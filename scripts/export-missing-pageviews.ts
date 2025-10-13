import { prisma } from "../src/lib/prisma";

async function main() {
  const rows = await prisma.pageView.findMany({
    where: { OR: [{ ipAddress: null }, { userAgent: null }] },
    select: { id: true, weddingPageId: true, createdAt: true, ipAddress: true, userAgent: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
