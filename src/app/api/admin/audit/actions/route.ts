import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const AUDIT_FILE = path.join(process.cwd(), "logs", "audit.jsonl");

export async function GET() {
  try {
    if (!fs.existsSync(AUDIT_FILE)) return NextResponse.json({ actions: [] });
    const data = fs.readFileSync(AUDIT_FILE, "utf8");
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    const counts: Record<string, number> = {};
    for (const l of lines) {
      try {
        const obj = JSON.parse(l);
        if (obj && obj.action) {
          const a = String(obj.action);
          counts[a] = (counts[a] || 0) + 1;
        }
      } catch {
        // ignore
      }
    }
    const actions = Object.keys(counts)
      .map((k) => ({ action: k, count: counts[k] }))
      .sort((a, b) => b.count - a.count || a.action.localeCompare(b.action));
    return NextResponse.json({ actions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ actions: [] }, { status: 500 });
  }
}
