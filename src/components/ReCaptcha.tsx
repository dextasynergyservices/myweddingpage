/**
 * Google reCAPTCHA React Component
 * Wrapper for react-google-recaptcha with TypeScript support
 */

"use client";

import React, { useRef, forwardRef, useImperativeHandle } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export interface RecaptchaComponentProps {
  /**
   * Version of reCAPTCHA to use ("v2" for checkbox, "v3" for invisible)
   * @default "v3"
   */
  version?: "v2" | "v3";

  /**
   * Action name for v3 (used for analytics and filtering)
   * @example "submit_form", "login", "register"
   */
  action?: string;

  /**
   * Callback when reCAPTCHA is successfully completed
   * @param token - The response token to send to your backend
   */
  onVerify?: (token: string) => void;

  /**
   * Callback when reCAPTCHA expires (v2 only)
   */
  onExpire?: () => void;

  /**
   * Callback when reCAPTCHA encounters an error
   */
  onError?: (error: Error) => void;

  /**
   * reCAPTCHA theme ("light" or "dark")
   * @default "light"
   */
  theme?: "light" | "dark";

  /**
   * Size of the reCAPTCHA widget (v2 only)
   * @default "normal"
   */
  size?: "compact" | "normal" | "invisible";

  /**
   * Custom CSS class name
   */
  className?: string;

  /**
   * Tab index for accessibility
   */
  tabindex?: number;
}

export interface RecaptchaComponentRef {
  /**
   * Execute reCAPTCHA challenge
   * @returns Promise with token
   */
  execute: () => Promise<string | null>;

  /**
   * Reset reCAPTCHA widget
   */
  reset: () => void;

  /**
   * Get current token (v2 only)
   */
  getValue: () => string | null;
}

/**
 * Google reCAPTCHA Component
 *
 * @example
 * // reCAPTCHA v2 (Checkbox)
 * <RecaptchaComponent
 *   version="v2"
 *   onVerify={(token) => console.log("Verified:", token)}
 *   theme="light"
 * />
 *
 * @example
 * // reCAPTCHA v3 (Invisible) with ref
 * const recaptchaRef = useRef<RecaptchaComponentRef>(null);
 *
 * const handleSubmit = async () => {
 *   const token = await recaptchaRef.current?.execute();
 *   if (token) {
 *     // Send token to backend
 *   }
 * };
 *
 * <RecaptchaComponent
 *   ref={recaptchaRef}
 *   version="v3"
 *   action="submit_form"
 * />
 */
export const RecaptchaComponent = forwardRef<
  RecaptchaComponentRef,
  RecaptchaComponentProps
>(
  (
    {
      version = "v3",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      action = "submit",
      onVerify,
      onExpire,
      onError,
      theme = "light",
      size = "normal",
      className = "",
      tabindex = 0,
    },
    ref
  ) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Get site key from environment variables
    const siteKey =
      version === "v3"
        ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3
        : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2;

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      execute: async (): Promise<string | null> => {
        if (version === "v3") {
          try {
            const token = await recaptchaRef.current?.executeAsync();
            return token || null;
          } catch (error) {
            console.error("reCAPTCHA v3 execute error:", error);
            onError?.(error as Error);
            return null;
          }
        } else {
          // For v2, just return the current value
          return recaptchaRef.current?.getValue() || null;
        }
      },
      reset: () => {
        recaptchaRef.current?.reset();
      },
      getValue: () => {
        return recaptchaRef.current?.getValue() || null;
      },
    }));

    // Handle v2 onChange event
    const handleChange = (token: string | null) => {
      if (token && onVerify) {
        onVerify(token);
      }
    };

    // Handle expiration (v2 only)
    const handleExpire = () => {
      console.warn("reCAPTCHA expired");
      onExpire?.();
    };

    // Handle errors
    const handleError = () => {
      const error = new Error("reCAPTCHA error occurred");
      console.error("reCAPTCHA error:", error);
      onError?.(error);
    };

    // Don't render if site key is not configured
    if (!siteKey) {
      console.error(`reCAPTCHA ${version} site key not configured`);
      return (
        <div className="text-red-500 text-sm p-2 border border-red-300 rounded bg-red-50">
          reCAPTCHA is not configured. Please add{" "}
          {version === "v3"
            ? "NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3"
            : "NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2"}{" "}
          to your environment variables.
        </div>
      );
    }

    return (
      <div className={`recaptcha-container ${className}`}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={handleChange}
          onExpired={handleExpire}
          onErrored={handleError}
          theme={theme}
          size={version === "v3" ? "invisible" : size}
          badge={version === "v3" ? "bottomright" : undefined}
          tabindex={tabindex}
        />
        {version === "v3" && (
          <div className="text-xs text-gray-500 mt-2">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Terms of Service
            </a>{" "}
            apply.
          </div>
        )}
      </div>
    );
  }
);

RecaptchaComponent.displayName = "RecaptchaComponent";

/**
 * Hook to use reCAPTCHA in functional components
 *
 * @param version - reCAPTCHA version
 * @param action - Action name (for v3)
 * @returns Object with execute, reset, and getValue methods
 *
 * @example
 * const recaptcha = useRecaptcha("v3", "submit_form");
 *
 * const handleSubmit = async () => {
 *   const token = await recaptcha.execute();
 *   // Use token...
 * };
 */
export function useRecaptcha(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  version: "v2" | "v3" = "v3",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  action: string = "submit"
) {
  const ref = useRef<RecaptchaComponentRef>(null);

  return {
    ref,
    execute: async (): Promise<string | null> => {
      return ref.current?.execute() || null;
    },
    reset: () => {
      ref.current?.reset();
    },
    getValue: () => {
      return ref.current?.getValue() || null;
    },
  };
}

/**
 * Default export
 */
export default RecaptchaComponent;
