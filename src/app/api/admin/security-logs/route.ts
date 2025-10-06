import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  querySecurityLogs,
  getSecurityStats,
  getRecentCriticalEvents,
  cleanupOldLogs,
} from "../../../../lib/security-logger";

/**
 * GET /api/admin/security-logs
 *
 * Query security logs with filters
 * Admin only endpoint
 *
 * Query parameters:
 * - eventType: Filter by event type
 * - severity: Filter by severity
 * - userId: Filter by user ID
 * - ipAddress: Filter by IP address
 * - startDate: Start date (ISO string)
 * - endDate: End date (ISO string)
 * - limit: Number of results (default: 100)
 * - action: Special actions (stats, critical, cleanup)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");

    // Handle special actions
    if (action === "stats") {
      const startDate = searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const endDate = searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : new Date();

      const stats = await getSecurityStats(startDate, endDate);
      return NextResponse.json({ stats });
    }

    if (action === "critical") {
      const limit = parseInt(searchParams.get("limit") || "10");
      const events = await getRecentCriticalEvents(limit);
      return NextResponse.json({ events });
    }

    if (action === "cleanup") {
      const daysToKeep = parseInt(searchParams.get("daysToKeep") || "90");
      const deletedCount = await cleanupOldLogs(daysToKeep);
      return NextResponse.json({
        message: `Cleaned up ${deletedCount} old logs`,
        deletedCount,
      });
    }

    // Regular query
    const eventType = searchParams.get("eventType") as Parameters<
      typeof querySecurityLogs
    >[0]["eventType"];
    const severity = searchParams.get("severity") as Parameters<
      typeof querySecurityLogs
    >[0]["severity"];
    const userId = searchParams.get("userId") || undefined;
    const ipAddress = searchParams.get("ipAddress") || undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;
    const limit = parseInt(searchParams.get("limit") || "100");

    const logs = await querySecurityLogs({
      eventType,
      severity,
      userId,
      ipAddress,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({ logs, count: logs.length });
  } catch (error) {
    console.error("Failed to query security logs:", error);
    return NextResponse.json({ error: "Failed to query security logs" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/security-logs
 *
 * Delete old security logs
 * Admin only endpoint
 *
 * Body:
 * - daysToKeep: Number of days to keep (default: 90)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const daysToKeep = body.daysToKeep || 90;

    const deletedCount = await cleanupOldLogs(daysToKeep);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} old logs`,
      deletedCount,
    });
  } catch (error) {
    console.error("Failed to cleanup logs:", error);
    return NextResponse.json({ error: "Failed to cleanup logs" }, { status: 500 });
  }
}
