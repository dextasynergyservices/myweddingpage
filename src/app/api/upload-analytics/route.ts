import { NextRequest, NextResponse } from "next/server";
import { uploadMonitor } from "@/lib/upload-monitor";

/**
 * Upload Analytics Dashboard API
 * Provides insights into upload performance and usage patterns
 */
export async function GET(request: NextRequest) {
  try {
    // Check if this is a development environment or admin access
    const isDev = process.env.NODE_ENV === "development";

    if (!isDev) {
      // In production, you might want to add admin authentication here
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const format = (searchParams.get("format") as "json" | "csv") || "json";

    switch (action) {
      case "stats":
        const stats = uploadMonitor.getStats();
        return NextResponse.json(stats);

      case "failures":
        const limit = parseInt(searchParams.get("limit") || "10");
        const failures = uploadMonitor.getRecentFailures(limit);
        return NextResponse.json(failures);

      case "export":
        const exportData = uploadMonitor.exportMetrics(format);
        const contentType = format === "csv" ? "text/csv" : "application/json";
        const filename = `upload-metrics-${Date.now()}.${format}`;

        return new NextResponse(exportData, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });

      case "dashboard":
        // Return HTML dashboard
        const dashboardHtml = generateDashboardHtml();
        return new NextResponse(dashboardHtml, {
          headers: { "Content-Type": "text/html" },
        });

      default:
        return NextResponse.json({
          message: "Upload Analytics API",
          actions: [
            { action: "stats", description: "Get upload statistics" },
            {
              action: "failures",
              description: "Get recent failures",
              params: "?limit=10",
            },
            {
              action: "export",
              description: "Export metrics",
              params: "?format=json|csv",
            },
            { action: "dashboard", description: "View HTML dashboard" },
          ],
        });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateDashboardHtml(): string {
  const stats = uploadMonitor.getStats();
  const recentFailures = uploadMonitor.getRecentFailures(5);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Analytics Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-gray-800">Upload Analytics Dashboard</h1>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Total Uploads</h3>
                <p class="text-3xl font-bold text-blue-600">${stats.total}</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Success Rate</h3>
                <p class="text-3xl font-bold text-green-600">${stats.successRate.toFixed(1)}%</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Avg Upload Time</h3>
                <p class="text-3xl font-bold text-purple-600">${stats.avgUploadTime}ms</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Data Saved</h3>
                <p class="text-3xl font-bold text-orange-600">${(stats.compressionSavings / 1024 / 1024).toFixed(1)}MB</p>
            </div>
        </div>

        <!-- Upload Types Breakdown -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-bold mb-4">Upload Types Breakdown</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-2">Type</th>
                            <th class="text-right py-2">Total</th>
                            <th class="text-right py-2">Successful</th>
                            <th class="text-right py-2">Failed</th>
                            <th class="text-right py-2">Success Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(stats.byType)
                          .map(
                            ([type, data]) => `
                            <tr class="border-b">
                                <td class="py-2 font-medium">${type}</td>
                                <td class="text-right py-2">${data.total}</td>
                                <td class="text-right py-2 text-green-600">${data.successful}</td>
                                <td class="text-right py-2 text-red-600">${data.failed}</td>
                                <td class="text-right py-2">${((data.successful / data.total) * 100).toFixed(1)}%</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Recent Failures -->
        ${
          recentFailures.length > 0
            ? `
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-bold mb-4 text-red-600">Recent Failures</h2>
            <div class="space-y-3">
                ${recentFailures
                  .map(
                    (failure) => `
                    <div class="border-l-4 border-red-500 pl-4 py-2">
                        <p class="font-medium">${failure.fileName} (${failure.uploadType})</p>
                        <p class="text-sm text-gray-600">${failure.errorMessage || "Unknown error"}</p>
                        <p class="text-xs text-gray-500">${failure.timestamp.toLocaleString()}</p>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
        `
            : ""
        }

        <!-- Actions -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Export Data</h2>
            <div class="space-x-4">
                <a href="?action=export&format=json" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Export JSON
                </a>
                <a href="?action=export&format=csv" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Export CSV
                </a>
                <button onclick="location.reload()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Refresh
                </button>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
  `;
}
