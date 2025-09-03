import { PrismaClient } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const categories = [
    { name: "Classic", description: "Traditional and elegant designs" },
    { name: "Modern", description: "Clean and contemporary designs" },
    { name: "Vintage", description: "Romantic and nostalgic designs" },
    { name: "Luxury", description: "Opulent and premium designs" },
  ];

  for (const category of categories) {
    await prisma.templateCategory.upsert({
      where: { name: category.name },
      update: category,
      create: { ...category, id: uuidv4() },
    });
    console.log(`Upserted category with name: ${category.name}`);
  }

  const templateData = [
    // ===== CLASSIC/RUSTIC TEMPLATE =====
    {
      name: "Rustic Elegance",
      description: "A timeless and classic wedding template.",
      thumbnail: "/templates/classic.jpg",
      categoryName: "Classic",
      layout_data: {},
      components: [
        {
          type: "rustic_hero",
          content: {
            title: "{brideName} & {groomName}",
            date: "{weddingDate}",
            venue: "Grand Ballroom",
            welcomeMessage: "{welcomeMessage}",
          },
        },
        {
          type: "rustic_story",
          content: {
            title: "Our Story",
            text: "From our first meeting to this special day...",
            imageUrl: "{ourStory.imageUrl}",
          },
        },
        {
          type: "rustic_gallery",
          content: {
            images: ["/default1.jpg", "/default2.jpg", "/default3.jpg"],
          },
        },
        {
          type: "rustic_guest",
          content: {
            title: "Guest Information",
            message: "We can't wait to celebrate with you!",
          },
        },
        {
          type: "rustic_gift",
          content: {
            title: "Gift Registry",
            message: "Your presence is the greatest gift, but if you wish to honor us with something more...",
          },
        },
      ],
      colorSchemes: [
        {
          name: "Default",
          primary: "#d4af37",
          secondary: "#8b4513",
          background: "#fdf6e3",
          text: "#333",
        },
      ],
      isActive: true,
    },

    // ===== MODERN TEMPLATE =====
    {
      name: "Modern Minimal",
      description: "A clean and contemporary wedding template.",
      thumbnail: "/templates/modern.jpg",
      categoryName: "Modern",
      layout_data: {},
      components: [
        {
          type: "modern_hero",
          content: {
            coupleNames: "{brideName} & {groomName}",
            weddingDate: "{weddingDate}",
            location: "City Venue",
            welcomeMessage: "{welcomeMessage}",
          },
        },
        {
          type: "modern_story",
          content: {
            title: "Our Journey",
            text: "Our love story began with a simple hello...",
            imageUrl: "{ourStory.imageUrl}",
          },
        },
        {
          type: "modern_gallery",
          content: {
            images: ["/modern1.jpg", "/modern2.jpg", "/modern3.jpg"],
          },
        },
        {
          type: "modern_guest",
          content: {
            title: "Join Our Celebration",
            message: "Your presence would mean the world to us",
          },
        },
        {
          type: "modern_gift",
          content: {
            title: "Our Wishes",
            message: "We're grateful for your love and support",
          },
        },
      ],
      colorSchemes: [
        {
          name: "Default",
          primary: "#333",
          secondary: "#666",
          background: "#fff",
          text: "#222",
        },
        {
          name: "Midnight",
          primary: "#2c3e50",
          secondary: "#34495e",
          background: "#ecf0f1",
          text: "#2c3e50",
        },
      ],
      isActive: true,
    },

    // ===== VINTAGE TEMPLATE =====
    {
      name: "Vintage Romance",
      description: "A romantic and nostalgic wedding template.",
      thumbnail: "/templates/vintage.jpg",
      categoryName: "Vintage",
      layout_data: {},
      components: [
        {
          type: "vintage_hero",
          content: {
            title: "{brideName} & {groomName}",
            date: "{weddingDate}",
            location: "Garden Estate",
            welcomeMessage: "{welcomeMessage}",
          },
        },
        {
          type: "vintage_story",
          content: {
            title: "Our Love Story",
            text: "A timeless romance written in the stars...",
            imageUrl: "{ourStory.imageUrl}",
          },
        },
        {
          type: "vintage_gallery",
          content: {
            images: ["/vintage1.jpg", "/vintage2.jpg", "/vintage3.jpg"],
          },
        },
        {
          type: "vintage_guest",
          content: {
            title: "Guest Details",
            message: "Join us for an unforgettable celebration",
          },
        },
        {
          type: "vintage_gift",
          content: {
            title: "Gift Preferences",
            message: "Your love and blessings are our greatest gifts",
          },
        },
      ],
      colorSchemes: [
        {
          name: "Vintage Rose",
          primary: "#c44569",
          secondary: "#e66767",
          background: "#f8a5c2",
          text: "#2d3436",
        },
        {
          name: "Sepia Tone",
          primary: "#8b4513",
          secondary: "#a0522d",
          background: "#f5deb3",
          text: "#654321",
        },
      ],
      isActive: true,
    },

    // ===== LUXURY TEMPLATE =====
    {
      name: "Luxury Affair",
      description: "An opulent and premium wedding template.",
      thumbnail: "/templates/luxury.jpg",
      categoryName: "Luxury",
      layout_data: {},
      components: [
        {
          type: "luxury_hero",
          content: {
            title: "{brideName} & {groomName}",
            date: "{weddingDate}",
            venue: "Exclusive Resort",
            welcomeMessage: "{welcomeMessage}",
          },
        },
        {
          type: "luxury_story",
          content: {
            title: "Our Fairytale",
            text: "A story of love, luxury, and forever...",
            imageUrl: "{ourStory.imageUrl}",
          },
        },
        {
          type: "luxury_gallery",
          content: {
            images: ["/luxury1.jpg", "/luxury2.jpg", "/luxury3.jpg"],
          },
        },
        {
          type: "luxury_guest",
          content: {
            title: "Guest Accommodations",
            message: "We've arranged everything for your comfort",
          },
        },
        {
          type: "luxury_gift",
          content: {
            title: "Registry",
            message: "Your presence is the greatest present",
          },
        },
      ],
      colorSchemes: [
        {
          name: "Gold Luxury",
          primary: "#d4af37",
          secondary: "#ffd700",
          background: "#fffaf0",
          text: "#2c3e50",
        },
        {
          name: "Royal Purple",
          primary: "#6c5ce7",
          secondary: "#a29bfe",
          background: "#dfe6e9",
          text: "#2d3436",
        },
      ],
      isActive: true,
    },
  ];

  for (const t of templateData) {
    const template = await prisma.template.upsert({
      where: { name: t.name },
      update: {
        description: t.description,
        thumbnail: t.thumbnail,
        layout_data: t.layout_data,
        components: t.components,
        colorSchemes: t.colorSchemes,
        isActive: t.isActive,
        category: {
          connect: { name: t.categoryName },
        },
      },
      create: {
        id: uuidv4(),
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        layout_data: t.layout_data,
        components: t.components,
        colorSchemes: t.colorSchemes,
        isActive: t.isActive,
        category: {
          connect: { name: t.categoryName },
        },
      },
    });

    console.log(`Upserted template with name: ${template.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });