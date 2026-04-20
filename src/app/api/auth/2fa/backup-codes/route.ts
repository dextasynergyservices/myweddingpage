/**
 * 2FA Backup Codes Regeneration Endpoint
 *
 * POST /api/auth/2fa/backup-codes
 * - Regenerates backup codes for the authenticated user
 * - Invalidates all old backup codes
 * - Requires password confirmation
 * - Requires authentication
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { regenerateBackupCodes, formatBackupCode } from "@/lib/two-factor";
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
        { error: "Password required to regenerate backup codes" },
        { status: 400 }
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await logSecurityEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        severity: "HIGH",
        userId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || undefined,
        endpoint: "/api/auth/2fa/backup-codes",
        method: "POST",
        message: "Failed attempt to regenerate backup codes with wrong password",
      });

      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Regenerate backup codes
    const result = await regenerateBackupCodes(userId);

    if (!result.success || !result.codes) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Log successful backup code regeneration
    await logSecurityEvent({
      eventType: "REGISTER_SUCCESS",
      severity: "MEDIUM",
      userId,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || undefined,
      endpoint: "/api/auth/2fa/backup-codes",
      method: "POST",
      message: "Backup codes regenerated successfully",
    });

    // Format backup codes for display
    const formattedCodes = result.codes.map(formatBackupCode);

    return NextResponse.json({
      success: true,
      backupCodes: formattedCodes,
      message: "Backup codes regenerated successfully. Save them in a secure location.",
    });
  } catch (error) {
    console.error("Backup codes regeneration error:", error);

    return NextResponse.json({ error: "Failed to regenerate backup codes" }, { status: 500 });
  }
}
