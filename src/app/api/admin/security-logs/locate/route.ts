import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/security-logs/locate?logId=...&limit=25
 * Returns { offset, page } so UI can request the page containing the log
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    const { searchParams } = request.nextUrl;
    const logId = searchParams.get("logId");
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    if (!logId) return NextResponse.json({ error: "logId required" }, { status: 400 });

    const log = await prisma.securityLog.findUnique({ where: { id: logId } });
    if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });

    // Count number of logs strictly newer than this log (timestamp > or same timestamp with id >)
    const newerCount = await prisma.securityLog.count({
      where: {
        OR: [
          { timestamp: { gt: log.timestamp } },
          { AND: [{ timestamp: log.timestamp }, { id: { gt: log.id } }] },
        ],
      },
    });

    const pageIndex = Math.floor(newerCount / limit);
    const page = pageIndex + 1;
    const offset = pageIndex * limit;

    return NextResponse.json({ offset, page });
  } catch (error) {
    console.error("Failed to locate log:", error);
    return NextResponse.json({ error: "Failed to locate log" }, { status: 500 });
  }
}
