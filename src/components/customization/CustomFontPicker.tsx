/**
 * CustomFontPicker Component
 * Main panel for selecting custom fonts for heading, body, and accent
 */

"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Type, FileText, Sparkles, Info, ThumbsUp, ThumbsDown } from "lucide-react";
import type { FontScheme } from "@/types/customization";
import type { FontDefinition } from "@/lib/font-library";
import { getFontByFamily } from "@/lib/font-library";
import { FontSelector } from "./FontSelector";
import { loadFontsFromScheme, getFontPairingScore, validateFontPairing } from "@/lib/font-utils";

interface CustomFontPickerProps {
  fonts: FontScheme;
  onChange: (fonts: FontScheme) => void;
}

export const CustomFontPicker: React.FC<CustomFontPickerProps> = ({ fonts, onChange }) => {
  // Load fonts when scheme changes
  useEffect(() => {
    loadFontsFromScheme(fonts);
  }, [fonts]);

  const handleFontChange = (key: keyof FontScheme, font: FontDefinition) => {
    onChange({
      ...fonts,
      [key]: font.family,
    });
  };

  // Get current font definitions
  const headingFont = getFontByFamily(fonts.heading);
  const bodyFont = getFontByFamily(fonts.body);
  const accentFont = getFontByFamily(fonts.script);

  // Calculate pairing score
  const pairingScore =
    headingFont && bodyFont && accentFont
      ? getFontPairingScore(headingFont, bodyFont, accentFont)
      : 50;

  // Validate pairing
  const pairingValidation =
    headingFont && bodyFont ? validateFontPairing(headingFont, bodyFont) : { valid: true };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Custom Font Selection
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Choose fonts for different text elements. Preview them live below.
        </p>
      </div>

      {/* Font Pairing Score */}
      {headingFont && bodyFont && accentFont && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border-2 p-4 ${
            pairingScore >= 80
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : pairingScore >= 60
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
          }`}
        >
          <div className="flex items-start gap-3">
            {pairingScore >= 80 ? (
              <ThumbsUp className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <ThumbsDown className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Font Pairing Score: {pairingScore}/100
                </h4>
                <div className="flex h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all ${
                      pairingScore >= 80
                        ? "bg-green-500"
                        : pairingScore >= 60
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                    }`}
                    style={{ width: `${pairingScore}%` }}
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {pairingScore >= 80
                  ? "Excellent! Your font combination works beautifully together."
                  : pairingScore >= 60
                    ? "Good pairing! Consider experimenting with other combinations."
                    : "This pairing might need adjustment for better harmony."}
              </p>
              {!pairingValidation.valid && pairingValidation.recommendation && (
                <p className="mt-2 text-xs font-medium text-orange-700 dark:text-orange-400">
                  💡 {pairingValidation.recommendation}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Heading Font Selector */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Heading Font</h4>
        </div>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
          Used for main titles, section headings (H1-H6). Choose a bold, attention-grabbing font.
        </p>
        <FontSelector
          currentFont={fonts.heading}
          onSelect={(font) => handleFontChange("heading", font)}
          label="Select Heading Font"
          description="Bold, elegant fonts work best for headings"
          filterByUse="headings"
        />

        {/* Heading Preview */}
        {headingFont && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Preview:</p>
            <h1
              className="text-4xl font-bold text-gray-900 dark:text-gray-100"
              style={{ fontFamily: `"${headingFont.family}", ${headingFont.fallback}` }}
            >
              Our Wedding Day
            </h1>
            <h2
              className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-200"
              style={{ fontFamily: `"${headingFont.family}", ${headingFont.fallback}` }}
            >
              Join Us for a Celebration of Love
            </h2>
          </div>
        )}
      </div>

      {/* Body Font Selector */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Body Font</h4>
        </div>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
          Used for paragraphs and main content. Choose a highly readable font.
        </p>
        <FontSelector
          currentFont={fonts.body}
          onSelect={(font) => handleFontChange("body", font)}
          label="Select Body Font"
          description="Clean, readable fonts work best for body text"
          filterByUse="body"
        />

        {/* Body Preview */}
        {bodyFont && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Preview:</p>
            <p
              className="text-base leading-relaxed text-gray-700 dark:text-gray-300"
              style={{ fontFamily: `"${bodyFont.family}", ${bodyFont.fallback}` }}
            >
              We are thrilled to invite you to celebrate our special day. Join us for an evening
              filled with love, laughter, and unforgettable memories as we begin our journey
              together as husband and wife.
            </p>
          </div>
        )}
      </div>

      {/* Accent/Script Font Selector */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Accent Font</h4>
        </div>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
          Used for decorative text, quotes, or special highlights. Script fonts work beautifully.
        </p>
        <FontSelector
          currentFont={fonts.script}
          onSelect={(font) => handleFontChange("script", font)}
          label="Select Accent Font"
          description="Elegant script or decorative fonts for special touches"
          filterByUse="accent"
        />

        {/* Accent Preview */}
        {accentFont && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Preview:</p>
            <p
              className="text-center text-3xl text-gray-900 dark:text-gray-100"
              style={{ fontFamily: `"${accentFont.family}", ${accentFont.fallback}` }}
            >
              Forever & Always
            </p>
            <p
              className="mt-2 text-center text-2xl text-gray-800 dark:text-gray-200"
              style={{ fontFamily: `"${accentFont.family}", ${accentFont.fallback}` }}
            >
              Together at Last
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Font Pairing Tips
            </h4>
            <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>• Mix serif and sans-serif for classic contrast</li>
              <li>• Use script fonts sparingly for decorative elements only</li>
              <li>• Ensure heading and body fonts complement each other</li>
              <li>• Test readability on different screen sizes</li>
              <li>• Limit to 2-3 font families for cohesive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
