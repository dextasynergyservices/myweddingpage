import { PrismaClient } from "../src/generated/prisma";

/**
 * Usage:
 *  pnpm tsx scripts/inspect-timings.ts --limit=20 --since=60
 */

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const out: {
    limit: number;
    sinceMinutes: number;
    eventType?: string;
    csv: boolean;
  } = {
    limit: 20,
    sinceMinutes: 60,
    csv: false,
  };
  for (const a of args) {
    if (a.startsWith("--limit="))
      out.limit = Number(a.split("=")[1]) || out.limit;
    if (a.startsWith("--since="))
      out.sinceMinutes = Number(a.split("=")[1]) || out.sinceMinutes;
    if (a.startsWith("--eventType="))
      out.eventType = a.split("=")[1] || undefined;
    if (a === "--csv") out.csv = true;
  }
  return out;
}

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  const weight = idx - lower;
  return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
}

async function run() {
  const { limit, sinceMinutes, eventType, csv } = parseArgs();
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000);

  try {
    const rows = await prisma.securityLog.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    if (!rows.length) {
      console.log(`No security logs in the last ${sinceMinutes} minutes.`);
      return;
    }

    // Extract response times and optionally filter by eventType
    const extracted = rows
      .map((r) => {
        const md = r.metadata as any;
        const rt =
          md?.responseTime ??
          md?.timing ??
          md?.duration ??
          (md && md.metrics ? (md.metrics.responseTime ?? null) : null);
        return {
          row: r,
          responseTime: typeof rt === "number" ? rt : null,
          metadata: md,
        };
      })
      .filter((x) =>
        eventType ? String(x.row.eventType) === eventType : true
      );

    const timings = extracted
      .map((x) => x.responseTime)
      .filter((t): t is number => typeof t === "number");

    if (timings.length) {
      const sorted = [...timings].sort((a, b) => a - b);
      const p50 = percentile(sorted, 50);
      const p90 = percentile(sorted, 90);
      const p95 = percentile(sorted, 95);
      console.log(
        `Found ${timings.length} timed entries (of ${rows.length} rows retrieved)`
      );
      console.log(`p50=${p50}ms p90=${p90}ms p95=${p95}ms`);
    } else {
      console.log(
        `No timing values found in the retrieved logs (checked ${rows.length} rows).`
      );
    }

    if (csv) {
      // print CSV header
      console.log("id,eventType,timestamp,responseTime,metadata");
      for (const e of extracted) {
        const id = e.row.id;
        const et = e.row.eventType;
        const ts = e.row.timestamp.toISOString();
        const rt = e.responseTime ?? "";
        const md = JSON.stringify(e.metadata || {})
          .replace(/\n/g, " ")
          .replace(/"/g, '""');
        console.log(`${id},${et},${ts},${rt},"${md}"`);
      }
    } else {
      for (const e of extracted) {
        console.log(
          JSON.stringify(
            {
              id: e.row.id,
              eventType: e.row.eventType,
              ts: e.row.timestamp,
              responseTime: e.responseTime,
              metadata: e.metadata,
            },
            null,
            2
          )
        );
      }
    }
  } catch (e) {
    console.error("Failed to query security logs:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
