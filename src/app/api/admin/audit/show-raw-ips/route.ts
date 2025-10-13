import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // enforce admin session
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  // find admin users who have showRawIps enabled
  const users = await prisma.user.findMany({
    where: { role: "ADMIN", showRawIps: true },
    select: {
      id: true,
      email: true,
      groomName: true,
      brideName: true,
      role: true,
      showRawIps: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });

  // Try to populate lastLoginAt by reading latest LOGIN_SUCCESS events from SecurityLog
  const userIds = users.map((u) => u.id);
  let lastMap = new Map<string, Date>();
  try {
    if (userIds.length > 0) {
      const loginEvents = await prisma.securityLog.findMany({
        where: { eventType: "LOGIN_SUCCESS", userId: { in: userIds } },
        select: { userId: true, timestamp: true },
        orderBy: { timestamp: "desc" },
      });
      lastMap = new Map<string, Date>();
      loginEvents.forEach((ev) => {
        if (ev.userId && ev.timestamp && !lastMap.has(ev.userId))
          lastMap.set(ev.userId, ev.timestamp);
      });
    }
  } catch (e) {
    console.warn("Could not populate lastLoginAt for show-raw-ips audit:", e);
  }

  const admins = users.map((u) => ({
    id: u.id,
    email: u.email,
    name:
      u.groomName && u.brideName
        ? `${u.groomName} & ${u.brideName}`
        : u.groomName || u.brideName || null,
    role: u.role,
    showRawIps: Boolean(u.showRawIps),
    createdAt: u.created_at.toISOString(),
    lastLoginAt: lastMap.has(u.id) ? lastMap.get(u.id)!.toISOString() : null,
  }));

  return NextResponse.json({ admins });
}
