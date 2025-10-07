import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/admin";

/**
 * GET /api/admin/lockouts
 * Get all account lockouts
 */
export async function GET() {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Fetch all lockouts
    const lockouts = await prisma.accountLockout.findMany({
      orderBy: {
        lockedAt: "desc",
      },
      take: 100, // Limit to last 100
    });

    // Calculate stats
    const activeLockouts = lockouts.filter(
      (l) => !l.unlocked && new Date(l.lockedUntil) > new Date()
    ).length;

    const unlockedLockouts = lockouts.filter((l) => l.unlocked).length;

    // Generate chart data for last 7 days
    const chartData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];

      const count = lockouts.filter((l) => {
        const lockoutDate = new Date(l.lockedAt).toISOString().split("T")[0];
        return lockoutDate === dateStr;
      }).length;

      chartData.push({
        date: dayName,
        lockouts: count,
      });
    }

    const stats = {
      totalLockouts: lockouts.length,
      activeLockouts,
      unlockedLockouts,
      chartData,
    };

    return NextResponse.json({
      success: true,
      lockouts,
      stats,
    });
  } catch (error) {
    console.error("Error fetching lockouts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch account lockouts",
      },
      { status: 500 }
    );
  }
}
