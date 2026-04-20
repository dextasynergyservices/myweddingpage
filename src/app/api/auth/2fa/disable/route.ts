/**
 * 2FA Disable Endpoint
 *
 * POST /api/auth/2fa/disable
 * - Disables 2FA for the authenticated user
 * - Requires password confirmation
 * - Requires authentication
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { disable2FA } from "@/lib/two-factor";
import { logSecurityEvent } from "@/lib/security-logger";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();
    const userId = session.user.id;

    if (!password) {
      return NextResponse.json(
        { error: "Password required to disable 2FA" },
        { status: 400 }
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await logSecurityEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        severity: "HIGH",
        userId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || undefined,
        endpoint: "/api/auth/2fa/disable",
        method: "POST",
        message: "Failed attempt to disable 2FA with wrong password",
      });

      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Disable 2FA
    const result = await disable2FA(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Log successful 2FA disable
    await logSecurityEvent({
      eventType: "SUSPICIOUS_ACTIVITY",
      severity: "MEDIUM",
      userId,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || undefined,
      endpoint: "/api/auth/2fa/disable",
      method: "POST",
      message: "2FA disabled successfully",
    });

    return NextResponse.json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    console.error("2FA disable error:", error);

    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}
