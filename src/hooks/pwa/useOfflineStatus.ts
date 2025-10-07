"use client";

import { useState, useEffect } from "react";

export interface UseOfflineStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to detect online/offline status
 *
 * @example
 * const { isOnline, isOffline, wasOffline } = useOfflineStatus();
 *
 * if (isOffline) {
 *   <div>You are offline. Some features may be limited.</div>
 * }
 *
 * if (wasOffline && isOnline) {
 *   <div>You're back online!</div>
 * }
 */
export function useOfflineStatus(): UseOfflineStatusReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);

      // Clear "was offline" flag after 5 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}
