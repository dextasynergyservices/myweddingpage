/**
 * API Route: Send Email 2FA Code
 * POST /api/auth/2fa/email/send-code
 *
 * Generates and sends a 6-digit verification code via email
 * Used during login when user has email-based 2FA enabled
 */

import { NextRequest, NextResponse } from "next/server";
import { createEmailCode } from "@/lib/email-two-factor";
import { send2FACodeEmail } from "@/lib/email-services/send2FACode";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        groomName: true,
        brideName: true,
        twoFactorSecret: {
          select: { enabled: true },
        },
        twoFactorMethod: true,
      },
    });

    if (!user) {
      // Don't reveal that user doesn't exist (security)
      return NextResponse.json(
        { message: "If this email has 2FA enabled, a code has been sent" },
        { status: 200 }
      );
    }

    // Check if 2FA is enabled
    if (!user.twoFactorSecret?.enabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled for this account" },
        { status: 400 }
      );
    }

    // Check if user prefers email method
    if (user.twoFactorMethod !== "email") {
      return NextResponse.json(
        { error: "Email 2FA is not enabled. Please use your authenticator app" },
        { status: 400 }
      );
    }

    // Get request metadata
    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Generate and store code
    const code = await createEmailCode(user.id, ipAddress, userAgent);

    // Send email
    const userName = user.groomName || user.brideName || user.email?.split("@")[0] || "User";
    const emailResult = await send2FACodeEmail({
      email: user.email!,
      userName,
      code,
      expiresInMinutes: 10,
      ipAddress,
      userAgent,
    });

    if (!emailResult.success) {
      await logSecurityEvent({
        eventType: "TWO_FA_EMAIL_SEND_FAILED",
        severity: "MEDIUM",
        userId: user.id,
        ipAddress,
        userAgent,
        message: `Failed to send 2FA code: ${emailResult.error}`,
      });
      return NextResponse.json(
        { error: "Failed to send verification code. Please try again" },
        { status: 500 }
      );
    }

    // Log successful code sending
    await logSecurityEvent({
      eventType: "TWO_FA_EMAIL_CODE_SENT",
      severity: "LOW",
      userId: user.id,
      ipAddress,
      userAgent,
      message: "Email 2FA code sent successfully",
    });

    return NextResponse.json({
      message: "Verification code sent to your email",
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error("Error sending 2FA email code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
