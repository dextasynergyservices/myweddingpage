import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// Task Category data
const taskCategoriesData = [
  {
    name: "Venue",
    color: "#3B82F6", // Blue
    icon: "MapPin",
  },
  {
    name: "Sound",
    color: "#10B981", // Green
    icon: "Volume2",
  },
  {
    name: "Flowers",
    color: "#F59E0B", // Amber
    icon: "Flower2",
  },
];

// Task Priority data
const taskPrioritiesData = [
  {
    name: "Low",
    level: 1,
    color: "#6B7280", // Gray
  },
  {
    name: "Medium",
    level: 2,
    color: "#F59E0B", // Amber
  },
  {
    name: "High",
    level: 3,
    color: "#EF4444", // Red
  },
];

async function main() {
  console.log("Seeding Task Categories and Priorities...");

  // Seed Task Categories
  console.log("Creating Task Categories...");
  const taskCategories = await Promise.all(
    taskCategoriesData.map((category) =>
      prisma.taskCategory.upsert({
        where: { id: category.name },
        update: {
          color: category.color,
          icon: category.icon,
        },
        create: {
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
      })
    )
  );

  // Seed Task Priorities
  console.log("Creating Task Priorities...");
  const taskPriorities = await Promise.all(
    taskPrioritiesData.map((priority) =>
      prisma.taskPriority.upsert({
        where: { id: priority.name },
        update: {
          level: priority.level,
          color: priority.color,
        },
        create: {
          name: priority.name,
          level: priority.level,
          color: priority.color,
        },
      })
    )
  );

  console.log("✅ Successfully seeded Task Categories and Priorities!");
  console.log(`📁 Created ${taskCategories.length} Task Categories:`, taskCategories.map(c => c.name));
  console.log(`📊 Created ${taskPriorities.length} Task Priorities:`, taskPriorities.map(p => `${p.name} (Level ${p.level})`));
}

main()
  .catch((e) => {
    console.error("❌ Error seeding Task Categories and Priorities:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


