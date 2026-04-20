/**
 * Upstash Redis Client Wrapper
 * Provides Redis connection for rate limiting and caching
 * Falls back gracefully when Redis is unavailable
 */

import { Redis } from "@upstash/redis";

// Redis client instance
let redis: Redis | null = null;
let redisAvailable = false;

/**
 * Initialize Redis client
 */
function initRedis(): Redis | null {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Skip Redis initialization if environment variables are not set
    if (!redisUrl || !redisToken) {
      console.warn(
        "Redis environment variables not set. Rate limiting will use in-memory fallback."
      );
      return null;
    }

    // Create Redis client
    const client = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    console.log("✅ Upstash Redis client initialized successfully");
    redisAvailable = true;
    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Upstash Redis client:", error);
    redisAvailable = false;
    return null;
  }
}

/**
 * Get Redis client instance (lazy initialization)
 */
export function getRedisClient(): Redis | null {
  if (redis === null && !redisAvailable) {
    redis = initRedis();
  }
  return redis;
}

/**
 * Check if Redis is available and functioning
 */
export async function isRedisAvailable(): Promise<boolean> {
  if (!redis) return false;

  try {
    // Ping Redis to check connection
    await redis.ping();
    return true;
  } catch (error) {
    console.warn("Redis ping failed:", error);
    return false;
  }
}

/**
 * Rate limiting operations using Redis
 */
export const redisRateLimit = {
  /**
   * Increment rate limit counter for a key
   * @returns Current count and TTL in seconds, or null if Redis unavailable
   */
  async increment(
    key: string,
    windowMs: number
  ): Promise<{ count: number; ttl: number } | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = client.pipeline();

      // Increment counter
      pipeline.incr(key);

      // Set expiry if this is a new key
      pipeline.expire(key, Math.ceil(windowMs / 1000));

      // Get TTL
      pipeline.ttl(key);

      const results = await pipeline.exec();

      // Results: [count, expireResult, ttl]
      const count = results[0] as number;
      const ttl = results[2] as number;

      return { count, ttl };
    } catch (error) {
      console.warn("Redis rate limit increment failed:", error);
      return null;
    }
  },

  /**
   * Get current count for a key
   */
  async getCount(key: string): Promise<number | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const count = await client.get<number>(key);
      return count ?? 0;
    } catch (error) {
      console.warn("Redis get count failed:", error);
      return null;
    }
  },

  /**
   * Get TTL for a key
   */
  async getTTL(key: string): Promise<number | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const ttl = await client.ttl(key);
      return ttl;
    } catch (error) {
      console.warn("Redis get TTL failed:", error);
      return null;
    }
  },

  /**
   * Delete a rate limit key (useful for testing)
   */
  async delete(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.warn("Redis delete failed:", error);
      return false;
    }
  },

  /**
   * Get rate limit status
   */
  async getStatus(key: string): Promise<{
    count: number;
    ttl: number;
    exists: boolean;
  } | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const pipeline = client.pipeline();
      pipeline.get<number>(key);
      pipeline.ttl(key);

      const results = await pipeline.exec();
      const count = (results[0] as number) ?? 0;
      const ttl = results[1] as number;

      return {
        count,
        ttl,
        exists: count > 0,
      };
    } catch (error) {
      console.warn("Redis get status failed:", error);
      return null;
    }
  },
};

/**
 * Generic cache operations (for future use)
 */
export const redisCache = {
  /**
   * Set a value in Redis with optional TTL
   */
  async set(
    key: string,
    value: unknown,
    ttlSeconds?: number
  ): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        await client.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.warn("Redis cache set failed:", error);
      return false;
    }
  },

  /**
   * Get a value from Redis
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get<string>(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn("Redis cache get failed:", error);
      return null;
    }
  },

  /**
   * Delete a cached value
   */
  async delete(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.warn("Redis cache delete failed:", error);
      return false;
    }
  },
};

const redisClient = {
  getClient: getRedisClient,
  isAvailable: isRedisAvailable,
  rateLimit: redisRateLimit,
  cache: redisCache,
};

export default redisClient;
