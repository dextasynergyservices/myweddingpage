import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database..."); // Remove all console.log during production

  // Seed Plans
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

  // Seed Templates (optional starter data)
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

  console.log("🌱 Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
