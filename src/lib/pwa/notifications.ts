/**
 * Notification Utilities
 * Helper functions for sending push notifications to users
 */

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Send notification to current user
 * @param payload Notification content
 * @returns Promise<boolean> Success status
 */
export async function sendNotificationToSelf(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icons/icon-192x192.png",
        badge: payload.badge || "/icons/icon-72x72.png",
        tag: payload.tag || "default",
        data: payload.data || {},
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Send notification error:", error);
    return false;
  }
}

/**
 * Send notification to specific user (admin only)
 * @param userId Target user ID
 * @param payload Notification content
 * @returns Promise<boolean> Success status
 */
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icons/icon-192x192.png",
        badge: payload.badge || "/icons/icon-72x72.png",
        tag: payload.tag || "default",
        data: payload.data || {},
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Send notification error:", error);
    return false;
  }
}

/**
 * Subscription expiration notification templates
 */
export const subscriptionNotifications = {
  sevenDays: {
    title: "⚠️ Subscription Expires Soon",
    body: "Your subscription expires in 7 days. Renew now to continue enjoying all features!",
    tag: "expiration-7days",
    data: { url: "/dashboard", action: "renew" },
  },
  threeDays: {
    title: "🚨 Subscription Ending Soon",
    body: "Only 3 days left! Renew your subscription to avoid interruption.",
    tag: "expiration-3days",
    data: { url: "/dashboard", action: "renew" },
  },
  oneDay: {
    title: "🔴 Last Chance to Renew",
    body: "Your subscription expires tomorrow! Renew now to keep your wedding page active.",
    tag: "expiration-1day",
    data: { url: "/dashboard", action: "renew" },
  },
  expired: {
    title: "❌ Subscription Expired",
    body: "Your subscription has expired. You now have 3 days grace period to renew.",
    tag: "expired",
    data: { url: "/dashboard", action: "renew" },
  },
  gracePeriod: (daysLeft: number) => ({
    title: "⏰ Grace Period Reminder",
    body: `${daysLeft} day(s) left to renew your subscription before your account is deactivated!`,
    tag: "grace-period",
    data: { url: "/dashboard", action: "renew" },
  }),
  renewed: {
    title: "✅ Subscription Renewed",
    body: "Your subscription has been successfully renewed. Thank you!",
    tag: "renewed",
    data: { url: "/dashboard" },
  },
  paymentFailed: {
    title: "❌ Payment Failed",
    body: "Your payment could not be processed. Please update your payment method.",
    tag: "payment-failed",
    data: { url: "/dashboard", action: "payment" },
  },
};
