import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/middleware/admin";

/**
 * POST /api/admin/users/[id]/reset-2fa
 * Reset user's two-factor authentication
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const adminUser = await requireAdmin();
    if (adminUser instanceof NextResponse) {
      return adminUser;
    }

    const { id } = params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Delete all 2FA related data for the user
    await prisma.$transaction([
      // Delete 2FA secret and backup codes (cascades)
      prisma.twoFactorSecret.deleteMany({
        where: { userId: id },
      }),
      // Delete email 2FA codes
      prisma.emailTwoFactorCode.deleteMany({
        where: { userId: id },
      }),
      // Reset 2FA method preference
      prisma.user.update({
        where: { id },
        data: { twoFactorMethod: null },
      }),
    ]);

    // Log admin action
    await logAdminAction(`Reset 2FA for user: ${user.email}`, {
      userId: id,
      userEmail: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication has been reset",
    });
  } catch (error) {
    console.error("Error resetting 2FA:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset two-factor authentication",
      },
      { status: 500 }
    );
  }
}
