/**
 * Notification Service Exports
 * Central export for all notification functionality
 */

export {
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  createTaskNotification,
  createRSVPNotification,
  createGuestAddedNotification,
  createGalleryNotification,
  createWeddingReminderNotification,
  createTaskReminderNotification,
  subscriptionNotifications,
} from "./notificationService";

export type { NotificationPayload } from "./notificationService";
