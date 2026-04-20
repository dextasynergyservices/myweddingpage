/**
 * Verify that `WeddingPage.views` equals aggregated PageView counts per page.
 * Exits with non-zero code if mismatches are found.
 *
 * Usage:
 *  pnpm tsx scripts/verify-reconciliation.ts
 */

(async () => {
  try {
    const { PrismaClient } = await import("../src/generated/prisma/index.js");
    const prisma = new PrismaClient();

    const rows = (await prisma.$queryRawUnsafe(`
      SELECT wp.id, wp.slug, wp.views as aggregate_views, COALESCE(pv.c,0) as pageview_count
      FROM "WeddingPage" wp
      LEFT JOIN (
        SELECT "weddingPageId", COUNT(*) as c FROM "PageView" GROUP BY "weddingPageId"
      ) pv ON pv."weddingPageId" = wp.id
      WHERE wp.views IS DISTINCT FROM COALESCE(pv.c,0)
    `)) as Array<{
      id: string;
      slug: string;
      aggregate_views: number;
      pageview_count: number;
    }>;

    if (!rows || rows.length === 0) {
      console.log("OK: All WeddingPage.views match PageView counts");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.error("MISMATCHES FOUND:");
    rows.forEach((r) =>
      console.error(
        `${r.slug} : aggregate=${r.aggregate_views} pageview_count=${r.pageview_count}`
      )
    );
    await prisma.$disconnect();
    process.exit(2);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
