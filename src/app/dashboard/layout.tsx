"use client";

import "../globals.css";
import { InstallPrompt } from "@/components/pwa";
import { useAuth } from "@/contexts/AuthContext";

export default function WeddingPageLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <>
      {/* Show install prompt to authenticated users */}
      <InstallPrompt
        userId={user?.id}
        autoDismissDelay={7}
        onInstall={() => console.log("PWA installed from dashboard")}
      />
      {children}
    </>
  );
}
