// app/api/user/plans/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      plan: true,
    },
  });

  if (!user || !user.plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({
    planName: user.plan.name,
    maxPhotos: user.plan.max_photos,
    maxVideos: user.plan.max_videos,
    maxTabs: user.plan.max_tabs,
    status: user.status,
    subscriptionEnd: user.subscription_end,
  });
}
