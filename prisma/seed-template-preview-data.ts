import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed template preview data...");

  try {
    // Get all templates with their sections
    const templates = await prisma.template.findMany({
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    console.log(`Found ${templates.length} templates to process`);

    for (const template of templates) {
      console.log(`\nProcessing template: ${template.name} (ID: ${template.id})`);

      // Create previewData from template sections
      const previewData = {
        // Basic template info
        templateId: template.id,
        templateName: template.name,
        category: template.category?.name || "Unknown",

        // Sample data for preview
        brideName: "Sarah",
        groomName: "Michael",
        weddingDate: "2024-06-15",
        venue: "Grand Ballroom",
        welcomeMessage: "Join us as we celebrate our special day!",

        // Hero image for preview
        heroImage: template.hero_image || null,

        // Story image for preview
        storyImage: "/default-story.jpg",

        // Gallery images for preview
        gallery: ["/preview-gallery-1.jpg", "/preview-gallery-2.jpg", "/preview-gallery-3.jpg"],

        // Sample gifts for preview
        gifts: [
          {
            id: "preview-gift-1",
            name: "Honeymoon Fund",
            description: "Help us create memories",
            price: 100,
            image: "/preview-gift-1.jpg",
          },
          {
            id: "preview-gift-2",
            name: "Dinner for Two",
            description: "A romantic dinner",
            price: 150,
            image: "/preview-gift-2.jpg",
          },
        ],

        // Sample guest messages for preview
        guests: [
          {
            id: "preview-guest-1",
            name: "Emma Johnson",
            message: "So happy for you both! Can't wait to celebrate!",
            created_at: new Date().toISOString(),
          },
          {
            id: "preview-guest-2",
            name: "David Smith",
            message: "Congratulations! Wishing you a lifetime of happiness.",
            created_at: new Date().toISOString(),
          },
        ],

        // Bank details for preview
        bankDetails: [
          {
            id: "preview-bank-1",
            bankName: "Sample Bank",
            accountName: "Sarah & Michael",
            accountNumber: "1234567890",
          },
        ],

        // Sections data from template sections
        sections: template.sections.reduce(
          (acc, section) => {
            acc[section.id] = {
              type: section.type,
              layout: section.layout,
              components: section.components,
              order: section.order,
            };
            return acc;
          },
          {} as Record<string, any>
        ),
      };

      // Update the template with previewData
      await prisma.template.update({
        where: { id: template.id },
        data: {
          previewData: previewData,
        },
      });

      console.log(`✅ Updated ${template.name} with preview data`);
      console.log(`   - ${template.sections.length} sections included`);
      console.log(`   - Hero image: ${previewData.heroImage || "None"}`);
    }

    console.log("\n🎉 Successfully seeded template preview data for all templates!");
  } catch (error) {
    console.error("❌ Error seeding template preview data:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
