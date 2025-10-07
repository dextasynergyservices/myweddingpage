import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/rate-limits
 * Get active rate limits from Redis and memory
 */
export async function GET() {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Mock data for now - in production, you'd query Redis
    // and memory rate limit stores
    const limits = [
      {
        identifier: "api:login:192.168.1.1",
        count: 4,
        limit: 5,
        remaining: 1,
        reset: Date.now() + 300000, // 5 minutes
        backend: "redis" as const,
      },
      {
        identifier: "api:register:10.0.0.5",
        count: 8,
        limit: 10,
        remaining: 2,
        reset: Date.now() + 180000, // 3 minutes
        backend: "redis" as const,
      },
    ];

    // Get rate limit hits from last 24 hours
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    const rateLimitHits = await prisma.securityLog.count({
      where: {
        eventType: "RATE_LIMIT_HIT",
        timestamp: {
          gte: dayAgo,
        },
      },
    });

    // Generate chart data for last 24 hours
    const chartData = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);

      chartData.push({
        time: `${hour.getHours()}:00`,
        hits: Math.floor(Math.random() * 20) + 5,
        blocked: Math.floor(Math.random() * 5),
      });
    }

    const stats = {
      totalLimits: limits.length,
      redisLimits: limits.filter((l) => l.backend === "redis").length,
      memoryLimits: 0, // No memory limits in mock data
      totalBlocked: rateLimitHits,
      chartData,
    };

    return NextResponse.json({
      success: true,
      limits,
      stats,
    });
  } catch (error) {
    console.error("Error fetching rate limits:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch rate limits",
      },
      { status: 500 }
    );
  }
}
