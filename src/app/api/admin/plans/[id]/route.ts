import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction, getSession } from "@/lib/middleware/admin";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const plan = await prisma.plan.findUnique({ where: { id: params.id } });
    if (!plan) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error("GET /api/admin/plans/[id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const body = await request.json();
    if (!body || typeof body !== "object")
      return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      const name = String(body.name || "").trim();
      if (!name)
        return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
      data.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(body, "price")) {
      const priceRaw = body.price;
      const priceStr = typeof priceRaw === "string" ? priceRaw : String(priceRaw);
      if (!/^-?\d+(?:\.\d+)?$/.test(priceStr)) {
        return NextResponse.json(
          { success: false, error: "Price must be a numeric value" },
          { status: 400 }
        );
      }
      data.price = priceStr;
    }

    const maybeNumber = (k: string, fallback: number) => {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        const v = Number(body[k]);
        if (!Number.isFinite(v) || v < 0) return { ok: false, val: fallback };
        return { ok: true, val: Math.floor(v) };
      }
      return { ok: true, val: fallback, skip: true };
    };

    const dur = maybeNumber("duration_days", 30);
    if (!dur.skip) {
      if (!dur.ok)
        return NextResponse.json(
          { success: false, error: "Invalid duration_days" },
          { status: 400 }
        );
      data.duration_days = dur.val;
    }

    const mp = maybeNumber("max_photos", 100);
    if (!mp.skip) {
      if (!mp.ok)
        return NextResponse.json({ success: false, error: "Invalid max_photos" }, { status: 400 });
      data.max_photos = mp.val;
    }

    const mv = maybeNumber("max_videos", 10);
    if (!mv.skip) {
      if (!mv.ok)
        return NextResponse.json({ success: false, error: "Invalid max_videos" }, { status: 400 });
      data.max_videos = mv.val;
    }

    const mt = maybeNumber("max_tabs", 5);
    if (!mt.skip) {
      if (!mt.ok)
        return NextResponse.json({ success: false, error: "Invalid max_tabs" }, { status: 400 });
      data.max_tabs = mt.val;
    }

    if (Object.prototype.hasOwnProperty.call(body, "gradient"))
      data.gradient = body.gradient ?? null;
    if (Object.prototype.hasOwnProperty.call(body, "popular")) data.popular = Boolean(body.popular);

    if (Object.prototype.hasOwnProperty.call(body, "prints")) {
      if (body.prints === null || body.prints === undefined) {
        data.prints = null;
      } else if (typeof body.prints !== "string") {
        return NextResponse.json(
          { success: false, error: "Prints must be a string" },
          { status: 400 }
        );
      } else {
        const t = body.prints.trim();
        if (t === "") {
          data.prints = null;
        } else if (t.length > 500) {
          return NextResponse.json(
            { success: false, error: "Prints must be at most 500 characters" },
            { status: 400 }
          );
        } else {
          data.prints = t;
        }
      }
    }

    const updated = await prisma.plan.update({
      where: { id: params.id },
      data,
    });
    // Audit
    try {
      const session = await getSession();
      const admin = session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          }
        : null;
      await logAdminAction("PLAN_UPDATED", { planId: updated.id, changes: data, admin }, session);
    } catch (e) {
      console.warn("Failed to log PLAN_UPDATED", e);
    }

    return NextResponse.json({ success: true, plan: updated });
  } catch (err) {
    console.error("PATCH /api/admin/plans/[id]", err);
    return NextResponse.json({ success: false, error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    // disallow delete if plan is in use
    const inUse = await prisma.$transaction([
      prisma.user.count({ where: { planId: params.id } }),
      prisma.subscription.count({ where: { planId: params.id } }),
      prisma.planTemplate.count({ where: { planId: params.id } }),
    ]);

    const [usersCount, subsCount, ptCount] = inUse as number[];
    if (usersCount > 0 || subsCount > 0 || ptCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete plan in use by users/subscriptions/templates",
        },
        { status: 400 }
      );
    }

    await prisma.plan.delete({ where: { id: params.id } });
    // Audit
    try {
      const session = await getSession();
      const admin = session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          }
        : null;
      await logAdminAction("PLAN_DELETED", { planId: params.id, admin }, session);
    } catch (e) {
      console.warn("Failed to log PLAN_DELETED", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/plans/[id]", err);
    return NextResponse.json({ success: false, error: "Failed to delete plan" }, { status: 500 });
  }
}
