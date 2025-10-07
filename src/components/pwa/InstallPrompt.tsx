"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone } from "lucide-react";
import { useInstallPrompt } from "@/hooks/pwa";
import Button from "@/components/ui/Button";

export interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  autoDismissDelay?: number; // Auto dismiss after X days
  userId?: string; // Optional user ID to make dismissal user-specific
}

/**
 * Component to prompt users to install the PWA
 * Shows "Add to Home Screen" banner with install/dismiss options
 *
 * @example
 * <InstallPrompt
 *   userId={user?.id} // Optional: Makes dismissal user-specific
 *   onInstall={() => console.log('User installed app')}
 *   onDismiss={() => console.log('User dismissed prompt')}
 *   autoDismissDelay={7} // Don't show again for 7 days
 * />
 */
export function InstallPrompt({
  onInstall,
  onDismiss,
  autoDismissDelay = 7,
  userId,
}: InstallPromptProps) {
  const { isInstallable, isInstalled, promptInstall, dismissPrompt } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt recently
    // Use user-specific key if userId provided, otherwise use global key
    const storageKey = userId
      ? `pwa-install-dismissed-until-${userId}`
      : "pwa-install-dismissed-until";
    const dismissedUntil = localStorage.getItem(storageKey);
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setIsDismissed(true);
        return;
      }
    }

    // Show prompt if installable and not already installed
    if (isInstallable && !isInstalled && !isDismissed) {
      // Delay showing the prompt slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isDismissed, userId]);

  const handleInstall = async () => {
    try {
      await promptInstall();
      setIsVisible(false);
      onInstall?.();
    } catch (error) {
      console.error("Install error:", error);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
    setIsDismissed(true);

    // Store dismissal with expiry (user-specific if userId provided)
    const storageKey = userId
      ? `pwa-install-dismissed-until-${userId}`
      : "pwa-install-dismissed-until";
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + autoDismissDelay);
    localStorage.setItem(storageKey, dismissUntil.toISOString());

    onDismiss?.();
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon and content */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Install My Wedding Page
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Install Myweddingpage app for quick access, offline support, and the best
                experience!
              </p>

              {/* Benefits list */}
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                  Fast access from your home screen
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                  Works offline
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                  Get notifications for important updates
                </li>
              </ul>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install
                </Button>
                <Button onClick={handleDismiss} variant="outline" className="px-4 py-2 text-sm">
                  Not now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
