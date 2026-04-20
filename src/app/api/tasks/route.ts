import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      include: {
        TaskCategory: true,
        TaskPriority: true,
      },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      description,
      TaskCategoryId,
      TaskPriorityId,
      dueDate,
      assignedTo,
      phone,
      email,
      estimatedTime,
    } = await request.json();

    if (!title || !dueDate || !TaskCategoryId || !TaskPriorityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        TaskCategoryId,
        TaskPriorityId,
        dueDate: new Date(dueDate),
        assignedTo: assignedTo || null,
        phone: phone || null,
        email: email || null,
        estimatedTime: estimatedTime || null,
        userId: session.user.id,
        token: Math.random().toString(36).substring(2, 15),
      },
      include: {
        TaskCategory: true,
        TaskPriority: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
