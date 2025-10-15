"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter, useParams } from "next/navigation";
import PlanForm from "@/components/admin/PlanForm";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

type Plan = { id: string; name?: string; price?: number | string; [key: string]: unknown };

export default function EditPlanPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/admin/plans/${id}`, { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          setPlan(j.plan || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!plan) return <div>Plan not found</div>;

  return (
    <div>
      <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        Edit Plan
      </h1>
      <div className="mt-4">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <PlanForm initial={plan} onSaved={() => router.push("/dashboard/admin/plans")} />
          </div>
          <div className="w-56">
            <div className="rounded border p-4">
              <h3 className="font-semibold">Danger zone</h3>
              <p className="text-sm text-gray-500 mt-2">
                Delete this plan. This action is irreversible if allowed.
              </p>
              <DeletePlanWidget onOpenDelete={() => setIsDeleteOpen(true)} deleting={deleting} />
            </div>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          setDeleting(true);
          try {
            const res = await fetch(`/api/admin/plans/${plan.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            const j = await res.json();
            if (res.ok && j.success) {
              toast.success("Plan deleted");
              router.push("/dashboard/admin/plans");
            } else {
              toast.error(j?.error || "Failed to delete plan");
            }
          } catch (err) {
            console.error(err);
            toast.error("Failed to delete plan");
          } finally {
            setDeleting(false);
            setIsDeleteOpen(false);
          }
        }}
        title={`Delete plan '${plan.name}'`}
        message={`Are you sure you want to delete the plan '${plan.name}'? This action cannot be undone.`}
      />
    </div>
  );
}

function DeletePlanWidget({
  onOpenDelete,
  deleting,
}: {
  onOpenDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="mt-4">
      <button
        onClick={() => onOpenDelete?.()}
        disabled={deleting}
        className="w-full rounded bg-red-600 px-3 py-2 text-white"
      >
        {deleting ? "Deleting..." : "Delete plan"}
      </button>
    </div>
  );
}
