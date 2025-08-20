import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const templateData = [
  {
    name: "Rustic Charm",
    description: "A rustic-themed wedding template with natural elements",
    thumbnail: "/templates/rustic.jpg",
    category: "rustic",
    requiredPlan: "DELIGHT",
    components: [
      {
        type: "rustic_hero",
        content: {
          title: "{brideName} & {groomName}",
          date: "{weddingDate}",
          venue: "{venue}"
        }
      },
      {
        type: "rustic_story",
        content: {
          title: "Our Story",
          text: "From our first meeting to this special day..."
        }
      },
      {
        type: "rustic_gallery",
        content: {
          images: ["/default1.jpg", "/default2.jpg"]
        }
      }
    ],
    colorSchemes: [
      {
        name: "Earth Tones",
        primary: "#8B4513",
        secondary: "#F5DEB3",
        background: "#FFF8DC",
        text: "#333333"
      },
      {
        name: "Forest Greens",
        primary: "#228B22",
        secondary: "#DEB887",
        background: "#F5F5DC",
        text: "#333333"
      }
    ],
    layout_data: {
      sections: [
        {
          id: "hero",
          type: "fullwidth",
          components: ["rustic_hero"]
        },
        {
          id: "content",
          type: "grid",
          columns: 2,
          components: ["rustic_story", "rustic_gallery"]
        }
      ]
    }
  },
  {
    name: "Modern Minimal",
    description: "A modern and minimal wedding template with clean lines",
    thumbnail: "/templates/modern.jpg",
    category: "modern",
    requiredPlan: "DARLING",
    components: [
      {
        type: "modern_hero",
        content: {
          coupleNames: "{brideName} & {groomName}",
          weddingDate: "{weddingDate}",
          location: "{venue}"
        }
      },
      {
        type: "modern_gallery",
        content: {
          images: ["/default1.jpg", "/default2.jpg"]
        }
      },
      {
        type: "modern_story",
        content: {
          title: "Our Journey",
          text: "Share your love story here..."
        }
      }
    ],
    colorSchemes: [
      {
        name: "Monochrome",
        primary: "#333333",
        secondary: "#CCCCCC",
        background: "#FFFFFF",
        text: "#333333"
      },
      {
        name: "Blue Accents",
        primary: "#1E40AF",
        secondary: "#93C5FD",
        background: "#F8FAFC",
        text: "#1F2937"
      }
    ],
    layout_data: {
      sections: [
        {
          id: "header",
          type: "fullwidth",
          components: ["modern_hero"]
        },
        {
          id: "main",
          type: "grid",
          columns: 2,
          components: ["modern_story", "modern_gallery"]
        }
      ]
    }
  },
  {
    name: "Vintage Romance",
    description: "A vintage-inspired wedding template",
    thumbnail: "/templates/vintage.jpg",
    category: "vintage",
    requiredPlan: "DAZZLE",
    components: [
      {
        type: "vintage_hero",
        content: {
          title: "{brideName} & {groomName}",
          date: "{weddingDate}",
          venue: "{venue}"
        }
      },
      {
        type: "vintage_story",
        content: {
          title: "Our Love Story",
          text: "From our first meeting to this special day..."
        }
      },
      {
        type: "vintage_gallery",
        content: {
          images: ["/vintage1.jpg", "/vintage2.jpg"]
        }
      }
    ],
    colorSchemes: [
      {
        name: "Sepia Tones",
        primary: "#8B4513",
        secondary: "#D2B48C",
        background: "#FAF0E6",
        text: "#654321"
      },
      {
        name: "Pastel Romance",
        primary: "#D87093",
        secondary: "#F0E68C",
        background: "#FFF0F5",
        text: "#696969"
      }
    ],
    layout_data: {
      sections: [
        {
          id: "hero-section",
          type: "fullwidth",
          components: ["vintage_hero"]
        },
        {
          id: "content-section",
          type: "grid",
          columns: 2,
          components: ["vintage_story", "vintage_gallery"]
        }
      ]
    }
  },
  {
    name: "Luxury Affair",
    description: "A luxurious wedding template for the elegant couple",
    thumbnail: "/templates/luxury.jpg",
    category: "luxury",
    requiredPlan: "DYNASTY_ROYALE",
    components: [
      {
        type: "luxury_hero",
        content: {
          title: "{brideName} & {groomName}",
          subtitle: "{weddingDate} | Exclusive Resort"
        }
      },
      {
        type: "luxury_story",
        content: {
          title: "Our Story",
          text: "Share your love story here..."
        }
      },
      {
        type: "luxury_gallery",
        content: {
          images: ["/luxury1.jpg", "/luxury2.jpg"]
        }
      }
    ],
    colorSchemes: [
      {
        name: "Gold & Ivory",
        primary: "#FFD700",
        secondary: "#FFFFF0",
        background: "#FAFAD2",
        text: "#333333"
      },
      {
        name: "Royal Purple",
        primary: "#9370DB",
        secondary: "#E6E6FA",
        background: "#F8F8FF",
        text: "#4B0082"
      }
    ],
    layout_data: {
      sections: [
        {
          id: "luxury-hero",
          type: "fullwidth",
          components: ["luxury_hero"]
        },
        {
          id: "luxury-content",
          type: "grid",
          columns: 2,
          components: ["luxury_story", "luxury_gallery"]
        }
      ]
    }
  }
];

const PLAN_IDS = {
  DELIGHT: "plan_delight",
  DARLING: "plan_darling",
  DAZZLE: "plan_dazzle",
  DYNASTY_ROYALE: "plan_dynasty_royale"
};

async function main() {
  console.log("Seeding database...");

  // Create plans
  console.log("Creating plans...");
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { id: PLAN_IDS.DELIGHT },
      update: {
        name: "DELIGHT",
        price: 29.99,
        max_photos: 15,
        max_videos: 1,
        max_tabs:  7,
        duration_days: 30
      },
      create: {
        id: PLAN_IDS.DELIGHT,
        name: "DELIGHT",
        price: 29.99,
        max_photos: 15,
        max_videos: 1,
        max_tabs:  7,
        duration_days: 365
      }
    }),
    prisma.plan.upsert({
      where: { id: PLAN_IDS.DARLING },
      update: {
        name: "DARLING",
        price: 59.99,
        max_photos: 25,
        max_videos: 2,
        max_tabs:  10,
        duration_days: 30
      },
      create: {
        id: PLAN_IDS.DARLING,
        name: "DARLING",
        price: 59.99,
        max_photos: 25,
        max_videos: 2,
        max_tabs:  10,
        duration_days: 30
      }
    }),
    prisma.plan.upsert({
      where: { id: PLAN_IDS.DAZZLE },
      update: {
        name: "DAZZLE",
        price: 99.99,
        max_photos: 50,
        max_videos: 3,
        max_tabs:  15,
        duration_days: 365
      },
      create: {
        id: PLAN_IDS.DAZZLE,
        name: "DAZZLE",
        price: 99.99,
        max_photos: 50,
        max_videos: 3,
        max_tabs:  15,
        duration_days: 365
      }
    }),
    prisma.plan.upsert({
      where: { id: PLAN_IDS.DYNASTY_ROYALE },
      update: {
        name: "DYNASTY_ROYALE",
        price: 199.99,
        max_photos: 100,
        max_videos: 4,
        max_tabs:  17,
        duration_days: 365
      },
      create: {
        id: PLAN_IDS.DYNASTY_ROYALE,
        name: "DYNASTY_ROYALE",
        price: 199.99,
        max_photos: 100,
        max_videos: 4,
        max_tabs:  17,
        duration_days: 365
      }
    })
  ]);

  // Create categories
  console.log("Creating categories...");
  const categories = await Promise.all([
    prisma.templateCategory.upsert({
      where: { name: "rustic" },
      update: {
        description: "Rustic themed templates with natural elements"
      },
      create: {
        name: "rustic",
        description: "Rustic themed templates with natural elements"
      }
    }),
    prisma.templateCategory.upsert({
      where: { name: "modern" },
      update: {
        description: "Modern and minimalistic templates"
      },
      create: {
        name: "modern",
        description: "Modern and minimalistic templates"
      }
    }),
    prisma.templateCategory.upsert({
      where: { name: "vintage" },
      update: {
        description: "Vintage and classic templates"
      },
      create: {
        name: "vintage",
        description: "Vintage and classic templates"
      }
    }),
    prisma.templateCategory.upsert({
      where: { name: "luxury" },
      update: {
        description: "Luxury and premium templates"
      },
      create: {
        name: "luxury",
        description: "Luxury and premium templates"
      }
    })
  ]);

  // Create templates
  console.log("Creating templates...");
  for (const template of templateData) {
    const category = categories.find(c => c.name === template.category);
    if (!category) {
      console.warn(`Category ${template.category} not found for template ${template.name}`);
      continue;
    }

    const plan = plans.find(p => p.name === template.requiredPlan);
    if (!plan) {
      console.warn(`Plan ${template.requiredPlan} not found for template ${template.name}`);
      continue;
    }

    // Create template with all required fields including layout_data
    const createdTemplate = await prisma.template.upsert({
      where: { name: template.name },
      update: {
        description: template.description,
        thumbnail: template.thumbnail,
        categoryId: category.id,
        components: template.components,
        colorSchemes: template.colorSchemes,
        layout_data: template.layout_data
      },
      create: {
        name: template.name,
        description: template.description,
        thumbnail: template.thumbnail,
        categoryId: category.id,
        components: template.components,
        colorSchemes: template.colorSchemes,
        layout_data: template.layout_data
      }
    });

    // Link template to plan
    await prisma.planTemplate.upsert({
      where: {
        planId_templateId: {
          planId: plan.id,
          templateId: createdTemplate.id
        }
      },
      update: {},
      create: {
        planId: plan.id,
        templateId: createdTemplate.id
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });