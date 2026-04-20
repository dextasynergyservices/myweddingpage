import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/middleware/admin";

/**
 * POST /api/admin/lockouts/[id]/unlock
 * Unlock a specific lockout
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const adminUser = await (await import("@/lib/middleware/admin")).getAdminUser();

    const { id } = params;

    // Check if lockout exists
    const lockout = await prisma.accountLockout.findUnique({
      where: { id },
    });

    if (!lockout) {
      return NextResponse.json({ success: false, error: "Lockout not found" }, { status: 404 });
    }

    if (lockout.unlocked) {
      return NextResponse.json(
        { success: false, error: "Account is already unlocked" },
        { status: 400 }
      );
    }

    // Unlock the account
    await prisma.accountLockout.update({
      where: { id },
      data: {
        unlocked: true,
        unlockedAt: new Date(),
        unlockedBy: adminUser?.id || "system",
      },
    });

    // Log admin action
    await logAdminAction(`Unlocked account for: ${lockout.email}`, {
      lockoutId: id,
      email: lockout.email,
    });

    return NextResponse.json({
      success: true,
      message: "Account unlocked successfully",
    });
  } catch (error) {
    console.error("Error unlocking account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to unlock account",
      },
      { status: 500 }
    );
  }
}
