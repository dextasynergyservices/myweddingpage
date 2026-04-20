/**
 * Notification Service
 * Centralized service for sending push notifications to users
 * Handles both instant and scheduled notifications
 */

import { prisma } from "@/lib/prisma";
import webPush from "web-push";

// Track if VAPID is configured to avoid redundant calls
let vapidConfigured = false;

/**
 * Configure VAPID details (lazy initialization)
 * Only called when actually sending notifications
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

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
}

/**
 * Send notification to a specific user
 * @param userId - User ID to send notification to
 * @param payload - Notification content
 * @returns Object with success/failure counts
 */
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  try {
    // Ensure VAPID is configured before sending
    ensureVapidConfigured();

    // Get user's push subscriptions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pushSubscriptions: true },
    });

    if (
      !user ||
      !user.pushSubscriptions ||
      user.pushSubscriptions.length === 0
    ) {
      console.log(`No push subscriptions found for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/icon-72x72.png",
      tag: payload.tag || "default",
      data: {
        url: payload.url || "/dashboard",
        timestamp: Date.now(),
        ...payload.data,
      },
    });

    // Send to all user's devices
    for (const subscription of user.pushSubscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys as { p256dh: string; auth: string },
          },
          notificationPayload
        );
        sent++;
      } catch (error: unknown) {
        console.error(
          `Failed to send notification to subscription ${subscription.id}:`,
          error
        );

        // Remove invalid subscriptions (404 or 410 status)
        const errorObj = error as { statusCode?: number };
        if (errorObj.statusCode === 404 || errorObj.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
          console.log(`Removed invalid subscription ${subscription.id}`);
        }
        failed++;
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { sent: 0, failed: 1 };
  }
}

/**
 * Send notification to multiple users
 * @param userIds - Array of user IDs
 * @param payload - Notification content
 */
export async function sendNotificationToMultipleUsers(
  userIds: string[],
  payload: NotificationPayload
): Promise<{ totalSent: number; totalFailed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendNotificationToUser(userId, payload);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { totalSent, totalFailed };
}

// ============================================================================
// Notification Templates
// ============================================================================

/**
 * Task completion notification
 */
export function createTaskNotification(taskTitle: string): NotificationPayload {
  return {
    title: "✅ Task Completed!",
    body: `Great progress! You completed: "${taskTitle}"`,
    tag: "task-completed",
    url: "/task",
    data: { type: "task", action: "completed" },
  };
}

/**
 * RSVP response notification
 */
export function createRSVPNotification(
  guestName: string,
  status: "ATTENDING" | "NOT_ATTENDING" | "MAYBE"
): NotificationPayload {
  const emoji =
    status === "ATTENDING" ? "🎉" : status === "NOT_ATTENDING" ? "😔" : "🤔";
  const statusText =
    status === "ATTENDING"
      ? "will attend"
      : status === "NOT_ATTENDING"
        ? "can't attend"
        : "might attend";

  return {
    title: `${emoji} RSVP Response`,
    body: `${guestName} ${statusText} your wedding!`,
    tag: "rsvp-response",
    url: "/rsvp",
    data: { type: "rsvp", guestName, status },
  };
}

/**
 * New guest added notification
 */
export function createGuestAddedNotification(
  guestName: string
): NotificationPayload {
  return {
    title: "👥 New Guest Added",
    body: `${guestName} has been added to your guest list`,
    tag: "guest-added",
    url: "/dashboard?tab=guests",
    data: { type: "guest", action: "added" },
  };
}

/**
 * Gallery photo uploaded notification
 */
export function createGalleryNotification(
  photoCount: number
): NotificationPayload {
  return {
    title: "📸 New Photos!",
    body: `${photoCount} ${photoCount === 1 ? "photo" : "photos"} added to your gallery`,
    tag: "gallery-update",
    url: "/dashboard?tab=gallery",
    data: { type: "gallery", action: "upload", count: photoCount },
  };
}

/**
 * Wedding date reminder notification
 */
export function createWeddingReminderNotification(
  daysUntil: number,
  brideName: string,
  groomName: string
): NotificationPayload {
  const emoji = daysUntil <= 1 ? "💍" : daysUntil <= 7 ? "🎊" : "📅";
  const timeText =
    daysUntil === 0
      ? "Today"
      : daysUntil === 1
        ? "Tomorrow"
        : `${daysUntil} days`;

  return {
    title: `${emoji} Wedding Day ${daysUntil === 0 ? "is Here!" : "Reminder"}`,
    body: `${timeText}! ${groomName} & ${brideName}'s special day ${daysUntil === 0 ? "is today" : `is in ${timeText}`}!`,
    tag: "wedding-reminder",
    url: "/dashboard",
    data: { type: "wedding-reminder", daysUntil },
  };
}

/**
 * Incomplete tasks reminder notification
 */
export function createTaskReminderNotification(
  incompleteCount: number
): NotificationPayload {
  return {
    title: "📋 Task Reminder",
    body: `You have ${incompleteCount} incomplete ${incompleteCount === 1 ? "task" : "tasks"}. Stay on track!`,
    tag: "task-reminder",
    url: "/task",
    data: { type: "task-reminder", count: incompleteCount },
  };
}

/**
 * Subscription expiration notifications (existing)
 */
export const subscriptionNotifications = {
  sevenDays: {
    title: "⚠️ Subscription Expires Soon",
    body: "Your subscription expires in 7 days. Renew now to continue enjoying all features!",
    tag: "expiration-7days",
    url: "/dashboard",
    data: { type: "subscription", action: "renew", daysLeft: 7 },
  },
  threeDays: {
    title: "🚨 Subscription Ending Soon",
    body: "Only 3 days left! Renew your subscription to avoid interruption.",
    tag: "expiration-3days",
    url: "/dashboard",
    data: { type: "subscription", action: "renew", daysLeft: 3 },
  },
  oneDay: {
    title: "🔴 Last Chance to Renew",
    body: "Your subscription expires tomorrow! Renew now to keep your wedding page active.",
    tag: "expiration-1day",
    url: "/dashboard",
    data: { type: "subscription", action: "renew", daysLeft: 1 },
  },
  expired: {
    title: "❌ Subscription Expired",
    body: "Your subscription has expired. You now have 3 days grace period to renew.",
    tag: "expired",
    url: "/dashboard",
    data: { type: "subscription", action: "renew", daysLeft: 0 },
  },
  gracePeriod: (daysLeft: number) => ({
    title: "⏰ Grace Period Reminder",
    body: `${daysLeft} day(s) left to renew your subscription before your account is deactivated!`,
    tag: "grace-period",
    url: "/dashboard",
    data: { type: "subscription", action: "renew", daysLeft },
  }),
};
