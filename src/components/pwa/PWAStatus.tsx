"use client";

import { usePWA } from "@/hooks/pwa";
import { Bell, BellOff, Download, Wifi, WifiOff } from "lucide-react";

interface PWAStatusProps {
  showInstallButton?: boolean;
  showNotificationToggle?: boolean;
  compact?: boolean;
}

/**
 * PWA Status Component
 * Shows PWA installation status, online/offline status, and notification status
 * Can be placed in dashboard sidebar or settings
 */
export default function PWAStatus({
  showInstallButton = true,
  showNotificationToggle = true,
  compact = false,
}: PWAStatusProps) {
  const {
    install: { isInstallable, isInstalled, promptInstall },
    offline: { isOnline },
    notifications: {
      permission,
      isSupported: notificationsSupported,
      isSubscribed,
      subscribe,
      unsubscribe,
      isLoading,
    },
    isPWA,
  } = usePWA();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* PWA Installed Badge */}
        {isPWA && (
          <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            App Mode
          </div>
        )}

        {/* Online/Offline Status */}
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            isOnline
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          }`}
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Notification Status */}
        {notificationsSupported && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              isSubscribed
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {isSubscribed ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            <span>{isSubscribed ? "Notifications" : "No Notifications"}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">PWA Status</h3>

      <div className="space-y-3">
        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className={`h-5 w-5 ${isPWA ? "text-green-600" : "text-gray-400"}`} />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isPWA ? "Installed" : "Not Installed"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isPWA ? "Running as app" : "Install for better experience"}
              </p>
            </div>
          </div>
          {showInstallButton && isInstallable && !isInstalled && (
            <button
              onClick={promptInstall}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Install
            </button>
          )}
        </div>

        {/* Online Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isOnline ? "Online" : "Offline"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isOnline ? "Connected to internet" : "Some features limited"}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Status */}
        {notificationsSupported && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSubscribed ? (
                <Bell className="h-5 w-5 text-blue-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isSubscribed ? "Notifications On" : "Notifications Off"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isSubscribed ? "Subscription reminders enabled" : "Enable to get reminders"}
                </p>
              </div>
            </div>
            {showNotificationToggle && permission !== "denied" && (
              <button
                onClick={isSubscribed ? unsubscribe : subscribe}
                disabled={isLoading}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  isSubscribed
                    ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                }`}
              >
                {isLoading ? "..." : isSubscribed ? "Disable" : "Enable"}
              </button>
            )}
          </div>
        )}

        {/* Permission Denied Warning */}
        {permission === "denied" && (
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Notifications blocked. Please enable them in your browser settings to receive
              subscription reminders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
