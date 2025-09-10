import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try to find the user's live wedding page first
    let wp = await prisma.weddingPage.findFirst({
      where: { userId: user.id, is_live: true },
      select: { id: true, slug: true, views: true, is_live: true },
    });

    // If no live page exists, fall back to the most recently created wedding page for the user
    let usedFallback = false;
    if (!wp) {
      usedFallback = true;
      wp = await prisma.weddingPage.findFirst({
        where: { userId: user.id },
        orderBy: { created_at: "desc" },
        select: { id: true, slug: true, views: true, is_live: true },
      });
    }

    if (!wp) {
      console.debug("/api/wedding-views: no wedding page found for user", user.id);
      return NextResponse.json({ views: 0, weddingPage: null });
    }

    console.debug(
      `/api/wedding-views: returning views=${wp.views ?? 0} (fallback=${usedFallback}) for user=${user.id}`
    );
    return NextResponse.json({
      views: wp.views ?? 0,
      weddingPage: { id: wp.id, slug: wp.slug, is_live: wp.is_live },
    });
  } catch (error) {
    console.error("Error fetching wedding views:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Allow unauthenticated clients to POST a slug to increment views once per browser (cookie-guarded)
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let slug = searchParams.get("slug");

    if (!slug) {
      // try to parse body JSON
      try {
        const body = await req.json();
        slug = body?.slug;
      } catch {
        // ignore
      }
    }

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Find the wedding page
    const weddingPage = await prisma.weddingPage.findUnique({
      where: { slug },
      select: { id: true, is_live: true, views: true },
    });
    if (!weddingPage || !weddingPage.is_live) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const userAgent = req.headers.get("user-agent") ?? "";
    const botRegex =
      /bot|crawler|spider|curl|slurp|bingpreview|facebookexternalhit|facebookcatalog|twitterbot|discordbot|whatsapp|pinterest|whatsapp|telegrambot/i;
    const isBot = botRegex.test(userAgent);

    const cookieName = `w_viewed_${weddingPage.id}`;
    const seenCookie = req.cookies.get(cookieName)?.value;

    // Also allow a pre-set non-httpOnly slug cookie the client may have set
    const slugCookieName = `w_viewed_slug_${encodeURIComponent(slug)}`;
    // Attempt to read from cookies map first
    let slugCookie = req.cookies.get(slugCookieName)?.value;
    // If not present, try parsing the raw Cookie header
    if (!slugCookie) {
      const rawCookie = req.headers.get("cookie") ?? "";
      const match = rawCookie.match(new RegExp(`${slugCookieName}=([^;]+)`));
      slugCookie = match ? match[1] : undefined;
    }

    let updatedViews: number | null = null;

    if (!isBot && !seenCookie && !slugCookie) {
      try {
        await prisma.$executeRaw`UPDATE "WeddingPage" SET views = COALESCE(views, 0) + 1 WHERE id = ${weddingPage.id}`;
        const refreshed = await prisma.weddingPage.findUnique({
          where: { id: weddingPage.id },
          select: { views: true },
        });
        updatedViews = refreshed?.views ?? null;
      } catch (err) {
        console.error("Failed to increment wedding page views:", err);
      }
    }

    const viewsToReturn = updatedViews ?? weddingPage.views ?? 0;
    const res = NextResponse.json({
      views: viewsToReturn,
      weddingPage: { id: weddingPage.id, is_live: weddingPage.is_live },
    });

    if (!isBot && !seenCookie && !slugCookie && updatedViews !== null) {
      const isProd = process.env.NODE_ENV === "production";
      res.cookies.set(cookieName, "1", {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        secure: isProd,
        path: "/",
      });
      // Also set a non-httpOnly slug cookie so client-side scripts can opt-in
      res.headers.append(
        "Set-Cookie",
        `${slugCookieName}=1; Max-Age=${60 * 60 * 24}; Path=/; ${isProd ? "Secure;" : ""} SameSite=Lax`
      );
    }

    return res;
  } catch (error) {
    console.error("Error incrementing wedding views via /api/wedding-views POST:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
