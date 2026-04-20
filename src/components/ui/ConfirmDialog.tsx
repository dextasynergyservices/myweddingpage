"use client";

/**
 * ConfirmDialog Component
 * Reusable confirmation modal with proper React patterns
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    default: {
      icon: "text-blue-600",
      confirmButton: "bg-blue-600 hover:bg-blue-700",
    },
    danger: {
      icon: "text-red-600",
      confirmButton: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-amber-600",
      confirmButton: "bg-amber-600 hover:bg-amber-700",
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`rounded-full bg-gray-100 p-3 dark:bg-gray-700 ${styles.icon}`}
                >
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              </div>

              {/* Message */}
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${styles.confirmButton}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
