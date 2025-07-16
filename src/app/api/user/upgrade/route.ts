import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Placeholder
  return NextResponse.json({ message: "Upgrade endpoint coming soon" });
}
