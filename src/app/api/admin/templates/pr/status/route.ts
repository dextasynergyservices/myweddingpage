import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

async function handle(req: NextRequest) {
  if (req.method !== "POST")
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });

  const body = await req.json();
  const { prUrl, owner, repo, number } = body as Record<string, unknown>;

  const githubOwner = owner || process.env.TEMPLATE_GITHUB_OWNER;
  const githubRepo = repo || process.env.TEMPLATE_GITHUB_REPO;
  const githubToken = process.env.TEMPLATE_GITHUB_TOKEN;
  if (!githubToken || !githubOwner || !githubRepo)
    return NextResponse.json(
      { error: "Server not configured for GitHub access" },
      { status: 500 }
    );

  let parsedOwner = String(githubOwner);
  let parsedRepo = String(githubRepo);
  let prNumber: number | null = null;

  if (prUrl && typeof prUrl === "string") {
    try {
      const u = new URL(prUrl);
      const parts = u.pathname.split("/").filter(Boolean);
      // expected /owner/repo/pull/NUMBER
      const pullIdx = parts.findIndex((p) => p === "pull");
      if (pullIdx >= 0 && parts.length > pullIdx + 1) {
        parsedOwner = parts[0];
        parsedRepo = parts[1];
        prNumber = parseInt(parts[pullIdx + 1], 10);
      }
    } catch {
      // ignore
    }
  }

  if (!prNumber && typeof number === "number") prNumber = number;
  if (!prNumber)
    return NextResponse.json({ error: "PR number not found" }, { status: 400 });

  try {
    const headers = {
      Authorization: `token ${String(githubToken)}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "myweddingpage-template-importer",
    } as Record<string, string>;

    // fetch PR
    const prRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(parsedOwner)}/${encodeURIComponent(
        parsedRepo
      )}/pulls/${prNumber}`,
      { method: "GET", headers }
    );
    if (!prRes.ok)
      throw new Error(`GitHub API error ${prRes.status} ${prRes.statusText}`);
    const pr = await prRes.json();

    // fetch check suites (commit SHA)
    const headSha = pr?.head?.sha;
    let checks: unknown[] = [];
    if (headSha) {
      const checksRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(parsedOwner)}/${encodeURIComponent(
          parsedRepo
        )}/commits/${encodeURIComponent(headSha)}/check-suites`,
        { method: "GET", headers }
      );
      if (checksRes.ok) {
        const cjson = await checksRes.json();
        checks = cjson?.check_suites || [];
      }
    }

    return NextResponse.json(
      {
        pr: {
          number: prNumber,
          state: pr.state,
          mergeable: pr.mergeable,
          html_url: pr.html_url,
          merged: pr.merged,
          merged_at: pr.merged_at,
        },
        checks,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("PR status error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    return await handle(req as unknown as NextRequest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
