/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const sess: any = session;

  // match other routes: require ADMIN role or at least a valid session
  if (!sess || sess.user?.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Total users
  const totalUsers = await prisma.user.count();

  // active users - crude proxy using sessions touched within last 30 days
  const activeUsers = await prisma.session.count({
    where: {
      lastAccessedAt: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    },
  });

  // Aggregate real payments from the Payment table if present.
  // If the project doesn't have a payment table or no payments, fall back to 0s.
  // We'll compute: totalRevenue (sum of amounts), and revenueByMonth for last 6 months.

  let totalRevenue = 0;
  const revenueByMonth: Array<{ month: string; revenue: number; users: number }> = [];

  try {
    // sum all paid subscriptions (assumes 'status' and 'amount' fields exist on Subscription)
    // We include subscriptions with status 'PAID' or 'ACTIVE' as a conservative assumption
    const sumResult: any = (await prisma.$queryRaw`
      SELECT SUM(amount) as "sum" FROM "Subscription" WHERE COALESCE(status, 'ACTIVE') IN ('PAID','ACTIVE')
    `) as any;

    // prisma.$queryRaw may return an array of rows or an object; normalize and parse
    let rawSum = 0;
    if (Array.isArray(sumResult) && sumResult.length > 0) {
      rawSum = Number(sumResult[0].sum ?? sumResult[0].SUM ?? 0) || 0;
    } else if (sumResult && (sumResult.sum !== undefined || sumResult.SUM !== undefined)) {
      rawSum = Number(sumResult.sum ?? sumResult.SUM ?? 0) || 0;
    }

    if (rawSum > 0) {
      totalRevenue = rawSum;
    } else {
      // try prisma.payment.aggregate
      try {
        const agg = await (prisma as any).subscription.aggregate({ _sum: { amount: true } });
        if (agg && agg._sum && agg._sum.amount != null) {
          // handle Decimal instances returned by Prisma
          const val = agg._sum.amount;
          totalRevenue = typeof val === "number" ? val : Number(val?.toString?.() ?? val);
        }
      } catch {
        // no payment model available or aggregate failed - leave totalRevenue = 0
      }
    }
  } catch {
    // raw query failed for some schema setups; attempt prisma.payment.aggregate as fallback
    try {
      const agg = await (prisma as any).subscription.aggregate({ _sum: { amount: true } });
      if (agg && agg._sum && agg._sum.amount != null) {
        const val = agg._sum.amount;
        totalRevenue = typeof val === "number" ? val : Number(val?.toString?.() ?? val);
      }
    } catch {
      // ignore - payments not present
      totalRevenue = 0;
    }
  }

  // Build monthly revenue for last 6 months using DB grouping if possible
  const months = 6;
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const monthLabel = `${monthName} ${year}`;

    let monthRevenue = 0;

    try {
      // Attempt to use prisma.payment.groupBy or raw SQL to sum payments per month
      // Use raw query to sum by month for portability
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      // raw query - Postgres style; wrap in try/catch if DB differs
      const res: any = await prisma.$queryRaw`
        SELECT COALESCE(SUM(amount),0) as sum
        FROM "Subscription"
        WHERE (COALESCE(status,'ACTIVE') IN ('PAID','ACTIVE'))
          AND "createdAt" >= ${start}
          AND "createdAt" < ${end}
      `;

      if (res && Array.isArray(res) && res.length > 0) {
        // when using $queryRaw with tag, Postgres returns rows
        monthRevenue = Number((res[0] && (res[0].sum ?? res[0].SUM)) || 0);
      } else if (res && res.sum != null) {
        monthRevenue = Number(res.sum);
      }
    } catch {
      // fallback: if payment model exists, try prisma.payment.aggregate with where
      try {
        const agg = await (prisma as any).subscription.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: {
              gte: new Date(date.getFullYear(), date.getMonth(), 1),
              lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
            },
            status: { in: ["PAID", "ACTIVE"] },
          },
        });
        if (agg && agg._sum && agg._sum.amount != null) {
          const val = agg._sum.amount;
          monthRevenue = typeof val === "number" ? val : Number(val?.toString?.() ?? val);
        }
      } catch {
        monthRevenue = 0;
      }
    }

    // users estimation: number of distinct users who made payments this month
    let monthUsers = 0;
    try {
      // Try to count distinct userId in payments
      const usersRes: any = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT("userId")) as count
        FROM "Subscription"
        WHERE (COALESCE(status,'ACTIVE') IN ('PAID','ACTIVE'))
          AND "createdAt" >= ${new Date(date.getFullYear(), date.getMonth(), 1)}
          AND "createdAt" < ${new Date(date.getFullYear(), date.getMonth() + 1, 1)}
      `;
      if (usersRes && Array.isArray(usersRes) && usersRes.length > 0) {
        monthUsers = Number(usersRes[0].count || 0);
      } else if (usersRes && usersRes.count != null) {
        monthUsers = Number(usersRes.count);
      }
    } catch {
      try {
        const distinct = await (prisma as any).subscription.count({
          where: {
            createdAt: {
              gte: new Date(date.getFullYear(), date.getMonth(), 1),
              lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
            },
            status: { in: ["PAID", "ACTIVE"] },
          },
        });
        monthUsers = distinct || 0;
      } catch {
        monthUsers = 0;
      }
    }

    revenueByMonth.push({
      month: monthLabel,
      revenue: Math.floor(monthRevenue),
      users: monthUsers,
    });
  }

  // compute monthlyRevenue as the most recent month in revenueByMonth (or 0)
  const monthlyRevenue = revenueByMonth.length
    ? revenueByMonth[revenueByMonth.length - 1].revenue
    : 0;

  // compute growthRate safely between first and last month (percent change)
  let growthRate = 0;
  if (revenueByMonth.length >= 2) {
    const first = revenueByMonth[0].revenue;
    const last = revenueByMonth[revenueByMonth.length - 1].revenue;
    growthRate = first > 0 ? Math.round(((last - first) / Math.max(1, first)) * 100) : 0;
  }

  // month-over-month growth: compare most recent month to the previous month
  let monthOverMonth = 0;
  if (revenueByMonth.length >= 2) {
    const prev = revenueByMonth[revenueByMonth.length - 2].revenue;
    const last = revenueByMonth[revenueByMonth.length - 1].revenue;
    if (prev > 0) {
      monthOverMonth = Math.round(((last - prev) / Math.max(1, prev)) * 100);
    } else {
      // If previous is zero and last > 0, present 100% to indicate growth from zero; otherwise 0
      monthOverMonth = last > 0 ? 100 : 0;
    }
  }

  // Top templates placeholder: attempt to join payments to wedding pages/templates if relations exist
  let topTemplates: Array<{ id: string; name: string; revenue: number }> = [];
  try {
    // Aggregate by Plan (payments reference planId). If you prefer templates, we need
    // a mapping between payments and wedding pages/templates which doesn't exist on Payment.
    const topRes: any = await prisma.$queryRaw`
        SELECT COALESCE(pl.id, '') as id, COALESCE(pl.name, '') as name, COALESCE(SUM(s.amount),0) as revenue
        FROM "Subscription" s
        LEFT JOIN "Plan" pl ON pl.id = s."planId"
        WHERE COALESCE(s.status,'ACTIVE') IN ('PAID','ACTIVE')
        GROUP BY pl.id, pl.name
        ORDER BY revenue DESC
        LIMIT 5
      `;

    if (Array.isArray(topRes)) {
      topTemplates = topRes.map((r: any) => ({
        id: r.id || "unknown",
        name: r.name || "Unknown",
        revenue: Math.floor(Number(r.revenue ?? 0)),
      }));
    }
  } catch (e) {
    topTemplates = [];
  }

  return new Response(
    JSON.stringify({
      totalRevenue,
      monthlyRevenue,
      revenueByMonth,
      growthRate,
      monthOverMonth,
      topTemplates,
      activeUsers,
    }),
    { status: 200 }
  );
}
