/**
 * KeyboardShortcutsHelp Component
 *
 * Displays available keyboard shortcuts to users
 * Triggered by pressing '?' or Ctrl+/
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface Shortcut {
  keys: string[];
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts?: Shortcut[];
}

const defaultShortcuts: Shortcut[] = [
  { keys: ["Ctrl", "S"], description: "Save changes" },
  { keys: ["Ctrl", "R"], description: "Reset to last saved" },
  { keys: ["Ctrl", "Shift", "P"], description: "Toggle full preview" },
  { keys: ["Escape"], description: "Close modal/sheet" },
  { keys: ["Tab"], description: "Navigate forward" },
  { keys: ["Shift", "Tab"], description: "Navigate backward" },
  { keys: ["?"], description: "Show this help" },
];

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts = defaultShortcuts,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle help with '?' or Ctrl+/
  useKeyboardShortcuts({
    enabled: true,
    shortcuts: [
      {
        key: "?",
        callback: () => setIsOpen(!isOpen),
        preventDefault: true,
      },
      {
        key: "/",
        ctrl: true,
        callback: () => setIsOpen(!isOpen),
        preventDefault: true,
      },
    ],
  });

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        // Hidden on small screens to avoid overlap with mobile UI (e.g., reCAPTCHA / floating actions)
        className="hidden md:fixed md:bottom-6 md:right-6 md:z-40 md:flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 dark:bg-gray-700"
        title="Keyboard Shortcuts (Press ?)"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Keyboard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Navigate faster with these shortcuts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-gray-400 dark:text-gray-600">+</span>
                          )}
                          <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-300">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Press{" "}
                  <kbd className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold dark:bg-blue-800">
                    ?
                  </kbd>{" "}
                  anytime to show this help
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
