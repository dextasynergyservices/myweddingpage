/**
 * Email-based Two-Factor Authentication Library
 *
 * Alternative to TOTP for users who prefer email codes
 * Uses 6-digit codes sent via email with 10-minute expiry
 *
 * @module email-two-factor
 */

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a 6-digit verification code
 */
export function generateEmailCode(): string {
  // Generate random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  return code;
}

/**
 * Create and store email 2FA code for user
 *
 * @param userId - User's ID
 * @param ipAddress - Request IP address (optional)
 * @param userAgent - Request user agent (optional)
 * @returns The generated code (to be sent via email)
 */
export async function createEmailCode(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const code = generateEmailCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any existing unused codes for this user
  await prisma.emailTwoFactorCode.updateMany({
    where: {
      userId,
      used: false,
    },
    data: {
      used: true,
      usedAt: new Date(),
    },
  });

  // Create new code
  await prisma.emailTwoFactorCode.create({
    data: {
      userId,
      code,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return code;
}

/**
 * Verify email 2FA code for user
 *
 * @param userId - User's ID
 * @param code - 6-digit code to verify
 * @returns True if code is valid and not expired
 */
export async function verifyEmailCode(
  userId: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  // Find the code
  const emailCode = await prisma.emailTwoFactorCode.findFirst({
    where: {
      userId,
      code,
      used: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!emailCode) {
    return { valid: false, error: "Invalid or already used code" };
  }

  // Check if expired
  if (new Date() > emailCode.expiresAt) {
    return { valid: false, error: "Code has expired" };
  }

  // Mark as used
  await prisma.emailTwoFactorCode.update({
    where: { id: emailCode.id },
    data: {
      used: true,
      usedAt: new Date(),
    },
  });

  return { valid: true };
}

/**
 * Get user's preferred 2FA method
 *
 * @param userId - User's ID
 * @returns "totp" or "email"
 */
export async function get2FAMethod(userId: string): Promise<"totp" | "email"> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorMethod: true },
  });

  return (user?.twoFactorMethod as "totp" | "email") || "totp";
}

/**
 * Set user's preferred 2FA method
 *
 * @param userId - User's ID
 * @param method - "totp" or "email"
 */
export async function set2FAMethod(
  userId: string,
  method: "totp" | "email"
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorMethod: method },
  });
}

/**
 * Check if user has any active (unused, non-expired) email codes
 *
 * @param userId - User's ID
 * @returns True if active codes exist
 */
export async function hasActiveEmailCode(userId: string): Promise<boolean> {
  const activeCode = await prisma.emailTwoFactorCode.findFirst({
    where: {
      userId,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return !!activeCode;
}

/**
 * Clean up expired email codes (maintenance function)
 * Should be run periodically via cron job
 *
 * @returns Number of codes deleted
 */
export async function cleanupExpiredEmailCodes(): Promise<number> {
  const result = await prisma.emailTwoFactorCode.deleteMany({
    where: {
      OR: [
        {
          // Delete used codes older than 7 days
          used: true,
          usedAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        {
          // Delete expired unused codes older than 1 day
          used: false,
          expiresAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
  });

  return result.count;
}

/**
 * Get statistics about email 2FA usage
 *
 * @param userId - User's ID
 * @returns Usage statistics
 */
export async function getEmailCodeStats(userId: string): Promise<{
  totalSent: number;
  totalUsed: number;
  totalExpired: number;
  lastSentAt: Date | null;
}> {
  const codes = await prisma.emailTwoFactorCode.findMany({
    where: { userId },
    select: {
      used: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  const now = new Date();
  const totalSent = codes.length;
  const totalUsed = codes.filter((c) => c.used).length;
  const totalExpired = codes.filter((c) => !c.used && c.expiresAt < now).length;
  const lastSentAt =
    codes.length > 0
      ? codes.reduce(
          (latest, code) => (code.createdAt > latest ? code.createdAt : latest),
          codes[0].createdAt
        )
      : null;

  return {
    totalSent,
    totalUsed,
    totalExpired,
    lastSentAt,
  };
}
