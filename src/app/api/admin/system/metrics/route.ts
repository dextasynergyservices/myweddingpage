import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import withTiming from "@/lib/withTiming";
import { createLogFromRequest, logSecurityEvent } from "@/lib/security-logger";
import os from "os";

export async function GET(req: NextRequest) {
  return withTiming(
    req,
    async () => {
      try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get recent request metrics (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Count total requests in the last 24 hours
        const totalRequests = await prisma.securityLog.count({
          where: {
            timestamp: {
              gte: twentyFourHoursAgo,
            },
          },
        });

        // Calculate requests per minute (approximate)
        const throughput = Math.floor(totalRequests / (24 * 60));

        // Get error rate (failed requests / total requests)
        const errorRequests = await prisma.securityLog.count({
          where: {
            timestamp: {
              gte: twentyFourHoursAgo,
            },
            eventType: {
              in: ["RATE_LIMIT_HIT", "LOGIN_FAILURE"],
            },
          },
        });

        const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

        // Get active connections (approximate from recent activity)
        const activeConnections = await prisma.securityLog.count({
          where: {
            timestamp: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
          },
        });

        // Try to derive average response time from SecurityLog.metadata if present
        let avgResponseTime = 0;
        try {
          const logsWithMetadata = await prisma.securityLog.findMany({
            where: {
              timestamp: { gte: twentyFourHoursAgo },
            },
            select: { metadata: true },
            take: 1000,
          });

          const timings: number[] = [];
          for (const l of logsWithMetadata) {
            const md = l.metadata as Record<string, unknown>;
            if (!md) continue;
            // Common fields we might use: duration, responseTime, timing, latency
            const cand = md.duration ?? md.responseTime ?? md.timing ?? md.latency;
            if (typeof cand === "number" && Number.isFinite(cand) && cand > 0)
              timings.push(cand as number);
            // Some systems store nested objects like { timing: { total: 123 } }
            if (!timings.length && md.timing && typeof md.timing === "object") {
              const timingObj = md.timing as Record<string, unknown>;
              // Try common shapes: total | Total | string numbers | nested value/duration
              const maybeTotal =
                timingObj.total ?? timingObj.Total ?? (timingObj as { total?: unknown }).total;
              if (typeof maybeTotal === "number" && Number.isFinite(maybeTotal)) {
                timings.push(maybeTotal);
              } else if (typeof maybeTotal === "string" && !Number.isNaN(Number(maybeTotal))) {
                timings.push(Number(maybeTotal));
              } else {
                const nested =
                  ((timingObj as Record<string, unknown>).total as { value?: unknown } | undefined)
                    ?.value ?? ((timingObj as Record<string, unknown>).duration as unknown);
                if (typeof nested === "number" && Number.isFinite(nested)) {
                  timings.push(nested);
                }
              }
            }
          }

          if (timings.length > 0) {
            avgResponseTime = Math.round(timings.reduce((a, b) => a + b, 0) / timings.length);
          }
        } catch {
          // ignore and fallback
          avgResponseTime = 0;
        }

        // Derive memory and CPU usage similar to system health
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = Math.max(0, totalMem - freeMem);
        const memPercent = totalMem > 0 ? (usedMem / totalMem) * 100 : 0;

        const cores = os.cpus()?.length ?? 1;
        let cpuUsage: number | null = null;
        try {
          const loads = os.loadavg();
          if (loads && loads[0] && cores > 0) {
            cpuUsage = Math.min(100, (loads[0] / cores) * 100);
          }
        } catch {
          cpuUsage = null;
        }
        // If loadavg isn't available (e.g., on Windows), attempt a short sampled CPU usage
        async function sampleCpuPercent(sampleMs = 100): Promise<number | null> {
          try {
            const snap = os.cpus();
            const start = snap.map((c) => ({ ...c.times }));
            await new Promise((r) => setTimeout(r, sampleMs));
            const snap2 = os.cpus();
            let idleDiff = 0;
            let totalDiff = 0;
            for (let i = 0; i < snap2.length; i++) {
              const s1 = start[i];
              const s2 = snap2[i].times;
              const t1 = Object.values(s1).reduce((a, b) => a + (b as number), 0);
              const t2 = Object.values(s2).reduce((a, b) => a + (b as number), 0);
              const idle1 = s1.idle as number;
              const idle2 = s2.idle as number;
              const td = t2 - t1;
              const id = idle2 - idle1;
              if (td > 0) {
                totalDiff += td;
                idleDiff += id;
              }
            }
            if (totalDiff <= 0) return null;
            const busy = (1 - idleDiff / totalDiff) * 100;
            return Math.min(100, Math.max(0, Number(busy.toFixed(1))));
          } catch {
            return null;
          }
        }

        if (cpuUsage == null) {
          // run sampling but don't block admin too long; await it since admin expects real-time metrics
          // 100ms is usually sufficient to get a reasonable estimate
          cpuUsage = await sampleCpuPercent(120);
        }

        // Prefer reading a recent aggregated SystemMetric if available (fast path)
        let performanceMetrics: { [key: string]: number | null } | null = null;
        try {
          const latest = await (
            prisma as unknown as {
              systemMetric: {
                findFirst: (args: {
                  where: { windowMinutes: number };
                  orderBy: { timestamp: string };
                }) => Promise<{
                  timestamp: Date;
                  avgResponseMs?: number;
                  throughputPerMin?: number;
                  errorRatePct?: number;
                }>;
              };
            }
          ).systemMetric.findFirst({
            where: { windowMinutes: 60 },
            orderBy: { timestamp: "desc" },
          });
          if (latest) {
            const ageMs = Date.now() - latest.timestamp.getTime();
            // If the aggregated row is recent (within 90 minutes), use it
            if (ageMs < 90 * 60 * 1000) {
              performanceMetrics = {
                responseTime: latest.avgResponseMs ?? null,
                throughput: latest.throughputPerMin ?? throughput,
                errorRate: latest.errorRatePct ?? errorRate,
                activeConnections: Math.min(activeConnections, 100),
                memoryUsage: Number(memPercent.toFixed(1)),
                cpuUsage: cpuUsage != null ? Number(cpuUsage.toFixed(1)) : null,
              };
            }
          }
        } catch {
          // ignore and fall back
          performanceMetrics = null;
        }

        if (!performanceMetrics) {
          performanceMetrics = {
            responseTime: avgResponseTime > 0 ? avgResponseTime : null, // null when insufficient data
            throughput: throughput,
            errorRate: errorRate,
            activeConnections: Math.min(activeConnections, 100), // Cap at reasonable number
            memoryUsage: Number(memPercent.toFixed(1)),
            cpuUsage: cpuUsage != null ? Number(cpuUsage.toFixed(1)) : null,
          };
        }

        // Log that an admin fetched metrics (include sampling disabled for admin calls)
        try {
          const entry = createLogFromRequest(req, "ADMIN_ACTION", {
            message: "Admin fetched system metrics",
            statusCode: 200,
            metadata: { metrics: performanceMetrics },
          });
          void logSecurityEvent(entry).catch(() => {});
        } catch {
          // ignore
        }

        return NextResponse.json(performanceMetrics);
      } catch (err) {
        console.error("System metrics fetch error:", err);
        return NextResponse.json({ error: "Failed to fetch system metrics" }, { status: 500 });
      }
    },
    { sampleRate: 1, eventType: "ADMIN_ACTION" }
  );
}
