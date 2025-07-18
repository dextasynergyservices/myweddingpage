import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getAuthUser();

    const payments = await prisma.payment.findMany({
      where: { userId: sessionUser.id },
      include: { plan: true },
      orderBy: { paid_at: "desc" },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
