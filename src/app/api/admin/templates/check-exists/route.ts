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

    const where: Record<string, string> = id ? { id } : { name: name as string };

    const found = await prisma.template.findFirst({ where });

    if (!found) return NextResponse.json({ exists: false });

    return NextResponse.json({
      exists: true,
      template: { id: found.id, name: found.name },
    });
  } catch (err) {
    console.error("check-exists error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
