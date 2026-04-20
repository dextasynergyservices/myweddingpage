/**
 * Two-Factor Authentication (2FA) Library
 *
 * Implements TOTP (Time-based One-Time Password) authentication
 * Compatible with Google Authenticator, Authy, Microsoft Authenticator, etc.
 *
 * Features:
 * - QR code generation for easy setup
 * - TOTP token verification
 * - Backup codes for account recovery
 * - Email delivery of backup codes
 */

import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Configure TOTP settings
authenticator.options = {
  window: 1, // Allow 1 time-step before and after (30s window each side)
  step: 30, // Time step in seconds (standard is 30s)
};

const APP_NAME = "MyWeddingPage";
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

/**
 * Generate a random secret for TOTP
 */
export function generateSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate a QR code data URL for setting up 2FA in authenticator apps
 */
export async function generateQRCode(
  email: string,
  secret: string
): Promise<string> {
  const otpauthUrl = authenticator.keyuri(email, APP_NAME, secret);

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    // Remove spaces and convert to uppercase (some apps format codes with spaces)
    const cleanToken = token.replace(/\s/g, "").toUpperCase();
    return authenticator.verify({ token: cleanToken, secret });
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 * Returns plain text codes that should be shown to user once
 */
export function generateBackupCodes(
  count: number = BACKUP_CODE_COUNT
): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate random backup code (alphanumeric, easy to type)
    const code = crypto
      .randomBytes(BACKUP_CODE_LENGTH)
      .toString("hex")
      .slice(0, BACKUP_CODE_LENGTH)
      .toUpperCase();

    codes.push(code);
  }

  return codes;
}

/**
 * Hash a backup code for storage
 */
export async function hashBackupCode(code: string): Promise<string> {
  return bcrypt.hash(code.toUpperCase(), 10);
}

/**
 * Verify a backup code against a hash
 */
export async function verifyBackupCode(
  code: string,
  hash: string
): Promise<boolean> {
  try {
    return bcrypt.compare(code.toUpperCase(), hash);
  } catch (error) {
    console.error("Backup code verification error:", error);
    return false;
  }
}

/**
 * Enable 2FA for a user
 * Stores the secret and generates backup codes
 */
export async function enable2FA(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Hash all backup codes
    const hashedCodes = await Promise.all(
      backupCodes.map((code) => hashBackupCode(code))
    );

    // Check if 2FA secret already exists
    const existing = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (existing) {
      // Update existing secret
      await prisma.twoFactorSecret.update({
        where: { userId },
        data: {
          secret,
          enabled: true,
          enabledAt: new Date(),
          backupCodes: {
            deleteMany: {}, // Delete old backup codes
            create: hashedCodes.map((code) => ({
              code,
              used: false,
            })),
          },
        },
      });
    } else {
      // Create new secret
      await prisma.twoFactorSecret.create({
        data: {
          userId,
          secret,
          enabled: true,
          enabledAt: new Date(),
          backupCodes: {
            create: hashedCodes.map((code) => ({
              code,
              used: false,
            })),
          },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to enable 2FA:", error);
    return { success: false, error: "Failed to enable 2FA" };
  }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        enabled: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to disable 2FA:", error);
    return { success: false, error: "Failed to disable 2FA" };
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  try {
    const secret = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    return secret?.enabled ?? false;
  } catch (error) {
    console.error("Failed to check 2FA status:", error);
    return false;
  }
}

/**
 * Verify 2FA token for a user
 * Updates lastUsedAt on successful verification
 */
export async function verify2FAToken(
  userId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactorSecret || !twoFactorSecret.enabled) {
      return { success: false, error: "2FA not enabled" };
    }

    const isValid = verifyToken(token, twoFactorSecret.secret);

    if (isValid) {
      // Update last used timestamp
      await prisma.twoFactorSecret.update({
        where: { userId },
        data: { lastUsedAt: new Date() },
      });

      return { success: true };
    }

    return { success: false, error: "Invalid token" };
  } catch (error) {
    console.error("Failed to verify 2FA token:", error);
    return { success: false, error: "Verification failed" };
  }
}

/**
 * Verify and consume a backup code
 * Marks the code as used if valid
 */
export async function verifyAndConsumeBackupCode(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string; remainingCodes?: number }> {
  try {
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
      where: { userId },
      include: {
        backupCodes: {
          where: { used: false },
        },
      },
    });

    if (!twoFactorSecret || !twoFactorSecret.enabled) {
      return { success: false, error: "2FA not enabled" };
    }

    // Try each unused backup code
    for (const backupCode of twoFactorSecret.backupCodes) {
      const isValid = await verifyBackupCode(code, backupCode.code);

      if (isValid) {
        // Mark code as used
        await prisma.twoFactorBackupCode.update({
          where: { id: backupCode.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });

        // Count remaining unused codes
        const remainingCodes = twoFactorSecret.backupCodes.length - 1;

        return { success: true, remainingCodes };
      }
    }

    return { success: false, error: "Invalid backup code" };
  } catch (error) {
    console.error("Failed to verify backup code:", error);
    return { success: false, error: "Verification failed" };
  }
}

/**
 * Get count of remaining unused backup codes
 */
export async function getRemainingBackupCodes(userId: string): Promise<number> {
  try {
    const count = await prisma.twoFactorBackupCode.count({
      where: {
        secret: {
          userId,
        },
        used: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Failed to get backup code count:", error);
    return 0;
  }
}

/**
 * Regenerate backup codes for a user
 * Invalidates all old codes
 */
export async function regenerateBackupCodes(
  userId: string
): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  try {
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactorSecret) {
      return { success: false, error: "2FA not setup" };
    }

    // Generate new codes
    const newCodes = generateBackupCodes();
    const hashedCodes = await Promise.all(
      newCodes.map((code) => hashBackupCode(code))
    );

    // Delete old codes and create new ones
    await prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        backupCodes: {
          deleteMany: {}, // Remove all old codes
          create: hashedCodes.map((code) => ({
            code,
            used: false,
          })),
        },
      },
    });

    return { success: true, codes: newCodes };
  } catch (error) {
    console.error("Failed to regenerate backup codes:", error);
    return { success: false, error: "Failed to regenerate codes" };
  }
}

/**
 * Format backup codes for display (groups of 4 characters)
 * Example: ABCD1234 -> ABCD-1234
 */
export function formatBackupCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}
