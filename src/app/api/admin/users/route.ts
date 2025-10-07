import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/admin";

/**
 * GET /api/admin/users
 * List all users with their details
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { groomName: { contains: search, mode: "insensitive" } },
        { brideName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role;
    }

    // Fetch users with related data
    const users = await prisma.user.findMany({
      where,
      include: {
        twoFactorSecret: {
          select: {
            enabled: true,
          },
        },
        _count: {
          select: {
            weddingPages: true,
            payments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Get lockout status for each user
    const userIds = users.map((u) => u.id);
    const lockouts = await prisma.accountLockout.findMany({
      where: {
        userId: { in: userIds },
        unlocked: false,
        lockedUntil: { gt: new Date() },
      },
    });

    const lockoutMap = new Map(lockouts.map((l) => [l.userId, l]));

    // Format users for response
    const formattedUsers = users.map((user) => {
      const lockout = lockoutMap.get(user.id);

      return {
        id: user.id,
        name:
          user.groomName && user.brideName
            ? `${user.groomName} & ${user.brideName}`
            : user.groomName || user.brideName || null,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorSecret?.enabled || false,
        emailVerified: user.emailVerified,
        createdAt: user.created_at.toISOString(),
        lastLoginAt: null, // Not tracked in current schema
        accountLockedUntil: lockout?.lockedUntil || null,
        failedLoginAttempts: lockout?.attemptCount || 0,
        weddingPagesCount: user._count.weddingPages,
        paymentsCount: user._count.payments,
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
