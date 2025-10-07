import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/middleware/admin";

/**
 * DELETE /api/admin/rate-limits/[identifier]
 * Clear a specific rate limit
 */
export async function DELETE(request: Request, { params }: { params: { identifier: string } }) {
  try {
    // Check admin authentication
    const adminUser = await requireAdmin();
    if (adminUser instanceof NextResponse) {
      return adminUser;
    }

    const { identifier } = params;
    const decodedIdentifier = decodeURIComponent(identifier);

    // Try to clear from Redis if available
    try {
      // Import redis module
      const { getRedisClient } = await import("@/lib/redis");
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.del(decodedIdentifier);
      }
    } catch (error) {
      console.log("Redis not available or key not found:", error);
    }

    // Log admin action
    await logAdminAction(`Cleared rate limit for: ${decodedIdentifier}`, {
      identifier: decodedIdentifier,
    });

    return NextResponse.json({
      success: true,
      message: "Rate limit cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing rate limit:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear rate limit",
      },
      { status: 500 }
    );
  }
}
