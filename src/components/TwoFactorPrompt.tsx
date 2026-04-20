/**
 * 2FA Setup Prompt Component
 *
 * Displays a friendly banner encouraging users to enable 2FA
 * Shows on dashboard for users who don't have 2FA enabled
 * Can be dismissed
 */

"use client";

import { useState, useEffect } from "react";
import { Shield, X, ChevronRight } from "lucide-react";

interface TwoFactorPromptProps {
  onEnableClick?: () => void;
}

export default function TwoFactorPrompt({
  onEnableClick,
}: TwoFactorPromptProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user dismissed the prompt in this session
    const dismissed = sessionStorage.getItem("2fa-prompt-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      setIsLoading(false);
      return;
    }

    // Check 2FA status
    fetch("/api/auth/2fa/status")
      .then((res) => res.json())
      .then((data) => {
        setIs2FAEnabled(data.enabled);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to check 2FA status:", error);
        setIsLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("2fa-prompt-dismissed", "true");
  };

  // Don't show if:
  // - Still loading
  // - 2FA is already enabled
  // - User dismissed the prompt
  if (isLoading || is2FAEnabled || isDismissed) {
    return null;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600 dark:hover:bg-black/30 dark:hover:text-gray-300"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Content */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Secure Your Account with Two-Factor Authentication
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your wedding page. Enable 2FA to
            protect your account from unauthorized access, even if someone gets
            your password.
          </p>

          {/* Benefits */}
          <ul className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Compatible with Google Authenticator, Authy, and more</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Backup codes for account recovery</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Takes less than 2 minutes to set up</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button
            onClick={onEnableClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Enable Two-Factor Authentication
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-800/20" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-800/20" />
    </div>
  );
}
