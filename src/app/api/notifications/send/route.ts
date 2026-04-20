import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Track if VAPID is configured
let vapidConfigured = false;

/**
 * Configure VAPID details (lazy initialization)
 */
function ensureVapidConfigured() {
  if (vapidConfigured) return;

  if (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:support@myweddingpage.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    vapidConfigured = true;
  }
}

/**
 * POST /api/notifications/send
 * Send push notification to user(s)
 * Admin or self-notification only
 */
export async function POST(request: NextRequest) {
  // Ensure VAPID is configured
  ensureVapidConfigured();
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, title, body, icon, badge, tag, data } =
      await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check authorization - user can only send to themselves unless they're admin
    if (userId && userId !== currentUser.id && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only send notifications to yourself" },
        { status: 403 }
      );
    }

    // Get target user's subscriptions
    const targetUserId = userId || currentUser.id;
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: targetUserId },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found for this user" },
        { status: 404 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/icons/icon-192x192.png",
      badge: badge || "/icons/icon-72x72.png",
      tag: tag || "default",
      data: data || {},
      timestamp: Date.now(),
    });

    // Send to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          };

          await webPush.sendNotification(pushSubscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: unknown) {
          console.error("Push send error:", error);

          // If subscription is no longer valid, delete it
          if (
            error &&
            typeof error === "object" &&
            "statusCode" in error &&
            (error.statusCode === 404 || error.statusCode === 410)
          ) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }

          return { success: false, endpoint: sub.endpoint, error };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} device(s)`,
      details: {
        successful,
        failed,
        total: subscriptions.length,
      },
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/send
 * Get notification status/config (for testing)
 */
export async function GET() {
  const isConfigured =
    !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    !!process.env.VAPID_PRIVATE_KEY;

  return NextResponse.json({
    configured: isConfigured,
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
    message: isConfigured
      ? "Push notifications are configured"
      : "Push notifications not configured. Run 'pnpm generate:vapid' to generate keys.",
  });
}
