import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ✅ Seed Plans
  await prisma.plan.createMany({
    data: [
      {
        name: "Delight",
        price: 100.0,
        duration_days: 30,
        max_photos: 15,
        max_videos: 1,
        max_tabs: 3,
      },
      {
        name: "Darling",
        price: 150.0,
        duration_days: 30,
        max_photos: 25,
        max_videos: 2,
        max_tabs: 5,
      },
      {
        name: "Dazzle",
        price: 250.0,
        duration_days: 60,
        max_photos: 50,
        max_videos: 3,
        max_tabs: 5,
      },
      {
        name: "Dynasty Royale",
        price: 500.0,
        duration_days: 365,
        max_photos: 100,
        max_videos: 4,
        max_tabs: 5,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Plans seeded.");

  // ✅ Seed Templates
  await prisma.template.createMany({
    data: [
      {
        name: "Classic Elegance",
        description: "A timeless, elegant wedding page design.",
        thumbnail_url: "https://example.com/classic-elegance.jpg",
        layout_data: {},
      },
      {
        name: "Rustic Charm",
        description: "Warm, rustic vibes for your special day.",
        thumbnail_url: "https://example.com/rustic-charm.jpg",
        layout_data: {},
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Templates seeded.");

  // ✅ Admin User
  const hashedPassword = await bcrypt.hash("AdminPassword123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@myweddingpage.online" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@myweddingpage.online",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin User seeded.");

  // ✅ Fetch IDs to use in weddingPage creation
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@myweddingpage.online" },
  });

  const template = await prisma.template.findUnique({
    where: { name: "Classic Elegance" }, // You must have made this name @unique in schema
  });

  if (!adminUser || !template) {
    throw new Error("❌ Could not find required User or Template for WeddingPage seed.");
  }

  // ✅ Seed WeddingPage
  await prisma.weddingPage.upsert({
    where: {
      slug: "john-and-jane",
    },
    update: {},
    create: {
      slug: "john-and-jane",
      title: "John & Jane's Wedding",
      is_live: true,
      created_by_admin: true,
      userId: adminUser.id,
      templateId: template.id,
    },
  });

  console.log("✅ WeddingPage seeded.");

  console.log("🌱 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
