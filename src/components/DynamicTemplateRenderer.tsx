"use client";

import { SectionType } from "@/generated/prisma";
import { componentMap, ComponentType, ColorScheme } from "@/lib/component-registry";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

interface TemplateSection {
  id: string;
  type: SectionType;
  layout: string;
  components: Record<string, unknown>;
  order: number;
}

interface Props {
  template: {
    id: string;
    name: string;
    sections: TemplateSection[];
  };
  userPlan: {
    id: string;
    name: string;
    maxComponents: number;
  };
  userData: Record<string, unknown>;
  colorScheme?: ColorScheme;
  onContentUpdate?: (sectionId: string, content: Record<string, unknown>) => void;
  editable?: boolean;
  isPreview?: boolean;
  editedSections?: string[]; // Track which sections have been edited
}

// Optimized function to replace placeholders in content
function replacePlaceholders(obj: unknown, userData: Record<string, unknown>): unknown {
  // Pre-compute replacement values
  const replacements = {
    "{brideName}": userData?.brideName || userData?.bride_name || userData?.bride || "Bride",
    "{bride_name}": userData?.brideName || userData?.bride_name || userData?.bride || "Bride",
    "{bride}": userData?.brideName || userData?.bride_name || userData?.bride || "Bride",
    "{groomName}": userData?.groomName || userData?.groom_name || userData?.groom || "Groom",
    "{groom_name}": userData?.groomName || userData?.groom_name || userData?.groom || "Groom",
    "{groom}": userData?.groomName || userData?.groom_name || userData?.groom || "Groom",
    "{weddingDate}": userData?.weddingDate || userData?.wedding_date || userData?.date || "Date",
    "{wedding_date}": userData?.weddingDate || userData?.wedding_date || userData?.date || "Date",
    "{date}": userData?.weddingDate || userData?.wedding_date || userData?.date || "Date",
    "{venue}": userData?.venue || userData?.location || userData?.place || "Venue",
    "{location}": userData?.venue || userData?.location || userData?.place || "Venue",
  };

  if (typeof obj === "string") {
    // Single pass replacement for better performance
    return Object.entries(replacements).reduce(
      (str, [placeholder, value]) => str.replaceAll(placeholder, value),
      obj
    );
  } else if (Array.isArray(obj)) {
    return obj.map((item) => replacePlaceholders(item, userData));
  } else if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replacePlaceholders(value, userData);
    }
    return result;
  }

  // Primitives (number, boolean, null)
  return obj;
}

const DynamicTemplateRendererComponent = ({
  template,
  userPlan,
  userData,
  colorScheme,
  onContentUpdate,
  editable = false,
  isPreview = false,
  editedSections = [],
}: Props) => {
  const [localEditedSections, setLocalEditedSections] = useState<string[]>(editedSections);

  // Memoize normalized userData to prevent unnecessary recalculations
  const normalizedUserData = useMemo(
    () => ({
      brideName: userData?.brideName || userData?.bride_name || userData?.bride || "",
      groomName: userData?.groomName || userData?.groom_name || userData?.groom || "",
      weddingDate: userData?.weddingDate || userData?.wedding_date || userData?.date || "",
      venue: userData?.venue || userData?.location || userData?.place || "",
    }),
    [
      userData?.brideName,
      userData?.bride_name,
      userData?.bride,
      userData?.groomName,
      userData?.groom_name,
      userData?.groom,
      userData?.weddingDate,
      userData?.wedding_date,
      userData?.date,
      userData?.venue,
      userData?.location,
      userData?.place,
    ]
  );

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("DynamicTemplateRenderer - template sections:", template?.sections?.length);
  }

  // Memoize processed sections to prevent expensive recalculations on every render
  const processedSections = useMemo(() => {
    return (template?.sections ?? []).map((section) => {
      // Get user's edited content for this section
      const userSectionContent = userData?.sections?.[section.id] || {};

      // Merge template components with user's edited content
      const mergedComponents = {
        ...section.components,
        ...userSectionContent,
      };

      return {
        ...section,
        components: replacePlaceholders(mergedComponents, normalizedUserData),
      };
    });
  }, [template?.sections, userData?.sections, normalizedUserData]);

  // Enforce component limit based on plan
  const sectionsToRender = processedSections.slice(0, userPlan.maxComponents);

  const handleContentUpdate = useCallback(
    (sectionId: string, content: Record<string, unknown>) => {
      if (onContentUpdate) {
        onContentUpdate(sectionId, content);
      }

      // Mark section as edited
      setLocalEditedSections((prev) => {
        if (!prev.includes(sectionId)) {
          return [...prev, sectionId];
        }
        return prev;
      });
    },
    [onContentUpdate]
  );

  return (
    <div className="space-y-8 relative">
      {isPreview && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded-md shadow">
          <Eye className="w-3 h-3" />
          Preview
        </div>
      )}

      {sectionsToRender.map((section) => {
        const Component = componentMap[section.layout as ComponentType];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`Component layout ${section.layout} not found in componentMap`);
          }
          return null;
        }

        const isEdited = localEditedSections.includes(section.id);

        return (
          <div key={section.id} id={section.id} className="template-section relative">
            {isEdited && editable && (
              <div className="absolute top-2 right-2 z-10 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Edited
              </div>
            )}

            <Component
              {...section.components}
              sectionId={section.id}
              sectionType={section.type}
              userPlan={userPlan}
              theme={colorScheme}
              editable={editable && !isPreview}
              onContentUpdate={(newContent: Record<string, unknown>) =>
                handleContentUpdate(section.id, newContent)
              }
              // Pass additional data from userData for Gallery, Gift, and Guest components
              gallery={userData?.gallery}
              gifts={userData?.gifts}
              guests={userData?.guests}
              bankDetails={userData?.bankDetails}
            />
          </div>
        );
      })}

      {processedSections.length > userPlan.maxComponents && (
        <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Plan Limit Reached</h3>
            <p className="text-sm text-yellow-700">
              Your {userPlan.name} plan includes {userPlan.maxComponents} sections. Upgrade to
              access all {processedSections.length} sections in this template.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export const DynamicTemplateRenderer = React.memo(DynamicTemplateRendererComponent);
