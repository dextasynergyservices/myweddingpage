import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/admin";
import prisma from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await (async () => {
    const { getAdminUser } = await import("@/lib/middleware/admin");
    return getAdminUser();
  })();

  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const rows = await prisma.$queryRaw<Array<{ data: unknown }>>`
    SELECT data FROM "AdminSelection" WHERE "adminId" = ${admin.id} LIMIT 1
  `;
  const rec = rows && rows.length > 0 ? rows[0] : null;
  return NextResponse.json({ data: rec?.data ?? null });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await (async () => {
    const { getAdminUser } = await import("@/lib/middleware/admin");
    return getAdminUser();
  })();

  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Expect body.ids to be an array of selected log ids
  function hasIdsArray(v: unknown): v is { ids: unknown[] } {
    if (typeof v !== "object" || v === null) return false;
    const maybe = v as Record<string, unknown>;
    return Array.isArray(maybe["ids"]);
  }

  if (!hasIdsArray(body)) {
    return NextResponse.json({ error: "Missing ids array" }, { status: 400 });
  }

  // Normalize ids to string[]
  const ids = body.ids.map((x) => String(x));

  // Use a parameterized raw query to upsert (avoid relying on generated prisma client for the new model)
  const jsonIds = JSON.stringify(ids);
  const upRows = await prisma.$queryRaw<Array<{ data: unknown }>>`
    INSERT INTO "AdminSelection" ("adminId", data)
    VALUES (${admin.id}, ${jsonIds}::jsonb)
    ON CONFLICT ("adminId") DO UPDATE
      SET data = ${jsonIds}::jsonb, "updatedAt" = now()
    RETURNING data
  `;

  const up = upRows && upRows.length > 0 ? upRows[0] : null;
  return NextResponse.json({ ok: true, ids: up?.data ?? null });
}
