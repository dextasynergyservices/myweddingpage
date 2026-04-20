import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking current template preview data status...\n");

  try {
    // Get all templates with their sections
    const templates = await prisma.template.findMany({
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
        category: true,
      },
    });

    console.log(`Found ${templates.length} templates:\n`);

    for (const template of templates) {
      console.log(`📋 Template: ${template.name}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   Category: ${template.category?.name || "Unknown"}`);
      console.log(`   Sections: ${template.sections.length}`);
      console.log(
        `   Has previewData: ${template.previewData ? "✅ Yes" : "❌ No"}`
      );

      if (template.previewData) {
        const previewData = template.previewData as any;
        console.log(
          `   Preview sections: ${Object.keys(previewData.sections || {}).length}`
        );
        console.log(
          `   Preview brideName: ${previewData.brideName || "Not set"}`
        );
        console.log(
          `   Preview groomName: ${previewData.groomName || "Not set"}`
        );
      }

      console.log(`   Hero image: ${template.hero_image || "None"}`);
      console.log("");
    }

    // Summary
    const templatesWithPreviewData = templates.filter((t) => t.previewData);
    const templatesWithoutPreviewData = templates.filter((t) => !t.previewData);

    console.log("📊 Summary:");
    console.log(`   Total templates: ${templates.length}`);
    console.log(`   With previewData: ${templatesWithPreviewData.length}`);
    console.log(
      `   Without previewData: ${templatesWithoutPreviewData.length}`
    );

    if (templatesWithoutPreviewData.length > 0) {
      console.log("\n❌ Templates missing previewData:");
      templatesWithoutPreviewData.forEach((t) => {
        console.log(`   - ${t.name} (ID: ${t.id})`);
      });
    }
  } catch (error) {
    console.error("❌ Error checking template preview data:", error);
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
