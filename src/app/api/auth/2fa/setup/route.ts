/**
 * 2FA Setup Endpoint
 *
 * POST /api/auth/2fa/setup
 * - Generates a new TOTP secret and QR code
 * - Returns QR code data URL and backup codes
 * - Requires authentication
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  generateSecret,
  generateQRCode,
  generateBackupCodes,
  enable2FA,
  formatBackupCode,
} from "@/lib/two-factor";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, id: userId } = session.user;

    if (!email) {
      return NextResponse.json(
        { error: "Email required for 2FA setup" },
        { status: 400 }
      );
    }

    // Generate secret and QR code
    const secret = generateSecret();
    const qrCodeDataUrl = await generateQRCode(email, secret);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable 2FA in database
    const result = await enable2FA(userId, secret, backupCodes);

    if (!result.success) {
      await logSecurityEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        severity: "MEDIUM",
        userId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || undefined,
        endpoint: "/api/auth/2fa/setup",
        method: "POST",
        message: "Failed to setup 2FA",
        metadata: { error: result.error },
      });

      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Log successful 2FA setup
    await logSecurityEvent({
      eventType: "REGISTER_SUCCESS",
      severity: "LOW",
      userId,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || undefined,
      endpoint: "/api/auth/2fa/setup",
      method: "POST",
      message: "2FA enabled successfully",
    });

    // Format backup codes for display
    const formattedCodes = backupCodes.map(formatBackupCode);

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      backupCodes: formattedCodes,
      message:
        "2FA setup successful. Save your backup codes in a secure location.",
    });
  } catch (error) {
    console.error("2FA setup error:", error);

    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 });
  }
}
