import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Find the wedding page id only
    const weddingPage = await prisma.weddingPage.findUnique({ where: { slug }, select: { id: true, is_live: true, views: true } });
    if (!weddingPage || !weddingPage.is_live) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const userAgent = req.headers.get("user-agent") ?? "";
    const botRegex = /bot|crawler|spider|curl|slurp|bingpreview|facebookexternalhit|facebookcatalog|twitterbot|discordbot|whatsapp|pinterest|whatsapp|telegrambot/i;
    const isBot = botRegex.test(userAgent);

    const cookieName = `w_viewed_${weddingPage.id}`;
    const seenCookie = req.cookies.get(cookieName)?.value;

    let updatedViews: number | null = null;

    if (!isBot && !seenCookie) {
      try {
        await prisma.$executeRaw`UPDATE "WeddingPage" SET views = COALESCE(views, 0) + 1 WHERE id = ${weddingPage.id}`;
        const refreshed = await prisma.weddingPage.findUnique({ where: { id: weddingPage.id }, select: { views: true } });
        updatedViews = refreshed?.views ?? null;
      } catch (err) {
        console.error("Failed to increment wedding page views:", err);
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

    return res;
  } catch (error) {
    console.error("Error incrementing wedding views:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
