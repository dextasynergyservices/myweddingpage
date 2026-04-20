"use client";

import PlanForm from "@/components/admin/PlanForm";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";

export default function NewPlanPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  return (
    <div>
      <h1
        className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        Create Plan
      </h1>
      <div className="mt-4">
        <PlanForm onSaved={() => router.push("/dashboard/admin/plans")} />
      </div>
    </div>
  );
}
