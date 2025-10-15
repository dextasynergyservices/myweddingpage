import { NextResponse } from "next/server";
import { readAuditEvents } from "@/lib/audit";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "50");
    // support comma-separated actions for multi-select UI
    const actionRaw = url.searchParams.get("action") || undefined;
    const action = actionRaw
      ? actionRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    const stagingId = url.searchParams.get("stagingId") || undefined;
    const dateFrom = url.searchParams.get("dateFrom") || undefined;
    const dateTo = url.searchParams.get("dateTo") || undefined;
    const { events, total } = readAuditEvents({
      page,
      pageSize,
      action,
      stagingId,
      dateFrom,
      dateTo,
    });
    return NextResponse.json({ events, total, page, pageSize }, { status: 200 });
  } catch {
    return NextResponse.json({ events: [], total: 0 }, { status: 500 });
  }
}
