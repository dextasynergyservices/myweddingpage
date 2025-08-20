import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      include: {
        templates: {
          include: {
            template: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
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