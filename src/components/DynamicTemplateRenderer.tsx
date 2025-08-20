// components/DynamicTemplateRenderer.tsx
"use client";

import { componentMap, ComponentType, ColorScheme } from "@/lib/component-registry";
import { AlertTriangle } from "lucide-react";
import React from "react";

interface Props {
  template: {
    id: string;
    name: string;
    components: any[];
  };
  userPlan: {
    id: string;
    name: string;
    maxComponents: number;
  };
  userData: {
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
    venue?: string;
  };
  colorScheme?: ColorScheme;
  onContentUpdate?: (componentId: string, content: any) => void;
  editable?: boolean;
}

// Recursive function to replace placeholders in content
function replacePlaceholders(obj: any, userData: Props["userData"]): any {
  if (typeof obj === "string") {
    return obj
      .replace(/{brideName}/g, userData.brideName || "Bride")
      .replace(/{groomName}/g, userData.groomName || "Groom")
      .replace(/{weddingDate}/g, userData.weddingDate || "Date")
      .replace(/{venue}/g, userData.venue || "Venue");
  } else if (Array.isArray(obj)) {
    return obj.map(item => replacePlaceholders(item, userData));
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        replacePlaceholders(value, userData)
      ])
    );
  }
  return obj;
}

export function DynamicTemplateRenderer({
  template,
  userPlan,
  userData,
  colorScheme,
  onContentUpdate,
  editable = false
}: Props) {
  // Process components with user data
  const processedComponents = template.components.map((component, index) => ({
    ...component,
    id: component.id || `${component.type}-${index}`,
    content: replacePlaceholders(component.content, userData)
  }));

  // Enforce component limit based on plan
  const componentsToRender = processedComponents.slice(0, userPlan.maxComponents);

  return (
    <div className="space-y-8">
      {componentsToRender.map((component) => {
        const Component = componentMap[component.type as ComponentType];

        if (!Component) {
          console.warn(`Component type ${component.type} not found in componentMap`);
          return null;
        }

        return (
          <div key={component.id} className="template-component">
            <Component
              {...component}
              userPlan={userPlan}
              theme={colorScheme}
              editable={editable}
              onContentUpdate={(newContent: any) =>
                onContentUpdate && onContentUpdate(component.id, newContent)
              }
            />
          </div>
        );
      })}

      {processedComponents.length > userPlan.maxComponents && (
        <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Plan Limit Reached</h3>
            <p className="text-sm text-yellow-700">
              Your {userPlan.name} plan includes {userPlan.maxComponents} components.
              Upgrade to access all {processedComponents.length} components in this template.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}