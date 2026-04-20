import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body?.id === "string" && body.id.trim() ? body.id.trim() : undefined;
    const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : undefined;

    if (!id && !name) {
      return NextResponse.json({ error: "id or name required" }, { status: 400 });
    }

    const where: Record<string, string> = id ? { id } : { name: name! };

    const t = await prisma.template.findFirst({
      where,
      include: { sections: { orderBy: { order: "asc" } }, planTemplate: true },
    });

    if (!t) return NextResponse.json({ found: false });

    // Construct a manifest-like object from DB fields to compare against uploaded manifest
    const manifest = {
      name: t.name,
      description: t.description,
      categoryId: t.categoryId,
      layout_data: t.layout_data ?? {},
      components: t.components ?? {},
      colorSchemes: t.colorSchemes ?? {},
      previewData: t.previewData ?? null,
      sections: (t.sections || []).map((s: unknown) => {
        const sec = s as {
          layout?: string;
          type?: string;
          order?: number;
          components?: unknown;
        };
        return {
          layout: sec.layout,
          type: sec.type,
          order: sec.order,
          components: sec.components ?? {},
        };
      }),
      thumbnail: t.thumbnail || null,
      hero_image: t.hero_image || null,
    };

    const assets: string[] = [];
    if (t.thumbnail) assets.push(t.thumbnail);
    if (t.hero_image) assets.push(t.hero_image);

    return NextResponse.json({
      found: true,
      templateId: t.id,
      manifest,
      assets,
    });
  } catch (err) {
    console.error("get-by-name error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
