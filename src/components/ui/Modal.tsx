"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import FocusLock from "react-focus-lock";

interface ModalProps {
  // accept both prop names for compatibility
  open?: boolean;
  isOpen?: boolean;
  // legacy size prop mapping (e.g. 'sm' | 'md' | 'lg' | 'xl')
  size?: "sm" | "md" | "lg" | "xl" | "full";
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  descriptionId?: string;
  maxWidth?: string; // tailwind max-w-* class
  forceLight?: boolean; // when true, always use light background even in dark mode
  autoFocusPrimary?: boolean;
}

export default function Modal({
  open,
  isOpen,
  size,
  onClose,
  children,
  title,
  description,
  descriptionId,
  maxWidth = "max-w-2xl",
  autoFocusPrimary = false,
}: ModalProps) {
  const visible = open ?? isOpen ?? false;

  React.useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  // focus primary action when modal opens
  React.useEffect(() => {
    if (!visible) return;
    // delay to let the modal render
    const t = setTimeout(() => {
      try {
        const root = document.querySelector('[role="dialog"]');
        if (!root) return;
        // prefer element with data-primary attribute
        const primary = root.querySelector<HTMLElement>(
          "[data-primary]"
        ) as HTMLElement | null;
        if (primary && autoFocusPrimary) {
          primary.focus();
          return;
        }
        // otherwise focus the first focusable button
        const btn = root.querySelector<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        if (btn) btn.focus();
      } catch {
        // ignore
      }
    }, 50);
    return () => clearTimeout(t);
  }, [visible, autoFocusPrimary]);

  // handle Enter to trigger the primary action if present
  React.useEffect(() => {
    if (!visible) return;
    const onEnter = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const root = document.querySelector('[role="dialog"]');
      if (!root) return;
      const primary = root.querySelector<HTMLElement>(
        "[data-primary]"
      ) as HTMLElement | null;
      if (primary) {
        e.preventDefault();
        (primary as HTMLButtonElement).click();
      }
    };
    document.addEventListener("keydown", onEnter);
    return () => document.removeEventListener("keydown", onEnter);
  }, [visible]);

  // map legacy size to tailwind max-w classes when maxWidth isn't explicitly provided
  const resolvedMaxWidth =
    maxWidth ||
    (size === "sm"
      ? "max-w-sm"
      : size === "md"
        ? "max-w-md"
        : size === "lg"
          ? "max-w-2xl"
          : size === "xl"
            ? "max-w-4xl"
            : size === "full"
              ? "max-w-full"
              : "max-w-2xl");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          <motion.div
            className={`relative w-full ${resolvedMaxWidth} bg-white rounded-xl shadow-lg p-6 z-10`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <FocusLock returnFocus={true}>
              {(() => {
                const titleId = title
                  ? `modal-title-${Math.random().toString(36).slice(2, 9)}`
                  : undefined;
                const descId =
                  descriptionId ||
                  (description
                    ? `modal-desc-${Math.random().toString(36).slice(2, 9)}`
                    : undefined);
                return (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={description ? descId : undefined}
                    className="outline-none"
                  >
                    {title && (
                      <div className="flex justify-between items-center mb-4">
                        <h2
                          id={titleId}
                          className="text-lg font-semibold text-black"
                        >
                          {title}
                        </h2>
                        <button
                          onClick={onClose}
                          aria-label="Close dialog"
                          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <X className="h-4 w-4 dark:text-white" />
                        </button>
                      </div>
                    )}

                    {description && (
                      <div id={descId} className="text-sm text-gray-600 mb-3">
                        {description}
                      </div>
                    )}

                    <div tabIndex={0} className="overflow-y-auto max-h-[80vh]">
                      {children}
                    </div>
                  </div>
                );
              })()}
            </FocusLock>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// FocusLock (react-focus-lock) is used instead of a custom implementation above
