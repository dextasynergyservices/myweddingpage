"use client";

/**
 * PublicPageCustomization Component
 * Applies user's customization (colors and fonts) to published wedding pages
 * Phase 7: Save & Apply System
 */

import { useEffect } from "react";
import type { UserCustomization } from "@/types/customization";
import { applyGlobalCustomization, removeGlobalCustomization } from "@/lib/css-variable-injection";
import { loadFontsFromScheme } from "@/lib/font-utils";

interface PublicPageCustomizationProps {
  customization?: UserCustomization | null;
  slug: string; // Used for cache busting
}

export default function PublicPageCustomization({
  customization,
  slug,
}: PublicPageCustomizationProps) {
  useEffect(() => {
    // Only apply if customization exists
    if (!customization?.colors || !customization?.fonts) {
      return;
    }

    // Load custom fonts
    loadFontsFromScheme(customization.fonts);

    // Apply CSS variables globally with cache key based on slug and timestamp
    const cacheKey = `${slug}-${customization.updatedAt || Date.now()}`;
    applyGlobalCustomization(customization.colors, customization.fonts, cacheKey);

    // Cleanup function
    return () => {
      removeGlobalCustomization(cacheKey);
    };
  }, [customization, slug]);

  // This component doesn't render anything
  return null;
}
