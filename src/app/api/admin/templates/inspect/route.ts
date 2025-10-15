import { NextResponse } from "next/server";
import { componentKeySet } from "@/lib/component-keys";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const manifest = body?.manifest as Record<string, unknown> | undefined;
    if (!manifest || typeof manifest !== "object") {
      return NextResponse.json({ error: "manifest required" }, { status: 400 });
    }

    const name = String(manifest.name || "");
    const sections = Array.isArray(manifest.sections) ? manifest.sections : [];

    const missingLayouts: string[] = [];
    const sectionKeys: string[] = [];
    for (const s of sections) {
      const layoutRaw = String(s?.layout || "").toLowerCase();
      if (!layoutRaw) continue;
      sectionKeys.push(layoutRaw);
      if (!componentKeySet.has(layoutRaw)) missingLayouts.push(layoutRaw);
    }

    // For this inspection we consider "exists" false since this app uses a component registry
    // and templates are not stored in a central template registry here. The caller can decide
    // how to interpret overwrite risk. We still return the parsed keys and missing layouts.

    return NextResponse.json({
      name,
      sectionKeys,
      missingLayouts,
      exists: false,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
