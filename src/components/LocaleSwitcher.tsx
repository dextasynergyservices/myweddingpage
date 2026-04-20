"use client";

import { useState, useEffect, useRef } from "react";
import { LOCALE_COOKIE_NAME, SUPPORTED_LOCALES } from "@/config/i18n";
import { Globe } from "lucide-react";

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  yoruba: "Yorùbá",
  igbo: "Igbo",
  hausa: "Hausa",
};

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    const m = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE_NAME}=([^;]+)`));
    return m ? decodeURIComponent(m[2]) : (process.env.NEXT_DEFAULT_LOCALE ?? "en");
  });

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    // ensure default locale is set once on mount
    setLocale((prev) => prev ?? (process.env.NEXT_DEFAULT_LOCALE as string) ?? "en");
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }

    if (open) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  useEffect(() => {
    if (open && focusedIndex != null && itemsRef.current[focusedIndex]) {
      itemsRef.current[focusedIndex]!.focus();
    }
  }, [open, focusedIndex]);

  const handleToggle = () => {
    setOpen((s) => !s);
    if (!open) setFocusedIndex(0);
  };

  const handleSelect = (v: string) => {
    setLocale(v);
    setCookie(LOCALE_COOKIE_NAME, v);
    setOpen(false);
    // reload to let server components pick up the cookie
    window.location.reload();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setFocusedIndex(0);
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, idx: number, value: string) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) =>
        i == null ? 0 : Math.min((i as number) + 1, SUPPORTED_LOCALES.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i == null ? 0 : Math.max((i as number) - 1, 0)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        className="flex items-center justify-center gap-0.5 rounded-full px-1 py-0.5 text-xs bg-white md:bg-white border md:border shadow-none md:shadow-sm hover:shadow-md min-w-0 w-2 h-2 md:w-auto md:h-auto md:px-2 md:py-1 md:text-sm md:rounded-md"
        aria-label="Select language"
      >
        <Globe className="h-3 w-3 md:h-4 md:w-4" />
        <span className="hidden md:inline">{LOCALE_LABELS[locale] ?? locale}</span>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label="Language menu"
          className="absolute left-0 md:right-0 md:left-auto mt-2 w-28 md:w-48 bg-white border rounded-md shadow-lg z-50 overflow-hidden py-1"
        >
          {SUPPORTED_LOCALES.map((l, i) => (
            <li key={l} role="none">
              <button
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                role="menuitem"
                tabIndex={-1}
                onKeyDown={(e) => handleItemKeyDown(e, i, l)}
                onClick={() => handleSelect(l)}
                className={`w-full text-left px-3 py-2 text-sm ${
                  l === locale ? "font-semibold bg-black text-white dark:bg-black" : ""
                }`}
              >
                {LOCALE_LABELS[l] ?? l}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
