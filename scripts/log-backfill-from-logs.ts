import fs from "fs";
import readline from "readline";
import { prisma } from "../src/lib/prisma";

// Usage:
// pnpm tsx scripts/log-backfill-from-logs.ts --log=C:\path\to\logs_result_new.json --window=10 --limit=1000
// For UA-only matching when IPs are not present:
// pnpm tsx scripts/log-backfill-from-logs.ts --log=C:\path\to\logs_result_new.json --ua-only=true

function parseArgs() {
  const args = process.argv.slice(2);
  const out: any = {};
  for (const a of args) {
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      out[k] = v ?? true;
    }
  }
  return out;
}

function tryParseJsonLine(line: string) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function parseNginxCombined(line: string) {
  // remote_addr - - [10/Oct/2025:12:27:35 +0000] "GET /slug HTTP/1.1" 200 123 "-" "User-Agent"
  const re = /^(\S+) \S+ \S+ \[([^\]]+)\] "([A-Z]+) ([^\s]+)[^\"]*" \d+ \d+ "[^"]*" "([^\"]*)"/;
  const m = line.match(re);
  if (!m) return null;
  const ip = m[1];
  const dateStr = m[2];
  const method = m[3];
  const path = m[4];
  const ua = m[5];

  // Convert dateStr like 10/Oct/2025:12:27:35 +0000 -> "10 Oct 2025 12:27:35 +0000"
  const d = dateStr.replace(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})/, "$1 $2 $3 $4");
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return { ip, path, ua, timestamp: parsed.toISOString() };
}

function extractFromJsonObject(j: any) {
  if (!j || typeof j !== "object") return null;
  // heuristics for various providers (Vercel uses requestUserAgent and timestampInMs)
  const ip =
    j.remote_addr ||
    j.client_ip ||
    j.ip ||
    j.src_ip ||
    j.cip ||
    j.cf_connecting_ip ||
    j["x-forwarded-for"] ||
    null;
  const ua =
    j.requestUserAgent ||
    j.request_user_agent ||
    j.request_useragent ||
    j.request_user_agent ||
    j.request_user_agent ||
    j.request_userAgent ||
    j.request_user_agent ||
    j.user_agent ||
    j["user-agent"] ||
    j.ua ||
    null;
  const path =
    j.requestPath ||
    j.request_path ||
    j.request ||
    j.path ||
    j.url ||
    j.request_uri ||
    j.request_url ||
    null;
  const time =
    j.timestampInMs ?? j.timestamp ?? j.time ?? j.TimeUTC ?? j.date ?? j["@timestamp"] ?? null;
  let ts: string | null = null;
  if (time != null) {
    if (typeof time === "number") {
      // timestampInMs likely
      ts = new Date(time).toISOString();
    } else {
      // try to coerce
      const dd = new Date(time);
      if (!isNaN(dd.getTime())) ts = dd.toISOString();
    }
  }

  if (!path || !ts || !ua)
    return {
      ip: ip ?? null,
      ua: ua ?? null,
      path: path ?? null,
      timestamp: ts,
    };
  return { ip: ip ?? null, ua: ua ?? null, path: path ?? null, timestamp: ts };
}

async function main() {
  const args = parseArgs();
  const logPath = args.log;
  if (!logPath) {
    console.error("Missing --log=path/to/access.log");
    process.exit(1);
  }
  const windowSec = Number(args.window || 10);
  const limit = Number(args.limit || 1000);
  const uaOnly = Boolean(args.uaOnly || args["ua-only"]);
  const debug = Boolean(args.debug || false);

  // Fetch PageView rows missing ip or userAgent
  const pageviews = await prisma.pageView.findMany({
    where: { OR: [{ ipAddress: null }, { userAgent: null }] },
    select: { id: true, weddingPageId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (pageviews.length === 0) {
    console.log("No pageviews found missing ip/userAgent");
    process.exit(0);
  }

  // Map weddingPageId -> slug
  const pageIds = Array.from(new Set(pageviews.map((p) => p.weddingPageId)));
  const pages = await prisma.weddingPage.findMany({
    where: { id: { in: pageIds } },
    select: { id: true, slug: true },
  });
  const slugById = new Map(pages.map((p) => [p.id, p.slug]));

  const targets = pageviews.map((p) => ({
    id: p.id,
    weddingPageId: p.weddingPageId,
    slug: slugById.get(p.weddingPageId) ?? null,
    createdAt: p.createdAt,
  }));

  console.log(`Loaded ${targets.length} targets across ${pageIds.length} pages`);

  const parsedLines: Array<{
    ip: string | null;
    path: string;
    ua: string;
    timestamp: string;
  }> = [];

  // Try reading entire file as JSON (Vercel exports often are a JSON array)
  try {
    const raw = fs.readFileSync(logPath, "utf8");
    const maybe = JSON.parse(raw);
    if (Array.isArray(maybe)) {
      for (const entry of maybe) {
        const ex = extractFromJsonObject(entry);
        if (ex && ex.path && ex.timestamp && ex.ua) {
          parsedLines.push({
            ip: ex.ip ?? null,
            path: ex.path,
            ua: ex.ua,
            timestamp: ex.timestamp,
          });
        }
      }
    } else if (typeof maybe === "object") {
      const ex = extractFromJsonObject(maybe);
      if (ex && ex.path && ex.timestamp && ex.ua)
        parsedLines.push({
          ip: ex.ip ?? null,
          path: ex.path,
          ua: ex.ua,
          timestamp: ex.timestamp,
        });
    }
  } catch (e) {
    // fall back to line-by-line streaming parse (handles json-lines and nginx combined)
    const fileStream = fs.createReadStream(logPath, { encoding: "utf8" });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    for await (const line of rl) {
      if (!line || line.trim().length === 0) continue;
      const j = tryParseJsonLine(line);
      if (j && typeof j === "object") {
        const ex = extractFromJsonObject(j);
        if (ex && ex.path && ex.timestamp && ex.ua)
          parsedLines.push({
            ip: ex.ip ?? null,
            path: ex.path,
            ua: ex.ua,
            timestamp: ex.timestamp,
          });
        continue;
      }
      const n = parseNginxCombined(line);
      if (n)
        parsedLines.push({
          ip: n.ip ?? null,
          path: n.path,
          ua: n.ua,
          timestamp: n.timestamp,
        });
    }
  }

  console.log(`Parsed ${parsedLines.length} log lines into memory`);
  if (debug) {
    console.log("Sample parsed lines:", parsedLines.slice(0, 10));
  }

  const windowMs = windowSec * 1000;
  const results: Array<{
    slug: string;
    timestamp: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    pageViewId: string;
  }> = [];

  if (debug) console.log("Targets sample:", targets.slice(0, 10));
  for (const t of targets) {
    if (!t.slug) continue; // can't map to slug
    const targetTime = new Date(t.createdAt).getTime();
    const candidates = parsedLines.filter((ln) => {
      const lnTime = new Date(ln.timestamp).getTime();
      if (Math.abs(lnTime - targetTime) > windowMs) return false;
      try {
        return ln.path.includes(t.slug as string);
      } catch {
        return false;
      }
    });

    if (candidates.length > 0) {
      // prefer a candidate with an IP if available
      let chosen = candidates.find((c) => c.ip) ?? candidates[0];
      if (!uaOnly && !chosen.ip) {
        // skip because we didn't find an IP and we're not in UA-only mode
      } else {
        results.push({
          slug: t.slug as string,
          timestamp: t.createdAt.toISOString(),
          ipAddress: chosen.ip ?? null,
          userAgent: chosen.ua,
          pageViewId: t.id,
        });
      }
    }
  }

  const outPath = "scripts/backfill-payload.json";
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`Wrote ${results.length} candidate backfill events to ${outPath}`);
  console.log("Preview:", results.slice(0, 10));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
