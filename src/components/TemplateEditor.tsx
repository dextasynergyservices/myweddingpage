"use client";

import { useState, useEffect } from "react";
import { DynamicTemplateRenderer } from "./DynamicTemplateRenderer";
import { Save, Palette, ArrowLeft } from "lucide-react";
import { SectionType } from "@/generated/prisma";
import { ColorScheme } from "@/lib/component-registry";
import { UserData } from "@/types/user-data";

interface TemplateEditorProps {
  template: {
    id: string;
    name: string;
    description?: string;
    sections: Array<{
      id: string;
      type: string;
      components: Record<string, unknown>;
    }>;
    colorSchemes: ColorScheme[];
  };
  userPlan: { id: string; name: string; maxComponents: number };
  userData: UserData;
  onSave: (content: Record<string, unknown>, colorScheme: ColorScheme) => Promise<void>;
  onBack: () => void;
}

export default function TemplateEditor({
  template,
  userPlan,
  userData,
  onSave,
  onBack,
}: TemplateEditorProps) {
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme | null>(null);
  const [customContent, setCustomContent] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Initialize with first color scheme
  useEffect(() => {
    if (template.colorSchemes && template.colorSchemes.length > 0) {
      setSelectedColorScheme(template.colorSchemes[0]);
    }
  }, [template]);

  const handleContentUpdate = (componentId: string, content: Record<string, unknown>) => {
    setCustomContent((prev) => ({
      ...prev,
      [componentId]: content,
    }));
  };

  const handleSave = async () => {
    if (!selectedColorScheme) return;

    setIsSaving(true);
    try {
      await onSave(customContent, selectedColorScheme);
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedColorScheme) {
    return <div>Loading...</div>;
  }

  return (
    <div className="template-editor min-h-screen bg-gray-50">
      <div className="editor-header bg-white p-4 border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Color Scheme Selector */}
            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Palette className="h-5 w-5" />
                <span>{selectedColorScheme.name}</span>
              </button>

              {showColorPicker && template.colorSchemes && (
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 p-3 min-w-48">
                  <h3 className="font-medium mb-2">Choose Color Scheme</h3>
                  <div className="space-y-2">
                    {template.colorSchemes.map((scheme: ColorScheme, index: number) => (
                      <div
                        key={index}
                        className={`p-2 rounded border cursor-pointer ${
                          selectedColorScheme.name === scheme.name
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedColorScheme(scheme);
                          setShowColorPicker(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: scheme.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: scheme.secondary }}
                            />
                          </div>
                          <span className="text-sm">{scheme.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <div className="p-6 max-w-7xl mx-auto">
        <DynamicTemplateRenderer
          template={{
            ...template,
            sections: template.sections.map((section) => ({
              ...section,
              // ensure required fields for TemplateSection
              layout:
                (section as unknown as { layout?: string }).layout ?? (section.type as string),
              type: section.type as unknown as SectionType,
              order: (section as unknown as { order?: number }).order ?? 0,
              components: {
                ...(section.components || {}),
                ...(customContent[section.id] || {}),
              },
            })),
          }}
          userPlan={userPlan}
          userData={userData}
          colorScheme={selectedColorScheme}
          onContentUpdate={handleContentUpdate}
          editable={true}
        />
      </div>
    </div>
  );
}
