// components/DynamicTemplateRenderer.tsx
"use client";

import { PLANS } from "@/lib/plans";
import {
  templateRegistry,
  componentMap,
  TemplateComponent,
  TemplateMeta,
} from "@/lib/template-registry";
import { Triangle } from "lucide-react";
import React from "react";

interface Props {
  // templateName must match exact keys of templateRegistry
  templateName: keyof typeof templateRegistry;
  userPlan: keyof typeof PLANS;
  userData: {
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
  };
}

export function DynamicTemplateRenderer({
  templateName,
  userPlan,
  userData,
}: Props) {
  // 1. Get template from registry
  const template: TemplateMeta = templateRegistry[templateName];

  // 2. Verify plan access
  if (!PLANS[userPlan].allowedTemplates.includes(templateName)) {
    return (
      <div className="bg-red-50 p-6 rounded-lg flex items-start gap-3">
        <Triangle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800">Plan Limit Reached</h3>
          <p className="text-sm text-red-700">
            This template requires {template.requiredPlan} plan
          </p>
        </div>
      </div>
    );
  }

  // 3. Replace placeholders with user data
  const processedComponents: TemplateComponent[] = template.components.map(
    (component: TemplateComponent) => ({
      ...component,
      content: Object.fromEntries(
        Object.entries(component.content).map(([key, value]) => [
          key,
          typeof value === "string"
            ? value
                .replace(/{brideName}/g, userData.brideName || "Bride")
                .replace(/{groomName}/g, userData.groomName || "Groom")
                .replace(/{weddingDate}/g, userData.weddingDate || "Date")
            : value,
        ])
      ),
    })
  );

  // 4. Render with plan limits
  return (
    <div className="space-y-12">
      {processedComponents
        .slice(0, PLANS[userPlan].maxComponents) // Enforce component limit
        .map((component, index) => {
          // Ensure TypeScript knows this is a React component
          const Component =
            componentMap[component.type as keyof typeof componentMap] as React.ComponentType<any>;

          return Component ? (
            <div key={`${component.type}-${index}`}>
              <Component {...component} userPlan={userPlan} />
            </div>
          ) : null;
        })}
    </div>
  );
}

// --- Example usage ---
// const myTemplateName: keyof typeof templateRegistry = "classic";
// <DynamicTemplateRenderer
//   templateName={myTemplateName}
//   userPlan="DELIGHT"
//   userData={{ brideName: "Ada", groomName: "Emeka", weddingDate: "2025-12-12" }}
// />
