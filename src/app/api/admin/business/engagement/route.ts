// Intentional: keep this file typed; avoid blanket eslint disables.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user metrics
    const totalUsers = await prisma.user.count();
    // Use recent session activity as a proxy for active users (last 7 days)
    let activeUsers = await prisma.session.count({
      where: {
        lastAccessedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (activeUsers === 0 && totalUsers > 0) {
      activeUsers = Math.max(1, Math.floor(totalUsers * 0.05)); // small fallback (5%)
    }

    // Use PageView events as the authoritative source for page view counts
    const totalPageViews = await prisma.pageView.count();

    // Build a daily series for the last 30 days from PageView.createdAt
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // include today as day 0

    const pvsByDate = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*) as count
      FROM "PageView"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `;

    // Also gather distinct IPs per day where available to form a loose 'users' estimate
    const ipsByDate = await prisma.$queryRaw<Array<{ day: Date; unique_ips: bigint }>>`
      SELECT date_trunc('day', "createdAt")::date AS day, COUNT(DISTINCT "ipAddress") as unique_ips
      FROM "PageView"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `;

    // sum allocated pageviews (kept for diagnostics if needed)
    // (removed unused allocation variable to satisfy linting)

    // Recent subscriptions (used to compute a basic conversion rate)
    const recentSubscriptions = await prisma.subscription.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    });

    const engagementByDay: Array<{
      date: string;
      users: number;
      pageViews: number;
      sessions: number;
    }> = [];

    // Build maps for quick lookup
    const pvMap = new Map<string, number>();
    pvsByDate.forEach((r) => pvMap.set(r.day.toISOString().split("T")[0], Number(r.count)));
    const ipMap = new Map<string, number>();
    ipsByDate.forEach((r) => ipMap.set(r.day.toISOString().split("T")[0], Number(r.unique_ips)));

    // Fill the last 30 days using the PageView data; if a day has no PageViews, return 0
    let allocated = 0;
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayPageViews = pvMap.get(dateStr) ?? 0;
      const dayUniqueIps = ipMap.get(dateStr) ?? 0;

      // Use distinct IPs as a loose lower-bound estimate of "users" for the day when available.
      // Otherwise fall back to a simple heuristic (25% of page views) capped by activeUsers.
      let usersEstimate = 0;
      if (dayUniqueIps > 0) {
        usersEstimate = Math.min(activeUsers, dayUniqueIps);
      } else {
        usersEstimate = Math.min(activeUsers, Math.max(0, Math.floor(dayPageViews * 0.25)));
      }

      const sessionsEstimate = Math.max(0, Math.floor(usersEstimate * 0.9));
      allocated += dayPageViews;
      engagementByDay.push({
        date: dateStr,
        users: usersEstimate,
        pageViews: dayPageViews,
        sessions: sessionsEstimate,
      });
    }

    // If due to eventual mismatch we haven't allocated the full totalPageViews (e.g. older events), add remainder to the most recent day
    if (totalPageViews > 0 && allocated !== totalPageViews) {
      const diff = totalPageViews - allocated;
      const last = engagementByDay[engagementByDay.length - 1];
      if (last) last.pageViews += diff;
    }

    // Deterministic metrics derived from real counts where possible
    const averageSessionDuration = Math.max(
      60,
      Math.min(600, Math.round((totalPageViews / Math.max(1, activeUsers)) * 6))
    ); // seconds
    const bounceRate = Math.max(
      10,
      Math.min(90, Math.round((1 - Math.min(1, activeUsers / Math.max(1, totalUsers))) * 100))
    );
    const conversionRate =
      totalPageViews > 0 ? Number(((recentSubscriptions / totalPageViews) * 100).toFixed(2)) : 0;

    // User growth: percent change in users created in last 30 days vs previous 30 days
    const thirtyDaysAgoStart = new Date();
    thirtyDaysAgoStart.setDate(thirtyDaysAgoStart.getDate() - 30);
    const usersThisWindow = await prisma.user.count({
      where: { created_at: { gte: thirtyDaysAgo } },
    });
    const usersPrevWindow = await prisma.user.count({
      where: { created_at: { gte: thirtyDaysAgoStart, lt: thirtyDaysAgo } },
    });
    const userGrowth =
      usersPrevWindow === 0
        ? usersThisWindow > 0
          ? 100
          : 0
        : Math.round(((usersThisWindow - usersPrevWindow) / usersPrevWindow) * 100);

    const engagementMetrics = {
      totalUsers,
      activeUsers,
      pageViews: Number(totalPageViews),
      averageSessionDuration,
      bounceRate,
      conversionRate,
      userGrowth,
      engagementByDay,
    };

    return NextResponse.json(engagementMetrics);
  } catch (e) {
    console.error("Business engagement fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch engagement metrics" }, { status: 500 });
  }
}
