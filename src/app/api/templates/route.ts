import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await getAuthUser(); // Must be logged in
    const templates = await prisma.template.findMany();
    return NextResponse.json({ templates });
  } catch (_err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
