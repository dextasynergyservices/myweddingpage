import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const AUDIT_FILE = path.join(LOG_DIR, "audit.jsonl");

export function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function auditEvent(event: Record<string, unknown>) {
  try {
    ensureLogDir();
    const line = JSON.stringify({ ts: new Date().toISOString(), ...event });
    fs.appendFileSync(AUDIT_FILE, line + "\n", { encoding: "utf8" });
  } catch (err) {
    // best-effort logging, don't throw
    console.error("Failed to write audit event:", err);
  }
}

export function readAuditLines(limit = 100) {
  try {
    if (!fs.existsSync(AUDIT_FILE)) return [];
    const data = fs.readFileSync(AUDIT_FILE, "utf8");
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    return lines.slice(-limit).map((l) => JSON.parse(l));
  } catch (err) {
    console.error("Failed to read audit file:", err);
    return [];
  }
}

export function readAuditEvents(opts?: {
  page?: number;
  pageSize?: number;
  action?: string | string[];
  stagingId?: string;
  dateFrom?: string; // ISO date or YYYY-MM-DD
  dateTo?: string; // ISO date or YYYY-MM-DD
}) {
  try {
    if (!fs.existsSync(AUDIT_FILE)) return { events: [], total: 0 };
    const data = fs.readFileSync(AUDIT_FILE, "utf8");
    const lines = data
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((l) => {
        try {
          const p = JSON.parse(l);
          return typeof p === "object" && p !== null
            ? (p as Record<string, unknown>)
            : null;
        } catch {
          return null;
        }
      })
      .filter((x): x is Record<string, unknown> => Boolean(x));

    // sort descending by timestamp
    lines.sort(
      (a, b) =>
        new Date(String(b.ts)).getTime() - new Date(String(a.ts)).getTime()
    );

    let filtered = lines;
    if (opts?.action) {
      const actions = Array.isArray(opts.action)
        ? opts.action.map(String)
        : [String(opts.action)];
      filtered = filtered.filter((ev) => actions.includes(String(ev.action)));
    }
    if (opts?.stagingId)
      filtered = filtered.filter((ev) =>
        String(ev.stagingId || ev.staging || "").includes(
          String(opts.stagingId)
        )
      );
    if (opts?.dateFrom) {
      const from = new Date(opts.dateFrom);
      filtered = filtered.filter((ev) => new Date(String(ev.ts)) >= from);
    }
    if (opts?.dateTo) {
      // include the full date by adding one day to compare strictly less than next day
      const to = new Date(opts.dateTo);
      to.setDate(to.getDate() + 1);
      filtered = filtered.filter((ev) => new Date(String(ev.ts)) < to);
    }

    const total = filtered.length;
    const page = Math.max(1, Number(opts?.page || 1));
    const pageSize = Math.max(1, Number(opts?.pageSize || 50));
    const start = (page - 1) * pageSize;
    const events = filtered.slice(start, start + pageSize);
    return { events, total };
  } catch (err) {
    console.error("Failed to read audit events:", err);
    return { events: [], total: 0 };
  }
}

const audit = { auditEvent, readAuditLines };
export default audit;
