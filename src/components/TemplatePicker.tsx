"use client";

import { PLANS } from "@/lib/plans";
import { componentMap, ComponentType } from "@/lib/component-registry";
import { RusticTemplate } from "@/lib/sample-templates/rustic";
import { modernTemplate } from "@/lib/sample-templates/modern";
import { vintageTemplate } from "@/lib/sample-templates/vintage";
import { luxuryTemplate } from "@/lib/sample-templates/luxury";

type TemplateName = "rustic" | "modern" | "vintage" | "luxury";

type TemplateMeta = {
  name: string;
  category?: string;
  requiredPlan?: string;
  components: Array<{ type: ComponentType } | Record<string, unknown>>;
};

const templateRegistry: Record<string, TemplateMeta> = {
  rustic: RusticTemplate as TemplateMeta,
  modern: modernTemplate as TemplateMeta,
  vintage: vintageTemplate as TemplateMeta,
  luxury: luxuryTemplate as TemplateMeta,
};
import Link from "next/link";

interface Props {
  userPlan: keyof typeof PLANS;
}

export function TemplatePicker({ userPlan }: Props) {
  const allowedTemplates = new Set<TemplateName>(PLANS[userPlan].allowedTemplates);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(templateRegistry).map(([id, template]: [string, TemplateMeta]) => {
        const isAllowed = allowedTemplates.has(id as TemplateName);
        const requiresUpgrade = !isAllowed;

        // pick the first component for preview
        const previewKey = Object.keys(template.components)[0] as ComponentType;
        const PreviewComponent = componentMap[previewKey];

        return (
          <Link
            key={id}
            href={isAllowed ? `/editor?template=${id}` : "#"}
            className={`border rounded-lg overflow-hidden transition-all ${
              requiresUpgrade ? "opacity-70" : "hover:shadow-lg"
            }`}
          >
            <div className="relative h-48">
              {PreviewComponent && <PreviewComponent />}
              {requiresUpgrade && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
                    Upgrade to {template.requiredPlan}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold">{template.name}</h3>
              <p className="text-sm text-gray-500">{template.category}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
