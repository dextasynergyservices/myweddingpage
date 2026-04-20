/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const sess: any = session;

  if (!sess || sess.user?.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // Count subscriptions

    const paymentCount = await (prisma as any).subscription.count();

    // distinct payers
    let distinctPayers = 0;
    try {
      const res: any =
        await prisma.$queryRaw`SELECT COUNT(DISTINCT("userId")) as count FROM "Subscription"`;
      if (Array.isArray(res) && res.length > 0) {
        distinctPayers = Number(res[0].count ?? res[0].COUNT ?? 0);
      } else if (res && res.count != null) {
        distinctPayers = Number(res.count);
      }
    } catch {
      try {
        // fallback: count users via prisma if raw failed
        const rows = await (prisma as any).payment.groupBy({
          by: ["userId"],
          take: 1,
        });
        distinctPayers = Array.isArray(rows) ? rows.length : 0;
      } catch {
        distinctPayers = 0;
      }
    }

    // sample payments (most recent 5)
    let samplePayments: Array<any> = [];
    try {
      samplePayments = await (prisma as any).subscription.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      // convert Decimal amounts to strings for safety
      samplePayments = samplePayments.map((p: any) => ({
        id: p.id,
        amount: p.amount?.toString?.() ?? String(p.amount),
        createdAt: p.createdAt,
        status: p.status,
        userId: p.userId,
      }));
    } catch {
      samplePayments = [];
    }

    const lastPaymentDate =
      samplePayments.length > 0 ? samplePayments[0].createdAt : null;

    return new Response(
      JSON.stringify({
        paymentCount,
        distinctPayers,
        samplePayments,
        lastPaymentDate,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      { status: 500 }
    );
  }
}
