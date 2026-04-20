/**
 * ColorSection Component
 *
 * Collapsible section wrapper for grouping related colors
 * Used to organize colors into categories like:
 * - Theme Colors (primary, secondary, accent)
 * - UI Colors (background, text)
 * - Button Colors (button states)
 *
 * Features:
 * - Collapsible with smooth animation
 * - Color count badge
 * - Icon support
 * - Responsive design
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LucideIcon } from "lucide-react";

interface ColorSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  colorCount?: number;
}

export default function ColorSection({
  title,
  description,
  icon: Icon,
  children,
  defaultOpen = true,
  colorCount,
}: ColorSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {colorCount !== undefined && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {colorCount} {colorCount === 1 ? "color" : "colors"}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Chevron Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-100 dark:border-gray-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
