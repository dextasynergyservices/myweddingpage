import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/admin";

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Get date ranges for analytics
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Read pagination params for template stats from query string
    const url = new URL(request.url);
    const templatePerPage = Number(
      url.searchParams.get("templatePerPage") ?? "10"
    );
    const tplPer = Math.max(
      1,
      isFinite(templatePerPage) ? templatePerPage : 10
    );
    const templateCursor = url.searchParams.get("templateCursor");
    // templateCursor is a base64-encoded JSON: { count: number, template: string }
    let cursorObj: { count: number; template: string } | null = null;
    if (templateCursor) {
      try {
        const decoded = Buffer.from(templateCursor, "base64").toString("utf8");
        cursorObj = JSON.parse(decoded);
      } catch {
        cursorObj = null;
      }
    }

    // Fetch wedding page analytics in parallel
    const [
      totalWeddingPages,
      liveWeddingPages,
      totalViews,
      averageViewsPerPage,
      topPerformingPages,
      viewsByDate,
      recentPages,
      pagesByTemplate,
    ] = await Promise.all([
      // Total wedding pages created
      prisma.weddingPage.count(),

      // Live wedding pages
      prisma.weddingPage.count({
        where: { is_live: true },
      }),

      // Total views across all pages
      prisma.weddingPage
        .aggregate({
          _sum: { views: true },
        })
        .then((result) => result._sum.views || 0),

      // Average views per page
      prisma.weddingPage
        .aggregate({
          _avg: { views: true },
          where: { views: { gt: 0 } },
        })
        .then((result) => Math.round(result._avg.views || 0)),

      // Top 10 performing pages by views
      prisma.weddingPage.findMany({
        take: 10,
        where: { views: { gt: 0 } },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          is_live: true,
          created_at: true,
          user: {
            select: {
              brideName: true,
              groomName: true,
            },
          },
          template: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { views: "desc" },
      }),

      // Views by date for the last 7 days
      prisma.$queryRaw<Array<{ date: Date; total_views: bigint }>>`
        SELECT
          DATE(created_at) as date,
          SUM(views) as total_views
        FROM "WeddingPage"
        WHERE created_at >= ${weekAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Recent wedding pages (last 10)
      prisma.weddingPage.findMany({
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          is_live: true,
          created_at: true,
          user: {
            select: {
              brideName: true,
              groomName: true,
            },
          },
          template: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),

      // Pages by template usage (paginated)
      // Keyset pagination: if cursorObj is present, return rows after the cursor
      cursorObj
        ? await prisma.$queryRaw<
            Array<{
              template_name: string;
              count: bigint;
              total_views: bigint;
              average_views: number;
              live_count: bigint;
            }>
          >`
            SELECT
              t.name as template_name,
              COUNT(wp.id) as count,
              SUM(wp.views) as total_views,
              AVG(COALESCE(wp.views,0)) as average_views,
              SUM(CASE WHEN wp.is_live THEN 1 ELSE 0 END) as live_count
            FROM "WeddingPage" wp
            JOIN "Template" t ON wp."templateId" = t.id
            GROUP BY t.name
            HAVING (COUNT(wp.id) < ${cursorObj.count}) OR (COUNT(wp.id) = ${cursorObj.count} AND t.name > ${cursorObj.template})
            ORDER BY count DESC, t.name ASC
            LIMIT ${tplPer}
          `
        : await prisma.$queryRaw<
            Array<{
              template_name: string;
              count: bigint;
              total_views: bigint;
              average_views: number;
              live_count: bigint;
            }>
          >`
            SELECT
              t.name as template_name,
              COUNT(wp.id) as count,
              SUM(wp.views) as total_views,
              AVG(COALESCE(wp.views,0)) as average_views,
              SUM(CASE WHEN wp.is_live THEN 1 ELSE 0 END) as live_count
            FROM "WeddingPage" wp
            JOIN "Template" t ON wp."templateId" = t.id
            GROUP BY t.name
            ORDER BY count DESC, t.name ASC
            LIMIT ${tplPer}
          `,
    ]);

    // Count total template groups for pagination metadata
    const templateGroupsCountResult = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*) as count FROM (
        SELECT t.name FROM "WeddingPage" wp JOIN "Template" t ON wp."templateId" = t.id GROUP BY t.name
      ) as sub
    `;
    const templateGroupsTotal = templateGroupsCountResult?.[0]
      ? Number(templateGroupsCountResult[0].count)
      : 0;

    // Transform top performing pages (add best-effort last_viewed_at and engagement_rate)
    const transformedTopPages = await Promise.all(
      topPerformingPages.map(async (page) => {
        // Try to find a recent SecurityLog mentioning the page slug in endpoint or metadata
        let lastViewedAt: Date | null = null;
        try {
          const lastRows = await prisma.$queryRaw<Array<{ timestamp: Date }>>`
            SELECT timestamp FROM "SecurityLog"
            WHERE endpoint ILIKE ${"%" + page.slug + "%"}
              OR CAST(metadata AS text) ILIKE ${"%" + page.slug + "%"}
            ORDER BY timestamp DESC
            LIMIT 1
          `;
          if (lastRows && lastRows[0]) lastViewedAt = lastRows[0].timestamp;
        } catch {
          // ignore lookup failures
          lastViewedAt = null;
        }

        // Compute engagement as a percentage of average views/page.
        // Use a one-decimal precision so the UI reads a more useful value (e.g. 123.4).
        const engagementRate = averageViewsPerPage
          ? (Number(page.views) / Math.max(1, averageViewsPerPage)) * 100
          : 0;

        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          views: page.views,
          is_live: page.is_live,
          created_at: page.created_at,
          couple_name:
            page.user.brideName && page.user.groomName
              ? `${page.user.brideName} & ${page.user.groomName}`
              : page.title,
          template_name: page.template.name,
          // If we couldn't find a recent security log but the page has views,
          // fall back to the page's created_at as a best-effort "last viewed".
          last_viewed_at: lastViewedAt
            ? lastViewedAt.toISOString()
            : page.views
              ? (page.created_at?.toISOString() ?? null)
              : null,
          engagement_rate: Number.isFinite(engagementRate)
            ? Number(engagementRate.toFixed(1))
            : 0,
        };
      })
    );

    // Transform recent pages
    const transformedRecentPages = await Promise.all(
      recentPages.map(async (page) => {
        let lastViewedAt: Date | null = null;
        try {
          const lastRows = await prisma.$queryRaw<Array<{ timestamp: Date }>>`
            SELECT timestamp FROM "SecurityLog"
            WHERE endpoint ILIKE ${"%" + page.slug + "%"}
              OR CAST(metadata AS text) ILIKE ${"%" + page.slug + "%"}
            ORDER BY timestamp DESC
            LIMIT 1
          `;
          if (lastRows && lastRows[0]) lastViewedAt = lastRows[0].timestamp;
        } catch {
          lastViewedAt = null;
        }

        const engagementRate = averageViewsPerPage
          ? Math.round(
              (Number(page.views) / Math.max(1, averageViewsPerPage)) * 100
            )
          : 0;

        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          views: page.views,
          is_live: page.is_live,
          created_at: page.created_at,
          couple_name:
            page.user.brideName && page.user.groomName
              ? `${page.user.brideName} & ${page.user.groomName}`
              : page.title,
          template_name: page.template.name,
          last_viewed_at: lastViewedAt
            ? lastViewedAt.toISOString()
            : page.views
              ? (page.created_at?.toISOString() ?? null)
              : null,
          engagement_rate: Number.isFinite(engagementRate) ? engagementRate : 0,
        };
      })
    );

    // Transform views by date for chart
    const viewsChartData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];

      const dayViews = viewsByDate.find(
        (stat) => stat.date.toISOString().split("T")[0] === dateStr
      );

      viewsChartData.push({
        name: dayName,
        views: dayViews ? Number(dayViews.total_views) : 0,
      });
    }

    // Transform template usage data (include average_views and live_count)
    const templateUsageData = pagesByTemplate.map((item) => ({
      template: item.template_name,
      count: Number(item.count),
      total_views: Number(item.total_views),
      average_views: Number(item.average_views ?? 0),
      live_count: Number(item.live_count ?? 0),
    }));

    // Build nextCursor for keyset pagination (if there may be more rows)
    let nextCursor: string | null = null;
    if (pagesByTemplate.length === tplPer) {
      const last = pagesByTemplate[pagesByTemplate.length - 1];
      try {
        nextCursor = Buffer.from(
          JSON.stringify({
            count: Number(last.count),
            template: last.template_name,
          })
        ).toString("base64");
      } catch {
        nextCursor = null;
      }
    }

    const analytics = {
      // Keep original names and provide UI-friendly aliases
      totalWeddingPages,
      liveWeddingPages,
      totalPages: totalWeddingPages,
      livePages: liveWeddingPages,
      totalViews,
      averageViewsPerPage,
      topPerformingPages: transformedTopPages,
      recentPages: transformedRecentPages,
      viewsChartData,
      templateStats: templateUsageData,
      templateUsageData,
      templatePagination: {
        total: templateGroupsTotal,
        // Cursor-based pagination: no page index or totalPages reliably available without extra work
        page: null,
        perPage: tplPer,
        totalPages: null,
        nextCursor,
      },
    };

    // Return analytics wrapped so Overview client can read `analytics` property
    return NextResponse.json({ success: true, analytics });
  } catch (err) {
    console.error("Error fetching wedding analytics:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch wedding analytics",
      },
      { status: 500 }
    );
  }
}
