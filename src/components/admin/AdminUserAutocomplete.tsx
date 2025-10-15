"use client";

import React, { useEffect, useRef, useState } from "react";

type UserOption = { id: string; email: string; name?: string };

export default function AdminUserAutocomplete({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState(value || "");
  const [results, setResults] = useState<UserOption[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q) return setResults([]);
      (async () => {
        try {
          const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`, {
            credentials: "include",
          });
          if (!res.ok) return;
          const j = await res.json();
          const users = (j.users || []) as Array<Record<string, unknown>>;
          setResults(
            users
              .filter((u): u is Record<string, unknown> => !!u && typeof u === "object")
              .map((u) => ({
                id: String(u["id"] || ""),
                email: String(u["email"] || ""),
                name: typeof u["name"] === "string" ? (u["name"] as string) : undefined,
              }))
          );
          setHighlight(0);
        } catch (e) {
          console.error(e);
        }
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // keep latest onChange in a ref so effects can call it without requiring it in deps
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // keyboard shortcut to clear (Ctrl+K)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQ("");
        onChangeRef.current("");
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setQ(value || ""), [value]);

  // Close when clicked outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function selectIndex(i: number) {
    const r = results[i];
    if (!r) return;
    onChange(r.id);
    setQ(r.email || r.name || r.id);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        className="input"
        role="combobox"
        aria-expanded={open}
        aria-controls="admin-autocomplete-list"
        aria-autocomplete="list"
        placeholder={placeholder || "Search admin by name or email"}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            e.preventDefault();
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, Math.max(0, results.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(0, h - 1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            selectIndex(highlight);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        onFocus={() => setOpen(true)}
      />

      {open && results.length > 0 && (
        <ul
          id="admin-autocomplete-list"
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded border bg-white shadow"
        >
          {results.map((r, idx) => (
            <li
              role="option"
              aria-selected={idx === highlight}
              key={r.id}
              className={`px-2 py-1 cursor-pointer ${idx === highlight ? "bg-blue-50" : "hover:bg-gray-100"}`}
              onMouseEnter={() => setHighlight(idx)}
              onMouseDown={(ev) => {
                // use onMouseDown to prevent blur before click
                ev.preventDefault();
                selectIndex(idx);
              }}
            >
              <div className="text-sm font-medium">{r.name || r.email}</div>
              <div className="text-xs text-muted-foreground">{r.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
