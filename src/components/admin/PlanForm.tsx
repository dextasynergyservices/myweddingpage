"use client";

import { useState } from "react";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import toast from "react-hot-toast";

interface Plan {
  id?: string;
  name?: string;
  price?: number | string;
  duration_days?: number;
  max_photos?: number;
  max_videos?: number;
  max_tabs?: number;
  popular?: boolean;
  prints?: string;
  [key: string]: unknown;
}

interface Props {
  initial?: Plan;
  onSaved?: (plan: Plan | null) => void;
}

export default function PlanForm({ initial = {}, onSaved }: Props) {
  const { token: csrfToken } = useCSRFToken();
  const [name, setName] = useState(initial.name || "");
  const [price, setPrice] = useState(
    initial.price ? String(initial.price) : "0.00"
  );
  const [duration_days, setDurationDays] = useState(
    initial.duration_days ?? 30
  );
  const [max_photos, setMaxPhotos] = useState(initial.max_photos ?? 100);
  const [max_videos, setMaxVideos] = useState(initial.max_videos ?? 10);
  const [max_tabs, setMaxTabs] = useState(initial.max_tabs ?? 5);
  const [popular, setPopular] = useState(Boolean(initial.popular));
  const [prints, setPrints] = useState(initial.prints ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Plan = {
        name,
        price: price,
        duration_days: Number(duration_days),
        max_photos: Number(max_photos),
        max_videos: Number(max_videos),
        max_tabs: Number(max_tabs),
        popular,
        prints,
      };

      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id
        ? `/api/admin/plans/${initial.id}`
        : "/api/admin/plans";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (res.ok) {
        toast.success("Plan saved");
        onSaved?.(json?.plan ?? null);
      } else {
        const message = json?.error || json?.message || "Failed to save plan";
        toast.error(message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white border rounded-lg p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3"
            aria-required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            disabled={loading}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3"
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium">Duration (days)</label>
          <input
            disabled={loading}
            type="number"
            value={String(duration_days)}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Max photos</label>
          <input
            disabled={loading}
            type="number"
            value={String(max_photos)}
            onChange={(e) => setMaxPhotos(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Max videos</label>
          <input
            disabled={loading}
            type="number"
            value={String(max_videos)}
            onChange={(e) => setMaxVideos(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Max tabs</label>
          <input
            disabled={loading}
            type="number"
            value={String(max_tabs)}
            onChange={(e) => setMaxTabs(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Prints</label>
          <input
            disabled={loading}
            value={prints}
            onChange={(e) => setPrints(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-transparent py-2 px-3"
            placeholder="e.g., Up to 100 Cards & 200 Programmes"
            maxLength={500}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="popular"
            type="checkbox"
            disabled={loading}
            checked={popular}
            onChange={(e) => setPopular(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="popular" className="text-sm">
            Popular
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          aria-busy={loading}
          aria-disabled={loading}
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded bg-[#ab862b] px-4 py-2 text-white"
        >
          {loading ? "Saving..." : "Save plan"}
        </button>
      </div>
    </form>
  );
}
