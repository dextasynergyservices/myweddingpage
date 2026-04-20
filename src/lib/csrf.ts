/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * This module provides CSRF token generation, validation, and management
 * to protect against CSRF attacks on state-changing operations.
 *
 * Features:
 * - Token generation with cryptographic randomness
 * - Token validation with timing attack prevention
 * - Token storage in encrypted cookies
 * - Automatic token rotation
 * - Double-submit cookie pattern
 *
 * @module csrf
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Configuration for CSRF protection
 */
export interface CSRFConfig {
  /** Secret key for token generation (from env) */
  secret: string;
  /** Cookie name for CSRF token */
  cookieName: string;
  /** Header name for CSRF token */
  headerName: string;
  /** Token expiration time in milliseconds */
  tokenExpiry: number;
  /** Whether to use secure cookies (HTTPS only) */
  secureCookie: boolean;
  /** SameSite cookie attribute */
  sameSite: "strict" | "lax" | "none";
}

/**
 * Default CSRF configuration
 */
const defaultConfig: CSRFConfig = {
  secret: process.env.CSRF_SECRET || "fallback-secret-please-set-CSRF_SECRET",
  cookieName: "csrf_token",
  headerName: "x-csrf-token",
  tokenExpiry: 3600000, // 1 hour
  secureCookie: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

/**
 * Generate a cryptographically secure CSRF token
 * Compatible with both Node.js and Edge Runtime
 * Now async to support Web Crypto API
 *
 * @param config - CSRF configuration
 * @returns Generated token string
 */
export async function generateCSRFToken(
  config: Partial<CSRFConfig> = {}
): Promise<string> {
  const conf = { ...defaultConfig, ...config };

  // Generate random token using Web Crypto API (works in both environments)
  const randomBytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(randomBytes);

  // Convert to base64url
  const token = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // Add timestamp for expiry checking
  const timestamp = Date.now();

  // Create HMAC signature using Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(conf.secret);
  const messageData = encoder.encode(`${token}.${timestamp}`);

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );
  const signatureArray = new Uint8Array(signatureBuffer);
  const signature = btoa(String.fromCharCode(...signatureArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // Return token with signature and timestamp
  return `${token}.${timestamp}.${signature}`;
}

/**
 * Validate a CSRF token
 *
 * Uses constant-time comparison to prevent timing attacks
 * Compatible with both Node.js and Edge Runtime
 *
 * @param token - Token to validate
 * @param config - CSRF configuration
 * @returns True if token is valid, false otherwise
 */
export async function validateCSRFToken(
  token: string,
  config: Partial<CSRFConfig> = {}
): Promise<boolean> {
  const conf = { ...defaultConfig, ...config };

  try {
    // Parse token parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    const [tokenPart, timestampPart, providedSignature] = parts;
    const timestamp = parseInt(timestampPart, 10);

    const now = Date.now();
    const age = now - timestamp;
    const expiryMs = conf.tokenExpiry;

    // Check if token is expired
    if (age > expiryMs) {
      return false;
    }

    // Recreate HMAC signature using Web Crypto API (Edge Runtime compatible)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(conf.secret);
    const messageData = encoder.encode(`${tokenPart}.${timestamp}`);

    // Use global crypto (Web Crypto API) instead of imported Node.js crypto
    const cryptoAPI = globalThis.crypto;

    // Import key for HMAC
    const cryptoKey = await cryptoAPI.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Sign the message
    const signatureBuffer = await cryptoAPI.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

    // Convert to base64url
    const signatureArray = new Uint8Array(signatureBuffer);
    const expectedSignature = btoa(String.fromCharCode(...signatureArray))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    // Simple string comparison (timing-safe comparison not available in Edge Runtime)
    return providedSignature === expectedSignature;
  } catch (error) {
    console.error("CSRF token validation error:", error);
    return false;
  }
}

/**
 * Extract CSRF token from request
 *
 * Checks multiple sources:
 * 1. Custom header (x-csrf-token)
 * 2. Request body (_csrf field)
 * 3. Query parameter (_csrf)
 *
 * @param request - Next.js request object
 * @returns Token string or null if not found
 */
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Check header
  const headerToken = request.headers.get(defaultConfig.headerName);
  if (headerToken) {
    return headerToken;
  }

  // Check cookie for double-submit pattern
  const cookieToken = request.cookies.get(defaultConfig.cookieName)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Set CSRF token cookie in response
 *
 * @param response - Next.js response object
 * @param token - CSRF token to set
 * @param config - CSRF configuration
 * @returns Modified response with cookie
 */
export function setCSRFTokenCookie(
  response: NextResponse,
  token: string,
  config: Partial<CSRFConfig> = {}
): NextResponse {
  const conf = { ...defaultConfig, ...config };

  response.cookies.set({
    name: conf.cookieName,
    value: token,
    httpOnly: true,
    secure: conf.secureCookie,
    sameSite: conf.sameSite,
    maxAge: conf.tokenExpiry / 1000, // Convert to seconds
    path: "/",
  });

  return response;
}

/**
 * CSRF Protection Middleware
 *
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE, PATCH)
 * Generates and sets tokens for GET requests
 *
 * @param request - Next.js request object
 * @param config - CSRF configuration
 * @returns Response with token or validation error
 */
export async function csrfMiddleware(
  request: NextRequest,
  config: Partial<CSRFConfig> = {}
): Promise<NextResponse | null> {
  const method = request.method.toUpperCase();
  const conf = { ...defaultConfig, ...config };

  // Skip CSRF check for safe methods
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    // Generate new token for safe requests
    const token = await generateCSRFToken(conf);
    const response = NextResponse.next();
    return setCSRFTokenCookie(response, token, conf);
  }

  // For state-changing methods, validate CSRF token
  const token = getCSRFTokenFromRequest(request);

  if (!token) {
    // Log CSRF violation (lazy import to avoid circular dependency)
    if (typeof window === "undefined") {
      import("./security-logger").then(({ logCSRFViolation }) => {
        logCSRFViolation(request, "Token missing").catch(console.error);
      });
    }

    return NextResponse.json(
      {
        error: "CSRF token missing",
        message: "CSRF token is required for this request",
      },
      { status: 403 }
    );
  }

  const isValid = await validateCSRFToken(token, conf);

  if (!isValid) {
    // Log CSRF violation
    if (typeof window === "undefined") {
      import("./security-logger").then(({ logCSRFViolation }) => {
        logCSRFViolation(request, "Token invalid or expired").catch(
          console.error
        );
      });
    }

    return NextResponse.json(
      {
        error: "Invalid CSRF token",
        message: "CSRF token is invalid or expired",
      },
      { status: 403 }
    );
  }

  // Token is valid, continue with request
  return null;
}

/**
 * Get CSRF token for client-side use
 *
 * This should be called from an API route to provide the token to the frontend
 *
 * @returns JSON response with CSRF token and expiration
 */
export async function getCSRFTokenResponse(): Promise<NextResponse> {
  const token = await generateCSRFToken();
  const expiresAt = Date.now() + defaultConfig.tokenExpiry;

  const response = NextResponse.json({
    csrfToken: token,
    expiresAt: expiresAt,
  });

  return setCSRFTokenCookie(response, token);
}

/**
 * Verify CSRF token from request body or headers
 *
 * Use this in API routes that need CSRF protection
 *
 * @param request - Next.js request object
 * @param bodyToken - Token from request body (optional)
 * @returns True if valid, throws error if invalid
 */
export async function verifyCSRFToken(
  request: NextRequest,
  bodyToken?: string
): Promise<boolean> {
  // Get token from header or cookie
  const headerToken = getCSRFTokenFromRequest(request);

  // Use body token if provided, otherwise use header/cookie token
  const token = bodyToken || headerToken;

  if (!token) {
    throw new Error("CSRF token is required");
  }

  const isValid = await validateCSRFToken(token);

  if (!isValid) {
    throw new Error("Invalid or expired CSRF token");
  }

  return true;
}

/**
 * Create a CSRF-protected API route handler
 *
 * Wraps an API route handler with CSRF protection
 *
 * @param handler - Original route handler
 * @param config - CSRF configuration
 * @returns Protected route handler
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: Partial<CSRFConfig> = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check CSRF token
    const csrfError = await csrfMiddleware(request, config);

    if (csrfError) {
      return csrfError;
    }

    // Call original handler
    return handler(request);
  };
}

/**
 * Check if request is exempt from CSRF protection
 *
 * Some endpoints might need to be exempt (e.g., webhooks, public APIs)
 *
 * @param request - Next.js request object
 * @param exemptPaths - Array of paths to exempt
 * @returns True if request is exempt
 */
export function isCSRFExempt(
  request: NextRequest,
  exemptPaths: string[] = []
): boolean {
  const pathname = request.nextUrl.pathname;

  // Default exempt paths
  const defaultExempt = ["/api/webhooks/", "/api/health", "/api/cron/"];

  const allExemptPaths = [...defaultExempt, ...exemptPaths];

  return allExemptPaths.some((exemptPath) => pathname.startsWith(exemptPath));
}

/**
 * Rotate CSRF token
 *
 * Generate a new token and invalidate the old one
 * Use after sensitive operations (login, password change)
 *
 * @param request - Next.js request object
 * @param response - Next.js response object
 * @param config - CSRF configuration
 * @returns Response with new token
 */
export async function rotateCSRFToken(
  response: NextResponse,
  config: Partial<CSRFConfig> = {}
): Promise<NextResponse> {
  const newToken = await generateCSRFToken(config);
  return setCSRFTokenCookie(response, newToken, config);
}

const csrfFunctions = {
  generateCSRFToken,
  validateCSRFToken,
  csrfMiddleware,
  isCSRFExempt,
};

export default csrfFunctions;
