import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/middleware/admin";

/**
 * POST /api/admin/users/[id]/unlock
 * Unlock a locked user account
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Find active lockouts for this user
    const activeLockouts = await prisma.accountLockout.findMany({
      where: {
        userId: id,
        unlocked: false,
      },
    });

    if (activeLockouts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active lockouts found" },
        { status: 404 }
      );
    }

    // Unlock all active lockouts
    await prisma.accountLockout.updateMany({
      where: {
        userId: id,
        unlocked: false,
      },
      data: {
        unlocked: true,
        unlockedAt: new Date(),
        unlockedBy: adminUser?.id || "system",
      },
    });

    // Also reset login attempts for this user/email
    await prisma.loginAttempt.deleteMany({
      where: {
        userId: id,
        success: false,
      },
    });

    // Log admin action
    await logAdminAction(`Unlocked account for user: ${user.email}`, {
      userId: id,
      userEmail: user.email,
      unlockedCount: activeLockouts.length,
    });

    return NextResponse.json({
      success: true,
      message: "Account has been unlocked",
      unlockedCount: activeLockouts.length,
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
