/**
 * 2FA Status Endpoint
 *
 * GET /api/auth/2fa/status
 * - Returns whether the authenticated user has 2FA enabled
 * - Returns remaining backup codes count
 * - Requires authentication
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { is2FAEnabled, getRemainingBackupCodes } from "@/lib/two-factor";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check 2FA status
    const enabled = await is2FAEnabled(userId);

    let remainingBackupCodes = 0;
    let method = "totp"; // default

    if (enabled) {
      remainingBackupCodes = await getRemainingBackupCodes(userId);

      // Get user's preferred 2FA method
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorMethod: true },
      });
      method = user?.twoFactorMethod || "totp";
    }

    return NextResponse.json({
      enabled,
      remainingBackupCodes,
      method,
    });
  } catch (error) {
    console.error("2FA status check error:", error);

    return NextResponse.json({ error: "Failed to check 2FA status" }, { status: 500 });
  }
}
