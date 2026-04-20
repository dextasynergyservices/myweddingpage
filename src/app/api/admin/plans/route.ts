import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction, getSession } from "@/lib/middleware/admin";

export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const plans = await prisma.plan.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ success: true, plans });
  } catch (err) {
    console.error("GET /api/admin/plans error", err);
    return NextResponse.json({ success: false, error: "Failed to list plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const body = await request.json();
    // Basic validation
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    if (!name)
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });

    // price can be a number or string; ensure it's parseable
    const priceRaw = body.price;
    if (priceRaw === undefined || priceRaw === null || priceRaw === "") {
      return NextResponse.json({ success: false, error: "Price is required" }, { status: 400 });
    }
    const priceStr = typeof priceRaw === "string" ? priceRaw : String(priceRaw);
    if (!/^-?\d+(?:\.\d+)?$/.test(priceStr)) {
      return NextResponse.json(
        { success: false, error: "Price must be a numeric value" },
        { status: 400 }
      );
    }

    const duration_days = Number.isFinite(Number(body.duration_days))
      ? Number(body.duration_days)
      : 30;
    const max_photos = Number.isFinite(Number(body.max_photos)) ? Number(body.max_photos) : 100;
    const max_videos = Number.isFinite(Number(body.max_videos)) ? Number(body.max_videos) : 10;
    const max_tabs = Number.isFinite(Number(body.max_tabs)) ? Number(body.max_tabs) : 5;

    // prints: optional string, trim whitespace, empty -> null, limit length
    let printsVal: string | null = null;
    if (Object.prototype.hasOwnProperty.call(body, "prints")) {
      if (body.prints === null || body.prints === undefined) {
        printsVal = null;
      } else if (typeof body.prints !== "string") {
        return NextResponse.json(
          { success: false, error: "Prints must be a string" },
          { status: 400 }
        );
      } else {
        const t = body.prints.trim();
        if (t === "") {
          printsVal = null;
        } else if (t.length > 500) {
          return NextResponse.json(
            { success: false, error: "Prints must be at most 500 characters" },
            { status: 400 }
          );
        } else {
          printsVal = t;
        }
      }
    }

    const created = await prisma.plan.create({
      data: {
        name,
        price: priceStr,
        duration_days,
        max_photos,
        max_videos,
        max_tabs,
        gradient: body.gradient ?? null,
        popular: body.popular ?? false,
        prints: printsVal,
      },
    });

    // Audit: include admin identity when available
    try {
      const s = await getSession();
      let admin: { id: string; email?: string | null; role?: string } | null = null;
      if (s && s.user) {
        const u = s.user as {
          id: string;
          email?: string | null;
          role?: string;
        };
        admin = { id: u.id, email: u.email ?? null, role: u.role ?? undefined };
      }
      const res = await logAdminAction(
        "PLAN_CREATED",
        { planId: created.id, name: created.name, admin },
        s
      );
      // diagnostic: log the created security log entry
      if (!res) {
        console.warn("logAdminAction returned falsy for PLAN_CREATED", {
          planId: created.id,
        });
      } else {
        try {
          console.info("Audit entry created:", JSON.stringify(res));
        } catch {
          console.info("Audit entry created (non-serializable)");
        }
      }
    } catch (e) {
      console.warn("Failed to log PLAN_CREATED", e);
    }

    return NextResponse.json({ success: true, plan: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/plans error", err);
    return NextResponse.json({ success: false, error: "Failed to create plan" }, { status: 500 });
  }
}
