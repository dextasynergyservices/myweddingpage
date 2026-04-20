(async () => {
  try {
    const { PrismaClient } = await import("../src/generated/prisma/index.js");
    const prisma = new PrismaClient();

    const totalUsers = await prisma.user.count();

    const seven = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const sessionsCount = await prisma.session.count({
      where: { lastAccessedAt: { gte: seven } },
    });

    const distinctUsersRows = (await prisma.$queryRawUnsafe(
      'SELECT COUNT(DISTINCT "userId") as c FROM "Session" WHERE "lastAccessedAt" >= $1',
      seven
    )) as Array<{ c: string | number }>;
    const distinctUserIds = Number(distinctUsersRows?.[0]?.c ?? 0);

    const pvDistinctIpsRows = (await prisma.$queryRawUnsafe(
      'SELECT COUNT(DISTINCT "ipAddress") as c FROM "PageView" WHERE "createdAt" >= $1',
      seven
    )) as Array<{ c: string | number }>;
    const pvDistinctIps = Number(pvDistinctIpsRows?.[0]?.c ?? 0);

    console.log(
      JSON.stringify(
        {
          totalUsers,
          sessionsCount,
          distinctUserIds,
          pvDistinctIps,
          seven: seven.toISOString(),
        },
        null,
        2
      )
    );
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
