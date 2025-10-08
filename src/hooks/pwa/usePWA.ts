"use client";

import { useInstallPrompt, UseInstallPromptReturn } from "./useInstallPrompt";
import { useOfflineStatus, UseOfflineStatusReturn } from "./useOfflineStatus";
import { useNotifications, UseNotificationsReturn } from "./useNotifications";

export interface UsePWAReturn {
  install: UseInstallPromptReturn;
  offline: UseOfflineStatusReturn;
  notifications: UseNotificationsReturn;
  isPWA: boolean;
}

/**
 * Combined PWA hook with all PWA functionality
 *
 * @example
 * const { install, offline, notifications, isPWA } = usePWA();
 *
 * // Check if running as PWA
 * if (isPWA) {
 *   console.log('Running as installed PWA');
 * }
 *
 * // Show install prompt
 * if (install.isInstallable) {
 *   <button onClick={install.promptInstall}>Install App</button>
 * }
 *
 * // Check online status
 * if (offline.isOffline) {
 *   <div>You are offline</div>
 * }
 *
 * // Enable notifications
 * if (notifications.isSupported && notifications.permission === 'default') {
 *   <button onClick={notifications.requestPermission}>Enable Notifications</button>
 * }
 */
export function usePWA(): UsePWAReturn {
  const install = useInstallPrompt();
  const offline = useOfflineStatus();
  const notifications = useNotifications();

  // Detect if running as PWA
  const isPWA = install.isInstalled;

  return {
    install,
    offline,
    notifications,
    isPWA,
  };
}
