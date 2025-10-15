"use client";

import React from "react";
import { SectionType } from "@/generated/prisma";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";

type Manifest = {
  name?: string;
  sections?: Array<{
    type: string;
    layout?: string;
    components?: Record<string, unknown>;
    order?: number;
  }>;
};

export default function PreviewHost({
  manifest,
  stagingId,
}: {
  manifest: Manifest | null;
  stagingId: string;
}) {
  const template: {
    id: string;
    name: string;
    sections: Array<{
      id: string;
      type: SectionType;
      layout: string;
      components: Record<string, unknown>;
      order: number;
    }>;
  } = {
    id: stagingId,
    name: manifest?.name || "Staged Preview",
    sections: (manifest?.sections || []).map((s, i: number) => ({
      id: String(i),
      // manifest provides a string; coerce to SectionType for the renderer
      type: s.type as unknown as SectionType,
      layout: s.layout || String(s.type),
      components: s.components || {},
      order: s.order ?? i,
    })),
  };

  // sensible sample userData for preview
  const userData = {
    brideName: "Jane",
    groomName: "John",
    weddingDate: "2026-06-01",
    venue: "Sample Venue",
    sections: {},
  };

  const userPlan = { id: "preview", name: "Preview Plan", maxComponents: 100 };

  return (
    <div className="p-6 bg-white">
      <DynamicTemplateRenderer
        template={template}
        userPlan={userPlan}
        userData={userData}
        isPreview
      />
    </div>
  );
}
