import { NextResponse } from "next/server";
import { templateRegistry, Template } from "@/lib/template-registry";

export async function GET() {
  try {
    const templates: Template[] = Object.entries(templateRegistry).map(
      ([key, value]) => ({
        id: key,
        ...value,
      })
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
