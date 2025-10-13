/**
 * API Route: Verify Email 2FA Code
 * POST /api/auth/2fa/email/verify
 *
 * Verifies a 6-digit email 2FA code during login
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailCode } from "@/lib/email-two-factor";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security-logger";
import withTiming from "@/lib/withTiming";

export async function POST(request: NextRequest) {
  return withTiming(
    request,
    async () => {
      try {
        const body = await request.json();
        const { userId, code } = body;

        if (!userId || !code) {
          return NextResponse.json({ error: "User ID and code are required" }, { status: 400 });
        }

        // Get request metadata
        const ipAddress =
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // Verify the code
        const result = await verifyEmailCode(userId, code.trim());

        if (!result.valid) {
          // Log failed attempt
          await logSecurityEvent({
            eventType: "TWO_FA_EMAIL_VERIFY_FAILED",
            severity: "MEDIUM",
            userId,
            ipAddress,
            userAgent,
            message: `Email 2FA verification failed: ${result.error}`,
          });

          return NextResponse.json(
            { error: result.error || "Invalid verification code" },
            { status: 400 }
          );
        }

        // Update last used timestamp in TwoFactorSecret
        await prisma.twoFactorSecret.updateMany({
          where: { userId },
          data: { lastUsedAt: new Date() },
        });

        // Log successful verification
        await logSecurityEvent({
          eventType: "TWO_FA_EMAIL_VERIFY_SUCCESS",
          severity: "LOW",
          userId,
          ipAddress,
          userAgent,
          message: "Email 2FA verification successful",
        });

        return NextResponse.json({
          success: true,
          message: "Verification successful",
        });
      } catch (error) {
        console.error("Error verifying email 2FA code:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    },
    { sampleRate: 1, eventType: "TWO_FA_EMAIL_VERIFY_SUCCESS" }
  );
}
