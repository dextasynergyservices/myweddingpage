import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ✅ Seed Plans
  // await prisma.plan.createMany({
  //   data: [
  //     {
  //       name: "Delight",
  //       price: 100.0,
  //       duration_days: 30,
  //       max_photos: 15,
  //       max_videos: 1,
  //       max_tabs: 3,
  //     },
  //     {
  //       name: "Darling",
  //       price: 150.0,
  //       duration_days: 30,
  //       max_photos: 25,
  //       max_videos: 2,
  //       max_tabs: 5,
  //     },
  //     {
  //       name: "Dazzle",
  //       price: 250.0,
  //       duration_days: 60,
  //       max_photos: 50,
  //       max_videos: 3,
  //       max_tabs: 5,
  //     },
  //     {
  //       name: "Dynasty Royale",
  //       price: 500.0,
  //       duration_days: 365,
  //       max_photos: 100,
  //       max_videos: 4,
  //       max_tabs: 5,
  //     },
  //   ],
  //   skipDuplicates: true,
  // });
  // console.log("✅ Plans seeded.");

  // ✅ Seed Templates
  // await prisma.template.createMany({
  //   data: [
  //     {
  //       name: "Classic Elegance",
  //       description: "A timeless, elegant wedding page design.",
  //       thumbnail_url: "https://example.com/classic-elegance.jpg",
  //       layout_data: {},
  //     },
  //     {
  //       name: "Rustic Charm",
  //       description: "Warm, rustic vibes for your special day.",
  //       thumbnail_url: "https://example.com/rustic-charm.jpg",
  //       layout_data: {},
  //     },
  //   ],
  //   skipDuplicates: true,
  // });
  // console.log("✅ Templates seeded.");

  // ✅ Seed Templates - FIX field names and add required fields
  await prisma.template.createMany({
    data: [
      {
        name: "Classic Elegance",
        description: "A timeless, elegant wedding page design.",
        thumbnail: "https://example.com/classic-elegance.jpg",
        layout_data: {},
        categoryId: category.id,
        components: [],
        colorSchemes: []
      },
      {
        name: "Rustic Charm",
        description: "Warm, rustic vibes for your special day.",
        thumbnail: "https://example.com/rustic-charm.jpg",
        layout_data: {},
        categoryId: category.id,
        components: [],
        colorSchemes: []
      },
    ],
    skipDuplicates: true,
  });
  console.log("Templates seeded.");

  // ✅ Admin User - FIX: Your User model doesn't have 'name' field
  const hashedPassword = await bcrypt.hash("AdminPassword123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@myweddingpage.online" },
    update: {},
    create: {
      email: "admin@myweddingpage.online",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      // Your User model doesn't have 'name' field, so remove it
      // Add other fields your User model requires
    },
  });
  console.log("Admin User seeded.");

  // ✅ Fetch admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@myweddingpage.online" },
  });
  const template = await prisma.template.findUnique({
    where: { name: "Classic Elegance" },
  });

  if (!adminUser || !template) {
    throw new Error("Could not find required User or Template for WeddingPage seed.");
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

  console.log("WeddingPage seeded.");

  // ✅ Use CORRECT plan IDs
  const delightPlanId = "plan_delight";
  const darlingPlanId = "plan_darling";
  const dazzlePlanId = "plan_dazzle";
  const dynastyRoyalePlanId = "plan_dynasty_royale";

  // ✅ ADD skipDuplicates: true to avoid duplicate errors
  await prisma.planRenewalOption.createMany({
    skipDuplicates: true,
    data: [
      // Delight Plan
      { planId: delightPlanId, duration: 30, price: 10 },
      { planId: delightPlanId, duration: 90, price: 25 },
      { planId: delightPlanId, duration: 365, price: 90 },

      // Darling Plan
      { planId: darlingPlanId, duration: 30, price: 20 },
      { planId: darlingPlanId, duration: 90, price: 50 },
      { planId: darlingPlanId, duration: 365, price: 180 },

      // Dazzle Plan
      { planId: dazzlePlanId, duration: 30, price: 30 },
      { planId: dazzlePlanId, duration: 90, price: 100 },
      { planId: dazzlePlanId, duration: 365, price: 360 },

      // Dynasty Royale Plan
      { planId: dynastyRoyalePlanId, duration: 30, price: 60 },
      { planId: dynastyRoyalePlanId, duration: 90, price: 200 },
      { planId: dynastyRoyalePlanId, duration: 365, price: 720 },
    ],
  });

  console.log("Plan renewal options seeded");
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });