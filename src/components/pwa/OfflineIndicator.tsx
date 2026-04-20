"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useOfflineStatus } from "@/hooks/pwa";

export interface OfflineIndicatorProps {
  position?: "top" | "bottom";
  showOnlineMessage?: boolean;
}

/**
 * Component to show online/offline status
 * Displays a banner when user goes offline or comes back online
 *
 * @example
 * // Show at top of page
 * <OfflineIndicator position="top" showOnlineMessage={true} />
 *
 * // Show at bottom
 * <OfflineIndicator position="bottom" />
 */
export function OfflineIndicator({
  position = "top",
  showOnlineMessage = true,
}: OfflineIndicatorProps) {
  const { isOffline, wasOffline, isOnline } = useOfflineStatus();

  const showOffline = isOffline;
  const showOnline = wasOffline && isOnline && showOnlineMessage;

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ y: position === "top" ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === "top" ? -100 : 100, opacity: 0 }}
          className={`fixed left-0 right-0 z-50 ${position === "top" ? "top-0" : "bottom-0"}`}
        >
          <div className="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">You are offline</span>
              <span className="text-sm opacity-90">
                - Some features may be limited
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {showOnline && (
        <motion.div
          initial={{ y: position === "top" ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === "top" ? -100 : 100, opacity: 0 }}
          className={`fixed left-0 right-0 z-50 ${position === "top" ? "top-0" : "bottom-0"}`}
        >
          <div className="bg-green-500 dark:bg-green-600 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
              <Wifi className="w-5 h-5" />
              <span className="font-medium"> You&apos;re back online!</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
