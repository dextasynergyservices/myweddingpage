import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
      include: {
        templates: {
          include: {
            template: true
          }
        }
      }
    });

    const planFeatures = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      maxPhotos: plan.max_photos,
      maxVideos: plan.max_videos,
      maxComponents: plan.max_tabs,
      allowedTemplates: plan.templates.map(pt => pt.template.id),
      price: plan.price,
      duration_days: plan.duration_days
    }));

    return NextResponse.json(planFeatures);
  } catch (error) {
    console.error("Failed to fetch plan features:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan features" },
      { status: 500 }
    );
  }
}