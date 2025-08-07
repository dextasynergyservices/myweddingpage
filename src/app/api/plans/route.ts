import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    return new NextResponse("Failed to fetch plans", { status: 500 });
  }
}
