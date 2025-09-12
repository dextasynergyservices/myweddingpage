import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up old templates...");

  try {
    // List of old template names to remove
    const oldTemplateNames = ["Rustic", "Modern", "Vintage", "Luxury"];

    // Delete old templates and their related data
    for (const templateName of oldTemplateNames) {
      console.log(`  🗑️  Deleting template: ${templateName}`);

      // Find the template
      const template = await prisma.template.findUnique({
        where: { name: templateName },
        include: {
          sections: true,
          planTemplate: true,
          userTemplates: true,
          weddingPages: true,
        },
      });

      if (template) {
        console.log(
          `    Found template with ${template.sections.length} sections, ${template.planTemplate.length} plan links, ${template.userTemplates.length} user templates, ${template.weddingPages.length} wedding pages`
        );

        // Delete related data first (due to foreign key constraints)
        await prisma.templateSection.deleteMany({
          where: { templateId: template.id },
        });

        await prisma.planTemplate.deleteMany({
          where: { templateId: template.id },
        });

        await prisma.userTemplate.deleteMany({
          where: { templateId: template.id },
        });

        // Note: We won't delete wedding pages as they might contain user data
        // Just unlink them from the template
        await prisma.weddingPage.updateMany({
          where: { templateId: template.id },
          data: { templateId: null },
        });

        // Finally delete the template
        await prisma.template.delete({
          where: { id: template.id },
        });

        console.log(`    ✅ Deleted template: ${templateName}`);
      } else {
        console.log(`    ⚠️  Template not found: ${templateName}`);
      }
    }

    console.log("\n🎉 Old templates cleanup completed!");

    // List remaining templates
    const remainingTemplates = await prisma.template.findMany({
      select: { name: true, id: true },
    });

    console.log("\n📋 Remaining templates:");
    remainingTemplates.forEach((template) => {
      console.log(`  - ${template.name} (${template.id})`);
    });
  } catch (error) {
    console.error("❌ Error cleaning up old templates:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
