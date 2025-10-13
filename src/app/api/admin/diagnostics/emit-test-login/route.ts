import { NextResponse } from "next/server";
import { requireAdmin, getAdminUser } from "@/lib/middleware/admin";
import { logSecurityEvent } from "@/lib/security-logger";
import { SecurityEventType, SecuritySeverity } from "@/generated/prisma";

export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const admin = await getAdminUser();
    const userId = admin?.id || null;

    await logSecurityEvent({
      eventType: SecurityEventType.LOGIN_SUCCESS,
      severity: SecuritySeverity.LOW,
      userId: userId || undefined,
      ipAddress: "admin-test",
      userAgent: "admin-test",
      endpoint: "/api/admin/diagnostics/emit-test-login",
      method: "POST",
      statusCode: 200,
      message: `Admin emitted test login for ${admin?.email ?? "unknown"}`,
      metadata: { test: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Emit test login failed:", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
