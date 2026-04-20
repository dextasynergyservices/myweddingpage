/**
 * 2FA Verification Endpoint
 *
 * POST /api/auth/2fa/verify
 * - Verifies a TOTP token or backup code during login
 * - Returns success status
 */

import { NextResponse, NextRequest } from "next/server";
import { verify2FAToken, verifyAndConsumeBackupCode } from "@/lib/two-factor";
import { logSecurityEvent } from "@/lib/security-logger";
import withTiming from "@/lib/withTiming";

export async function POST(req: Request) {
  // Wrap the existing logic with withTiming; convert Request to NextRequest where useful
  const nextReq = req as NextRequest;
  return withTiming(
    nextReq,
    async () => {
      try {
        const body = await req.json();
        const { userId, token, isBackupCode } = body;

        if (!userId || !token) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let result;

        if (isBackupCode) {
          // Verify backup code
          result = await verifyAndConsumeBackupCode(userId, token);

          if (result.success) {
            await logSecurityEvent({
              eventType: "LOGIN_SUCCESS",
              severity: "MEDIUM",
              userId,
              ipAddress: req.headers.get("x-forwarded-for") || "unknown",
              userAgent: req.headers.get("user-agent") || undefined,
              endpoint: "/api/auth/2fa/verify",
              method: "POST",
              message: "2FA backup code verified successfully",
              metadata: { remainingCodes: result.remainingCodes },
            });

            return NextResponse.json({
              success: true,
              message: "Backup code verified",
              remainingCodes: result.remainingCodes,
            });
          }
        } else {
          // Verify TOTP token
          result = await verify2FAToken(userId, token);

          if (result.success) {
            await logSecurityEvent({
              eventType: "LOGIN_SUCCESS",
              severity: "LOW",
              userId,
              ipAddress: req.headers.get("x-forwarded-for") || "unknown",
              userAgent: req.headers.get("user-agent") || undefined,
              endpoint: "/api/auth/2fa/verify",
              method: "POST",
              message: "2FA token verified successfully",
            });

            return NextResponse.json({
              success: true,
              message: "Token verified",
            });
          }
        }

        // Failed verification
        await logSecurityEvent({
          eventType: "LOGIN_FAILURE",
          severity: "MEDIUM",
          userId,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent") || undefined,
          endpoint: "/api/auth/2fa/verify",
          method: "POST",
          message: "2FA verification failed",
          metadata: { isBackupCode, error: result?.error },
        });

        return NextResponse.json(
          { error: result?.error || "Verification failed" },
          { status: 401 }
        );
      } catch (error) {
        console.error("2FA verification error:", error);

        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
      }
    },
    { sampleRate: 1, eventType: "LOGIN_SUCCESS" }
  );
}
