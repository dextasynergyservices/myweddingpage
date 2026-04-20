import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bankDetails = await prisma.bankDetail.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json(bankDetails);
  } catch (error) {
    console.error("Failed to fetch bank details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bank details",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.bankName || !body.accountNumber || !body.accountName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const bankDetail = await prisma.bankDetail.create({
      data: {
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        accountName: body.accountName,
        userId: user.id,
      },
    });

    return NextResponse.json(bankDetail, { status: 201 });
  } catch (error) {
    console.error("Failed to create bank detail:", error);
    return NextResponse.json(
      {
        error: "Failed to create bank detail",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing bank detail ID" },
        { status: 400 }
      );
    }

    const existingDetail = await prisma.bankDetail.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingDetail) {
      return NextResponse.json(
        { error: "Bank detail not found" },
        { status: 404 }
      );
    }

    const updatedDetail = await prisma.bankDetail.update({
      where: { id, userId: user.id },
      data: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      },
    });

    return NextResponse.json(updatedDetail);
  } catch (error) {
    console.error("Failed to update bank detail:", error);
    return NextResponse.json(
      {
        error: "Failed to update bank detail",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing bank detail ID" },
        { status: 400 }
      );
    }

    await prisma.bankDetail.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete bank detail:", error);
    return NextResponse.json(
      {
        error: "Failed to delete bank detail",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
