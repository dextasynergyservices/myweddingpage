"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface UseInstallPromptReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

/**
 * Hook to detect and trigger PWA installation prompt
 *
 * @example
 * const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
 *
 * if (isInstallable && !isInstalled) {
 *   <button onClick={promptInstall}>Install App</button>
 * }
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // Check display mode
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      // Check iOS standalone mode
      const isIOSStandalone =
        (window.navigator as { standalone?: boolean }).standalone === true;

      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn("Install prompt not available");
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissPrompt = () => {
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    dismissPrompt,
  };
}
