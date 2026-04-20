/**
 * FontSelector Component
 * Dropdown selector with search, filter, and font previews
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import type { FontCategory } from "@/types/customization";
import type { FontDefinition } from "@/lib/font-library";
import {
  getAllFonts,
  getFontsByCategory,
  getPopularFonts,
  searchFonts,
  getFontCategories,
} from "@/lib/font-library";
import { FontPreview } from "./FontPreview";

interface FontSelectorProps {
  currentFont: string;
  onSelect: (font: FontDefinition) => void;
  label: string;
  description?: string;
  filterByUse?: "headings" | "body" | "accent";
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  currentFont,
  onSelect,
  label,
  description,
  filterByUse,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | "all" | "popular">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all fonts
  const allFonts = getAllFonts();
  const currentFontDef = allFonts.find((f) => f.family === currentFont);

  // Filter fonts
  const filteredFonts = (() => {
    let fonts = allFonts;

    // Filter by use case
    if (filterByUse) {
      fonts = fonts.filter((f) => f.bestFor.includes(filterByUse));
    }

    // Filter by category
    if (selectedCategory === "popular") {
      fonts = getPopularFonts();
    } else if (selectedCategory !== "all") {
      fonts = getFontsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      fonts = searchFonts(searchQuery);
    }

    return fonts;
  })();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (font: FontDefinition) => {
    onSelect(font);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {description && (
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {/* Current Font Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:border-gray-400 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
      >
        <div className="flex-1">
          {currentFontDef ? (
            <>
              <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                {currentFontDef.displayName}
              </span>
              <span
                className="block text-lg"
                style={{
                  fontFamily: `"${currentFontDef.family}", ${currentFontDef.fallback}`,
                }}
              >
                {currentFontDef.previewText}
              </span>
            </>
          ) : (
            <span className="text-gray-500">Select a font</span>
          )}
        </div>
        <ChevronDown
          className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Search Bar */}
            <div className="border-b border-gray-200 p-3 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fonts..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="border-b border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === "all"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedCategory("popular")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === "popular"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Popular
                  </button>
                  {getFontCategories().map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font List */}
            <div className="max-h-[400px] overflow-y-auto p-3">
              {filteredFonts.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No fonts found matching your criteria
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFonts.map((font) => (
                    <FontPreview
                      key={font.family}
                      font={font}
                      selected={font.family === currentFont}
                      onClick={() => handleSelect(font)}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3 text-center dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredFonts.length} {filteredFonts.length === 1 ? "font" : "fonts"} available
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
