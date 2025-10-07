import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webPush from "web-push";

// Configure VAPID details
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:support@myweddingpage.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Cron Job: Subscription Expiration Notifications
 * Sends push notifications to users about their subscription status
 *
 * Schedule: Run daily at 9:00 AM
 *
 * Notifications sent:
 * - 7 days before expiration
 * - 3 days before expiration
 * - 1 day before expiration
 * - On expiration day
 * - During grace period (daily)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results = {
      sevenDays: 0,
      threeDays: 0,
      oneDay: 0,
      expired: 0,
      gracePeriod: 0,
      errors: 0,
    };

    // Calculate notification dates
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // 1. Users expiring in 7 days (first warning)
    const sevenDayUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        subscription_end: {
          gte: new Date(sevenDaysFromNow.setHours(0, 0, 0, 0)),
          lt: new Date(sevenDaysFromNow.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        pushSubscriptions: true,
      },
    });

    for (const user of sevenDayUsers) {
      if (user.pushSubscriptions.length > 0) {
        await sendNotification(user, {
          title: "⚠️ Subscription Expires Soon",
          body: "Your subscription expires in 7 days. Renew now to continue enjoying all features!",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: "expiration-7days",
          data: { url: "/dashboard", action: "renew" },
        });
        results.sevenDays++;
      }
    }

    // 2. Users expiring in 3 days (second warning)
    const threeDayUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        subscription_end: {
          gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
          lt: new Date(threeDaysFromNow.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        pushSubscriptions: true,
      },
    });

    for (const user of threeDayUsers) {
      if (user.pushSubscriptions.length > 0) {
        await sendNotification(user, {
          title: "🚨 Subscription Ending Soon",
          body: "Only 3 days left! Renew your subscription to avoid interruption.",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: "expiration-3days",
          data: { url: "/dashboard", action: "renew" },
        });
        results.threeDays++;
      }
    }

    // 3. Users expiring in 1 day (final warning)
    const oneDayUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        subscription_end: {
          gte: new Date(oneDayFromNow.setHours(0, 0, 0, 0)),
          lt: new Date(oneDayFromNow.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        pushSubscriptions: true,
      },
    });

    for (const user of oneDayUsers) {
      if (user.pushSubscriptions.length > 0) {
        await sendNotification(user, {
          title: "🔴 Last Chance to Renew",
          body: "Your subscription expires tomorrow! Renew now to keep your wedding page active.",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: "expiration-1day",
          data: { url: "/dashboard", action: "renew" },
        });
        results.oneDay++;
      }
    }

    // 4. Users who expired today
    const expiredToday = await prisma.user.findMany({
      where: {
        status: "EXPIRED",
        subscription_end: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lt: new Date(now.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        pushSubscriptions: true,
      },
    });

    for (const user of expiredToday) {
      if (user.pushSubscriptions.length > 0) {
        await sendNotification(user, {
          title: "❌ Subscription Expired",
          body: "Your subscription has expired. You now have 3 days grace period to renew.",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: "expired",
          data: { url: "/dashboard", action: "renew" },
        });
        results.expired++;
      }
    }

    // 5. Users in grace period (send daily reminder)
    const gracePeriodUsers = await prisma.user.findMany({
      where: {
        isInGracePeriod: true,
        gracePeriodEnd: {
          gt: now,
        },
      },
      include: {
        pushSubscriptions: true,
      },
    });

    for (const user of gracePeriodUsers) {
      if (user.pushSubscriptions.length > 0 && user.gracePeriodEnd) {
        const daysLeft = Math.ceil(
          (user.gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await sendNotification(user, {
          title: "⏰ Grace Period Reminder",
          body: `${daysLeft} day(s) left to renew your subscription before your account is deactivated!`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: "grace-period",
          data: { url: "/dashboard", action: "renew" },
        });
        results.gracePeriod++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subscription expiration notifications sent",
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Subscription notification cron error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Helper function to send push notification to a user
 */
async function sendNotification(
  user: {
    pushSubscriptions: Array<{
      id: string;
      endpoint: string;
      keys: unknown;
    }>;
  },
  payload: {
    title: string;
    body: string;
    icon: string;
    badge: string;
    tag: string;
    data: Record<string, unknown>;
  }
) {
  const notificationPayload = JSON.stringify({
    ...payload,
    timestamp: Date.now(),
  });

  for (const subscription of user.pushSubscriptions) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys as { p256dh: string; auth: string },
      };

      await webPush.sendNotification(pushSubscription, notificationPayload);
    } catch (error: unknown) {
      console.error("Failed to send notification:", error);

      // If subscription is invalid, delete it
      const errorObj = error as { statusCode?: number };
      if (errorObj.statusCode === 404 || errorObj.statusCode === 410) {
        await prisma.pushSubscription.delete({
          where: { id: subscription.id },
        });
      }
    }
  }
}
