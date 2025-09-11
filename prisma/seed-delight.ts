import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Target plan to associate templates with
  const TARGET_PLAN_ID = "8838eb28-4dde-4847-a821-fd6a92edc7e7";

  const plan = await prisma.plan.findUnique({ where: { id: TARGET_PLAN_ID } });
  if (!plan) {
    console.warn(
      `Plan with id ${TARGET_PLAN_ID} not found. Sections will still be seeded, but templates won't be linked to a plan.`
    );
  }
  // Map template names to default sections and layouts
  const defaults: Record<string, Array<{ type: string; layout: string; components: any }>> = {
    Rustic: [
      {
        type: "HERO",
        layout: "rustic_hero",
        components: {
          title: "{groomName} & {brideName}",
          subtitle: "{weddingDate}",
          venue: "{venue}",
        },
      },
      {
        type: "STORY",
        layout: "rustic_story",
        components: { title: "Our Story", text: "{welcomeMessage}", content: "{welcomeMessage}" },
      },
      { type: "GALLERY", layout: "rustic_gallery", components: { images: [] } },
      { type: "REGISTRY", layout: "rustic_gift", components: { content: "Browse our registry" } },
      { type: "WISHES", layout: "rustic_guest", components: { content: "Leave your wishes" } },
    ],
    Vintage: [
      {
        type: "HERO",
        layout: "vintage_hero",
        components: {
          title: "{groomName} & {brideName}",
          subtitle: "{weddingDate}",
          venue: "{venue}",
        },
      },
      {
        type: "STORY",
        layout: "vintage_story",
        components: { title: "Our Story", text: "{welcomeMessage}", content: "{welcomeMessage}" },
      },
      { type: "GALLERY", layout: "vintage_gallery", components: { images: [] } },
      { type: "REGISTRY", layout: "vintage_gift", components: { content: "Browse our registry" } },
      { type: "WISHES", layout: "vintage_guest", components: { content: "Leave your wishes" } },
    ],
  };

  const templates = await prisma.template.findMany({
    include: { sections: true, category: true },
  });

  // Ensure at least three plan-linked templates exist with distinct layouts
  async function ensureCategory(name: string) {
    const existing = await prisma.templateCategory.findFirst({ where: { name } });
    if (existing) return existing.id;
    const created = await prisma.templateCategory.create({
      data: { name, description: `${name} templates` },
    });
    return created.id;
  }

  async function createTemplateWithSections(
    name: string,
    description: string,
    thumbnail: string,
    categoryName: string,
    presetKey: keyof typeof defaults
  ) {
    const categoryId = await ensureCategory(categoryName);
    // Avoid duplicate template names (unique constraint)
    let created = await prisma.template.findUnique({ where: { name } });
    if (!created) {
      created = await prisma.template.create({
        data: {
          name,
          description,
          thumbnail,
          categoryId,
          layout_data: {},
          components: {},
          colorSchemes: [],
        },
      });
    }

    const existingSections = await prisma.templateSection.findMany({
      where: { templateId: created.id },
    });
    if (existingSections.length === 0) {
      let order = 1;
      for (const def of defaults[presetKey]) {
        await prisma.templateSection.create({
          data: {
            templateId: created.id,
            type: def.type as any,
            layout: def.layout,
            components: def.components,
            order: order++,
          },
        });
      }
    }

    if (plan) {
      await prisma.planTemplate.create({
        data: { planId: TARGET_PLAN_ID, templateId: created.id },
      });
    }

    return created;
  }

  if (plan) {
    // Count templates already linked to the target plan
    const linked = await prisma.planTemplate.findMany({
      where: { planId: TARGET_PLAN_ID },
      include: { template: { include: { sections: true } } },
    });

    if (linked.length < 3) {
      let needed = 3 - linked.length;
      const presets: Array<{
        name: string;
        desc: string;
        thumb: string;
        cat: string;
        key: keyof typeof defaults;
      }> = [
        {
          name: "Rustic Elegance",
          desc: "Warm, earthy rustic style",
          thumb: "/templates/rustic.jpg",
          cat: "rustic",
          key: "Rustic",
        },
        {
          name: "Modern Minimal",
          desc: "Clean modern aesthetic",
          thumb: "/templates/modern.jpg",
          cat: "modern",
          key: "Modern",
        },
        {
          name: "Vintage Charm",
          desc: "Classic vintage theme",
          thumb: "/templates/vintage.jpg",
          cat: "vintage",
          key: "Vintage",
        },
      ];

      // Create up to 'needed' templates based on presets not already present
      for (const preset of presets) {
        if (linked.find((l: any) => l.template.name === preset.name)) continue;
        await createTemplateWithSections(
          preset.name,
          preset.desc,
          preset.thumb,
          preset.cat,
          preset.key
        );
        if (--needed <= 0) break;
      }
    }
  }

  for (const tpl of templates) {
    if (tpl.sections.length > 0) continue;

    const key =
      Object.keys(defaults).find((k) => tpl.name.toLowerCase().includes(k.toLowerCase())) ||
      "Modern";
    const items = defaults[key];

    console.log(`Seeding sections for template ${tpl.name} using preset ${key}`);

    let order = 1;
    for (const def of items) {
      await prisma.templateSection.create({
        data: {
          templateId: tpl.id,
          type: def.type as any,
          layout: def.layout,
          components: def.components,
          order: order++,
        },
      });
    }

    // Link template to the target plan if provided and not already linked
    if (plan) {
      const alreadyLinked = await prisma.planTemplate.findFirst({
        where: { planId: TARGET_PLAN_ID, templateId: tpl.id },
      });
      if (!alreadyLinked) {
        await prisma.planTemplate.create({
          data: {
            planId: TARGET_PLAN_ID,
            templateId: tpl.id,
          },
        });
        console.log(`Linked template ${tpl.name} to plan ${plan.name}`);
      }
    }
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
