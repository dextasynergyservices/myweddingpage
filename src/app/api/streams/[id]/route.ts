import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    // Verify the stream belongs to the user
    const existingStream = await prisma.stream.findUnique({
      where: { id: id },
    });
    if (!existingStream || existingStream.userId !== session.user.id) {
      return NextResponse.json({ error: "Stream not found or access denied" }, { status: 404 });
    }
    const stream = await prisma.stream.update({
      where: { id: id },
      data: body,
    });
    return NextResponse.json(stream);
  } catch (error) {
    console.error("Error updating stream:", error);
    return NextResponse.json({ error: "Error updating stream" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Verify the stream belongs to the user
    const existingStream = await prisma.stream.findUnique({
      where: { id: id },
    });
    if (!existingStream || existingStream.userId !== session.user.id) {
      return NextResponse.json({ error: "Stream not found or access denied" }, { status: 404 });
    }
    await prisma.stream.delete({
      where: { id: id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json({ error: "Error deleting stream" }, { status: 500 });
  }
}
