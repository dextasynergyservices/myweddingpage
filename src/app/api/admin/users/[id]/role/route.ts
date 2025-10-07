import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/middleware/admin";

/**
 * PATCH /api/admin/users/[id]/role
 * Change user role (USER <-> ADMIN)
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const adminUser = await (await import("@/lib/middleware/admin")).getAdminUser();

    const { id } = params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Prevent demoting yourself
    if (adminUser?.id === id && role === "USER") {
      return NextResponse.json(
        { success: false, error: "Cannot demote yourself" },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as "USER" | "ADMIN" },
      select: { id: true, email: true, role: true },
    });

    // Log admin action
    await logAdminAction(`Changed user role: ${user.email} from ${user.role} to ${role}`, {
      userId: id,
      userEmail: user.email,
      oldRole: user.role,
      newRole: role,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user role",
      },
      { status: 500 }
    );
  }
}
