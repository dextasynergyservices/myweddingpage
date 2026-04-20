import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin";
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
    const adminCheck = await requireAdmin();
    if (adminCheck) {
      return adminCheck;
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
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const after = searchParams.get("after") || undefined; // cursor encoded as base64 JSON { t: timestamp, id: id }
    let afterTimestamp: string | undefined;
    let afterId: string | undefined;
    if (after) {
      try {
        const decoded = JSON.parse(
          Buffer.from(after, "base64").toString("utf8")
        );
        afterTimestamp = decoded.t;
        afterId = decoded.id;
      } catch {
        // ignore invalid cursor
      }
    }
    const messageContains = searchParams.get("messageContains") || undefined;
    const metadataContains = searchParams.get("metadataContains") || undefined;
    const offsetParam = searchParams.get("offset");
    const offset = offsetParam
      ? Math.max(0, parseInt(offsetParam, 10))
      : undefined;

    const logs = await querySecurityLogs({
      eventType,
      severity,
      userId,
      ipAddress,
      startDate,
      endDate,
      limit,
      offset: afterTimestamp || afterId ? undefined : offset,
      afterTimestamp,
      afterId,
      messageContains,
      metadataContains,
    });

    // compute total count for pagination when requested
    const metadataKey = searchParams.get("metadataKey") || undefined;
    const metadataValue = searchParams.get("metadataValue") || undefined;
    const { countSecurityLogs } = await import(
      "../../../../lib/security-logger"
    );
    const totalCount = await countSecurityLogs({
      eventType,
      severity,
      userId,
      ipAddress,
      startDate,
      endDate,
      messageContains,
      metadataKey: metadataKey || undefined,
      metadataValue: metadataValue || undefined,
    });

    const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(1, limit)));

    // next cursor: use last item timestamp and id
    let nextCursor: string | null = null;
    if (logs.length > 0) {
      const last = logs[logs.length - 1] as Record<string, unknown>;
      try {
        // timestamp may be string|number|Date or unknown shape coming from raw SQL
        const tsVal = last.timestamp as unknown;
        let iso: string | null = null;
        if (typeof tsVal === "string" || typeof tsVal === "number") {
          const d = new Date(tsVal as string | number);
          if (!isNaN(d.getTime())) iso = d.toISOString();
        } else if (tsVal instanceof Date) {
          iso = tsVal.toISOString();
        } else if (
          typeof last.createdAt === "string" ||
          typeof last.createdAt === "number"
        ) {
          const d = new Date(last.createdAt as string | number);
          if (!isNaN(d.getTime())) iso = d.toISOString();
        }

        if (iso) {
          const cur = { t: iso, id: String(last.id ?? "") };
          nextCursor = Buffer.from(JSON.stringify(cur), "utf8").toString(
            "base64"
          );
        } else {
          nextCursor = null;
        }
      } catch {
        nextCursor = null;
      }
    }

    // Normalize logs: expose metadata.action (if present) as top-level `action` for client convenience
    const normalizedLogs = (logs || []).map((l: Record<string, unknown>) => {
      try {
        const meta = (l.metadata as Record<string, unknown>) || {};
        let action = undefined as string | undefined;
        if (
          meta &&
          typeof meta === "object" &&
          typeof meta["action"] === "string"
        ) {
          action = String(meta["action"]);
        } else if (typeof l.message === "string") {
          const m = (l.message as string).toUpperCase();
          if (m.startsWith("PLAN_CREATED")) action = "PLAN_CREATED";
          else if (m.startsWith("PLAN_UPDATED")) action = "PLAN_UPDATED";
          else if (m.startsWith("PLAN_DELETED")) action = "PLAN_DELETED";
          else if (
            m.includes("LOGIN") &&
            (m.includes("FAIL") || m.includes("FAILURE"))
          )
            action = "LOGIN_FAILED";
          else if (
            m.includes("LOGIN") &&
            (m.includes("SUCCESS") || m.includes("SUCCEED"))
          )
            action = "LOGIN_SUCCESS";
        }
        return { ...l, action };
      } catch {
        return l;
      }
    });

    return NextResponse.json({
      logs: normalizedLogs,
      count: logs.length,
      totalCount,
      totalPages,
      nextCursor,
    });
  } catch (error) {
    console.error("Failed to query security logs:", error);
    return NextResponse.json(
      { error: "Failed to query security logs" },
      { status: 500 }
    );
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
    const adminCheck = await requireAdmin();
    if (adminCheck) {
      return adminCheck;
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
    return NextResponse.json(
      { error: "Failed to cleanup logs" },
      { status: 500 }
    );
  }
}
