#!/usr/bin/env tsx
import { prisma } from "@/lib/prisma";

async function main() {
  const rows = await prisma.pageView.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log(`Last ${rows.length} pageviews:`);
  console.table(
    rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      ipAddress: r.ipAddress ?? null,
      userAgent: r.userAgent ?? null,
      weddingPageId: r.weddingPageId,
    }))
  );

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
