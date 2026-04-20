/**
 * PresetSelector Component
 * Displays a grid of preset themes with filtering and selection
 */

"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Sparkles, X } from "lucide-react";
import { PresetTheme, TemplateType } from "@/types/customization";
import {
  getPresetsByTemplate,
  getPopularPresets,
  ALL_PRESETS,
} from "@/lib/theme-presets";
import { useTheme } from "@/contexts/ThemeContext";
import PresetCard from "./PresetCard";

interface PresetSelectorProps {
  templateType?: TemplateType;
  selectedPresetId?: string;
  onSelect: (preset: PresetTheme) => void;
  showSearch?: boolean;
  showFilter?: boolean;
}

type FilterType = "all" | "popular" | TemplateType;

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  templateType,
  selectedPresetId,
  onSelect,
  showSearch = true,
  showFilter = true,
}) => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>(templateType || "all");

  // Get presets based on filter
  const filteredPresets = useMemo(() => {
    let presets: PresetTheme[] = [];

    if (filter === "all") {
      presets = ALL_PRESETS;
    } else if (filter === "popular") {
      presets = getPopularPresets();
    } else {
      presets = getPresetsByTemplate(filter as TemplateType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      presets = presets.filter(
        (preset) =>
          preset.name.toLowerCase().includes(query) ||
          preset.description.toLowerCase().includes(query) ||
          preset.id.toLowerCase().includes(query)
      );
    }

    return presets;
  }, [filter, searchQuery]);

  // Filter options
  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "All Themes", count: ALL_PRESETS.length },
    { value: "popular", label: "Popular", count: getPopularPresets().length },
    {
      value: "elegance",
      label: "Elegance",
      count: getPresetsByTemplate("elegance").length,
    },
    {
      value: "bloom",
      label: "Bloom",
      count: getPresetsByTemplate("bloom").length,
    },
    {
      value: "luxe",
      label: "Luxe",
      count: getPresetsByTemplate("luxe").length,
    },
    {
      value: "vows",
      label: "Vows",
      count: getPresetsByTemplate("vows").length,
    },
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <h2
          className={`text-2xl md:text-3xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Choose Your Theme
        </h2>
        <p
          className={`text-sm md:text-base ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
        >
          Select a professionally designed color and font combination for your
          wedding page
        </p>
      </div>

      {/* Search and Filter Section */}
      {(showSearch || showFilter) && (
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? "text-slate-400" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 transition-colors ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-indigo-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                    isDarkMode
                      ? "hover:bg-slate-700 text-slate-400"
                      : "hover:bg-gray-200 text-gray-400"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Filter Buttons */}
          {showFilter && (
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    filter === option.value
                      ? "bg-indigo-600 text-white shadow-md"
                      : isDarkMode
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.value === "popular" && (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {option.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      filter === option.value
                        ? "bg-white/20"
                        : isDarkMode
                          ? "bg-slate-700"
                          : "bg-gray-200"
                    }`}
                  >
                    {option.count}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p
          className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
        >
          {filteredPresets.length === 0 ? (
            <span>No themes found</span>
          ) : (
            <span>
              Showing <strong>{filteredPresets.length}</strong> theme
              {filteredPresets.length !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Presets Grid */}
      <AnimatePresence mode="wait">
        {filteredPresets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`text-center py-12 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-gray-50"}`}
          >
            <Filter
              className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}
            />
            <h3
              className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              No themes found
            </h3>
            <p
              className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
            >
              Try adjusting your search or filter
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={filter + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
          >
            {filteredPresets.map((preset, index) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <PresetCard
                  preset={preset}
                  isSelected={selectedPresetId === preset.id}
                  onSelect={onSelect}
                  showPopularBadge={filter !== "popular"}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PresetSelector;
