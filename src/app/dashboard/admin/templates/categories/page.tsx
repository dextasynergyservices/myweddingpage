"use client";

import React, { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";
import Button from "@/components/ui/Button";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

type Category = { id: string; name: string; description?: string };

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // modals
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/template-categories");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const doLoad = async () => {
      setLoading(true);
      await load();
      setLoading(false);
    };
    doLoad();
  }, []);

  const create = async () => {
    if (!name.trim()) return toast.error("Name required");
    setLoading(true);
    try {
      // attempt to include CSRF token
      let csrfToken: string | null = null;
      try {
        const t = await fetch("/api/csrf-token", { method: "GET", credentials: "include" });
        if (t.ok) {
          const j = await t.json();
          csrfToken = j?.csrfToken || null;
        }
      } catch {}

      const res = await fetch("/api/admin/template-categories", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (!res.ok) throw new Error("Create failed");
      const json = await res.json();
      const created = json.category || json || null;
      setName("");
      setDescription("");
      toast.success("Category created");
      // notify listeners that categories changed
      try {
        window.dispatchEvent(
          new CustomEvent("template-categories:changed", {
            detail: { action: "create", category: created },
          })
        );
      } catch {}
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteRequested = (id: string) => {
    setActiveId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!activeId) return;
    try {
      let csrfToken: string | null = null;
      try {
        const t = await fetch("/api/csrf-token", { method: "GET", credentials: "include" });
        if (t.ok) {
          const j = await t.json();
          csrfToken = j?.csrfToken || null;
        }
      } catch {}

      const res = await fetch("/api/admin/template-categories", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({ id: activeId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      // notify listeners
      try {
        window.dispatchEvent(
          new CustomEvent("template-categories:changed", {
            detail: { action: "delete", id: activeId },
          })
        );
      } catch {}
      setDeleteOpen(false);
      setActiveId(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  const onEditRequested = (c: Category) => {
    setActiveId(c.id);
    setEditName(c.name || "");
    setEditDescription(c.description || "");
    setEditOpen(true);
  };

  const confirmEdit = async () => {
    if (!activeId) return;
    if (!editName.trim()) return toast.error("Name required");
    try {
      let csrfToken: string | null = null;
      try {
        const t = await fetch("/api/csrf-token", { method: "GET", credentials: "include" });
        if (t.ok) {
          const j = await t.json();
          csrfToken = j?.csrfToken || null;
        }
      } catch {}

      const res = await fetch("/api/admin/template-categories", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({
          id: activeId,
          name: editName.trim(),
          description: editDescription || null,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Updated");
      try {
        window.dispatchEvent(
          new CustomEvent("template-categories:changed", {
            detail: {
              action: "update",
              category: { id: activeId, name: editName.trim(), description: editDescription },
            },
          })
        );
      } catch {}
      setEditOpen(false);
      setActiveId(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Template Categories</h1>
      </div>

      <div className="rounded border p-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="input"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="input"
          />
        </div>
        <div className="mt-3">
          <Button onClick={create} isLoading={loading}>
            Create Category
          </Button>
        </div>
      </div>

      <div className="rounded border p-4">
        <h2 className="font-medium mb-2">Existing Categories</h2>
        {loading ? (
          <PageSkeleton />
        ) : (
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-slate-600">{c.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onEditRequested(c)}>
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => onDeleteRequested(c.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm delete"
        message="Are you sure you want to delete this category? This action cannot be undone."
      />

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit category">
        <div className="grid grid-cols-1 gap-2">
          <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input" />
          <input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="input"
          />
        </div>
        <div className="mt-3">
          <Button onClick={confirmEdit} data-primary>
            Save
          </Button>
          <Button variant="outline" className="ml-3" onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
