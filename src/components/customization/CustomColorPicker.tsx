/**
 * CustomColorPicker Component
 *
 * Main color customization panel with all color controls
 * Organized into logical sections:
 * - Theme Colors (primary, secondary, accent)
 * - Background Co      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> For best accessibility, ensure text colors have sufficient contrast
          against their backgrounds (minimum 4.5:1 for normal text, 3:1 for large text).
          We&apos;ll automatically check and warn you about contrast issues.
        </p>
      </div>ackground, surface)
 * - Text Colors (primary, secondary text)
 * - Button Colors (all button states)
 *
 * Features:
 * - Visual color pickers
 * - Hex and RGB input
 * - Real-time validation
 * - Contrast checking
 * - Collapsible sections
 * - Responsive design
 */

"use client";

import React from "react";
import { Palette, Layout, MousePointerClick } from "lucide-react";
import ColorInput from "./ColorInput";
import ColorSection from "./ColorSection";
import { ColorScheme } from "@/types/customization";

interface CustomColorPickerProps {
  colors: ColorScheme;
  onChange: (colors: ColorScheme) => void;
  disabled?: boolean;
}

export default function CustomColorPicker({
  colors,
  onChange,
  disabled = false,
}: CustomColorPickerProps) {
  const handleColorChange = (key: keyof ColorScheme, value: string) => {
    onChange({
      ...colors,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Custom Colors
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your own colors with full control. Pick from the color wheel or
          enter hex/RGB codes.
        </p>
      </div>

      {/* Theme Colors Section */}
      <ColorSection
        title="Theme Colors"
        description="Main brand colors that define your wedding's visual identity"
        icon={Palette}
        colorCount={3}
        defaultOpen={true}
      >
        <ColorInput
          label="Primary Color"
          description="Your main brand color - appears throughout the site"
          value={colors.primary}
          onChange={(value) => handleColorChange("primary", value)}
          required
          disabled={disabled}
        />

        <ColorInput
          label="Secondary Color"
          description="Complementary color for variety and depth"
          value={colors.secondary}
          onChange={(value) => handleColorChange("secondary", value)}
          required
          disabled={disabled}
        />

        <ColorInput
          label="Accent Color"
          description="Highlight color for important elements and CTAs"
          value={colors.accent}
          onChange={(value) => handleColorChange("accent", value)}
          required
          disabled={disabled}
        />
      </ColorSection>

      {/* Background & Text Colors Section */}
      <ColorSection
        title="Background & Text"
        description="Colors for page background and text content"
        icon={Layout}
        colorCount={2}
        defaultOpen={true}
      >
        <ColorInput
          label="Background Color"
          description="Main page background color"
          value={colors.background}
          onChange={(value) => handleColorChange("background", value)}
          required
          disabled={disabled}
        />

        <ColorInput
          label="Text Color"
          description="Main text color for headings and body content"
          value={colors.text}
          onChange={(value) => handleColorChange("text", value)}
          checkContrastWith={colors.background}
          required
          disabled={disabled}
        />
      </ColorSection>

      {/* Button Colors Section */}
      <ColorSection
        title="Button Colors"
        description="Colors for all button states and interactions"
        icon={MousePointerClick}
        colorCount={6}
        defaultOpen={false}
      >
        {/* Primary Button */}
        <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Primary Buttons
          </h4>

          <ColorInput
            label="Button Background"
            description="Primary button background color"
            value={colors.buttonPrimary}
            onChange={(value) => handleColorChange("buttonPrimary", value)}
            required
            disabled={disabled}
          />

          <ColorInput
            label="Button Text"
            description="Text color on primary buttons"
            value={colors.buttonPrimaryText}
            onChange={(value) => handleColorChange("buttonPrimaryText", value)}
            checkContrastWith={colors.buttonPrimary}
            required
            disabled={disabled}
          />

          <ColorInput
            label="Button Hover"
            description="Primary button color when hovering"
            value={colors.buttonPrimaryHover}
            onChange={(value) => handleColorChange("buttonPrimaryHover", value)}
            required
            disabled={disabled}
          />
        </div>

        {/* Secondary Button */}
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Secondary Buttons
          </h4>

          <ColorInput
            label="Button Background"
            description="Secondary button background color"
            value={colors.buttonSecondary}
            onChange={(value) => handleColorChange("buttonSecondary", value)}
            disabled={disabled}
          />

          <ColorInput
            label="Button Text"
            description="Text color on secondary buttons"
            value={colors.buttonSecondaryText}
            onChange={(value) =>
              handleColorChange("buttonSecondaryText", value)
            }
            checkContrastWith={colors.buttonSecondary}
            disabled={disabled}
          />

          <ColorInput
            label="Button Hover"
            description="Secondary button color when hovering"
            value={colors.buttonSecondaryHover}
            onChange={(value) =>
              handleColorChange("buttonSecondaryHover", value)
            }
            disabled={disabled}
          />
        </div>
      </ColorSection>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> For best accessibility, ensure text colors have
          sufficient contrast against their backgrounds (minimum 4.5:1 for
          normal text, 3:1 for large text). We&apos;ll automatically check and
          warn you about contrast issues.
        </p>
      </div>
    </div>
  );
}
