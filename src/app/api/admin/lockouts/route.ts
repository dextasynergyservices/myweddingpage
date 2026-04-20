import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
      console.log("Admin check failed:", adminCheck.status, await adminCheck.json());
      return adminCheck;
    }

    console.log("Fetching lockouts...");

    // Fetch all lockouts
    const lockouts = await prisma.accountLockout.findMany({
      orderBy: {
        lockedAt: "desc",
      },
      take: 100, // Limit to last 100
    });

    console.log("Found lockouts:", lockouts.length);

    // Calculate stats
    let activeLockouts = 0;
    let unlockedLockouts = 0;
    try {
      activeLockouts = lockouts.filter(
        (l) => !l.unlocked && new Date(l.lockedUntil) > new Date()
      ).length;

      unlockedLockouts = lockouts.filter((l) => l.unlocked).length;
    } catch (statsError) {
      console.error("Error calculating stats:", statsError);
      activeLockouts = 0;
      unlockedLockouts = 0;
    }

    // Generate chart data for last 7 days
    const chartData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];

      const count = lockouts.filter((l) => {
        try {
          const lockoutDate = new Date(l.lockedAt).toISOString().split("T")[0];
          return lockoutDate === dateStr;
        } catch {
          return false;
        }
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

    console.log("Returning stats:", stats);

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
