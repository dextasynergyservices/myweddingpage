/**
 * API Route: Set 2FA Method Preference
 * POST /api/auth/2fa/set-method
 *
 * Allows user to choose between TOTP (authenticator app) or Email 2FA
 * Requires authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security-logger";
import { set2FAMethod } from "@/lib/email-two-factor";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { method } = body;

    // Validate method
    if (!method || !["totp", "email"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid method. Must be 'totp' or 'email'" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        twoFactorSecret: {
          select: { enabled: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if 2FA is enabled
    if (!user.twoFactorSecret?.enabled) {
      return NextResponse.json(
        { error: "Please enable 2FA first before choosing a method" },
        { status: 400 }
      );
    }

    // Get request metadata
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Update method preference
    await set2FAMethod(user.id, method);

    // Log the method change
    await logSecurityEvent({
      eventType: "TWO_FA_METHOD_CHANGED",
      severity: "MEDIUM",
      userId: session.user.id,
      ipAddress,
      userAgent,
      message: `2FA method changed to: ${method}`,
    });

    return NextResponse.json({
      success: true,
      method,
      message: `2FA method updated to ${method === "totp" ? "authenticator app" : "email"}`,
    });
  } catch (error) {
    console.error("Error setting 2FA method:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current method
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        twoFactorMethod: true,
        twoFactorSecret: {
          select: { enabled: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      method: user.twoFactorMethod || "totp",
      enabled: user.twoFactorSecret?.enabled || false,
    });
  } catch (error) {
    console.error("Error getting 2FA method:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
