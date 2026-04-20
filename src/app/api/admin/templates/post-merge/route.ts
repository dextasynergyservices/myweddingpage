import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import type { Prisma, SectionType } from "@/generated/prisma";

export const runtime = "nodejs";

/**
 * Expected payload shape (POST):
 * {
 *   name: string,
 *   slug: string,
 *   description?: string,
 *   thumbnail?: string,
 *   heroImage?: string,
 *   layout_data?: object,
 *   components?: object,
 *   colorSchemes?: object,
 *   previewData?: object,
 *   sections?: Array<{ type, layout, order, components }>,
 *   planIds?: string[]
 * }
 */

async function handle(req: Request) {
  if (req.method !== "POST")
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });

  // Optional webhook secret verification
  const secretHeader = req.headers.get("x-template-webhook-secret");
  const expected = process.env.TEMPLATE_WEBHOOK_SECRET;
  if (expected && secretHeader !== expected) {
    return NextResponse.json(
      { error: "Invalid webhook secret" },
      { status: 401 }
    );
  }

  interface PostMergePayload {
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    heroImage?: string | null;
    layout_data?: Record<string, unknown>;
    components?: Record<string, unknown>;
    colorSchemes?: Record<string, unknown>;
    previewData?: Record<string, unknown> | null;
    sections?: Array<{
      type: string;
      layout: string;
      order?: number;
      components?: Record<string, unknown>;
    }>;
    planIds?: string[];
    categoryId?: string;
  }
  const raw = await req.json();

  const SectionSchema = z.object({
    type: z.enum(["HERO", "STORY", "GALLERY", "REGISTRY", "WISHES"]),
    layout: z.string(),
    order: z.number().int().optional(),
    components: z.any().optional(),
  });

  const PayloadSchema = z
    .object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional().default(""),
      thumbnail: z.string().optional().default(""),
      heroImage: z.string().nullable().optional().default(null),
      layout_data: z.any().optional().default({}),
      components: z.any().optional().default({}),
      colorSchemes: z.any().optional().default({}),
      previewData: z.any().nullable().optional().default(null),
      sections: z.array(SectionSchema).optional().default([]),
      planIds: z.array(z.string()).optional().default([]),
      categoryId: z.string().optional(),
    })
    .passthrough();

  const parsed = PayloadSchema.safeParse(raw);
  if (!parsed.success) {
    // Return structured zod errors for clients
    return NextResponse.json(
      { error: "validation", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const {
    name,
    slug,
    description = "",
    thumbnail = "",
    heroImage = null,
    layout_data = {},
    components = {},
    colorSchemes = {},
    previewData = null,
    sections = [],
    planIds = [],
  } = parsed.data as unknown as PostMergePayload;

  if (!name || !slug)
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );

  try {
    // Upsert template record
    const template = await prisma.template.upsert({
      where: { name },
      update: {
        description,
        thumbnail,
        hero_image: heroImage,
        // cast to Prisma.InputJsonValue to satisfy client types
        layout_data: layout_data as Prisma.InputJsonValue,
        components: components as Prisma.InputJsonValue,
        colorSchemes: colorSchemes as Prisma.InputJsonValue,
        previewData:
          previewData == null
            ? undefined
            : (previewData as Prisma.InputJsonValue),
        isActive: true,
      },
      create: {
        name,
        description,
        thumbnail,
        hero_image: heroImage,
        categoryId:
          (parsed.data.categoryId as string) ||
          (await ensureDefaultCategory()).id,
        layout_data: layout_data as Prisma.InputJsonValue,
        components: components as Prisma.InputJsonValue,
        colorSchemes: colorSchemes as Prisma.InputJsonValue,
        previewData:
          previewData == null
            ? undefined
            : (previewData as Prisma.InputJsonValue),
        isActive: true,
      },
    });

    // Recreate sections idempotently: delete existing then create new list
    await prisma.templateSection.deleteMany({
      where: { templateId: template.id },
    });

    for (const s of sections) {
      await prisma.templateSection.create({
        data: {
          templateId: template.id,
          // cast incoming string to the generated SectionType enum
          type: s.type as SectionType,
          layout: s.layout,
          components: (s.components ?? {}) as Prisma.InputJsonValue,
          order: s.order ?? 0,
        },
      });
    }

    // Link to plans via upsert (idempotent)
    for (const planId of planIds || []) {
      await prisma.planTemplate.upsert({
        where: { planId_templateId: { planId, templateId: template.id } },
        update: {},
        create: { planId, templateId: template.id },
      });
    }

    return NextResponse.json(
      { success: true, templateId: template.id },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("post-merge webhook failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function ensureDefaultCategory() {
  // ensure a default category exists to attach templates to when none provided
  const name = "Imported";
  let cat = await prisma.templateCategory.findUnique({ where: { name } });
  if (!cat) {
    cat = await prisma.templateCategory.create({
      data: { name, description: "Imported templates" },
    });
  }
  return cat;
}

export async function POST(req: Request) {
  return handle(req);
}

// Export handle for in-process integration tests (bypasses middleware)
export { handle };
