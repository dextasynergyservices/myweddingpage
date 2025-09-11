"use client";

import { SectionType } from "@/generated/prisma";
import { componentMap, ComponentType, ColorScheme } from "@/lib/component-registry";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";
import { UserData, ComponentProps } from "@/types/user-data";

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
  userData: UserData;
  colorScheme?: ColorScheme;
  onContentUpdate?: (sectionId: string, content: Record<string, unknown>) => void;
  editable?: boolean;
  isPreview?: boolean;
  editedSections?: string[]; // Track which sections have been edited
}

// Optimized function to replace placeholders in content
function replacePlaceholders(obj: unknown, userData: UserData): unknown {
  // Pre-compute replacement values as string entries
  const replacementsObj = {
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
  } as Record<string, unknown>;
  const replacementEntries: [string, string][] = Object.entries(replacementsObj).map(([k, v]) => [
    k,
    String(v ?? ""),
  ]);

  if (typeof obj === "string") {
    // Single pass replacement for better performance
    return replacementEntries.reduce(
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
      venue: String(userData?.venue || userData?.location || userData?.place || ""),
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
      // Get user's edited content for this section (userData can be arbitrary shape)
      const sectionsObj = (userData?.sections ?? {}) as Record<string, Record<string, unknown>>;
      const userSectionContent = sectionsObj[section.id] || {};

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
  }, [template?.sections, userData, normalizedUserData]);

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
        // Use flexible typing to accommodate different component prop structures
        const RenderComponent = Component as React.ComponentType<Record<string, unknown>>;

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`Component layout ${section.layout} not found in componentMap`);
          }
          return null;
        }

        const isEdited = localEditedSections.includes(section.id);

        // Debug: Log userData for Gift components
        if (
          section.layout === "ModernGift" ||
          section.layout === "RusticGift" ||
          section.layout === "LuxuryGift" ||
          section.layout === "VintageGift"
        ) {
          console.log(`Debug for ${section.layout}:`, {
            userData,
            userId: userData?.id,
            gifts: userData?.gifts,
          });
        }

        // Debug: Log userData for Story components
        if (
          section.layout === "modern_story" ||
          section.layout === "rustic_story" ||
          section.layout === "luxury_story" ||
          section.layout === "vintage_story"
        ) {
          console.log(`Debug for ${section.layout}:`, {
            userData,
            storyImage: userData?.storyImage,
            section: section.layout,
          });
        }

        return (
          <div key={section.id} id={section.id} className="template-section relative">
            {isEdited && editable && (
              <div className="absolute top-2 right-2 z-10 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Edited
              </div>
            )}

            {(() => {
              const componentProps: ComponentProps = {
                ...(section.components as Record<string, unknown>),
                sectionId: section.id,
                sectionType: section.type,
                userPlan,
                theme: colorScheme,
                editable: editable && !isPreview,
                onContentUpdate: (newContent: Record<string, unknown>) =>
                  handleContentUpdate(section.id, newContent),
                gallery: userData?.gallery,
                gifts: userData?.gifts,
                guests: userData?.guests,
                bankDetails: userData?.bankDetails,
                userId: userData?.id,
                heroImage: userData?.heroImage,
                storyImage: userData?.storyImage,
              };

              return <RenderComponent {...componentProps} />;
            })()}
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
