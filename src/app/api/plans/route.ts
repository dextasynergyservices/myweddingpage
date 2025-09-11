import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        max_photos: true,
        max_videos: true,
        max_tabs: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json([], { status: 200 });
  }
}
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET() {
//   try {
//     const plans = await prisma.plan.findMany({
//       orderBy: { price: "asc" },
//     });

//     return NextResponse.json(plans);
//   } catch (error) {
//     console.error("Failed to fetch plans:", error);
//     return new NextResponse("Failed to fetch plans", { status: 500 });
//   }
// }
