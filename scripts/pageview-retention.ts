#!/usr/bin/env node
/**
 * scripts/pageview-retention.ts
 *
 * Usage:
 *  pnpm tsx scripts/pageview-retention.ts --dry-run
 *  pnpm tsx scripts/pageview-retention.ts --apply
 *
 * Behavior:
 *  - By default does a dry-run reporting how many PageView rows would be anonymized (ip hashed) older than RETENTION_ANON_DAYS
 *    and how many PageView rows would be deleted older than RETENTION_DELETE_DAYS.
 *  - When run with --apply it performs the anonymization and deletion.
 *
 * Environment variables (optional):
 *  RETENTION_ANON_DAYS (default 90)
 *  RETENTION_DELETE_DAYS (default 365)
 */

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const dryRun = args.includes("--dry-run") || !apply;

  const anonDays = Number(process.env.RETENTION_ANON_DAYS || 90);
  const deleteDays = Number(process.env.RETENTION_DELETE_DAYS || 365);

  const { PrismaClient } = await import("../src/generated/prisma/index.js");
  const prisma = new PrismaClient();
  const crypto = await import("crypto");

  try {
    const now = new Date();
    const anonBefore = new Date(now.getTime() - anonDays * 24 * 60 * 60 * 1000);
    const deleteBefore = new Date(now.getTime() - deleteDays * 24 * 60 * 60 * 1000);

    // Count candidate rows for anonymization: ipAddress not null and not already a 64-char hex sha256
    const anonCountRows = (await prisma.$queryRawUnsafe(
      'SELECT COUNT(*) as c FROM "PageView" WHERE "createdAt" < $1 AND "ipAddress" IS NOT NULL',
      anonBefore
    )) as Array<{ c: bigint }>;
    const toAnon = Number(anonCountRows?.[0]?.c ?? 0);

    // Count candidate rows for deletion
    const deleteCountRows = (await prisma.$queryRawUnsafe(
      'SELECT COUNT(*) as c FROM "PageView" WHERE "createdAt" < $1',
      deleteBefore
    )) as Array<{ c: bigint }>;
    const toDelete = Number(deleteCountRows?.[0]?.c ?? 0);

    console.log(
      JSON.stringify(
        {
          anonDays,
          deleteDays,
          anonBefore: anonBefore.toISOString(),
          deleteBefore: deleteBefore.toISOString(),
          toAnon,
          toDelete,
        },
        null,
        2
      )
    );

    if (dryRun) {
      console.log("Dry-run mode: no changes will be made. Run with --apply to perform changes.");
      await prisma.$disconnect();
      return;
    }

    console.log("Applying retention policy...");

    // Anonymize: update ipAddress to sha256(ip) for rows older than anonDays, but avoid double-hashing: detect existing 64-hex string
    // We'll fetch ids and ipAddress in batches
    const batchSize = 1000;
    let offset = 0;
    while (true) {
      const rows = (await prisma.$queryRawUnsafe(
        'SELECT id, "ipAddress" FROM "PageView" WHERE "createdAt" < $1 AND "ipAddress" IS NOT NULL ORDER BY "createdAt" ASC LIMIT $2 OFFSET $3',
        anonBefore,
        batchSize,
        offset
      )) as Array<{ id: string; ipAddress: string | null }>;
      if (!rows || rows.length === 0) break;

      const updates: Array<Promise<any>> = [];
      for (const r of rows) {
        const ip = r.ipAddress ?? "";
        // detect probable sha256 hex (64 hex chars)
        const isLikelyHashed = /^[a-f0-9]{64}$/i.test(ip);
        if (isLikelyHashed) continue;
        const hashed = crypto.createHash("sha256").update(ip).digest("hex");
        updates.push(prisma.pageView.update({ where: { id: r.id }, data: { ipAddress: hashed } }));
      }

      await Promise.all(updates);
      offset += rows.length;
      if (rows.length < batchSize) break;
    }

    // Delete rows older than deleteDays
    const delRes = await prisma.pageView.deleteMany({ where: { createdAt: { lt: deleteBefore } } });

    console.log(`Anonymization and deletion complete. Deleted ${delRes.count} rows.`);
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    try {
      await prisma.$disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

main();
