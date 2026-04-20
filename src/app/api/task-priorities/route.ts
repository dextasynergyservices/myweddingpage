import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const priorities = await prisma.taskPriority.findMany({
      orderBy: { level: "desc" },
    });
    return NextResponse.json(priorities);
  } catch (error) {
    console.error("GET /api/task-priorities error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, level, color } = await request.json();

    if (!name || level === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const priority = await prisma.taskPriority.create({
      data: { name, level, color },
    });

    return NextResponse.json(priority, { status: 201 });
  } catch (error) {
    console.error("POST /api/task-priorities error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
