/**
 * Check if user requires 2FA
 *
 * POST /api/auth/check-2fa
 * - Checks if user has 2FA enabled based on email/phone
 * - Does NOT require authentication (used during login flow)
 * - Only returns whether 2FA is required, no sensitive data
 */

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import withTiming from "@/lib/withTiming";

export async function POST(req: Request) {
  const nextReq = req as NextRequest;
  return withTiming(
    nextReq,
    async () => {
      try {
        const { emailOrPhone } = await req.json();

        if (!emailOrPhone) {
          return NextResponse.json(
            { error: "Email or phone required" },
            { status: 400 }
          );
        }

        // Find user by email or phone
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: emailOrPhone }, { whatsapp: emailOrPhone }],
          },
          select: {
            id: true,
            twoFactorSecret: {
              select: {
                enabled: true,
              },
            },
            twoFactorMethod: true, // Get user's preferred 2FA method
          },
        });

        if (!user) {
          // Don't reveal if user exists - return false
          return NextResponse.json({
            requires2FA: false,
          });
        }

        const requires2FA = user.twoFactorSecret?.enabled ?? false;
        const method = user.twoFactorMethod || "totp"; // Default to TOTP

        return NextResponse.json({
          requires2FA,
          userId: requires2FA ? user.id : undefined, // Only return userId if 2FA is needed
          method: requires2FA ? method : undefined, // Return preferred method if 2FA enabled
        });
      } catch (error) {
        console.error("Check 2FA error:", error);

        return NextResponse.json(
          { error: "Failed to check 2FA status" },
          { status: 500 }
        );
      }
    },
    { sampleRate: 1, eventType: "TWO_FA_CHECK" }
  );
}
