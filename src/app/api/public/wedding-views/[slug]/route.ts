import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import withTiming from "@/lib/withTiming";
import { logSecurityEvent, createLogFromRequest } from "@/lib/security-logger";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  return withTiming(req, async () => {
    try {
      const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Find the wedding page id only (excluding deleted pages)
    const weddingPage = await prisma.weddingPage.findFirst({
      where: {
        slug,
        deleted_at: null, // Only show non-deleted pages
      },
      select: { id: true, is_live: true, views: true }
    });
      if (!weddingPage || !weddingPage.is_live) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

  const userAgent = req.headers.get("user-agent") ?? "";
  // prefer shared helper that checks many forwarding headers
  const { getClientIp } = await import("@/lib/ip-utils");
  const clientIp = getClientIp(req);
    const botRegex = /bot|crawler|spider|curl|slurp|bingpreview|facebookexternalhit|facebookcatalog|twitterbot|discordbot|whatsapp|pinterest|whatsapp|telegrambot/i;
    const isBot = botRegex.test(userAgent);

    const cookieName = `w_viewed_${weddingPage.id}`;
    const seenCookie = req.cookies.get(cookieName)?.value;

    let updatedViews: number | null = null;

      if (!isBot && !seenCookie) {
      try {
        // Transactionally create PageView and increment the aggregate views
        const txRes = await prisma.$transaction(async (tx) => {
          // record PageView with whatever IP/User-Agent we detected; ip may be null
          // for privacy if a proxy stripped headers, but in most envs we'll capture something
          await tx.pageView.create({
            data: {
              weddingPageId: weddingPage.id,
              ipAddress: clientIp ?? undefined,
              userAgent: userAgent || undefined,
            },
          });
          await tx.$executeRaw`UPDATE "WeddingPage" SET views = COALESCE(views, 0) + 1 WHERE id = ${weddingPage.id}`;
          return tx.weddingPage.findUnique({ where: { id: weddingPage.id }, select: { views: true } });
        });
        updatedViews = txRes?.views ?? null;
      } catch (err) {
        console.error("Failed to increment wedding page views and record PageView:", err);
      }
    }

    const viewsToReturn = updatedViews ?? weddingPage.views ?? 0;
      const res = NextResponse.json({ views: viewsToReturn });

      if (!isBot && !seenCookie && updatedViews !== null) {
      const isProd = process.env.NODE_ENV === "production";
      res.cookies.set(cookieName, "1", {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        secure: isProd,
        path: "/",
      });
    }

      // Sampled timing/security log for pageview events (1% default)
      try {
        const timingSampleRate = Number(process.env.PAGEVIEW_TIMING_SAMPLE_RATE || 0.01);
        if (Math.random() <= timingSampleRate) {
          const entry = createLogFromRequest(req, "API_ABUSE", {
            message: `PageView for ${slug}`,
            statusCode: 200,
            metadata: { weddingPageId: weddingPage.id, sample: true },
          });
          // attach responseTime is handled by withTiming wrapper for the overall request
          void logSecurityEvent(entry).catch(() => {});
        }
      } catch {
        // ignore
      }

      return res;
    } catch (error) {
      console.error("Error incrementing wedding views:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }, { sampleRate: Number(process.env.PAGEVIEW_TIMING_SAMPLE_RATE || 0.01), eventType: "API_ABUSE" });
}
