"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import toast from "react-hot-toast";
import Image from "next/image";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";

type TemplateItem = {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string | null;
};

export default function ThumbnailsAdminPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/templates/thumbnails");
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      setTemplates(json.templates || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onFile = async (tId: string, f: File | null) => {
    if (!f) return;
    setLoadingId(tId);
    setStatusMap((s) => ({ ...s, [tId]: "idle" }));
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("uploadType", "hero");
      const upRes = await fetch("/api/upload-image", {
        method: "POST",
        body: fd,
      });
      if (!upRes.ok) throw new Error("upload failed");
      const upJson = await upRes.json();
      const url = upJson?.secure_url || upJson?.url;
      const publicId = upJson?.publicId || upJson?.public_id || null;
      if (!url) throw new Error("no url returned");

      let csrfToken: string | null = null;
      try {
        const t = await fetch("/api/csrf-token", {
          method: "GET",
          credentials: "include",
        });
        if (t.ok) {
          const j = await t.json();
          csrfToken = j?.csrfToken || null;
        }
      } catch {}

      const saveRes = await fetch("/api/admin/templates/thumbnail", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({ id: tId, thumbnailUrl: url, publicId }),
      });
      if (!saveRes.ok) throw new Error("save failed");
      toast.success("Thumbnail updated");
      setStatusMap((s) => ({ ...s, [tId]: "success" }));
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to upload thumbnail");
      setStatusMap((s) => ({ ...s, [tId]: "error" }));
    } finally {
      setLoadingId(null);
    }
  };

  const clearThumb = async (tId: string | null) => {
    if (!tId) return;
    setLoadingId(tId);
    setStatusMap((s) => ({ ...s, [tId]: "idle" }));
    try {
      let csrfToken: string | null = null;
      try {
        const t = await fetch("/api/csrf-token", {
          method: "GET",
          credentials: "include",
        });
        if (t.ok) {
          const j = await t.json();
          csrfToken = j?.csrfToken || null;
        }
      } catch {}

      const res = await fetch("/api/admin/templates/thumbnail", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({ id: tId }),
      });
      if (!res.ok) throw new Error("clear failed");
      const json = await res.json().catch(() => null);
      const remoteDeletion = json?.remoteDeletion || null;
      if (remoteDeletion?.attempted) {
        if (remoteDeletion.success) {
          setStatusMap((s) => ({ ...s, [tId]: "success-remote" }));
          toast.success("Cleared (remote deletion succeeded)");
        } else {
          setStatusMap((s) => ({ ...s, [tId]: "pending-remote" }));
          toast.success("Cleared (remote deletion pending; will retry)");
        }
      } else {
        setStatusMap((s) => ({ ...s, [tId]: "success" }));
        toast.success("Cleared");
      }
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to clear thumbnail");
      setStatusMap((s) => ({ ...s, [tId]: "error" }));
    } finally {
      setLoadingId(null);
      setPendingDeleteId(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Template Thumbnails</h1>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="rounded border p-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-slate-600">{t.description}</div>
                </div>
                <div>
                  <input
                    id={`file-${t.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(t.id, e.target.files?.[0] || null)}
                  />
                  <Button
                    onClick={() => document.getElementById(`file-${t.id}`)?.click()}
                    isLoading={loadingId === t.id}
                  >
                    Upload
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                {t.thumbnail ? (
                  <div className="relative h-40 w-full rounded overflow-hidden border">
                    <Image src={t.thumbnail} alt={t.name} fill className="object-cover" />
                    <div className="absolute top-2 right-2">
                      {statusMap[t.id] === "success" && (
                        <div
                          className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-600 text-white text-xs"
                          title="Operation succeeded"
                        >
                          ✓
                        </div>
                      )}
                      {statusMap[t.id] === "success-remote" && (
                        <div
                          className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-600 text-white text-xs animate-success-badge"
                          title="Remote deletion confirmed"
                        >
                          ✓
                        </div>
                      )}
                      {statusMap[t.id] === "pending-remote" && (
                        <div
                          className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-yellow-500 text-white text-xs"
                          title="Remote deletion pending; will be retried by background job"
                        >
                          ⟳
                        </div>
                      )}
                      {statusMap[t.id] === "error" && (
                        <div
                          className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white text-xs"
                          title="Operation failed"
                        >
                          !
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 w-full rounded border flex items-center justify-center text-xs text-slate-500">
                    No thumbnail
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard?.writeText(t.id);
                      toast.success(`Copied id: ${t.id}`);
                    } catch {
                      toast("Copied id");
                    }
                  }}
                >
                  Copy ID
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPendingDeleteId(t.id);
                    setDeleteOpen(true);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={async () => {
          await clearThumb(pendingDeleteId);
        }}
        title="Confirm clear thumbnail"
        message="Are you sure you want to clear this template's thumbnail? This action cannot be undone."
      />
    </div>
  );
}
