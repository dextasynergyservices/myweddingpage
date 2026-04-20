/**
 * CustomizationTab Component
 * Main customization interface with responsive layouts
 * Desktop: Left panel + right preview
 * Tablet: Top tabs + preview below
 * Mobile: Floating button + bottom sheet
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Type,
  Sparkles,
  X,
  Save,
  RotateCcw,
  Eye,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { UserCustomization, ColorScheme, FontScheme } from "@/types/customization";
import { DEFAULT_CUSTOMIZATION } from "@/types/customization";
import { PresetSelector } from "@/components/customization";
import { CustomColorPicker } from "@/components/customization";
import { CustomFontPicker } from "@/components/customization";
import { loadFontsFromScheme } from "@/lib/font-utils";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import { injectCSSVariables } from "@/lib/css-variable-injection";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton, SkeletonColorPicker, SkeletonFontPicker } from "@/components/ui/Skeleton";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================================================
// TYPES
// ============================================================================

type CustomizationMode = "preset" | "custom";
type CustomizationSubTab = "presets" | "colors" | "fonts";

interface CustomizationTabProps {
  templateId: string;
  initialCustomization?: UserCustomization;
  onSave: (customization: UserCustomization) => Promise<void>;
  onPreview?: () => void;
  // Props for live preview
  selectedTemplate?: {
    id: string;
    name: string;
    sections: Array<{
      id: string;
      type: string;
      components: Record<string, unknown>;
      order: number;
    }>;
  };
  userTemplate?: {
    content?: Record<string, Record<string, unknown>>;
  };
  weddingPage?: {
    bride_name?: string;
    groom_name?: string;
    wedding_date?: string;
    venue?: string;
    hero_image?: string;
    story_image?: string;
  };
  userPlan?: {
    id: string;
    name: string;
    maxComponents: number;
  };
  // User uploaded data
  gallery?: Array<{
    id: string;
    url: string;
    title?: string;
    category?: string;
  }>;
  gifts?: Array<{
    id: string;
    item: string;
    name?: string;
    description?: string;
    link?: string;
    price: string;
    image: string;
    purchased: boolean;
  }>;
  guests?: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    rsvp?: "yes" | "no" | "pending";
  }>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CustomizationTab: React.FC<CustomizationTabProps> = ({
  initialCustomization,
  onSave,
  selectedTemplate,
  userTemplate,
  weddingPage,
  userPlan,
  gallery,
  gifts,
  guests,
}) => {
  // State - Ensure we have valid customization with all required fields
  const [customization, setCustomization] = useState<UserCustomization>(() => {
    // If initialCustomization is provided and has all required fields, use it
    if (
      initialCustomization &&
      initialCustomization.colors &&
      initialCustomization.fonts &&
      initialCustomization.mode
    ) {
      return initialCustomization;
    }
    // Otherwise, use DEFAULT_CUSTOMIZATION
    return DEFAULT_CUSTOMIZATION;
  });
  const [activeSubTab, setActiveSubTab] = useState<CustomizationSubTab>("presets");
  const [saving, setSaving] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFontLoading, setIsFontLoading] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "default" | "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "default",
  }); // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Load fonts when scheme changes
  useEffect(() => {
    const loadFonts = async () => {
      setIsFontLoading(true);
      await loadFontsFromScheme(customization.fonts);
      // Small delay to ensure fonts are loaded
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsFontLoading(false);
    };
    loadFonts();
  }, [customization.fonts]);

  // Inject CSS variables for live preview whenever colors or fonts change
  useEffect(() => {
    if (customization.colors && customization.fonts) {
      // Inject CSS variables for all preview containers
      const containerIds = [
        "customization-preview-desktop",
        "customization-preview-tablet",
        "customization-preview-mobile",
        "customization-preview-modal",
      ];

      containerIds.forEach((containerId) => {
        const element = document.getElementById(containerId);
        if (element) {
          injectCSSVariables(containerId, customization.colors, customization.fonts);
        }
      });
    }
  }, [customization.colors, customization.fonts]);

  // Track changes
  useEffect(() => {
    const hasModifications =
      JSON.stringify(customization) !==
      JSON.stringify(initialCustomization || DEFAULT_CUSTOMIZATION);
    setHasChanges(hasModifications);
  }, [customization, initialCustomization]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true,
    shortcuts: [
      {
        key: "s",
        ctrl: true,
        description: "Save changes",
        callback: (e) => {
          e.preventDefault();
          if (hasChanges && !saving) {
            handleSave();
            toast.info("Keyboard shortcut: Ctrl+S pressed");
          }
        },
      },
      {
        key: "Escape",
        description: "Close modal/sheet",
        callback: () => {
          if (showMobileSheet) {
            setShowMobileSheet(false);
          } else if (showFullPreview) {
            setShowFullPreview(false);
          } else if (confirmDialog.isOpen) {
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }
        },
      },
      {
        key: "p",
        ctrl: true,
        shift: true,
        description: "Toggle full preview",
        callback: (e) => {
          e.preventDefault();
          setShowFullPreview(!showFullPreview);
          toast.info("Keyboard shortcut: Ctrl+Shift+P pressed");
        },
      },
      {
        key: "r",
        ctrl: true,
        description: "Reset to last saved",
        callback: (e) => {
          e.preventDefault();
          if (hasChanges) {
            handleReset();
            toast.info("Keyboard shortcut: Ctrl+R pressed");
          }
        },
      },
    ],
  });

  // Handlers
  const handleModeChange = (mode: CustomizationMode) => {
    setCustomization((prev) => ({
      ...prev,
      mode,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handlePresetSelect = (presetId: string, colors: ColorScheme, fonts: FontScheme) => {
    setCustomization({
      mode: "preset",
      presetId,
      colors,
      fonts,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleColorsChange = (colors: ColorScheme) => {
    setCustomization((prev) => ({
      ...prev,
      mode: "custom",
      presetId: undefined,
      colors,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleFontsChange = (fonts: FontScheme) => {
    setCustomization((prev) => ({
      ...prev,
      mode: "custom",
      presetId: undefined,
      fonts,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSave = async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    setSaving(true);

    try {
      // Optimistic update: assume save will succeed
      setHasChanges(false);

      await onSave(customization);

      toast.success("Customization saved successfully! 🎨");
    } catch (error) {
      console.error("Failed to save customization:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";

      // Revert optimistic update on failure
      setHasChanges(true);

      // Retry logic for network errors
      if (
        retryCount < MAX_RETRIES &&
        (error instanceof TypeError || errorMessage.includes("fetch"))
      ) {
        toast.error(`Failed to save. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return handleSave(retryCount + 1);
      }

      toast.error(`Failed to save customization: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (hasChanges) {
      setConfirmDialog({
        isOpen: true,
        title: "Reset Changes?",
        message:
          "This will discard all unsaved changes and revert to the last saved customization. This action cannot be undone.",
        variant: "warning",
        onConfirm: () => {
          setCustomization(initialCustomization || DEFAULT_CUSTOMIZATION);
          setHasChanges(false);
          toast.info("Reset to last saved customization");
        },
      });
    } else {
      setCustomization(initialCustomization || DEFAULT_CUSTOMIZATION);
      setHasChanges(false);
    }
  };

  const handleResetToDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset to Default?",
      message:
        "This will clear all customizations and use the template's default styling. You can save these changes if you want to keep the default style.",
      variant: "warning",
      onConfirm: () => {
        setCustomization(DEFAULT_CUSTOMIZATION);
        setHasChanges(true); // Mark as changed since it's different from saved state
        toast.info("Reset to default customization");
      },
    });
  };

  // Sub-tab configurations
  const subTabs = [
    {
      id: "presets" as CustomizationSubTab,
      label: "Preset Themes",
      icon: Sparkles,
      description: "Choose from pre-designed themes",
    },
    {
      id: "colors" as CustomizationSubTab,
      label: "Custom Colors",
      icon: Palette,
      description: "Create your own color scheme",
    },
    {
      id: "fonts" as CustomizationSubTab,
      label: "Fonts",
      icon: Type,
      description: "Select typography",
    },
  ];

  const { isDarkMode } = useTheme();

  return (
    <div className="flex h-full flex-col">
      {/* ============================================================================
          DESKTOP LAYOUT (≥1024px)
          Left panel (400px) + Right preview (flex-1)
          ============================================================================ */}
      <div className="hidden h-full lg:flex">
        {/* Left Panel: Customization Controls */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 0 : 400 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`flex flex-col border-r ${isDarkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-black"} ${sidebarCollapsed ? "overflow-hidden" : ""}`}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
              Customize
            </h2>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-black"}`}>
              Personalize colors and fonts
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
              <button
                onClick={() => handleModeChange("preset")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  customization.mode === "preset"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                Preset
              </button>
              <button
                onClick={() => handleModeChange("custom")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  customization.mode === "custom"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex w-full items-center gap-3 border-b px-6 py-4 text-left transition-colors last:border-b-0 ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  } ${
                    isActive
                      ? isDarkMode
                        ? "bg-primary/10 text-primary"
                        : "bg-primary/5 text-primary"
                      : isDarkMode
                        ? "text-white hover:bg-gray-700/50"
                        : "text-black hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-primary" : isDarkMode ? "text-white" : "text-black"}`}
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${isActive ? "text-primary" : isDarkMode ? "text-white" : "text-black"}`}
                    >
                      {tab.label}
                    </div>
                    <div
                      className={`text-xs ${isActive ? "opacity-70" : isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {tab.description}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {isInitialLoading ? (
                  <div className="space-y-6 p-6">
                    <Skeleton variant="text" width="50%" height="1.5rem" />
                    {activeSubTab === "presets" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} variant="rectangular" height="8rem" />
                          ))}
                        </div>
                      </>
                    )}
                    {activeSubTab === "colors" && <SkeletonColorPicker />}
                    {activeSubTab === "fonts" && <SkeletonFontPicker />}
                  </div>
                ) : (
                  <>
                    {activeSubTab === "presets" && (
                      <PresetSelector
                        selectedPresetId={customization.presetId}
                        onSelect={(preset) =>
                          handlePresetSelect(preset.id, preset.colors, preset.fonts)
                        }
                      />
                    )}
                    {activeSubTab === "colors" &&
                      (isFontLoading ? (
                        <div className="p-6">
                          <SkeletonColorPicker />
                        </div>
                      ) : (
                        <CustomColorPicker
                          colors={customization.colors}
                          onChange={handleColorsChange}
                        />
                      ))}
                    {activeSubTab === "fonts" &&
                      (isFontLoading ? (
                        <div className="p-6">
                          <SkeletonFontPicker />
                        </div>
                      ) : (
                        <CustomFontPicker
                          fonts={customization.fonts}
                          onChange={handleFontsChange}
                        />
                      ))}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                title="Reset to last saved"
              >
                <RotateCcw className="mx-auto h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleResetToDefault}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                title="Reset to template default"
              >
                Reset to Default
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave()}
                disabled={!hasChanges || saving}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
            {hasChanges && (
              <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
                You have unsaved changes
              </p>
            )}
          </div>
        </motion.div>

        {/* Right Panel: Live Preview */}
        <div className={`flex flex-1 flex-col ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
          <div className={`border-b p-4 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Collapse/Expand Button */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`flex items-center justify-center rounded-lg border-2 border-primary p-2.5 shadow-sm transition-all ${
                    isDarkMode
                      ? "bg-gray-800 text-primary hover:bg-primary hover:text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                  title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                  aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </button>
                <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Live Preview
                </h3>
              </div>
              <button
                onClick={() => setShowFullPreview(true)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "border-gray-300 bg-white text-black hover:bg-gray-50"
                }`}
              >
                <Eye className="inline-block mr-2 h-4 w-4" />
                Full Preview
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8">
            <div className="relative mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
              {/* Loading overlay for font loading */}
              {isFontLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-3 text-sm font-medium text-gray-600">Loading fonts...</p>
                  </div>
                </div>
              )}
              <PreviewContent
                customization={customization}
                selectedTemplate={selectedTemplate}
                userTemplate={userTemplate}
                weddingPage={weddingPage}
                userPlan={userPlan}
                gallery={gallery}
                gifts={gifts}
                guests={guests}
                containerId="customization-preview-desktop"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================
          TABLET LAYOUT (768px-1023px)
          Top tabs + Preview below
          ============================================================================ */}
      <div className="hidden h-full flex-col md:flex lg:hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customize Template</h2>
        </div>

        {/* Mode Toggle */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
            <button
              onClick={() => handleModeChange("preset")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                customization.mode === "preset"
                  ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              Preset
            </button>
            <button
              onClick={() => handleModeChange("custom")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                customization.mode === "custom"
                  ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Sub Tabs - Horizontal */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex flex-shrink-0 items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : isDarkMode
                        ? "border-transparent text-white hover:text-gray-300"
                        : "border-transparent text-black hover:text-gray-700"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-primary" : isDarkMode ? "text-white" : "text-black"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            {/* Controls */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSubTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isInitialLoading ? (
                    <div className="space-y-6">
                      <Skeleton variant="text" width="50%" height="1.5rem" />
                      {activeSubTab === "presets" && (
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} variant="rectangular" height="8rem" />
                          ))}
                        </div>
                      )}
                      {activeSubTab === "colors" && <SkeletonColorPicker />}
                      {activeSubTab === "fonts" && <SkeletonFontPicker />}
                    </div>
                  ) : (
                    <>
                      {activeSubTab === "presets" && (
                        <PresetSelector
                          selectedPresetId={customization.presetId}
                          onSelect={(preset) =>
                            handlePresetSelect(preset.id, preset.colors, preset.fonts)
                          }
                        />
                      )}
                      {activeSubTab === "colors" &&
                        (isFontLoading ? (
                          <SkeletonColorPicker />
                        ) : (
                          <CustomColorPicker
                            colors={customization.colors}
                            onChange={handleColorsChange}
                          />
                        ))}
                      {activeSubTab === "fonts" &&
                        (isFontLoading ? (
                          <SkeletonFontPicker />
                        ) : (
                          <CustomFontPicker
                            fonts={customization.fonts}
                            onChange={handleFontsChange}
                          />
                        ))}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Preview */}
            <div className="sticky top-0">
              <div
                className={`relative rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"} p-6`}
              >
                {/* Loading overlay for font loading */}
                {isFontLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="mt-3 text-sm font-medium text-gray-600">Loading fonts...</p>
                    </div>
                  </div>
                )}
                <h3 className={`mb-4 font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Preview
                </h3>
                <div className="bg-white rounded-lg overflow-hidden">
                  <PreviewContent
                    customization={customization}
                    selectedTemplate={selectedTemplate}
                    userTemplate={userTemplate}
                    weddingPage={weddingPage}
                    userPlan={userPlan}
                    gallery={gallery}
                    gifts={gifts}
                    guests={guests}
                    containerId="customization-preview-tablet"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={() => handleSave()}
              disabled={!hasChanges || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================
          MOBILE LAYOUT (<768px)
          Full-screen preview + Floating button + Bottom sheet
          ============================================================================ */}
      <div className="flex h-full flex-col md:hidden">
        {/* Full-screen Preview */}
        <div className={`flex-1 overflow-auto p-4 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
          <div
            className={`relative rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"} p-6`}
          >
            {/* Loading overlay for font loading */}
            {isFontLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="mt-3 text-sm font-medium text-gray-600">Loading fonts...</p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg overflow-hidden">
              <PreviewContent
                customization={customization}
                selectedTemplate={selectedTemplate}
                userTemplate={userTemplate}
                weddingPage={weddingPage}
                userPlan={userPlan}
                gallery={gallery}
                gifts={gifts}
                guests={guests}
                containerId="customization-preview-mobile"
              />
            </div>
          </div>
        </div>

        {/* Floating Customize Button - moved to bottom-left on mobile to avoid reCAPTCHA overlap */}
        <button
          onClick={() => setShowMobileSheet(true)}
          aria-label="Open customization panel"
          title="Customize"
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <Palette className="h-6 w-6" />
        </button>

        {/* Bottom Sheet Modal */}
        <AnimatePresence>
          {showMobileSheet && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSheet(false)}
                className="fixed inset-0 z-50 bg-black/50"
              />

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  // Close if dragged down more than 150px
                  if (info.offset.y > 150) {
                    setShowMobileSheet(false);
                  }
                }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>

                {/* Sheet Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 pb-4 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Customize</h2>
                  <button
                    onClick={() => setShowMobileSheet(false)}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mode Toggle */}
                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                    <button
                      onClick={() => handleModeChange("preset")}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        customization.mode === "preset"
                          ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      }`}
                    >
                      Preset
                    </button>
                    <button
                      onClick={() => handleModeChange("custom")}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        customization.mode === "custom"
                          ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {/* Accordion Tabs */}
                <div className="max-h-[calc(85vh-180px)] overflow-y-auto overscroll-contain">
                  {subTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                      <div
                        key={tab.id}
                        className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
                      >
                        <button
                          onClick={() => setActiveSubTab(isActive ? activeSubTab : tab.id)}
                          className="flex w-full items-center gap-3 p-4 text-left"
                        >
                          <Icon
                            className={`h-5 w-5 ${isActive ? "text-primary" : isDarkMode ? "text-white" : "text-black"}`}
                          />
                          <div className="flex-1">
                            <div
                              className={`font-medium ${isActive ? "text-primary" : isDarkMode ? "text-white" : "text-black"}`}
                            >
                              {tab.label}
                            </div>
                            <div
                              className={`text-xs ${isActive ? "text-primary/70" : isDarkMode ? "text-gray-400" : "text-gray-700"}`}
                            >
                              {tab.description}
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: isActive ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight
                              className={`h-5 w-5 ${isActive ? "text-primary" : isDarkMode ? "text-gray-500" : "text-black"}`}
                            />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0">
                                {isInitialLoading ? (
                                  <div className="space-y-4">
                                    {activeSubTab === "presets" && (
                                      <div className="grid grid-cols-2 gap-4">
                                        {[1, 2].map((i) => (
                                          <Skeleton key={i} variant="rectangular" height="6rem" />
                                        ))}
                                      </div>
                                    )}
                                    {activeSubTab === "colors" && <SkeletonColorPicker />}
                                    {activeSubTab === "fonts" && <SkeletonFontPicker />}
                                  </div>
                                ) : (
                                  <>
                                    {activeSubTab === "presets" && (
                                      <PresetSelector
                                        selectedPresetId={customization.presetId}
                                        onSelect={(preset) => {
                                          handlePresetSelect(
                                            preset.id,
                                            preset.colors,
                                            preset.fonts
                                          );
                                          setShowMobileSheet(false);
                                        }}
                                      />
                                    )}
                                    {activeSubTab === "colors" &&
                                      (isFontLoading ? (
                                        <SkeletonColorPicker />
                                      ) : (
                                        <CustomColorPicker
                                          colors={customization.colors}
                                          onChange={handleColorsChange}
                                        />
                                      ))}
                                    {activeSubTab === "fonts" &&
                                      (isFontLoading ? (
                                        <SkeletonFontPicker />
                                      ) : (
                                        <CustomFontPicker
                                          fonts={customization.fonts}
                                          onChange={handleFontsChange}
                                        />
                                      ))}
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      disabled={!hasChanges}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Reset
                    </button>
                    <button
                      onClick={async () => {
                        await handleSave();
                        setShowMobileSheet(false);
                      }}
                      disabled={!hasChanges || saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save & Close"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowFullPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Full Preview</h2>
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 bg-white">
                <PreviewContent
                  customization={customization}
                  selectedTemplate={selectedTemplate}
                  userTemplate={userTemplate}
                  weddingPage={weddingPage}
                  userPlan={userPlan}
                  gallery={gallery}
                  gifts={gifts}
                  guests={guests}
                  containerId="customization-preview-modal"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
};

// ============================================================================
// PREVIEW CONTENT COMPONENT
// Real-time preview using DynamicTemplateRenderer with CSS injection
// ============================================================================

interface PreviewContentProps {
  customization: UserCustomization;
  selectedTemplate?: CustomizationTabProps["selectedTemplate"];
  userTemplate?: CustomizationTabProps["userTemplate"];
  weddingPage?: CustomizationTabProps["weddingPage"];
  userPlan?: CustomizationTabProps["userPlan"];
  gallery?: CustomizationTabProps["gallery"];
  gifts?: CustomizationTabProps["gifts"];
  guests?: CustomizationTabProps["guests"];
  containerId: string;
}

const PreviewContent: React.FC<PreviewContentProps> = ({
  customization,
  selectedTemplate,
  userTemplate,
  weddingPage,
  userPlan,
  gallery,
  gifts,
  guests,
  containerId,
}) => {
  const colors = customization.colors || DEFAULT_CUSTOMIZATION.colors;
  const fonts = customization.fonts || DEFAULT_CUSTOMIZATION.fonts;

  // Debug: Log what we received
  console.log("PreviewContent props:", {
    hasTemplate: !!selectedTemplate,
    hasUserPlan: !!userPlan,
    templateName: selectedTemplate?.name,
    containerId,
  });

  // If no template provided, show simple placeholder with live color/font preview
  if (!selectedTemplate || !userPlan) {
    console.log("Showing placeholder preview - missing:", {
      selectedTemplate: !selectedTemplate,
      userPlan: !userPlan,
    });
    return (
      <div id={containerId} className="space-y-6 p-6">
        {/* Info Banner */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {!selectedTemplate &&
              "Please select a template in the 'Choose Template' tab to see full preview."}
            {selectedTemplate && !userPlan && "Loading user plan..."}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            You can still preview colors and fonts below:
          </p>
        </div>

        {/* Color & Font Preview */}
        <div
          className="rounded-lg p-8 text-center shadow-md"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
          }}
        >
          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{
              fontFamily: `"${fonts.heading}", serif`,
              color: colors.primary,
            }}
          >
            {weddingPage?.bride_name && weddingPage?.groom_name
              ? `${weddingPage.bride_name} & ${weddingPage.groom_name}`
              : "Your Wedding Names"}
          </h1>
          <p
            className="mt-4 text-xl md:text-2xl"
            style={{
              fontFamily: `"${fonts.script}", cursive`,
              color: colors.secondary,
            }}
          >
            Are Getting Married
          </p>
          <p
            className="mt-2 text-sm md:text-base"
            style={{
              fontFamily: `"${fonts.body}", sans-serif`,
              color: colors.text,
            }}
          >
            {weddingPage?.wedding_date || "Your Wedding Date"} •{" "}
            {weddingPage?.venue || "Your Venue"}
          </p>
        </div>

        {/* Button Preview */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="flex-1 rounded-lg px-6 py-3 font-medium shadow transition-all hover:shadow-lg"
            style={{
              backgroundColor: colors.buttonPrimary,
              color: colors.buttonPrimaryText,
              fontFamily: `"${fonts.body}", sans-serif`,
            }}
          >
            Primary Button
          </button>
          <button
            className="flex-1 rounded-lg border-2 px-6 py-3 font-medium shadow transition-all hover:shadow-lg"
            style={{
              borderColor: colors.buttonSecondary,
              backgroundColor: colors.buttonSecondary,
              color: colors.buttonSecondaryText,
              fontFamily: `"${fonts.body}", sans-serif`,
            }}
          >
            Secondary Button
          </button>
        </div>

        {/* Sample Content */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
          <h2
            className="text-xl font-bold md:text-2xl"
            style={{
              fontFamily: `"${fonts.heading}", serif`,
              color: colors.primary,
            }}
          >
            Our Story
          </h2>
          <p
            className="mt-3 leading-relaxed"
            style={{
              fontFamily: `"${fonts.body}", sans-serif`,
              color: colors.text,
            }}
          >
            This is a preview of how your body text will look with your selected fonts and colors.
            The heading above uses your heading font, and this paragraph uses your body font.
          </p>
          <p
            className="mt-3 text-center text-lg italic md:text-xl"
            style={{
              fontFamily: `"${fonts.script}", cursive`,
              color: colors.accent,
            }}
          >
            &quot;Your script font for special quotes&quot;
          </p>
        </div>
      </div>
    );
  }

  // Full template preview with DynamicTemplateRenderer
  return (
    <div id={containerId} className="w-full">
      <DynamicTemplateRenderer
        template={{
          ...selectedTemplate,
          sections: selectedTemplate.sections.map((section) => ({
            ...section,
            layout: section.type, // Use type as layout
            type: section.type as never,
            components: {
              ...(section.components || {}),
              ...(userTemplate?.content?.[section.id] || {}),
            },
          })),
        }}
        userPlan={userPlan}
        userData={{
          brideName: weddingPage?.bride_name || "Bride",
          groomName: weddingPage?.groom_name || "Groom",
          weddingDate: weddingPage?.wedding_date || "Your Date",
          venue: weddingPage?.venue || "Your Venue",
          heroImage: weddingPage?.hero_image,
          storyImage: weddingPage?.story_image,
          gallery: gallery || [],
          gifts: gifts || [],
          guests: guests || [],
        }}
        colorScheme={{
          name: customization.presetId || "Custom",
          primary: colors.primary,
          secondary: colors.secondary,
          background: colors.background,
          text: colors.text,
        }}
        isPreview={true}
        editable={false}
      />
    </div>
  );
};
