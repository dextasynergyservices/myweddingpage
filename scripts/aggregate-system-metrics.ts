#!/usr/bin/env node
/*
  scripts/aggregate-system-metrics.ts
  - Computes aggregates from SecurityLog for the last N minutes and writes a SystemMetric row.
  Usage: pnpm tsx scripts/aggregate-system-metrics.ts --window=60
*/
import prisma from "@/lib/prisma";

async function compute(windowMinutes = 60) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  // Fetch timings from metadata
  const rows = await prisma.securityLog.findMany({
    where: { timestamp: { gte: since } },
    select: { metadata: true },
    take: 10000,
  });

  const timings: number[] = [];
  let totalRequests = 0;
  let errorRequests = 0;

  for (const r of rows) {
    totalRequests++;
    const md = r.metadata as any;
    if (md) {
      const cand = md.duration ?? md.responseTime ?? md.timing ?? md.latency;
      if (typeof cand === "number" && Number.isFinite(cand) && cand > 0) timings.push(cand);
      if (
        !timings.length &&
        md.timing &&
        typeof md.timing === "object" &&
        typeof md.timing.total === "number"
      )
        timings.push(md.timing.total);
    }
    // heuristics for error: eventType in metadata or explicit statusCode
    // Try pulling statusCode
    if (md && md.statusCode && Number(md.statusCode) >= 400) errorRequests++;
  }

  const throughputPerMin = totalRequests > 0 ? Math.round(totalRequests / windowMinutes) : 0;
  const errorRatePct = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

  const avgResponseMs =
    timings.length > 0 ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length) : null;
  const sorted = timings.sort((a, b) => a - b);
  const p50 = sorted.length ? sorted[Math.floor(sorted.length * 0.5)] : null;
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : null;

  const timestamp = new Date();

  // Insert a new SystemMetric row
  const p: any = prisma;
  await p.systemMetric.create({
    data: {
      windowMinutes,
      timestamp,
      avgResponseMs: avgResponseMs ?? undefined,
      p50ResponseMs: p50 ?? undefined,
      p95ResponseMs: p95 ?? undefined,
      throughputPerMin: throughputPerMin ?? undefined,
      errorRatePct: errorRatePct ?? undefined,
      totalRequests: totalRequests ?? undefined,
    },
  });

  console.log(
    `Wrote system metric for last ${windowMinutes} minutes: totalRequests=${totalRequests} avg=${avgResponseMs} p50=${p50} p95=${p95}`
  );
}

(async () => {
  const argv = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")));
  const windowMinutes = Number(argv["--window"] || argv["window"] || 60);
  await compute(windowMinutes);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
