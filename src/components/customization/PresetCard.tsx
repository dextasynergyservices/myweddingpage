/**
 * PresetCard Component
 * Displays a single preset theme with color preview and selection
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { PresetTheme } from "@/types/customization";
import { useTheme } from "@/contexts/ThemeContext";

interface PresetCardProps {
  preset: PresetTheme;
  isSelected?: boolean;
  onSelect: (preset: PresetTheme) => void;
  showPopularBadge?: boolean;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  isSelected = false,
  onSelect,
  showPopularBadge = true,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(preset)}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isDarkMode
          ? "bg-slate-800 hover:bg-slate-750 border-slate-700"
          : "bg-white hover:bg-gray-50 border-gray-200"
      } border-2 ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500 ring-offset-2"
          : "hover:border-indigo-300"
      } shadow-md hover:shadow-xl`}
    >
      {/* Popular Badge */}
      {showPopularBadge && preset.popular && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3" />
          Popular
        </div>
      )}

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Color Preview Section */}
      <div
        className="relative h-32 sm:h-36 md:h-40"
        style={{ backgroundColor: preset.colors.background }}
      >
        {/* Color Palette */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top Row - Primary, Secondary, Accent */}
          <div className="flex-1 flex">
            <div
              className="flex-1 transition-all duration-300 hover:flex-[1.5]"
              style={{ backgroundColor: preset.colors.primary }}
              title={`Primary: ${preset.colors.primary}`}
            />
            <div
              className="flex-1 transition-all duration-300 hover:flex-[1.5]"
              style={{ backgroundColor: preset.colors.secondary }}
              title={`Secondary: ${preset.colors.secondary}`}
            />
            <div
              className="flex-1 transition-all duration-300 hover:flex-[1.5]"
              style={{ backgroundColor: preset.colors.accent }}
              title={`Accent: ${preset.colors.accent}`}
            />
          </div>

          {/* Bottom Row - Button Colors */}
          <div className="flex h-8">
            <div
              className="flex-1 transition-all duration-300 hover:flex-[1.5]"
              style={{ backgroundColor: preset.colors.buttonPrimary }}
              title={`Button Primary: ${preset.colors.buttonPrimary}`}
            />
            <div
              className="flex-1 transition-all duration-300 hover:flex-[1.5]"
              style={{ backgroundColor: preset.colors.buttonSecondary }}
              title={`Button Secondary: ${preset.colors.buttonSecondary}`}
            />
          </div>
        </div>

        {/* Sample Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none">
          <div className="text-center px-4">
            <p
              className="font-serif text-lg sm:text-xl md:text-2xl font-bold drop-shadow-lg"
              style={{
                color: preset.colors.text,
                fontFamily: preset.fonts.heading,
                textShadow: "0 2px 4px rgba(255,255,255,0.5)",
              }}
            >
              Aa
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5">
        {/* Preset Name */}
        <h3
          className={`text-base sm:text-lg font-semibold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {preset.name}
        </h3>

        {/* Description */}
        <p
          className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 ${
            isDarkMode ? "text-slate-400" : "text-gray-600"
          }`}
        >
          {preset.description}
        </p>

        {/* Font Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-medium ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}
            >
              Heading:
            </span>
            <span
              className={`truncate ml-2 ${isDarkMode ? "text-slate-400" : "text-gray-700"}`}
              style={{ fontFamily: preset.fonts.heading }}
            >
              {preset.fonts.heading}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-medium ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}
            >
              Body:
            </span>
            <span
              className={`truncate ml-2 ${isDarkMode ? "text-slate-400" : "text-gray-700"}`}
              style={{ fontFamily: preset.fonts.body }}
            >
              {preset.fonts.body}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-medium ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}
            >
              Script:
            </span>
            <span
              className={`truncate ml-2 italic ${isDarkMode ? "text-slate-400" : "text-gray-700"}`}
              style={{ fontFamily: preset.fonts.script }}
            >
              {preset.fonts.script}
            </span>
          </div>
        </div>

        {/* Select Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(preset);
          }}
          className={`w-full mt-4 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
            isSelected
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : isDarkMode
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Selected
            </span>
          ) : (
            "Use This Theme"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PresetCard;
