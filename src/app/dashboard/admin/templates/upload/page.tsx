import UploadClient from "./UploadClient";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export default async function TemplateUploadPage() {
  // Fetch plans and categories server-side to avoid client-side flash
  const plansData = await prisma.plan.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const categoriesData = await prisma.templateCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const plans = plansData.map((p) => ({ id: p.id, name: p.name }));
  const categories = categoriesData.map((c) => ({ id: c.id, name: c.name }));

  return <UploadClient initialPlans={plans} initialCategories={categories} />;
}
