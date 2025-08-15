// import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";

// export async function GET() {
//   const session = await getServerSession();
//   if (!session?.user?.id) {
//     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: session.user.id },
//     select: { planId: true },
//   });

//   if (!user?.planId) {
//     return new Response(JSON.stringify({ error: "No plan found for user" }), { status: 404 });
//   }

//   const renewalOptions = await prisma.planRenewalOption.findMany({
//     where: { planId: user.planId },
//     orderBy: { duration: "asc" },
//   });

//   return new Response(JSON.stringify(renewalOptions), { status: 200 });
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/renewal-options?planId=...
 * Returns renewal options for the specified planId.
 * Keep it explicit (planId query) so we don't depend on auth/session here.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const planId = url.searchParams.get("planId");

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const options = await prisma.planRenewalOption.findMany({
      where: { planId },
      orderBy: { duration: "asc" },
      select: { id: true, duration: true, price: true },
    });

    return NextResponse.json(options);
  } catch (err) {
    console.error("[renewal-options] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
