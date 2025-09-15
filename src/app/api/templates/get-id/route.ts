import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all templates with their IDs
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      templates,
    });
  } catch (error) {
    console.error("Error fetching all templates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
