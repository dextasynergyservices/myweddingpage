import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getAuthUser();

    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      include: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
