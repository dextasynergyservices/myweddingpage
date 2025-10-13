import prisma from "@/lib/prisma";

async function run() {
  try {
    const totalWeddingPages = await prisma.weddingPage.count();
    const liveWeddingPages = await prisma.weddingPage.count({ where: { is_live: true } });
    const totalViewsAgg = await prisma.weddingPage.aggregate({ _sum: { views: true } });
    const totalViews = totalViewsAgg._sum.views ?? 0;
    const avgViewsAgg = await prisma.weddingPage.aggregate({
      _avg: { views: true },
      where: { views: { gt: 0 } },
    });
    const avgViews = Math.round(avgViewsAgg._avg.views ?? 0);

    const lockedAccounts = await prisma.accountLockout.count({
      where: { unlocked: false, lockedUntil: { gt: new Date() } },
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const rateLimitHits = await prisma.securityLog.count({
      where: { eventType: "RATE_LIMIT_HIT", timestamp: { gte: weekAgo } },
    });

    const pageViewCount = await prisma.pageView.count();
    const pageViewsLast7 = await prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } });

    console.log(
      JSON.stringify(
        {
          totalWeddingPages,
          liveWeddingPages,
          totalViews: Number(totalViews),
          avgViews,
          lockedAccounts,
          rateLimitHits,
          pageViewCount,
          pageViewsLast7,
        },
        null,
        2
      )
    );
  } catch (e) {
    console.error("diagnose error", e);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

run();
