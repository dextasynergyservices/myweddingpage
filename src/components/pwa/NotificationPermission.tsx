"use client";

import React, { useState } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";
import { useNotifications } from "@/hooks/pwa";
import Button from "@/components/ui/Button";
import { toast } from "sonner";

export interface NotificationPermissionProps {
  onSubscribe?: () => void;
  onUnsubscribe?: () => void;
  showTestButton?: boolean;
}

/**
 * Component to request and manage notification permissions
 * Allows users to enable/disable push notifications
 *
 * @example
 * <NotificationPermission
 *   onSubscribe={() => console.log('User subscribed')}
 *   showTestButton={true}
 * />
 */
export function NotificationPermission({
  onSubscribe,
  onUnsubscribe,
  showTestButton = false,
}: NotificationPermissionProps) {
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = useNotifications();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSupported) {
    return null; // Don't show if notifications aren't supported
  }

  const handleEnable = async () => {
    try {
      // First request permission
      const granted = await requestPermission();

      if (!granted) {
        toast.error("Notification permission denied");
        return;
      }

      // Then subscribe to push notifications
      const success = await subscribe();

      if (success) {
        toast.success("Notifications enabled successfully!");
        onSubscribe?.();
      } else {
        toast.error("Failed to enable notifications");
      }
    } catch (error) {
      console.error("Enable notifications error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleDisable = async () => {
    try {
      const success = await unsubscribe();

      if (success) {
        toast.success("Notifications disabled");
        onUnsubscribe?.();
      } else {
        toast.error("Failed to disable notifications");
      }
    } catch (error) {
      console.error("Disable notifications error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleTest = async () => {
    try {
      await sendTestNotification();
      toast.success("Test notification sent! Check your notifications.");
    } catch (error) {
      console.error("Test notification error:", error);
      toast.error("Failed to send test notification");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSubscribed
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSubscribed ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>

        {isSubscribed && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">Active</span>
          </div>
        )}
      </div>

      {/* Description */}
      {!isExpanded && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Get notified about task reminders, wedding date countdowns, and
          important updates.
        </p>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enable notifications to receive:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 pl-4">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Task reminders for your wedding checklist</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Wedding date countdown notifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Guest RSVP updates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Important announcements</span>
            </li>
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {!isSubscribed && permission === "default" && (
          <Button
            onClick={handleEnable}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Bell className="w-4 h-4 mr-2" />
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </Button>
        )}

        {!isSubscribed && permission === "denied" && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <X className="w-4 h-4" />
            <span>
              Notifications blocked. Please enable in your browser settings.
            </span>
          </div>
        )}

        {isSubscribed && (
          <>
            <Button
              onClick={handleDisable}
              disabled={isLoading}
              variant="outline"
            >
              <BellOff className="w-4 h-4 mr-2" />
              {isLoading ? "Disabling..." : "Disable"}
            </Button>

            {showTestButton && (
              <Button onClick={handleTest} variant="outline">
                Send Test
              </Button>
            )}
          </>
        )}

        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="text-sm"
        >
          {isExpanded ? "Show less" : "Learn more"}
        </Button>
      </div>
    </div>
  );
}
