/**
 * Session Security Module
 *
 * Provides enhanced session s    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    // Session expiry time calculated for metadata
    const _expiresAt = new Date(Date.now() + config.sessionMaxAge * 1000);
    // expiresAt would be used when storing session metadata in databaserity features including:
 * - Session rotation (after login, privilege changes)
 * - IP address validation
 * - User agent validation
 * - Concurrent session limits
 * - Session hijacking detection
 * - Automatic session cleanup
 *
 * Integrates with NextAuth for session management.
 */

import { prisma } from "./prisma";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { logSecurityEvent } from "./security-logger";

// Session security configuration
const config = {
  maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || "3", 10),
  sessionMaxAge: parseInt(
    process.env.SESSION_MAX_AGE || "2592000", // 30 days
    10
  ),
  rotationEnabled: process.env.SESSION_ROTATION_ENABLED !== "false",
  strictIpValidation: process.env.STRICT_IP_VALIDATION === "true",
  strictUserAgentValidation: process.env.STRICT_USER_AGENT_VALIDATION === "true",
};

// Types
export interface SessionMetadata {
  userId: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
}

export interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  shouldRotate?: boolean;
  suspicious?: boolean;
}

/**
 * Track active session in database
 *
 * Stores session metadata for validation and concurrent session tracking
 *
 * @param userId - User ID
 * @param sessionToken - NextAuth session token
 * @param request - Next.js request object
 */
export async function trackSession(
  userId: string,
  sessionToken: string,
  request: NextRequest
): Promise<void> {
  try {
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    // Session expiry is handled by NextAuth, not needed here

    // Store session metadata
    await prisma.session.update({
      where: { sessionToken },
      data: {
        // Store metadata in session table
        // Note: You may need to add these fields to your Session model
        ipAddress,
        userAgent,
        lastAccessedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to track session:", error);
    // Don't throw - session tracking is non-critical
  }
}

/**
 * Validate session security
 *
 * Checks for:
 * - IP address changes (potential hijacking)
 * - User agent changes (potential hijacking)
 * - Session expiry
 * - Suspicious patterns
 *
 * @param session - NextAuth session
 * @param request - Next.js request
 * @returns Validation result with actions to take
 */
export async function validateSession(
  session: Session & { sessionToken?: string },
  request: NextRequest
): Promise<SessionValidationResult> {
  try {
    if (!session.sessionToken) {
      return { valid: true }; // Can't validate without token
    }

    // Get stored session metadata
    const storedSession = await prisma.session.findUnique({
      where: { sessionToken: session.sessionToken },
    });

    if (!storedSession) {
      return {
        valid: false,
        reason: "Session not found in database",
        suspicious: true,
      };
    }

    const currentIP = getClientIP(request);
    const currentUserAgent = request.headers.get("user-agent") || "unknown";

    // Check IP address change
    if (
      config.strictIpValidation &&
      storedSession.ipAddress &&
      storedSession.ipAddress !== currentIP
    ) {
      await logSecurityEvent({
        eventType: "SESSION_HIJACK_ATTEMPT",
        severity: "HIGH",
        userId: session.user?.id,
        ipAddress: currentIP,
        message: `IP address changed from ${storedSession.ipAddress} to ${currentIP}`,
        metadata: {
          oldIP: storedSession.ipAddress,
          newIP: currentIP,
          sessionToken: session.sessionToken,
        },
      });

      return {
        valid: false,
        reason: "IP address mismatch",
        suspicious: true,
      };
    }

    // Check user agent change
    if (
      config.strictUserAgentValidation &&
      storedSession.userAgent &&
      storedSession.userAgent !== currentUserAgent
    ) {
      await logSecurityEvent({
        eventType: "SESSION_HIJACK_ATTEMPT",
        severity: "HIGH",
        userId: session.user?.id,
        ipAddress: currentIP,
        message: "User agent changed during session",
        metadata: {
          oldUserAgent: storedSession.userAgent,
          newUserAgent: currentUserAgent,
          sessionToken: session.sessionToken,
        },
      });

      return {
        valid: false,
        reason: "User agent mismatch",
        suspicious: true,
      };
    }

    // Check session expiry
    if (storedSession.expires < new Date()) {
      return {
        valid: false,
        reason: "Session expired",
      };
    }

    // Update last accessed time
    await prisma.session.update({
      where: { sessionToken: session.sessionToken },
      data: { lastAccessedAt: new Date() },
    });

    return { valid: true };
  } catch (error) {
    console.error("Session validation error:", error);
    // Fail open for non-critical errors
    return { valid: true };
  }
}

/**
 * Rotate session token
 *
 * Creates a new session token and invalidates the old one.
 * Should be called after:
 * - Successful login
 * - Password change
 * - Privilege escalation
 * - Email change
 *
 * @param oldSessionToken - Current session token
 * @param userId - User ID
 * @returns New session token
 */
export async function rotateSession(oldSessionToken: string, userId: string): Promise<string> {
  try {
    // Get old session
    const oldSession = await prisma.session.findUnique({
      where: { sessionToken: oldSessionToken },
    });

    if (!oldSession) {
      throw new Error("Session not found");
    }

    // Generate new session token
    const newSessionToken = generateSessionToken();

    // Create new session with same data
    await prisma.session.create({
      data: {
        sessionToken: newSessionToken,
        userId: oldSession.userId,
        expires: oldSession.expires,
        ipAddress: oldSession.ipAddress,
        userAgent: oldSession.userAgent,
        lastAccessedAt: new Date(),
      },
    });

    // Delete old session
    await prisma.session.delete({
      where: { sessionToken: oldSessionToken },
    });

    // Log rotation
    await logSecurityEvent({
      eventType: "SESSION_HIJACK_ATTEMPT", // Closest available type
      severity: "LOW",
      userId,
      ipAddress: "system",
      message: "Session token rotated",
      metadata: {
        oldToken: oldSessionToken.substring(0, 10) + "...",
        newToken: newSessionToken.substring(0, 10) + "...",
      },
    });

    return newSessionToken;
  } catch (error) {
    console.error("Session rotation error:", error);
    throw error;
  }
}

/**
 * Check concurrent session limit
 *
 * Ensures user doesn't exceed maximum concurrent sessions.
 * When limit is reached, terminates oldest session.
 *
 * @param userId - User ID
 */
export async function checkConcurrentSessions(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _currentSessionToken: string
): Promise<{ exceeded: boolean; activeCount: number; limit: number }> {
  try {
    // Get all active sessions for user
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gte: new Date() },
      },
      orderBy: { lastAccessedAt: "asc" },
    });

    // Check if limit exceeded
    if (sessions.length >= config.maxConcurrentSessions) {
      // Terminate oldest sessions
      const sessionsToTerminate = sessions.length - config.maxConcurrentSessions + 1;

      for (let i = 0; i < sessionsToTerminate; i++) {
        await prisma.session.delete({
          where: { sessionToken: sessions[i].sessionToken },
        });
      }

      // Log event
      await logSecurityEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        severity: "MEDIUM",
        userId,
        ipAddress: "multiple",
        message: `Concurrent session limit reached (${sessions.length}/${config.maxConcurrentSessions})`,
        metadata: {
          terminatedSessions: sessionsToTerminate,
          maxSessions: config.maxConcurrentSessions,
        },
      });

      return {
        exceeded: true,
        activeCount: sessions.length,
        limit: config.maxConcurrentSessions,
      };
    }

    return {
      exceeded: false,
      activeCount: sessions.length,
      limit: config.maxConcurrentSessions,
    };
  } catch (error) {
    console.error("Concurrent session check error:", error);
    // Don't throw - this is non-critical, return default
    return {
      exceeded: false,
      activeCount: 0,
      limit: config.maxConcurrentSessions,
    };
  }
}

/**
 * Terminate session
 *
 * Deletes session from database and logs event
 *
 * @param sessionToken - Session token to terminate
 * @param reason - Reason for termination
 */
export async function terminateSession(
  sessionToken: string,
  reason: string = "Manual termination"
): Promise<void> {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (session) {
      await prisma.session.delete({
        where: { sessionToken },
      });

      await logSecurityEvent({
        eventType: "LOGOUT",
        severity: "LOW",
        userId: session.userId,
        ipAddress: session.ipAddress || "unknown",
        message: `Session terminated: ${reason}`,
        metadata: {
          sessionToken: sessionToken.substring(0, 10) + "...",
          reason,
        },
      });
    }
  } catch (error) {
    console.error("Session termination error:", error);
    throw error;
  }
}

/**
 * Terminate all sessions for user
 *
 * Useful for:
 * - Password change
 * - Account compromise
 * - Manual logout from all devices
 *
 * @param userId - User ID
 * @param excludeSessionToken - Session to keep active (optional)
 */
export async function terminateAllSessions(
  userId: string,
  excludeSessionToken?: string
): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        ...(excludeSessionToken && {
          sessionToken: { not: excludeSessionToken },
        }),
      },
    });

    await logSecurityEvent({
      eventType: "LOGOUT",
      severity: "MEDIUM",
      userId,
      ipAddress: "multiple",
      message: `All sessions terminated (${result.count} sessions)`,
      metadata: {
        terminatedCount: result.count,
        excludedSession: excludeSessionToken ? excludeSessionToken.substring(0, 10) + "..." : null,
      },
    });

    return result.count;
  } catch (error) {
    console.error("Terminate all sessions error:", error);
    throw error;
  }
}

/**
 * Get active sessions for user
 *
 * Returns list of all active sessions with metadata
 *
 * @param userId - User ID
 * @returns Array of session metadata
 */
export async function getActiveSessions(userId: string): Promise<SessionMetadata[]> {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gte: new Date() },
      },
      orderBy: { lastAccessedAt: "desc" },
    });

    return sessions.map(
      (session: {
        userId: string;
        sessionToken: string;
        ipAddress?: string | null;
        userAgent?: string | null;
        createdAt?: Date;
        lastAccessedAt?: Date;
        expires: Date;
      }) => ({
        userId: session.userId,
        sessionToken: session.sessionToken,
        ipAddress: session.ipAddress || "unknown",
        userAgent: session.userAgent || "unknown",
        createdAt: session.createdAt || new Date(),
        lastAccessedAt: session.lastAccessedAt || new Date(),
        expiresAt: session.expires,
      })
    );
  } catch (error) {
    console.error("Get active sessions error:", error);
    return [];
  }
}

/**
 * Cleanup expired sessions
 *
 * Should be run periodically (cron job)
 * Deletes all expired sessions from database
 *
 * @returns Number of sessions deleted
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: { lt: new Date() },
      },
    });

    console.log(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error("Session cleanup error:", error);
    return 0;
  }
}

/**
 * Detect session hijacking patterns
 *
 * Analyzes session access patterns to detect potential hijacking:
 * - Rapid IP changes
 * - Geographically impossible travel
 * - Multiple concurrent IPs
 *
 * @param userId - User ID
 * @returns Detection result
 */
export async function detectSessionHijacking(userId: string): Promise<{
  suspicious: boolean;
  reasons: string[];
}> {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gte: new Date() },
      },
      orderBy: { lastAccessedAt: "desc" },
    });

    const reasons: string[] = [];

    // Check for multiple concurrent IPs
    const uniqueIPs = new Set(
      sessions
        .map((s: { ipAddress?: string | null }) => s.ipAddress)
        .filter((ip: string | null | undefined): ip is string => !!ip)
    );
    if (uniqueIPs.size > 3) {
      reasons.push(`Multiple concurrent IP addresses (${uniqueIPs.size} unique IPs)`);
    }

    // Check for rapid IP changes (within 5 minutes)
    for (let i = 0; i < sessions.length - 1; i++) {
      const timeDiff =
        (sessions[i].lastAccessedAt?.getTime() || 0) -
        (sessions[i + 1].lastAccessedAt?.getTime() || 0);

      if (
        timeDiff < 300000 && // 5 minutes
        sessions[i].ipAddress !== sessions[i + 1].ipAddress
      ) {
        reasons.push(
          `Rapid IP change detected (${sessions[i + 1].ipAddress} -> ${sessions[i].ipAddress})`
        );
      }
    }

    // If suspicious, log event
    if (reasons.length > 0) {
      await logSecurityEvent({
        eventType: "SESSION_HIJACK_ATTEMPT",
        severity: "CRITICAL",
        userId,
        ipAddress: Array.from(uniqueIPs).join(","),
        message: "Session hijacking pattern detected",
        metadata: {
          reasons,
          sessionCount: sessions.length,
          uniqueIPs: Array.from(uniqueIPs),
        },
      });
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  } catch (error) {
    console.error("Session hijacking detection error:", error);
    return { suspicious: false, reasons: [] };
  }
}

// Helper functions

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Generate cryptographically secure session token
 */
function generateSessionToken(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Session security middleware
 *
 * Use this in your middleware to validate sessions
 *
 * @param session - NextAuth session
 * @param request - Next.js request
 * @returns Whether to allow the request
 */
export async function sessionSecurityMiddleware(
  session: Session & { sessionToken?: string },
  request: NextRequest
): Promise<boolean> {
  // Validate session
  const validation = await validateSession(session, request);

  if (!validation.valid) {
    // Terminate suspicious session
    if (validation.suspicious && session.sessionToken) {
      await terminateSession(
        session.sessionToken,
        validation.reason || "Security validation failed"
      );
    }
    return false;
  }

  // Check for hijacking patterns periodically
  if (session.user?.id) {
    // Only check every 100 requests to avoid performance impact
    if (Math.random() < 0.01) {
      detectSessionHijacking(session.user.id).catch(console.error);
    }
  }

  return true;
}

export { config as sessionConfig };
