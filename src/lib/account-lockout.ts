/**
 * Account Lockout System
 *
 * Progressive lockout mechanism to prevent brute force attacks.
 * Tracks failed login attempts and implements escalating lockout periods.
 *
 * Features:
 * - Progressive lockout (5 attempts = 15min, 10 attempts = 1hr, 15+ = 24hr)
 * - Track attempts by email and IP address
 * - Manual unlock capability for admins
 * - Email notifications for lockouts
 * - Automatic cleanup of old attempts
 *
 * @module account-lockout
 */

import { PrismaClient } from "@/generated/prisma";
import { NextRequest } from "next/server";
import { getClientIP, getUserAgent } from "./security-logger";

const prisma = new PrismaClient();

/**
 * Lockout configuration
 */
export interface LockoutConfig {
  /** Number of failed attempts before first lockout */
  firstThreshold: number;
  /** Lockout duration for first threshold (milliseconds) */
  firstDuration: number;
  /** Number of failed attempts before second lockout */
  secondThreshold: number;
  /** Lockout duration for second threshold (milliseconds) */
  secondDuration: number;
  /** Number of failed attempts before maximum lockout */
  maxThreshold: number;
  /** Maximum lockout duration (milliseconds) */
  maxDuration: number;
  /** Time window to count attempts (milliseconds) */
  attemptWindow: number;
}

/**
 * Default lockout configuration
 */
const defaultConfig: LockoutConfig = {
  firstThreshold: parseInt(process.env.LOCKOUT_FIRST_THRESHOLD || "5"),
  firstDuration: parseInt(process.env.LOCKOUT_FIRST_DURATION || String(15 * 60 * 1000)), // 15 minutes
  secondThreshold: parseInt(process.env.LOCKOUT_SECOND_THRESHOLD || "10"),
  secondDuration: parseInt(process.env.LOCKOUT_SECOND_DURATION || String(60 * 60 * 1000)), // 1 hour
  maxThreshold: parseInt(process.env.LOCKOUT_MAX_THRESHOLD || "15"),
  maxDuration: parseInt(process.env.LOCKOUT_MAX_DURATION || String(24 * 60 * 60 * 1000)), // 24 hours
  attemptWindow: parseInt(process.env.LOCKOUT_ATTEMPT_WINDOW || String(60 * 60 * 1000)), // 1 hour
};

/**
 * Lockout status interface
 */
export interface LockoutStatus {
  isLocked: boolean;
  lockedUntil?: Date;
  attemptCount: number;
  remainingTime?: number; // milliseconds
  message?: string;
}

/**
 * Track a login attempt
 *
 * @param email - Email address
 * @param ipAddress - IP address
 * @param success - Whether login was successful
 * @param options - Additional options
 * @returns Created login attempt record
 */
export async function trackLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
  options: {
    userId?: string;
    userAgent?: string;
    failureReason?: string;
  } = {}
) {
  try {
    const attempt = await prisma.loginAttempt.create({
      data: {
        email: email.toLowerCase(),
        ipAddress,
        success,
        userId: options.userId,
        userAgent: options.userAgent,
        failureReason: options.failureReason,
      },
    });

    // If successful, clear any existing lockouts for this email
    if (success) {
      await clearLockout(email, ipAddress);
    }

    return attempt;
  } catch (error) {
    console.error("Failed to track login attempt:", error);
    return null;
  }
}

/**
 * Check if account or IP is locked out
 *
 * Checks both email-based and IP-based lockouts
 *
 * @param email - Email address
 * @param ipAddress - IP address
 * @returns Lockout status
 */
export async function checkLockoutStatus(email: string, ipAddress: string): Promise<LockoutStatus> {
  try {
    const now = new Date();

    // Check for active lockout
    const activeLockout = await prisma.accountLockout.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { ipAddress }],
        unlocked: false,
        lockedUntil: {
          gt: now,
        },
      },
      orderBy: {
        lockedUntil: "desc",
      },
    });

    if (activeLockout) {
      const remainingTime = activeLockout.lockedUntil.getTime() - now.getTime();
      const minutes = Math.ceil(remainingTime / 60000);

      return {
        isLocked: true,
        lockedUntil: activeLockout.lockedUntil,
        attemptCount: activeLockout.attemptCount,
        remainingTime,
        message: `Account is locked. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
      };
    }

    // Count recent failed attempts
    const config = defaultConfig;
    const windowStart = new Date(now.getTime() - config.attemptWindow);

    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        OR: [{ email: email.toLowerCase() }, { ipAddress }],
        success: false,
        attemptedAt: {
          gte: windowStart,
        },
      },
    });

    return {
      isLocked: false,
      attemptCount: failedAttempts,
    };
  } catch (error) {
    console.error("Failed to check lockout status:", error);
    return {
      isLocked: false,
      attemptCount: 0,
    };
  }
}

/**
 * Apply lockout if thresholds are exceeded
 *
 * Implements progressive lockout based on attempt count
 *
 * @param email - Email address
 * @param ipAddress - IP address
 * @returns Lockout record if applied, null otherwise
 */
export async function applyLockoutIfNeeded(email: string, ipAddress: string) {
  try {
    const config = defaultConfig;
    const status = await checkLockoutStatus(email, ipAddress);

    // Already locked
    if (status.isLocked) {
      return null;
    }

    const attemptCount = status.attemptCount;
    let lockoutDuration = 0;
    let lockoutReason = "";

    // Determine lockout duration based on attempt count
    if (attemptCount >= config.maxThreshold) {
      lockoutDuration = config.maxDuration;
      lockoutReason = `${attemptCount} failed attempts - Maximum lockout (24 hours)`;
    } else if (attemptCount >= config.secondThreshold) {
      lockoutDuration = config.secondDuration;
      lockoutReason = `${attemptCount} failed attempts - Extended lockout (1 hour)`;
    } else if (attemptCount >= config.firstThreshold) {
      lockoutDuration = config.firstDuration;
      lockoutReason = `${attemptCount} failed attempts - Initial lockout (15 minutes)`;
    }

    // Apply lockout if threshold exceeded
    if (lockoutDuration > 0) {
      const lockedUntil = new Date(Date.now() + lockoutDuration);

      const lockout = await prisma.accountLockout.create({
        data: {
          email: email.toLowerCase(),
          ipAddress,
          lockedUntil,
          attemptCount,
          lockoutReason,
        },
      });

      // Send notification email (async, don't await)
      sendLockoutNotification(email, lockedUntil, attemptCount).catch(console.error);

      return lockout;
    }

    return null;
  } catch (error) {
    console.error("Failed to apply lockout:", error);
    return null;
  }
}

/**
 * Clear lockout for email and IP
 *
 * Called after successful login or manual unlock
 *
 * @param email - Email address
 * @param ipAddress - IP address
 */
export async function clearLockout(email: string, ipAddress: string) {
  try {
    await prisma.accountLockout.updateMany({
      where: {
        OR: [{ email: email.toLowerCase() }, { ipAddress }],
        unlocked: false,
      },
      data: {
        unlocked: true,
        unlockedAt: new Date(),
      },
    });

    // Clean up old failed attempts
    const cutoffDate = new Date(Date.now() - defaultConfig.attemptWindow);
    await prisma.loginAttempt.deleteMany({
      where: {
        OR: [{ email: email.toLowerCase() }, { ipAddress }],
        attemptedAt: {
          lt: cutoffDate,
        },
      },
    });
  } catch (error) {
    console.error("Failed to clear lockout:", error);
  }
}

/**
 * Manually unlock an account (admin function)
 *
 * @param email - Email address to unlock
 * @param unlockedBy - Admin user ID
 * @returns Updated lockout records
 */
export async function unlockAccount(email: string, unlockedBy: string) {
  try {
    const result = await prisma.accountLockout.updateMany({
      where: {
        email: email.toLowerCase(),
        unlocked: false,
      },
      data: {
        unlocked: true,
        unlockedAt: new Date(),
        unlockedBy,
      },
    });

    // Clear failed attempts
    await prisma.loginAttempt.deleteMany({
      where: {
        email: email.toLowerCase(),
        success: false,
      },
    });

    return result;
  } catch (error) {
    console.error("Failed to unlock account:", error);
    return null;
  }
}

/**
 * Get lockout history for email or IP
 *
 * @param identifier - Email or IP address
 * @param limit - Number of records to return
 * @returns Array of lockout records
 */
export async function getLockoutHistory(identifier: string, limit: number = 10) {
  try {
    return await prisma.accountLockout.findMany({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { ipAddress: identifier }],
      },
      orderBy: {
        lockedAt: "desc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to get lockout history:", error);
    return [];
  }
}

/**
 * Get login attempt history
 *
 * @param identifier - Email or IP address
 * @param limit - Number of records to return
 * @returns Array of login attempts
 */
export async function getLoginAttemptHistory(identifier: string, limit: number = 20) {
  try {
    return await prisma.loginAttempt.findMany({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { ipAddress: identifier }],
      },
      orderBy: {
        attemptedAt: "desc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to get login attempt history:", error);
    return [];
  }
}

/**
 * Send lockout notification email
 *
 * @param email - Email address
 * @param lockedUntil - Lockout expiry date
 * @param attemptCount - Number of failed attempts
 */
async function sendLockoutNotification(email: string, lockedUntil: Date, attemptCount: number) {
  try {
    // Import Resend dynamically to avoid circular dependencies
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const lockoutMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);

    await resend.emails.send({
      from: "Myweddingpage <info@myweddingpage.online>",
      to: email,
      subject: "🔒 Account Security Alert - Temporary Lockout",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Account Temporarily Locked</h2>

          <p>We detected ${attemptCount} failed login attempts on your account.</p>

          <p>For your security, your account has been temporarily locked for <strong>${lockoutMinutes} minutes</strong>.</p>

          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Lockout Details:</strong></p>
            <ul style="margin: 10px 0;">
              <li>Failed attempts: ${attemptCount}</li>
              <li>Locked until: ${lockedUntil.toLocaleString()}</li>
            </ul>
          </div>

          <h3>What to do:</h3>
          <ul>
            <li>Wait ${lockoutMinutes} minutes before trying again</li>
            <li>Make sure you're using the correct password</li>
            <li>If you forgot your password, use the "Forgot Password" link</li>
            <li>If you didn't attempt to log in, contact support immediately</li>
          </ul>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated security message. If you need assistance, please contact our support team.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send lockout notification:", error);
  }
}

/**
 * Clean up old login attempts and lockouts
 *
 * Remove records older than specified days
 *
 * @param daysToKeep - Number of days to keep records
 * @returns Counts of deleted records
 */
export async function cleanupOldRecords(daysToKeep: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const [deletedAttempts, deletedLockouts] = await Promise.all([
      prisma.loginAttempt.deleteMany({
        where: {
          attemptedAt: {
            lt: cutoffDate,
          },
        },
      }),
      prisma.accountLockout.deleteMany({
        where: {
          lockedAt: {
            lt: cutoffDate,
          },
          unlocked: true,
        },
      }),
    ]);

    console.log(
      `Cleaned up ${deletedAttempts.count} old login attempts and ${deletedLockouts.count} old lockouts`
    );

    return {
      deletedAttempts: deletedAttempts.count,
      deletedLockouts: deletedLockouts.count,
    };
  } catch (error) {
    console.error("Failed to cleanup old records:", error);
    return {
      deletedAttempts: 0,
      deletedLockouts: 0,
    };
  }
}

/**
 * Middleware to check lockout before processing login
 *
 * @param request - Next.js request
 * @param email - Email address
 * @returns Lockout response if locked, null otherwise
 */
export async function checkLockoutMiddleware(request: NextRequest, email: string) {
  const ipAddress = getClientIP(request);
  const status = await checkLockoutStatus(email, ipAddress);

  if (status.isLocked) {
    return {
      error: "Account locked",
      message: status.message,
      lockedUntil: status.lockedUntil,
      remainingTime: status.remainingTime,
    };
  }

  return null;
}

/**
 * Handle failed login attempt
 *
 * Tracks attempt and applies lockout if needed
 *
 * @param request - Next.js request
 * @param email - Email address
 * @param failureReason - Reason for failure
 * @returns Lockout info if applied
 */
export async function handleFailedLogin(
  request: NextRequest,
  email: string,
  failureReason: string
) {
  const ipAddress = getClientIP(request);
  const userAgent = getUserAgent(request);

  // Track the failed attempt
  await trackLoginAttempt(email, ipAddress, false, {
    userAgent,
    failureReason,
  });

  // Apply lockout if threshold exceeded
  const lockout = await applyLockoutIfNeeded(email, ipAddress);

  if (lockout) {
    const remainingTime = lockout.lockedUntil.getTime() - Date.now();
    const minutes = Math.ceil(remainingTime / 60000);

    return {
      locked: true,
      message: `Too many failed attempts. Account locked for ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
      lockedUntil: lockout.lockedUntil,
      attemptCount: lockout.attemptCount,
    };
  }

  // Get current attempt count
  const status = await checkLockoutStatus(email, ipAddress);

  return {
    locked: false,
    attemptCount: status.attemptCount,
    attemptsRemaining: defaultConfig.firstThreshold - status.attemptCount,
  };
}

/**
 * Handle successful login
 *
 * Tracks attempt and clears any lockouts
 *
 * @param request - Next.js request
 * @param email - Email address
 * @param userId - User ID
 */
export async function handleSuccessfulLogin(request: NextRequest, email: string, userId: string) {
  const ipAddress = getClientIP(request);
  const userAgent = getUserAgent(request);

  await trackLoginAttempt(email, ipAddress, true, {
    userId,
    userAgent,
  });
}

const accountLockoutFunctions = {
  trackLoginAttempt,
  checkLockoutStatus,
  applyLockoutIfNeeded,
  clearLockout,
  unlockAccount,
  getLockoutHistory,
  getLoginAttemptHistory,
  cleanupOldRecords,
  checkLockoutMiddleware,
  handleFailedLogin,
  handleSuccessfulLogin,
};

export default accountLockoutFunctions;
