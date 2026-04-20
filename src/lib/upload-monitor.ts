/**
 * Upload Analytics and Monitoring Utility
 * Tracks upload performance, success rates, and usage patterns
 */

export interface UploadMetrics {
  uploadType: string;
  userId: string;
  fileName: string;
  fileSize: number;
  compressedSize?: number;
  uploadTime: number;
  success: boolean;
  errorMessage?: string;
  cloudinaryUrl?: string;
  timestamp: Date;
}

export class UploadMonitor {
  private static instance: UploadMonitor;
  private metrics: UploadMetrics[] = [];

  private constructor() {}

  static getInstance(): UploadMonitor {
    if (!UploadMonitor.instance) {
      UploadMonitor.instance = new UploadMonitor();
    }
    return UploadMonitor.instance;
  }

  /**
   * Record an upload attempt
   */
  recordUpload(metrics: UploadMetrics): void {
    this.metrics.push({
      ...metrics,
      timestamp: new Date(),
    });

    // Log for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Upload recorded:", {
        type: metrics.uploadType,
        size: `${(metrics.fileSize / 1024 / 1024).toFixed(1)}MB`,
        success: metrics.success,
        time: `${metrics.uploadTime}ms`,
      });
    }

    // Keep only last 1000 entries to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get upload statistics
   */
  getStats(timeRange?: { start: Date; end: Date }) {
    let filteredMetrics = this.metrics;

    if (timeRange) {
      filteredMetrics = this.metrics.filter(
        (m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    const total = filteredMetrics.length;
    const successful = filteredMetrics.filter((m) => m.success).length;
    const failed = total - successful;

    const byType = filteredMetrics.reduce(
      (acc, m) => {
        if (!acc[m.uploadType]) {
          acc[m.uploadType] = { total: 0, successful: 0, failed: 0 };
        }
        acc[m.uploadType].total++;
        if (m.success) {
          acc[m.uploadType].successful++;
        } else {
          acc[m.uploadType].failed++;
        }
        return acc;
      },
      {} as Record<
        string,
        { total: number; successful: number; failed: number }
      >
    );

    const avgUploadTime =
      filteredMetrics.length > 0
        ? filteredMetrics.reduce((sum, m) => sum + m.uploadTime, 0) /
          filteredMetrics.length
        : 0;

    const avgFileSize =
      filteredMetrics.length > 0
        ? filteredMetrics.reduce((sum, m) => sum + m.fileSize, 0) /
          filteredMetrics.length
        : 0;

    const compressionSavings = filteredMetrics
      .filter((m) => m.compressedSize && m.compressedSize < m.fileSize)
      .reduce((sum, m) => sum + (m.fileSize - (m.compressedSize || 0)), 0);

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      byType,
      avgUploadTime: Math.round(avgUploadTime),
      avgFileSize: Math.round(avgFileSize),
      compressionSavings,
      timeRange: timeRange || {
        start: filteredMetrics[0]?.timestamp,
        end: filteredMetrics[filteredMetrics.length - 1]?.timestamp,
      },
    };
  }

  /**
   * Get recent failures for debugging
   */
  getRecentFailures(limit: number = 10): UploadMetrics[] {
    return this.metrics
      .filter((m) => !m.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = [
        "timestamp",
        "uploadType",
        "userId",
        "fileName",
        "fileSize",
        "compressedSize",
        "uploadTime",
        "success",
        "errorMessage",
      ];

      const rows = this.metrics.map((m) => [
        m.timestamp.toISOString(),
        m.uploadType,
        m.userId,
        m.fileName,
        m.fileSize,
        m.compressedSize || "",
        m.uploadTime,
        m.success,
        m.errorMessage || "",
      ]);

      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Clear all metrics (use with caution)
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Convenience functions for tracking uploads
export const uploadMonitor = UploadMonitor.getInstance();

export function trackUploadStart(
  uploadType: string,
  fileName: string,
  fileSize: number,
  userId: string
) {
  return {
    uploadType,
    fileName,
    fileSize,
    userId,
    startTime: Date.now(),
  };
}

export function trackUploadComplete(
  trackingData: ReturnType<typeof trackUploadStart>,
  success: boolean,
  cloudinaryUrl?: string,
  compressedSize?: number,
  errorMessage?: string
) {
  const uploadTime = Date.now() - trackingData.startTime;

  uploadMonitor.recordUpload({
    uploadType: trackingData.uploadType,
    userId: trackingData.userId,
    fileName: trackingData.fileName,
    fileSize: trackingData.fileSize,
    compressedSize,
    uploadTime,
    success,
    errorMessage,
    cloudinaryUrl,
    timestamp: new Date(),
  });
}

// Hook for React components
export function useUploadMetrics() {
  const getStats = (timeRange?: { start: Date; end: Date }) =>
    uploadMonitor.getStats(timeRange);

  const getRecentFailures = (limit?: number) =>
    uploadMonitor.getRecentFailures(limit);

  const exportData = (format?: "json" | "csv") =>
    uploadMonitor.exportMetrics(format);

  return {
    getStats,
    getRecentFailures,
    exportData,
  };
}
