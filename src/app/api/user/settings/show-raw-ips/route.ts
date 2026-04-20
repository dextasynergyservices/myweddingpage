import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const enable = Boolean(body?.showRawIps);

    console.log(
      "show-raw-ips PUT called by userId:",
      session.user.id,
      "body:",
      body
    );

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { showRawIps: enable },
    });

    return NextResponse.json({ showRawIps: updated.showRawIps });
  } catch (e) {
    console.error("Failed to update showRawIps:", e);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
