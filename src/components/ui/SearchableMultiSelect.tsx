"use client";

import React, { useEffect, useRef, useState, useId } from "react";

type Option = { id: string; name: string };

interface Props {
  options: Option[];
  value: string[]; // selected ids
  onChange: (ids: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export default function SearchableMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [announcement, setAnnouncement] = useState<string>("");
  const listId = useId();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const toggle = (id: string) => {
    const opt = options.find((o) => o.id === id);
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
      setAnnouncement(`${opt?.name || id} deselected`);
    } else {
      onChange([...value, id]);
      setAnnouncement(`${opt?.name || id} selected`);
    }
    // clear announcement after a short delay
    window.setTimeout(() => setAnnouncement(""), 2000);
  };

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    // reset focused index when filtered list changes
    setFocusedIndex(filtered.length > 0 ? 0 : -1);
  }, [filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
      const el =
        optionsRef.current[Math.min(focusedIndex + 1, filtered.length - 1)];
      el?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
      const el = optionsRef.current[Math.max(focusedIndex - 1, 0)];
      el?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filtered.length)
        toggle(filtered[focusedIndex].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="min-h-[44px] border rounded px-2 py-1 flex items-center gap-2 flex-wrap cursor-text"
        onClick={() => setOpen(true)}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        {value.length === 0 && (
          <div className="text-sm text-gray-500">{placeholder}</div>
        )}
        {value.map((id) => {
          const opt = options.find((o) => o.id === id);
          return (
            <span
              key={id}
              className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {opt?.name || id}
              <button
                type="button"
                aria-label={`Remove ${opt?.name || id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(id);
                }}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </span>
          );
        })}

        <input
          className="flex-1 min-w-[120px] p-1 text-sm outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length > 0 ? "" : placeholder}
          aria-label="Search options"
        />
      </div>

      {open && (
        <div
          id={listId}
          className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto"
          role="listbox"
        >
          {filtered.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No results</div>
          )}
          {filtered.map((o, idx) => (
            <button
              key={o.id}
              ref={(el) => {
                optionsRef.current[idx] = el;
                return;
              }}
              type="button"
              onClick={() => toggle(o.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  toggle(o.id);
                }
              }}
              className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between ${value.includes(o.id) ? "bg-slate-50" : ""} ${focusedIndex === idx ? "outline outline-1 outline-blue-300" : ""}`}
            >
              <span className="text-sm">{o.name}</span>
              {value.includes(o.id) && (
                <span className="text-xs text-green-600">Selected</span>
              )}
            </button>
          ))}
        </div>
      )}
      {/* ARIA live region for screen reader announcements */}
      <div aria-live="polite" className="sr-only" role="status">
        {announcement}
      </div>
    </div>
  );
}
