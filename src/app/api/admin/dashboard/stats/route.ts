import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/admin";

export async function GET() {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Get date 7 days ago for weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get date 30 days ago for monthly stats
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalUsersLastMonth,
      activeUsers,
      totalSecurityLogs,
      rateLimitHits,
      lockedAccounts,
      twoFactorEnabled,
      securityIncidents,
      dailyStats,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total users last month (for growth calculation)
      prisma.user.count({
        where: {
          created_at: {
            lte: monthAgo,
          },
        },
      }),

      // Active users (with email verified - using as proxy for active)
      prisma.user.count({
        where: {
          emailVerified: {
            not: null,
          },
        },
      }),

      // Total security logs
      prisma.securityLog.count(),

      // Rate limit hits (last 7 days)
      prisma.securityLog.count({
        where: {
          eventType: "RATE_LIMIT_HIT",
          timestamp: {
            gte: weekAgo,
          },
        },
      }),

      // Locked accounts (currently locked)
      prisma.accountLockout.count({
        where: {
          unlocked: false,
          lockedUntil: {
            gt: new Date(),
          },
        },
      }),

      // Users with 2FA enabled
      prisma.twoFactorSecret.count({
        where: {
          enabled: true,
        },
      }),

      // Security incidents (critical events in last 24 hours)
      prisma.securityLog.count({
        where: {
          severity: "CRITICAL",
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Daily stats for the last 7 days
      prisma.$queryRaw<Array<{ date: Date; users: bigint; logins: bigint; events: bigint }>>`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as users,
          0 as logins,
          0 as events
        FROM "User"
        WHERE created_at >= ${weekAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    // Calculate user growth percentage
    const userGrowthPercentage =
      totalUsersLastMonth > 0
        ? ((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100
        : 0;

    // Get login and security event counts for chart
    const loginCounts = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM "SecurityLog"
      WHERE "eventType" = 'LOGIN_SUCCESS'
        AND timestamp >= ${weekAgo}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    const eventCounts = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM "SecurityLog"
      WHERE timestamp >= ${weekAgo}
        AND "eventType" IN ('RATE_LIMIT_HIT', 'LOGIN_FAILURE', 'BRUTE_FORCE_DETECTED')
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    // Create a map of dates to counts
    const loginMap = new Map(loginCounts.map((item) => [item.date, item.count]));

    const eventMap = new Map(eventCounts.map((item) => [item.date, item.count]));

    // Generate chart data for last 7 days
    const chartData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];

      // Find user registrations for this day
      const dayUsers = dailyStats.find((stat) => stat.date.toISOString().split("T")[0] === dateStr);

      chartData.push({
        name: dayName,
        users: dayUsers ? Number(dayUsers.users) : 0,
        logins: loginMap.get(dateStr) || 0,
        events: eventMap.get(dateStr) || 0,
      });
    }

    const stats = {
      totalUsers,
      activeUsers,
      totalSecurityLogs,
      rateLimitHits,
      lockedAccounts,
      twoFactorEnabled,
      userGrowthPercentage: Number(userGrowthPercentage.toFixed(2)),
      securityIncidents,
    };

    return NextResponse.json({
      success: true,
      stats,
      chartData,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}
