import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Inspecting recent LOGIN_SUCCESS security logs...");

  const recent = await prisma.securityLog.findMany({
    where: { eventType: "LOGIN_SUCCESS" },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  console.log(`Found ${recent.length} recent LOGIN_SUCCESS events`);
  if (recent.length > 0) {
    console.log(JSON.stringify(recent.slice(0, 20), null, 2));
  }

  const counts = await prisma.securityLog.groupBy({
    by: ["userId"],
    where: { eventType: "LOGIN_SUCCESS" },
    _count: { userId: true },
    orderBy: { _count: { userId: "desc" } },
    take: 50,
  });

  console.log("Top users by LOGIN_SUCCESS count:");
  console.log(JSON.stringify(counts, null, 2));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
