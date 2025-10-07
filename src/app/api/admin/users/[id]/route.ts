import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/middleware/admin";

/**
 * DELETE /api/admin/users/[id]
 * Delete a user account and all related data
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (adminUser?.id === id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Prevent deleting other admins (optional safety check)
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Cannot delete admin accounts. Demote them first." },
        { status: 400 }
      );
    }

    // Delete user and all related data (cascading deletes handled by Prisma)
    await prisma.user.delete({
      where: { id },
    });

    // Log admin action
    await logAdminAction(`Deleted user account: ${user.email}`, {
      userId: id,
      userEmail: user.email,
      userRole: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "User account has been deleted",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user account",
      },
      { status: 500 }
    );
  }
}
