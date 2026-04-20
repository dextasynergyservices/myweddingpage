import { NextRequest, NextResponse } from "next/server";
import {
  validateEnvironment,
  checkServiceConnectivity,
} from "../../../lib/env-validator";

/**
 * GET /api/health
 *
 * Health check endpoint
 * Returns application health status and service connectivity
 *
 * Query parameters:
 * - detailed: Include service connectivity checks (slower)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const detailed = searchParams.get("detailed") === "true";

    // Basic health check
    const envValidation = validateEnvironment();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    const basicHealth = {
      status: envValidation.valid ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown",
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + " MB",
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + " MB",
        rss: Math.round(memory.rss / 1024 / 1024) + " MB",
      },
      envValidation: {
        valid: envValidation.valid,
        checked: envValidation.checked,
        errors: envValidation.errors.length,
        warnings: envValidation.warnings.length,
      },
    };

    // Detailed health check (includes service connectivity)
    if (detailed) {
      const connectivity = await checkServiceConnectivity();

      return NextResponse.json({
        ...basicHealth,
        services: {
          database: connectivity.database ? "connected" : "disconnected",
          email: connectivity.email ? "connected" : "disconnected",
          cloudinary: connectivity.cloudinary ? "configured" : "not configured",
        },
        serviceErrors: connectivity.errors,
      });
    }

    return NextResponse.json(basicHealth);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
