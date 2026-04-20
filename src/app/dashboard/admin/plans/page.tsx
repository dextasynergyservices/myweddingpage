"use client";

import { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import toast from "react-hot-toast";
// Plan type for basic plan fields used in this view
type Plan = {
  id: string;
  name?: string;
  price?: number | string;
  [key: string]: unknown;
};
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

export default function PlansPage() {
  const { isDarkMode } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/plans", { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          setPlans(j.plans || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Plans
        </h1>
        <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Manage subscription plans
        </p>
      </div>

      <div className="flex justify-end">
        <Link href="/dashboard/admin/plans/new" className="btn-primary">
          Create plan
        </Link>
        <Link href="/dashboard/admin/plans/audit" className="ml-2 btn-secondary">
          Audit
        </Link>
      </div>

      <div className="grid gap-4">
        {plans.map((p) => (
          <PlanListItem
            key={p.id}
            plan={p}
            onDeleted={() => setPlans((s) => s.filter((x) => x.id !== p.id))}
          />
        ))}
      </div>
    </div>
  );
}

function PlanListItem({ plan, onDeleted }: { plan: Plan; onDeleted?: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = await res.json();
      if (res.ok && j.success) {
        toast.success("Plan deleted");
        onDeleted?.();
      } else {
        toast.error(j?.error || "Failed to delete plan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    } finally {
      setDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="rounded border p-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <p className="text-sm text-gray-500">Price: {String(plan.price)}</p>
      </div>
      <div className="flex gap-2">
        <Link href={`/dashboard/admin/plans/${plan.id}`} className="btn-secondary">
          Edit
        </Link>
        <button onClick={() => setIsOpen(true)} disabled={deleting} className="btn-danger">
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={doDelete}
        title={`Delete plan '${plan.name}'`}
        message={`Are you sure you want to delete the plan '${plan.name}'? This action cannot be undone.`}
      />
    </div>
  );
}
