/**
 * FontPreview Component
 * Displays a single font with preview text and metadata
 */

"use client";

import React, { useEffect, useState } from "react";
import type { FontDefinition } from "@/lib/font-library";
import { preloadFont, isFontLoaded } from "@/lib/font-utils";
import { Check, Loader2 } from "lucide-react";

interface FontPreviewProps {
  font: FontDefinition;
  selected?: boolean;
  onClick?: () => void;
  showMetadata?: boolean;
  size?: "sm" | "md" | "lg";
  customPreviewText?: string;
}

export const FontPreview: React.FC<FontPreviewProps> = ({
  font,
  selected = false,
  onClick,
  showMetadata = false,
  size = "md",
  customPreviewText,
}) => {
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const previewText = customPreviewText || font.previewText;

  // Preload font on mount
  useEffect(() => {
    let mounted = true;

    const loadFont = async () => {
      try {
        preloadFont(font);
        // Wait a bit for font to load
        await new Promise((resolve) => setTimeout(resolve, 500));
        const isLoaded = await isFontLoaded(font.family);
        if (mounted) {
          setLoaded(isLoaded);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Failed to load font ${font.family}:`, error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFont();

    return () => {
      mounted = false;
    };
  }, [font]);

  // Size classes
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div
      className={`
        group relative cursor-pointer rounded-lg border-2 p-4 transition-all
        ${
          selected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
        }
        ${onClick ? "hover:shadow-lg" : ""}
      `}
      onClick={onClick}
    >
      {/* Loading/Selected Indicator */}
      <div className="absolute right-3 top-3">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : selected ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Check className="h-4 w-4 text-white" />
          </div>
        ) : null}
      </div>

      {/* Font Preview Text */}
      <div className="mb-3 overflow-hidden">
        <p
          className={`
            ${sizeClasses[size]} font-medium leading-tight
            ${loading ? "text-gray-300 dark:text-gray-600" : "text-gray-900 dark:text-gray-100"}
          `}
          style={{
            fontFamily: loaded
              ? `"${font.family}", ${font.fallback}`
              : font.fallback,
          }}
        >
          {previewText}
        </p>
      </div>

      {/* Font Name */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {font.displayName}
          </h4>
          {showMetadata && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {font.category} • {font.weights.length} weights
            </p>
          )}
        </div>

        {/* Popular Badge */}
        {font.popular && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Popular
          </span>
        )}
      </div>

      {/* Description (optional) */}
      {showMetadata && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {font.description}
        </p>
      )}

      {/* Best For Tags */}
      {showMetadata && font.bestFor.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {font.bestFor.map((use) => (
            <span
              key={use}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {use}
            </span>
          ))}
        </div>
      )}

      {/* Hover Effect */}
      {onClick && (
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary opacity-0 transition-opacity group-hover:opacity-20" />
      )}
    </div>
  );
};
