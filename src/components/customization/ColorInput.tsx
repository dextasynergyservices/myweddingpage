/**
 * ColorInput i'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, AlertCircle } from 'lucide-react';
import {
  validateColor,
  hexToRgb,
  rgbToHex,
  checkContrast,
} from '@/lib/color-utils';eact, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, AlertCircle } from 'lucide-react';onent
 *
 * Provides multiple ways to input colors:
 * - Visual color picker (HexColorPicker from react-colorful)
 * - Hex code input (#FF5733)
 * - RGB input (255, 87, 51)
 * - Contrast validation indicator
 *
 * Features:
 * - Real-time validation
 * - Format conversion
 * - Accessibility checking
 * - Color history
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, AlertCircle } from "lucide-react";
import {
  validateColor,
  hexToRgb,
  rgbToHex,
  checkContrast,
} from "@/lib/color-utils";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
  checkContrastWith?: string; // Optional: check contrast against this color
  required?: boolean;
  disabled?: boolean;
}

export default function ColorInput({
  label,
  value,
  onChange,
  description,
  checkContrastWith,
  required = false,
  disabled = false,
}: ColorInputProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [rgbInput, setRgbInput] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [contrastInfo, setContrastInfo] = useState<{
    ratio: number;
    level: "AAA" | "AA" | "AA Large" | "Fail";
  } | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);

  // Update inputs when value changes
  useEffect(() => {
    setHexInput(value);

    // Convert to RGB
    const rgb = hexToRgb(value);
    if (rgb) {
      setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }

    // Validate
    const validation = validateColor(value);
    setIsValid(validation.valid);
    setValidationError(validation.valid ? null : validation.error || null);

    // Check contrast if needed
    if (checkContrastWith) {
      const result = checkContrast(value, checkContrastWith);
      if (result) {
        const level: "AAA" | "AA" | "AA Large" | "Fail" = result.wcagAAA
          ? "AAA"
          : result.wcagAA
            ? "AA"
            : result.ratio >= 3
              ? "AA Large"
              : "Fail";

        setContrastInfo({
          ratio: result.ratio,
          level,
        });
      }
    }
  }, [value, checkContrastWith]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen]);

  const handleHexChange = (newHex: string) => {
    setHexInput(newHex);

    // Validate and update parent
    const validation = validateColor(newHex);
    if (validation.valid) {
      onChange(newHex);
      setIsValid(true);
      setValidationError(null);
    } else {
      setIsValid(false);
      setValidationError(validation.error || "Invalid color format");
    }
  };

  const handleRgbChange = (rgbString: string) => {
    setRgbInput(rgbString);

    // Parse RGB (format: "255, 87, 51" or "255,87,51")
    const parts = rgbString.split(",").map((s) => s.trim());

    if (parts.length === 3) {
      const r = parseInt(parts[0]);
      const g = parseInt(parts[1]);
      const b = parseInt(parts[2]);

      if (
        !isNaN(r) &&
        !isNaN(g) &&
        !isNaN(b) &&
        r >= 0 &&
        r <= 255 &&
        g >= 0 &&
        g <= 255 &&
        b >= 0 &&
        b <= 255
      ) {
        const hex = rgbToHex({ r, g, b });
        onChange(hex);
        setHexInput(hex);
        setIsValid(true);
        setValidationError(null);
      } else {
        setIsValid(false);
        setValidationError("RGB values must be 0-255");
      }
    }
  };

  const handlePickerChange = (newColor: string) => {
    onChange(newColor);
    setHexInput(newColor);
    setIsValid(true);
    setValidationError(null);
  };

  return (
    <div className="space-y-2">
      {/* Label and Description */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Validation Indicator */}
        {!isValid && (
          <div className="flex items-center gap-1 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Invalid</span>
          </div>
        )}
        {isValid && value && (
          <div className="flex items-center gap-1 text-green-500">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Color Preview and Picker Toggle */}
      <div className="flex items-center gap-3">
        {/* Color Swatch */}
        <button
          type="button"
          onClick={() => !disabled && setIsPickerOpen(!isPickerOpen)}
          disabled={disabled}
          className="relative w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: isValid ? value : "#cccccc" }}
          aria-label={`Pick ${label}`}
        >
          {!isValid && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80">
              <AlertCircle className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </button>

        {/* Hex Input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#FF5733"
              disabled={disabled}
              className={`w-full px-3 py-2 rounded-lg border-2 font-mono text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isValid
                  ? "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                  : "border-red-300 dark:border-red-600 focus:border-red-500"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            />
            {!isPickerOpen && (
              <button
                type="button"
                onClick={() => !disabled && setIsPickerOpen(true)}
                disabled={disabled}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <Palette className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* RGB Input */}
        <div className="flex-1">
          <input
            type="text"
            value={rgbInput}
            onChange={(e) => handleRgbChange(e.target.value)}
            placeholder="255, 87, 51"
            disabled={disabled}
            className={`w-full px-3 py-2 rounded-lg border-2 font-mono text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isValid
                ? "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                : "border-red-300 dark:border-red-600 focus:border-red-500"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          />
        </div>
      </div>

      {/* Color Picker Dropdown */}
      <AnimatePresence>
        {isPickerOpen && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10"
          >
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <HexColorPicker
                color={value}
                onChange={handlePickerChange}
                style={{ width: "100%" }}
              />

              {/* Quick Actions */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {value}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Contrast Info */}
      {contrastInfo && checkContrastWith && (
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1 ${
              contrastInfo.level === "Fail"
                ? "text-red-500"
                : contrastInfo.level === "AA Large"
                  ? "text-yellow-500"
                  : "text-green-500"
            }`}
          >
            {contrastInfo.level === "Fail" ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            <span>
              Contrast: {contrastInfo.ratio.toFixed(2)}:1 ({contrastInfo.level})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
