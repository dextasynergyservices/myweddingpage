"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-lg",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className={`relative w-full ${maxWidth} bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 z-10`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Header */}
            {title && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X className="h-4 w-4 dark:text-white" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
