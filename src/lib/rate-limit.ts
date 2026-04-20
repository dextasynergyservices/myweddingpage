/**
 * Rate Limiting Middleware for Next.js API Routes
 * Uses Upstash Redis for distributed rate limiting with in-memory fallback
 */

import { redisRateLimit } from "./redis";

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique identifier for this rate limit (defaults to endpoint) */
  keyGenerator?: (request: Request) => string;
  /** Message to return when rate limit is exceeded */
  message?: string;
  /** Skip rate limiting for certain requests */
  skip?: (request: Request) => boolean;
  /** Custom headers to include in rate limit response */
  headers?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return realIP || cfConnectingIP || "unknown";
}

/**
 * Default key generator: IP + endpoint
 */
function defaultKeyGenerator(request: Request): string {
  const ip = getClientIP(request);
  const url = new URL(request.url);
  return `${ip}:${url.pathname}`;
}

/**
 * Rate limiting middleware with Redis (primary) and in-memory (fallback)
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    keyGenerator = defaultKeyGenerator,
    message = "Too many requests, please try again later",
    skip,
    headers = true,
  } = config;

  return async (request: Request): Promise<Response | null> => {
    // Skip rate limiting if condition is met
    if (skip && skip(request)) {
      return null;
    }

    const key = keyGenerator(request);
    const now = Date.now();

    // Try Redis first
    const redisResult = await redisRateLimit.increment(key, windowMs);

    let count: number;
    let resetTime: number;

    if (redisResult) {
      // Redis is available - use distributed rate limiting
      count = redisResult.count;
      // TTL is in seconds, convert to milliseconds and add to current time
      resetTime = now + redisResult.ttl * 1000;
    } else {
      // Redis unavailable - fall back to in-memory rate limiting
      let entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired entry
        entry = {
          count: 1,
          resetTime: now + windowMs,
          firstRequest: now,
        };
        rateLimitStore.set(key, entry);
      } else {
        // Increment count for existing entry
        entry.count++;
      }

      count = entry.count;
      resetTime = entry.resetTime;
    }

    // Check if limit is exceeded
    const isLimitExceeded = count > maxRequests;
    const timeUntilReset = Math.ceil((resetTime - now) / 1000);
    const remainingRequests = Math.max(0, maxRequests - count);

    // Prepare headers
    const responseHeaders: Record<string, string> = {};

    if (headers) {
      responseHeaders["X-RateLimit-Limit"] = maxRequests.toString();
      responseHeaders["X-RateLimit-Remaining"] = remainingRequests.toString();
      responseHeaders["X-RateLimit-Reset"] = Math.ceil(
        resetTime / 1000
      ).toString();
      responseHeaders["X-RateLimit-Window"] = Math.ceil(
        windowMs / 1000
      ).toString();
      // Add Redis status indicator
      responseHeaders["X-RateLimit-Backend"] = redisResult ? "redis" : "memory";
    }

    if (isLimitExceeded) {
      responseHeaders["Retry-After"] = timeUntilReset.toString();

      return new Response(
        JSON.stringify({
          error: message,
          rateLimitExceeded: true,
          retryAfter: timeUntilReset,
          limit: maxRequests,
          window: Math.ceil(windowMs / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...responseHeaders,
          },
        }
      );
    }

    // Store headers for successful requests (to be added by the calling handler)
    (
      request as Request & { rateLimitHeaders?: Record<string, string> }
    ).rateLimitHeaders = responseHeaders;

    return null; // Continue to actual handler
  };
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict limits for unauthenticated users
  strict: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many requests. Please wait before trying again.",
  },

  // Moderate limits for general API endpoints
  moderate: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Rate limit exceeded. Please slow down your requests.",
  },

  // Lenient limits for authenticated users
  lenient: {
    maxRequests: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Rate limit exceeded. Please wait before making more requests.",
  },

  // Upload-specific limits (larger files, longer operations)
  upload: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message:
      "Upload rate limit exceeded. Please wait before uploading more files.",
  },

  // Authentication endpoints (stricter)
  auth: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: "Too many authentication attempts. Please try again later.",
  },
};

/**
 * Rate limit based on user authentication status
 */
export function createUserAwareRateLimit(
  authenticatedConfig: RateLimitConfig,
  unauthenticatedConfig: RateLimitConfig,
  getUserId?: (request: Request) => Promise<string | null>
) {
  return async (request: Request): Promise<Response | null> => {
    let userId: string | null = null;

    if (getUserId) {
      try {
        userId = await getUserId(request);
      } catch (error) {
        console.warn("Failed to get user ID for rate limiting:", error);
      }
    }

    // Use more lenient limits for authenticated users
    const config = userId ? authenticatedConfig : unauthenticatedConfig;

    // Create custom key generator that includes user ID if available
    const keyGenerator = (req: Request) => {
      const ip = getClientIP(req);
      const url = new URL(req.url);
      const userPrefix = userId ? `user:${userId}` : `ip:${ip}`;
      return `${userPrefix}:${url.pathname}`;
    };

    const rateLimiter = rateLimit({
      ...config,
      keyGenerator,
    });

    return rateLimiter(request);
  };
}

/**
 * Helper to add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  request: Request,
  response: Response
): Response {
  const headers = (
    request as Request & { rateLimitHeaders?: Record<string, string> }
  ).rateLimitHeaders;
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

/**
 * Utility to clear rate limit for a specific key (useful for testing)
 */
export async function clearRateLimit(key: string): Promise<void> {
  // Clear from Redis
  await redisRateLimit.delete(key);
  // Clear from in-memory store
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for a key
 */
export async function getRateLimitStatus(
  key: string,
  maxRequests: number
): Promise<{
  count: number;
  limit: number;
  remaining: number;
  resetTime: number;
  timeUntilReset: number;
  backend: "redis" | "memory" | "none";
} | null> {
  const now = Date.now();

  // Try Redis first
  const redisStatus = await redisRateLimit.getStatus(key);

  if (redisStatus && redisStatus.exists) {
    const resetTime = now + redisStatus.ttl * 1000;
    return {
      count: redisStatus.count,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - redisStatus.count),
      resetTime,
      timeUntilReset: Math.max(0, redisStatus.ttl),
      backend: "redis",
    };
  }

  // Fall back to in-memory
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return {
      count: 0,
      limit: maxRequests,
      remaining: maxRequests,
      resetTime: now,
      timeUntilReset: 0,
      backend: "none",
    };
  }

  const timeUntilReset = Math.max(0, entry.resetTime - now);

  return {
    count: entry.count,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime,
    timeUntilReset: Math.ceil(timeUntilReset / 1000),
    backend: "memory",
  };
}

export default rateLimit;
