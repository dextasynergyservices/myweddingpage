import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    // Get recent LOGIN_SUCCESS events
    const recent = await prisma.securityLog.findMany({
      where: { eventType: "LOGIN_SUCCESS" },
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    // Aggregate counts per user
    const counts = await prisma.securityLog.groupBy({
      by: ["userId"],
      where: { eventType: "LOGIN_SUCCESS" },
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 100,
    });

    return NextResponse.json({ recent, counts });
  } catch (e) {
    console.error("Diagnostics error:", e);
    return NextResponse.json({ error: "Failed to load diagnostics" }, { status: 500 });
  }
}
