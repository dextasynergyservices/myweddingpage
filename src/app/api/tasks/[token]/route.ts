import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

// Helper function to check if string looks like an ID
function isId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    // Try to find by token first
    let task = await prisma.task.findUnique({
      where: { token: params.token },
      include: { TaskCategory: true, TaskPriority: true },
    });

    // If not found and looks like ID, try as ID
    if (!task && isId(params.token)) {
      task = await prisma.task.findUnique({
        where: { id: params.token },
        include: { TaskCategory: true, TaskPriority: true },
      });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(`GET /api/tasks/${params.token} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { token: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First try to find by token
    let existingTask = await prisma.task.findUnique({
      where: { token: params.token },
    });

    // If not found and looks like ID, try as ID
    if (!existingTask && isId(params.token)) {
      existingTask = await prisma.task.findUnique({
        where: { id: params.token },
      });
    }

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const updatedTask = await prisma.task.update({
      where: { id: existingTask.id }, // Always use the ID for update
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        completedAt: body.completed ? new Date() : undefined,
      },
      include: {
        TaskCategory: true,
        TaskPriority: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`PUT /api/tasks/${params.token} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { token: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First try to find by token
    let existingTask = await prisma.task.findUnique({
      where: { token: params.token },
    });

    // If not found and looks like ID, try as ID
    if (!existingTask && isId(params.token)) {
      existingTask = await prisma.task.findUnique({
        where: { id: params.token },
      });
    }

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: existingTask.id }, // Always use the ID for delete
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/tasks/${params.token} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
