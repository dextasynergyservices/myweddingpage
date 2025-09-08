"use client";

import { SectionType } from "@/generated/prisma";
import { componentMap, ComponentType, ColorScheme } from "@/lib/component-registry";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";
import React, { useState } from "react";

interface TemplateSection {
  id: string;
  type: SectionType;
  layout: string;
  components: any;
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
  userData: Record<string, any>;
  colorScheme?: ColorScheme;
  onContentUpdate?: (sectionId: string, content: any) => void;
  editable?: boolean;
  isPreview?: boolean;
  editedSections?: string[]; // Track which sections have been edited
}

// Recursive function to replace placeholders in content
function replacePlaceholders(obj: any, userData: any): any {
  const b = userData?.brideName || userData?.bride_name || userData?.bride || "Bride";
  const g = userData?.groomName || userData?.groom_name || userData?.groom || "Groom";
  const d = userData?.weddingDate || userData?.wedding_date || userData?.date || "Date";
  const v = userData?.venue || userData?.location || userData?.place || "Venue";

  if (typeof obj === "string") {
    return obj
      .replace(/\{\s*brideName\s*\}/gi, b)
      .replace(/\{\s*bride_name\s*\}/gi, b)
      .replace(/\{\s*bride\s*\}/gi, b)
      .replace(/\{\s*groomName\s*\}/gi, g)
      .replace(/\{\s*groom_name\s*\}/gi, g)
      .replace(/\{\s*groom\s*\}/gi, g)
      .replace(/\{\s*weddingDate\s*\}/gi, d)
      .replace(/\{\s*wedding_date\s*\}/gi, d)
      .replace(/\{\s*date\s*\}/gi, d)
      .replace(/\{\s*venue\s*\}/gi, v)
      .replace(/\{\s*location\s*\}/gi, v);
  } else if (Array.isArray(obj)) {
    return obj.map((item) => replacePlaceholders(item, userData));
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, replacePlaceholders(value, userData)])
    );
  }

  // Primitives (number, boolean, null)
  return obj;
}

export function DynamicTemplateRenderer({
  template,
  userPlan,
  userData,
  colorScheme,
  onContentUpdate,
  editable = false,
  isPreview = false,
  editedSections = [],
}: Props) {
  const [localEditedSections, setLocalEditedSections] = useState<string[]>(editedSections);

  // Normalize userData to common keys to support multiple API shapes
  const normalizedUserData = {
    brideName: userData?.brideName || userData?.bride_name || userData?.bride || "",
    groomName: userData?.groomName || userData?.groom_name || userData?.groom || "",
    weddingDate: userData?.weddingDate || userData?.wedding_date || userData?.date || "",
    venue: userData?.venue || userData?.location || userData?.place || "",
  };

  // Debug logging
  console.log("DynamicTemplateRenderer - userData:", userData);
  console.log("DynamicTemplateRenderer - sections data:", userData?.sections);
  console.log(
    "DynamicTemplateRenderer - template sections:",
    template?.sections?.map((s) => ({ id: s.id, type: s.type }))
  );

  // Process sections with user data (defensive against undefined)
  const processedSections = (template?.sections ?? []).map((section) => {
    // Get user's edited content for this section
    const userSectionContent = userData?.sections?.[section.id] || {};

    // Merge template components with user's edited content
    const mergedComponents = {
      ...section.components,
      ...userSectionContent,
    };

    console.log(`Section ${section.id} (${section.type}):`, {
      templateComponents: section.components,
      userSectionContent,
      mergedComponents,
    });

    // Debug image data for STORY sections
    if (section.type === "STORY") {
      console.log(`STORY section ${section.id} image data:`, {
        templateImageUrl: section.components?.imageUrl,
        userImageUrl: userSectionContent?.imageUrl,
        userStoryImage: userSectionContent?.storyImage,
        mergedImageUrl: mergedComponents?.imageUrl,
        mergedStoryImage: mergedComponents?.storyImage,
      });
    }

    return {
      ...section,
      components: replacePlaceholders(mergedComponents, normalizedUserData),
    };
  });

  // Enforce component limit based on plan
  const sectionsToRender = processedSections.slice(0, userPlan.maxComponents);

  const handleContentUpdate = (sectionId: string, content: any) => {
    if (onContentUpdate) {
      onContentUpdate(sectionId, content);
    }

    // Mark section as edited
    if (!localEditedSections.includes(sectionId)) {
      setLocalEditedSections([...localEditedSections, sectionId]);
    }
  };

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
          console.warn(`Component layout ${section.layout} not found in componentMap`);
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
              onContentUpdate={(newContent: any) => handleContentUpdate(section.id, newContent)}
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
}
