import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import os from "os";

// optional dependency to get disk usage cross-platform; we'll lazy-load it inside the handler
let checkDiskSpace:
  | ((path: string) => Promise<{ free: number; size: number }>)
  | null = null;

export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get system uptime (mock data - in production, you'd get this from the OS)
    const uptime = process.uptime();

    // Get database connection status
    let databaseStatus = "disconnected";
    let databaseResponseTime = 0;
    let databaseConnections = 0;

    try {
      const startTime = Date.now();
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      databaseResponseTime = Date.now() - startTime;
      databaseStatus = "connected";

      // Get active connections (approximate)
      const connectionResult = await prisma.$queryRaw<{ count: number }[]>`
        SELECT count(*) as count FROM pg_stat_activity
      `;
      databaseConnections = connectionResult[0]?.count || 0;
    } catch (error) {
      console.error("Database health check failed:", error);
      databaseStatus = "disconnected";
    }

    // Attempt to collect realistic system metrics using Node's os module
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = Math.max(0, totalMem - freeMem);
    const memPercent = totalMem > 0 ? (usedMem / totalMem) * 100 : 0;

    // Basic CPU usage approximation: use load average on Unix as a proxy
    // For cross-platform, we provide core count and leave usage as null if not derivable
    const cores = os.cpus()?.length ?? 1;
    let cpuUsage = null as number | null;
    try {
      const loads = os.loadavg(); // [1min, 5min, 15min] - 0 on Windows
      if (loads && loads[0] && cores > 0) {
        cpuUsage = Math.min(100, (loads[0] / cores) * 100);
      }
    } catch {
      cpuUsage = null;
    }

    // Disk usage: try to dynamically import `check-disk-space` at runtime if available
    let diskUsed = 0;
    let diskTotal = 0;
    let diskPercent = 0;
    if (!checkDiskSpace) {
      try {
        // dynamic import avoids using require() which is disallowed by ESLint
        const mod = await import("check-disk-space");
        checkDiskSpace =
          (mod.default as unknown as typeof checkDiskSpace) ||
          (mod as unknown as typeof checkDiskSpace);
      } catch {
        checkDiskSpace = null;
      }
    }

    if (checkDiskSpace) {
      try {
        const root =
          process.platform === "win32"
            ? process.cwd().split("\\")[0] + "\\"
            : "/";
        const ds = await checkDiskSpace(root as string);
        diskTotal = Number(ds.size || 0);
        diskUsed = Math.max(0, diskTotal - Number(ds.free || 0));
        diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;
      } catch {
        // ignore disk errors and fall back to zeros
        diskUsed = 0;
        diskTotal = 0;
        diskPercent = 0;
      }
    }

    const systemHealth = {
      status: "healthy",
      uptime: Math.floor(uptime),
      memory: {
        used: usedMem,
        total: totalMem,
        percentage: Number(memPercent.toFixed(1)),
      },
      cpu: {
        usage: cpuUsage != null ? Number(cpuUsage.toFixed(1)) : 0,
        cores,
      },
      disk: {
        used: diskUsed,
        total: diskTotal,
        percentage: Number(diskPercent.toFixed(1)),
      },
      database: {
        status: databaseStatus,
        responseTime: databaseResponseTime,
        connections: databaseConnections,
      },
      services: [
        {
          name: "Next.js Application",
          status: "up",
          responseTime: databaseResponseTime,
          lastChecked: new Date().toISOString(),
        },
      ],
    };

    // Determine overall system status
    const hasIssues =
      (systemHealth.memory.percentage ?? 0) > 90 ||
      (systemHealth.cpu.usage ?? 0) > 85 ||
      (systemHealth.disk.percentage ?? 0) > 95 ||
      systemHealth.database.status !== "connected" ||
      systemHealth.services.some((s) => s.status !== "up");

    if (hasIssues) {
      systemHealth.status = "warning";
    }

    const hasCriticalIssues =
      systemHealth.memory.percentage > 95 ||
      systemHealth.cpu.usage > 95 ||
      systemHealth.disk.percentage > 98 ||
      systemHealth.database.status !== "connected";

    if (hasCriticalIssues) {
      systemHealth.status = "critical";
    }

    return NextResponse.json(systemHealth);
  } catch (error) {
    console.error("System health check error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system health data" },
      { status: 500 }
    );
  }
}
