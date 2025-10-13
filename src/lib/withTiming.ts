import { NextRequest } from "next/server";
import { logSecurityEvent, createLogFromRequest } from "./security-logger";
import type { SecurityLogEntry } from "./security-logger";
import type { SecurityEventType } from "@/generated/prisma";

/**
 * Measure async handler duration and optionally emit a SecurityLog entry (fire-and-forget).
 *
 * Usage:
 *   await withTiming(req, async () => { ...handler... }, { sampleRate: 0.01, eventType: 'API_ABUSE' })
 */
export async function withTiming<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  options?: {
    // sampling between 0 and 1 for noisy endpoints (default 1 = always)
    sampleRate?: number;
    // optional SecurityEventType string to use when logging timing
    eventType?: SecurityEventType;
    // allow attaching extra metadata
    metadata?: Record<string, unknown>;
  }
): Promise<T> {
  const start = process.hrtime.bigint();
  const result = await handler();
  const end = process.hrtime.bigint();
  try {
    const durationMs = Number(end - start) / 1_000_000; // high-res ms

    const sampleRate = typeof options?.sampleRate === "number" ? options!.sampleRate : 1;
    if (Math.random() <= sampleRate) {
      // Fire-and-forget: don't await logging to avoid adding latency
      const entry = createLogFromRequest(request, options?.eventType ?? "API_ABUSE", {
        metadata: { ...(options?.metadata || {}), responseTime: Math.round(durationMs) },
        severity: undefined,
        statusCode: undefined,
      }) as SecurityLogEntry;

      // Ensure eventType is set if provided as string/enum
      if (options?.eventType) entry.eventType = options.eventType;

      void logSecurityEvent(entry).catch((e) => {
        // swallow
        console.warn("Timing log failed:", e);
      });
    }
  } catch (e) {
    // Never throw from timing
    console.warn("withTiming internal error:", e);
  }

  return result;
}

export default withTiming;
