"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  // accept both prop names for compatibility
  open?: boolean;
  isOpen?: boolean;
  // legacy size prop mapping (e.g. 'sm' | 'md' | 'lg' | 'xl')
  size?: "sm" | "md" | "lg" | "xl" | "full";
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string; // tailwind max-w-* class
  forceLight?: boolean; // when true, always use light background even in dark mode
}

export default function Modal({
  open,
  isOpen,
  size,
  onClose,
  children,
  title,
  maxWidth = "max-w-2xl",
}: ModalProps) {
  const visible = open ?? isOpen ?? false;

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
            {title && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-black">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X className="h-4 w-4 dark:text-white" />
                </button>
              </div>
            )}

            <div className="overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
