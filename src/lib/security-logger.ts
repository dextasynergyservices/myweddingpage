/**
 * Security Logging System
 *
 * Comprehensive logging system for security events across the application.
 * Tracks login attempts, rate limit hits, validation failures, suspicious activities, etc.
 *
 * Features:
 * - Event-based logging with severity levels
 * - IP address and user agent tracking
 * - Metadata support for additional context
 * - Query helpers for security analysis
 * - Pattern detection for suspicious activities
 *
 * @module security-logger
 */

import { PrismaClient, SecurityEventType, SecuritySeverity, Prisma } from "@/generated/prisma";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

/**
 * Security log entry interface
 */
export interface SecurityLogEntry {
  eventType: SecurityEventType;
  severity?: SecuritySeverity;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a security event
 *
 * @param entry - Security log entry
 * @returns Created log entry
 */
export async function logSecurityEvent(entry: SecurityLogEntry) {
  try {
    // Derive canonical action and friendly message to store alongside raw metadata.
    const deriveCanonicalAction = (e: SecurityLogEntry) => {
      // Prefer explicit metadata.action when present
      const metaAction = e.metadata && (e.metadata as Record<string, unknown>).action;
      if (metaAction && typeof metaAction === "string") {
        const s = metaAction.toUpperCase();
        if (s.includes("LOGIN") && (s.includes("FAIL") || s.includes("FAILURE")))
          return "LOGIN_FAILED";
        if (s.includes("LOGIN") && (s.includes("SUCCESS") || s.includes("SUCCEED")))
          return "LOGIN_SUCCESS";
        if (s.includes("RATE") && s.includes("LIMIT")) return "RATE_LIMIT_EXCEEDED";
        if (
          (s.includes("ACCOUNT") && (s.includes("LOCK") || s.includes("LOCKED"))) ||
          s.includes("LOCKOUT")
        )
          return "ACCOUNT_LOCKED";
        if (s.startsWith("PLAN_CREATED")) return "PLAN_CREATED";
        if (s.startsWith("PLAN_UPDATED")) return "PLAN_UPDATED";
        if (s.startsWith("PLAN_DELETED")) return "PLAN_DELETED";
        return s.replace(/\s+/g, "_");
      }

      const m = e.message ? String(e.message).toUpperCase() : "";
      if (m.startsWith("PLAN_CREATED")) return "PLAN_CREATED";
      if (m.startsWith("PLAN_UPDATED")) return "PLAN_UPDATED";
      if (m.startsWith("PLAN_DELETED")) return "PLAN_DELETED";
      if (m.includes("LOGIN") && (m.includes("FAIL") || m.includes("FAILURE")))
        return "LOGIN_FAILED";
      if (m.includes("LOGIN") && (m.includes("SUCCESS") || m.includes("SUCCEED")))
        return "LOGIN_SUCCESS";
      if (m.includes("RATE") && m.includes("LIMIT")) return "RATE_LIMIT_EXCEEDED";
      if (
        (m.includes("ACCOUNT") && (m.includes("LOCK") || m.includes("LOCKED"))) ||
        m.includes("LOCKOUT") ||
        m.includes("LOCK")
      )
        return "ACCOUNT_LOCKED";
      return "";
    };

    const deriveFriendlyMessage = (msg?: string) => {
      if (!msg) return undefined;
      const s = String(msg);
      if (s.startsWith("PLAN_CREATED")) return "Plan created";
      if (s.startsWith("PLAN_UPDATED")) return "Plan updated";
      if (s.startsWith("PLAN_DELETED")) return "Plan deleted";
      if (s.startsWith("LOGIN_SUCCESS")) return "Login succeeded";
      if (s.startsWith("LOGIN_FAILURE") || s.startsWith("LOGIN_FAILED")) return "Login failed";
      return undefined;
    };

    const normalizedMetadata: Record<string, unknown> = {
      ...(entry.metadata || {}),
    };
    const canonical = deriveCanonicalAction(entry);
    if (canonical) normalizedMetadata.action = canonical;
    const friendly = deriveFriendlyMessage(entry.message);
    if (friendly) normalizedMetadata.friendlyMessage = friendly;
    const logEntry = await prisma.securityLog.create({
      data: {
        eventType: entry.eventType,
        severity: entry.severity || SecuritySeverity.MEDIUM,
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        endpoint: entry.endpoint,
        method: entry.method,
        statusCode: entry.statusCode,
        message: entry.message,
        metadata: normalizedMetadata as Prisma.InputJsonValue,
      },
    });

    // Log to console for immediate visibility (optional)
    if (entry.severity === SecuritySeverity.CRITICAL || entry.severity === SecuritySeverity.HIGH) {
      console.error("[SECURITY]", {
        type: entry.eventType,
        severity: entry.severity,
        ip: entry.ipAddress,
        userId: entry.userId,
        message: entry.message,
      });
    }

    return logEntry;
  } catch (error) {
    // Logging should never crash the application
    console.error("Failed to log security event:", error);
    return null;
  }
}

/**
 * Extract IP address from Next.js request
 *
 * Checks multiple headers for real IP (behind proxies/load balancers)
 *
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIP(request: NextRequest): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to unknown if no headers found
  return "unknown";
}

/**
 * Extract user agent from request
 *
 * @param request - Next.js request object
 * @returns User agent string
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Create security log entry from request
 *
 * Helper to extract common fields from Next.js request
 *
 * @param request - Next.js request object
 * @param eventType - Type of security event
 * @param options - Additional log options
 * @returns Security log entry
 */
export function createLogFromRequest(
  request: NextRequest,
  eventType: SecurityEventType,
  options: {
    severity?: SecuritySeverity;
    userId?: string;
    message?: string;
    statusCode?: number;
    metadata?: Record<string, unknown>;
  } = {}
): SecurityLogEntry {
  return {
    eventType,
    severity: options.severity || SecuritySeverity.MEDIUM,
    userId: options.userId,
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    endpoint: request.nextUrl.pathname,
    method: request.method,
    statusCode: options.statusCode,
    message: options.message,
    metadata: options.metadata,
  };
}

/**
 * Log failed login attempt
 *
 * @param request - Next.js request
 * @param email - Email attempted
 * @param reason - Failure reason
 */
export async function logLoginFailure(request: NextRequest, email: string, reason: string) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.LOGIN_FAILURE, {
      severity: SecuritySeverity.MEDIUM,
      message: `Failed login attempt for ${email}: ${reason}`,
      statusCode: 401,
      metadata: { email, reason },
    })
  );
}

/**
 * Log successful login
 *
 * @param request - Next.js request
 * @param userId - User ID
 * @param email - User email
 */
export async function logLoginSuccess(request: NextRequest, userId: string, email: string) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.LOGIN_SUCCESS, {
      severity: SecuritySeverity.LOW,
      userId,
      message: `Successful login for ${email}`,
      statusCode: 200,
      metadata: { email },
    })
  );
}

/**
 * Log rate limit hit
 *
 * @param request - Next.js request
 * @param limit - Rate limit that was hit
 */
export async function logRateLimitHit(
  request: NextRequest,
  limit: { max: number; window: number }
) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.RATE_LIMIT_HIT, {
      severity: SecuritySeverity.MEDIUM,
      message: `Rate limit exceeded: ${limit.max} requests in ${limit.window}ms`,
      statusCode: 429,
      metadata: { limit },
    })
  );
}

/**
 * Log validation failure
 *
 * @param request - Next.js request
 * @param errors - Validation errors
 */
export async function logValidationFailure(request: NextRequest, errors: Record<string, string>) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.VALIDATION_FAILURE, {
      severity: SecuritySeverity.LOW,
      message: "Input validation failed",
      statusCode: 400,
      metadata: { errors },
    })
  );
}

/**
 * Log CSRF violation
 *
 * @param request - Next.js request
 * @param reason - Violation reason
 */
export async function logCSRFViolation(request: NextRequest, reason: string) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.CSRF_VIOLATION, {
      severity: SecuritySeverity.HIGH,
      message: `CSRF violation: ${reason}`,
      statusCode: 403,
      metadata: { reason },
    })
  );
}

/**
 * Log XSS attempt
 *
 * @param request - Next.js request
 * @param field - Field with malicious content
 * @param content - Suspicious content (truncated)
 */
export async function logXSSAttempt(request: NextRequest, field: string, content: string) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.XSS_ATTEMPT, {
      severity: SecuritySeverity.HIGH,
      message: `Potential XSS attempt in field: ${field}`,
      statusCode: 400,
      metadata: {
        field,
        content: content.substring(0, 200), // Truncate for safety
      },
    })
  );
}

/**
 * Log file upload rejection
 *
 * @param request - Next.js request
 * @param reason - Rejection reason
 * @param filename - File name
 */
export async function logFileUploadRejected(
  request: NextRequest,
  reason: string,
  filename: string
) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.FILE_UPLOAD_REJECTED, {
      severity: SecuritySeverity.MEDIUM,
      message: `File upload rejected: ${reason}`,
      statusCode: 400,
      metadata: { reason, filename },
    })
  );
}

/**
 * Log unauthorized access attempt
 *
 * @param request - Next.js request
 * @param userId - User ID (if authenticated)
 * @param resource - Resource attempted to access
 */
export async function logUnauthorizedAccess(
  request: NextRequest,
  userId: string | undefined,
  resource: string
) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.UNAUTHORIZED_ACCESS, {
      severity: SecuritySeverity.HIGH,
      userId,
      message: `Unauthorized access attempt to: ${resource}`,
      statusCode: 403,
      metadata: { resource },
    })
  );
}

/**
 * Log suspicious activity
 *
 * @param request - Next.js request
 * @param activity - Description of suspicious activity
 * @param metadata - Additional context
 */
export async function logSuspiciousActivity(
  request: NextRequest,
  activity: string,
  metadata?: Record<string, unknown>
) {
  return logSecurityEvent(
    createLogFromRequest(request, SecurityEventType.SUSPICIOUS_ACTIVITY, {
      severity: SecuritySeverity.HIGH,
      message: activity,
      metadata,
    })
  );
}

/**
 * Query security logs
 *
 * @param options - Query options
 * @returns Array of security log entries
 */
export async function querySecurityLogs(options: {
  eventType?: SecurityEventType;
  severity?: SecuritySeverity;
  userId?: string;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  // Cursor-based pagination: return entries after this cursor (timestamp string and id)
  afterTimestamp?: string;
  afterId?: string;
  messageContains?: string;
  metadataContains?: string; // simple substring match on JSON stringified metadata
  // precise JSONB match (key/value) for Postgres
  metadataKey?: string;
  metadataValue?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (options.eventType) {
      where.eventType = options.eventType;
    }

    if (options.severity) {
      where.severity = options.severity;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.ipAddress) {
      where.ipAddress = options.ipAddress;
    }

    if (options.startDate || options.endDate) {
      const timestampFilter: Record<string, Date> = {};
      if (options.startDate) {
        timestampFilter.gte = options.startDate;
      }
      if (options.endDate) {
        timestampFilter.lte = options.endDate;
      }
      where.timestamp = timestampFilter;
    }

    // build raw filters for message and metadata substring matches
    const messageFilter = options.messageContains
      ? { contains: options.messageContains }
      : undefined;
    const metadataFilter = options.metadataContains
      ? { contains: options.metadataContains }
      : undefined;

    // Prisma where (use a flexible shape to avoid explicit any)
    const prismaWhere: Record<string, unknown> = { ...where };
    if (messageFilter) prismaWhere.message = messageFilter;
    if (metadataFilter) prismaWhere.metadata = metadataFilter;

    // If caller requested precise JSONB key/value matching, use raw SQL for Postgres JSONB ->>
    if (options.metadataKey && typeof options.metadataValue === "string") {
      // Build WHERE SQL and params based on provided filters
      const whereClauses: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (options.eventType) {
        whereClauses.push(`"eventType" = $${idx++}`);
        params.push(options.eventType);
      }
      if (options.severity) {
        whereClauses.push(`"severity" = $${idx++}`);
        params.push(options.severity);
      }
      if (options.userId) {
        whereClauses.push(`"userId" = $${idx++}`);
        params.push(options.userId);
      }
      if (options.ipAddress) {
        whereClauses.push(`"ipAddress" = $${idx++}`);
        params.push(options.ipAddress);
      }
      if (options.startDate) {
        whereClauses.push(`"timestamp" >= $${idx++}`);
        params.push(options.startDate.toISOString());
      }
      if (options.endDate) {
        whereClauses.push(`"timestamp" <= $${idx++}`);
        params.push(options.endDate.toISOString());
      }
      if (options.messageContains) {
        whereClauses.push(`"message" ILIKE $${idx++}`);
        params.push(`%${options.messageContains}%`);
      }

      // JSONB exact match using ->> to extract text value
      whereClauses.push(`"metadata" ->> $${idx++} = $${idx++}`);
      params.push(options.metadataKey, options.metadataValue);

      const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
      const limit = options.limit || 100;
      // cursor-based: if afterTimestamp/afterId provided, add compound comparison
      if (options.afterTimestamp && options.afterId) {
        whereClauses.push(
          `( "timestamp" < $${idx} OR ("timestamp" = $${idx} AND "id" < $${idx + 1}) )`
        );
        params.push(options.afterTimestamp, options.afterId);
        idx += 2;
      }

      const offset = options.offset || 0;

      const sql = `SELECT * FROM "SecurityLog" ${whereSQL} ORDER BY "timestamp" DESC, "id" DESC LIMIT ${limit} OFFSET ${offset}`;

      // Use parameterized raw query
      // prisma.$queryRaw requires parameters to be passed separately to avoid injection
      // $queryRawUnsafe could be used but we pass params to $queryRaw via Prisma.join is complex; we use $queryRawUnsafe with placeholders and params
      // Use $queryRawUnsafe with runtime params; assert unknown[] -> any[] for return
      const rows = await prisma.$queryRawUnsafe(sql, ...params);
      return rows as unknown as Record<string, unknown>[];
    }

    // Cursor-based where clause for Prisma when afterTimestamp/afterId provided
    if (options.afterTimestamp && options.afterId) {
      const afterDate = new Date(options.afterTimestamp);
      // combine original where with cursor condition
      const cursorCond: Record<string, unknown> = {
        OR: [
          { timestamp: { lt: afterDate } },
          { AND: [{ timestamp: afterDate }, { id: { lt: options.afterId } }] },
        ],
      };

      const finalWhere = { AND: [prismaWhere, cursorCond] };

      return await prisma.securityLog.findMany({
        where: finalWhere as never,
        orderBy: [{ timestamp: "desc" }, { id: "desc" }],
        take: options.limit || 100,
      });
    }

    return await prisma.securityLog.findMany({
      where: prismaWhere as never,
      orderBy: { timestamp: "desc" },
      take: options.limit || 100,
      skip: options.offset || 0,
    });
  } catch (error) {
    console.error("Failed to query security logs:", error);
    return [];
  }
}

/**
 * Count security logs for given filters. Uses JSONB exact match when metadataKey/metadataValue provided.
 */
export async function countSecurityLogs(options: {
  eventType?: SecurityEventType;
  severity?: SecuritySeverity;
  userId?: string;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  messageContains?: string;
  metadataKey?: string;
  metadataValue?: string;
}) {
  try {
    // If metadataKey provided, use raw SQL count with JSONB ->> operator
    if (options.metadataKey && typeof options.metadataValue === "string") {
      const whereClauses: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (options.eventType) {
        whereClauses.push(`"eventType" = $${idx++}`);
        params.push(options.eventType);
      }
      if (options.severity) {
        whereClauses.push(`"severity" = $${idx++}`);
        params.push(options.severity);
      }
      if (options.userId) {
        whereClauses.push(`"userId" = $${idx++}`);
        params.push(options.userId);
      }
      if (options.ipAddress) {
        whereClauses.push(`"ipAddress" = $${idx++}`);
        params.push(options.ipAddress);
      }
      if (options.startDate) {
        whereClauses.push(`"timestamp" >= $${idx++}`);
        params.push(options.startDate.toISOString());
      }
      if (options.endDate) {
        whereClauses.push(`"timestamp" <= $${idx++}`);
        params.push(options.endDate.toISOString());
      }
      if (options.messageContains) {
        whereClauses.push(`"message" ILIKE $${idx++}`);
        params.push(`%${options.messageContains}%`);
      }

      whereClauses.push(`"metadata" ->> $${idx++} = $${idx++}`);
      params.push(options.metadataKey, options.metadataValue);

      const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
      const sql = `SELECT COUNT(*)::int AS cnt FROM "SecurityLog" ${whereSQL}`;
      const res = await prisma.$queryRawUnsafe(sql, ...params);
      return Number((res as unknown as Array<Record<string, unknown>>)[0]?.cnt || 0);
    }

    // Fallback to Prisma count using metadata substring if provided
    const where: Record<string, unknown> = {};
    if (options.eventType) where.eventType = options.eventType;
    if (options.severity) where.severity = options.severity;
    if (options.userId) where.userId = options.userId;
    if (options.ipAddress) where.ipAddress = options.ipAddress;
    if (options.startDate || options.endDate) {
      // timestamp filter shape for Prisma
      (where as Record<string, unknown>).timestamp = {} as Record<string, unknown>;
      if (options.startDate) (where.timestamp as Record<string, unknown>).gte = options.startDate;
      if (options.endDate) (where.timestamp as Record<string, unknown>).lte = options.endDate;
    }
    if (options.messageContains) where.message = { contains: options.messageContains };
    // Note: no metadata exact match here

    const cnt = await prisma.securityLog.count({ where });
    return cnt;
  } catch (err) {
    console.error("Failed to count security logs:", err);
    return 0;
  }
}

/**
 * Detect brute force attacks
 *
 * Checks for repeated failed login attempts from same IP
 *
 * @param ipAddress - IP address to check
 * @param timeWindow - Time window in milliseconds (default: 15 minutes)
 * @param threshold - Number of attempts to trigger detection (default: 5)
 * @returns True if brute force detected
 */
export async function detectBruteForce(
  ipAddress: string,
  timeWindow: number = 900000, // 15 minutes
  threshold: number = 5
): Promise<boolean> {
  try {
    const startDate = new Date(Date.now() - timeWindow);

    const failedAttempts = await prisma.securityLog.count({
      where: {
        ipAddress,
        eventType: SecurityEventType.LOGIN_FAILURE,
        timestamp: {
          gte: startDate,
        },
      },
    });

    return failedAttempts >= threshold;
  } catch (error) {
    console.error("Failed to detect brute force:", error);
    return false;
  }
}

/**
 * Get security statistics
 *
 * Returns counts of different security events
 *
 * @param startDate - Start date for statistics
 * @param endDate - End date for statistics
 * @returns Security statistics
 */
export async function getSecurityStats(startDate: Date, endDate: Date) {
  try {
    const logs = await prisma.securityLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        eventType: true,
        severity: true,
      },
    });

    const stats = {
      total: logs.length,
      byEventType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    logs.forEach((log) => {
      // Count by event type
      stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;

      // Count by severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

      // Count severity levels
      switch (log.severity) {
        case SecuritySeverity.CRITICAL:
          stats.critical++;
          break;
        case SecuritySeverity.HIGH:
          stats.high++;
          break;
        case SecuritySeverity.MEDIUM:
          stats.medium++;
          break;
        case SecuritySeverity.LOW:
          stats.low++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error("Failed to get security stats:", error);
    return null;
  }
}

/**
 * Get recent critical events
 *
 * @param limit - Number of events to return
 * @returns Array of critical security events
 */
export async function getRecentCriticalEvents(limit: number = 10) {
  try {
    return await prisma.securityLog.findMany({
      where: {
        severity: {
          in: [SecuritySeverity.CRITICAL, SecuritySeverity.HIGH],
        },
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to get critical events:", error);
    return [];
  }
}

/**
 * Clean up old security logs
 *
 * Remove logs older than specified days
 *
 * @param daysToKeep - Number of days to keep logs
 * @returns Number of deleted logs
 */
export async function cleanupOldLogs(daysToKeep: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.securityLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old security logs`);
    return result.count;
  } catch (error) {
    console.error("Failed to cleanup old logs:", error);
    return 0;
  }
}

const securityLoggerFunctions = {
  logSecurityEvent,
  querySecurityLogs,
  detectBruteForce,
};

export default securityLoggerFunctions;
