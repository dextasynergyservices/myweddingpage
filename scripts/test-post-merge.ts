import prisma from "@/lib/prisma";

async function main() {
  const now = Date.now();
  const name = `TEST Imported ${now}`;
  const slug = `test-imported-${now}`;

  console.log("Starting test post-merge upsert for", name);

  const previewData = { sample: true, ts: now } as any;
  const components = { placeholder: true } as any;
  const colorSchemes = { primary: "#000" } as any;

  // Upsert template
  const template = await prisma.template.upsert({
    where: { name },
    update: {
      description: "Test import via local runner",
      thumbnail: "",
      hero_image: null,
      layout_data: {} as any,
      components,
      colorSchemes,
      previewData,
      isActive: true,
    },
    create: {
      name,
      description: "Test import via local runner",
      thumbnail: "",
      hero_image: null,
      categoryId: (await ensureDefaultCategory()).id,
      layout_data: {} as any,
      components,
      colorSchemes,
      previewData,
      isActive: true,
    },
  });

  console.log("Upserted template id:", template.id);

  // Recreate sections
  await prisma.templateSection.deleteMany({ where: { templateId: template.id } });
  const sec = await prisma.templateSection.create({
    data: {
      templateId: template.id,
      type: "HERO",
      layout: "hero_default",
      components: {},
      order: 0,
    },
  });

  console.log("Created section id:", sec.id);

  // No plans in this test, but demonstrate upsert for a dummy plan (only if plan exists)

  const freshTemplate = await prisma.template.findUnique({
    where: { id: template.id },
    include: { sections: true },
  });
  console.log("Template record:", JSON.stringify(freshTemplate, null, 2));
}

async function ensureDefaultCategory() {
  const name = "Imported";
  let cat = await prisma.templateCategory.findUnique({ where: { name } });
  if (!cat) {
    cat = await prisma.templateCategory.create({
      data: { name, description: "Imported templates" },
    });
  }
  return cat;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
