"use client";

import { useEffect, useState } from "react";

interface Props {
  slug: string;
}

export default function WeddingViewIncrementer({ slug }: Props) {
  const [status, setStatus] = useState<"idle" | "skipped" | "posting" | "success" | "failed">(
    "idle"
  );
  const [debugInfo, setDebugInfo] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    async function increment() {
      const sessionKey = `w_viewed_posted_${slug}`;

      // sessionStorage setup (ignore errors)
      try {
        if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
          console.debug("WeddingViewIncrementer: already posted in this session, skipping");
          setStatus("skipped");
          return;
        }
        if (typeof window !== "undefined") sessionStorage.setItem(sessionKey, "1");
      } catch {
        // ignore sessionStorage errors
      }

      // perform the POST
      try {
        setStatus("posting");
        console.info("WeddingViewIncrementer: posting to /api/wedding-views", {
          slug,
        });
        const res = await fetch(`/api/wedding-views?slug=${encodeURIComponent(slug)}`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
        });

        if (!mounted) return;

        if (!res.ok) {
          console.warn("WeddingViewIncrementer: failed to increment views", {
            status: res.status,
          });
          setStatus("failed");
          setDebugInfo({ status: res.status });
          return;
        }

        const data = await res.json();
        console.info("WeddingViewIncrementer: increment response", data);
        setDebugInfo(data);
        setStatus("success");
      } catch (err) {
        console.error("WeddingViewIncrementer: error", err);
        setStatus("failed");
        setDebugInfo({ error: String(err) });
        // clear optimistic flag so retries can occur
        try {
          if (typeof window !== "undefined") sessionStorage.removeItem(sessionKey);
        } catch {
          // ignore
        }
      }
    }

    increment();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // Render a tiny dev-only badge so it's obvious the component mounted and what it did.
  const debugText: string =
    typeof debugInfo === "string" ? debugInfo : JSON.stringify(debugInfo ?? "");

  if (process.env.NODE_ENV !== "production") {
    return (
      <div aria-hidden className="fixed left-2 bottom-2 z-50 pointer-events-none">
        <div className="text-xs font-mono bg-black/60 text-white px-2 py-1 rounded">
          WV: {slug} — {status}
          {debugText && (
            <div className="mt-1 text-[10px] text-white/80 max-w-xs break-words">{debugText}</div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
