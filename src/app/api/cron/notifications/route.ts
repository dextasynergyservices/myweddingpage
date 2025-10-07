/**
 * Unified Notification Cron Job
 * Runs daily to send all scheduled notifications:
 * - Subscription expiration reminders
 * - Wedding date reminders
 * - Incomplete task reminders
 *
 * Schedule: Daily at 9:00 AM
 * Authorization: Requires CRON_SECRET in Authorization header
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendNotificationToUser,
  subscriptionNotifications,
  createWeddingReminderNotification,
  createTaskReminderNotification,
} from "@/lib/notifications/notificationService";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      subscriptionNotifications: 0,
      weddingReminders: 0,
      taskReminders: 0,
      totalSent: 0,
      totalFailed: 0,
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // ========================================================================
    // 1. SUBSCRIPTION EXPIRATION NOTIFICATIONS
    // ========================================================================

    // 7 days before expiration
    const sevenDaysBefore = new Date(now);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() + 7);
    const sevenDaysEnd = new Date(sevenDaysBefore);
    sevenDaysEnd.setHours(23, 59, 59, 999);

    const users7Days = await prisma.user.findMany({
      where: {
        subscription_end: {
          gte: sevenDaysBefore,
          lte: sevenDaysEnd,
        },
      },
      include: { pushSubscriptions: true },
    });

    for (const user of users7Days) {
      if (user.pushSubscriptions.length > 0) {
        const result = await sendNotificationToUser(user.id, subscriptionNotifications.sevenDays);
        results.subscriptionNotifications++;
        results.totalSent += result.sent;
        results.totalFailed += result.failed;
      }
    }

    // 3 days before expiration
    const threeDaysBefore = new Date(now);
    threeDaysBefore.setDate(threeDaysBefore.getDate() + 3);
    const threeDaysEnd = new Date(threeDaysBefore);
    threeDaysEnd.setHours(23, 59, 59, 999);

    const users3Days = await prisma.user.findMany({
      where: {
        subscription_end: {
          gte: threeDaysBefore,
          lte: threeDaysEnd,
        },
      },
      include: { pushSubscriptions: true },
    });

    for (const user of users3Days) {
      if (user.pushSubscriptions.length > 0) {
        const result = await sendNotificationToUser(user.id, subscriptionNotifications.threeDays);
        results.subscriptionNotifications++;
        results.totalSent += result.sent;
        results.totalFailed += result.failed;
      }
    }

    // 1 day before expiration
    const oneDayBefore = new Date(now);
    oneDayBefore.setDate(oneDayBefore.getDate() + 1);
    const oneDayEnd = new Date(oneDayBefore);
    oneDayEnd.setHours(23, 59, 59, 999);

    const users1Day = await prisma.user.findMany({
      where: {
        subscription_end: {
          gte: oneDayBefore,
          lte: oneDayEnd,
        },
      },
      include: { pushSubscriptions: true },
    });

    for (const user of users1Day) {
      if (user.pushSubscriptions.length > 0) {
        const result = await sendNotificationToUser(user.id, subscriptionNotifications.oneDay);
        results.subscriptionNotifications++;
        results.totalSent += result.sent;
        results.totalFailed += result.failed;
      }
    }

    // Expiration day
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const usersExpiredToday = await prisma.user.findMany({
      where: {
        subscription_end: {
          gte: now,
          lte: todayEnd,
        },
      },
      include: { pushSubscriptions: true },
    });

    for (const user of usersExpiredToday) {
      if (user.pushSubscriptions.length > 0) {
        const result = await sendNotificationToUser(user.id, subscriptionNotifications.expired);
        results.subscriptionNotifications++;
        results.totalSent += result.sent;
        results.totalFailed += result.failed;
      }
    }

    // Grace period reminders
    const usersInGracePeriod = await prisma.user.findMany({
      where: {
        isInGracePeriod: true,
        gracePeriodEnd: { gt: now },
      },
      include: { pushSubscriptions: true },
    });

    for (const user of usersInGracePeriod) {
      if (user.pushSubscriptions.length > 0 && user.gracePeriodEnd) {
        const gracePeriodEnd = new Date(user.gracePeriodEnd);
        const daysLeft = Math.ceil(
          (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const result = await sendNotificationToUser(
          user.id,
          subscriptionNotifications.gracePeriod(daysLeft)
        );
        results.subscriptionNotifications++;
        results.totalSent += result.sent;
        results.totalFailed += result.failed;
      }
    }

    // ========================================================================
    // 2. WEDDING DATE REMINDERS (7 days, 3 days, 1 day, today)
    // ========================================================================

    // Get all users with upcoming weddings
    const usersWithWeddings = await prisma.user.findMany({
      where: {
        weddingDate: { gte: now },
      },
      include: {
        pushSubscriptions: true,
        weddingPages: {
          where: {
            deleted_at: null,
          },
        },
      },
    });

    for (const user of usersWithWeddings) {
      if (
        !user.weddingDate ||
        user.pushSubscriptions.length === 0 ||
        user.weddingPages.length === 0
      )
        continue;

      const weddingDate = new Date(user.weddingDate);
      weddingDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminders at 7 days, 3 days, 1 day, and day of wedding
      if ([7, 3, 1, 0].includes(daysUntil)) {
        const notification = createWeddingReminderNotification(
          daysUntil,
          user.brideName || "Bride",
          user.groomName || "Groom"
        );

        const result = await sendNotificationToUser(user.id, notification);
        results.weddingReminders++;
        results.totalSent += result.sent;
        results.totalFailed += result.failed;
      }
    }

    // ========================================================================
    // 3. INCOMPLETE TASKS REMINDER (Weekly - Only on Mondays)
    // ========================================================================

    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (dayOfWeek === 1) {
      // Monday only
      const usersWithTasks = await prisma.user.findMany({
        where: {
          pushSubscriptions: {
            some: {},
          },
        },
        include: {
          pushSubscriptions: true,
          tasks: {
            where: {
              completed: false,
            },
          },
        },
      });

      for (const user of usersWithTasks) {
        if (user.tasks.length > 0 && user.pushSubscriptions.length > 0) {
          const notification = createTaskReminderNotification(user.tasks.length);
          const result = await sendNotificationToUser(user.id, notification);
          results.taskReminders++;
          results.totalSent += result.sent;
          results.totalFailed += result.failed;
        }
      }
    }

    // ========================================================================
    // RETURN RESULTS
    // ========================================================================

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        subscriptionNotifications: results.subscriptionNotifications,
        weddingReminders: results.weddingReminders,
        taskReminders: results.taskReminders,
        totalNotificationsSent: results.totalSent,
        totalNotificationsFailed: results.totalFailed,
      },
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
