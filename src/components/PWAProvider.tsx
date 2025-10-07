"use client";

import React from "react";
import { OfflineIndicator } from "@/components/pwa";

/**
 * PWA Provider Component
 * Wraps the app with PWA features like offline indicator
 * Add other global PWA components here as needed
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Global offline/online status indicator */}
      <OfflineIndicator position="top" showOnlineMessage={true} />

      {children}
    </>
  );
}
