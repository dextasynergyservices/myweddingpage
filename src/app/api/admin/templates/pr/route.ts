import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { auditEvent } from "@/lib/audit";
// try to import ts-morph for AST-based checks; fall back to heuristic if unavailable
let TsMorph: unknown = null;
// Try to load ts-morph asynchronously; it's optional so failure is fine.
(async () => {
  try {
    TsMorph = await import("ts-morph");
  } catch {
    TsMorph = null;
  }
})();
import staging from "@/lib/staging";
import * as gh from "@/lib/github";
import { addTemplateToRegistry } from "@/lib/registry-editor";

export const runtime = "nodejs";

type CreatePrBody = {
  stagingId: string;
  slug: string;
  adminEmail: string;
  githubOwner?: string;
  githubRepo?: string;
  dryRun?: boolean;
  // githubToken is intentionally not accepted from client for security
};

async function handle(req: NextRequest) {
  if (req.method !== "POST")
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });

  const body: CreatePrBody = await req.json();
  const { stagingId, slug, adminEmail, dryRun } = body;
  // Owner/repo can be provided in body as overrides but default to env
  const githubOwner = body.githubOwner || process.env.TEMPLATE_GITHUB_OWNER;
  const githubRepo = body.githubRepo || process.env.TEMPLATE_GITHUB_REPO;
  const githubToken = process.env.TEMPLATE_GITHUB_TOKEN;

  if (!stagingId || !slug || !adminEmail) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (!githubOwner || !githubRepo || !githubToken) {
    return NextResponse.json(
      { error: "Server is not configured with GitHub owner/repo/token" },
      { status: 500 }
    );
  }

  // Disallow passing token from client (body.githubToken) to avoid accidental leakage
  const passedToken = (body as Record<string, unknown>)["githubToken"];
  if (passedToken) {
    return NextResponse.json(
      { error: "Passing githubToken in request body is not allowed" },
      { status: 400 }
    );
  }

  const stagingDir = path.join(staging.STAGING_ROOT, stagingId);
  if (!fs.existsSync(stagingDir))
    return NextResponse.json({ error: "stagingId not found" }, { status: 404 });

  const ghOpts = { owner: githubOwner, repo: githubRepo, token: githubToken };

  try {
    const MAX_BYTES = Number(
      process.env.MAX_COMMIT_FILE_SIZE_BYTES || 5 * 1024 * 1024
    ); // default 5MB
    // 1. Resolve develop ref
    const developRef = (await gh.getRef(ghOpts, "heads/develop")) as {
      object?: { sha?: string };
    } | null;
    const baseSha = developRef?.object?.sha;
    if (!baseSha) throw new Error("Could not resolve develop ref");

    // 2. Sanitize slug and create new branch name
    function sanitizeSlug(s: string) {
      return String(s || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-")
        .slice(0, 60);
    }

    const safeSlug = sanitizeSlug(slug);
    const ts = Date.now();
    let branchName = `feature/template/${safeSlug}-${ts}`;
    let refName = `refs/heads/${branchName}`;

    // 3. Create files from staging into blobs and build tree
    function walk(dirPath: string, base = "") {
      const entries: Array<{ path: string; full: string }> = [];
      for (const name of fs.readdirSync(dirPath)) {
        const full = path.join(dirPath, name);
        const rel = base ? base + "/" + name : name;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          entries.push(...walk(full, rel));
        } else {
          entries.push({ path: rel, full });
        }
      }
      return entries;
    }

    // collect staged files (used when building tree entries for template files)
    walk(stagingDir); // intentionally ignore result for now; tree entries are built from registry update only

    // prepare tree entries
    const treeEntries: Array<{
      path: string;
      mode: string;
      type: "blob";
      sha: string;
    }> = [];
    try {
      const registryPath = "src/lib/component-registry.ts";
      // fetch develop commit to use its tree as base_tree
      const developCommit = (await gh.getCommit(ghOpts, baseSha)) as {
        tree?: { sha?: string };
      } | null;
      const baseTreeSha = developCommit?.tree?.sha;

      // fetch existing registry content at develop
      const existing = await gh.getContent(
        ghOpts,
        registryPath,
        `develop` as unknown as string
      );
      let updatedRegistryContent: string | null = null;
      if (existing && existing.content) {
        const content = existing.content as string;
        // Use AST-based editor to compute a patched version (idempotent)
        try {
          const patched = addTemplateToRegistry({ slug, fileContent: content });
          if (patched) updatedRegistryContent = patched;
        } catch (err) {
          console.error("Registry AST edit failed:", err);
        }
      }

      // Collect staged files from staging dir
      const stagedFiles = walk(stagingDir);

      // Allowed file extensions (safe whitelist)
      const ALLOWED_EXT = new Set([
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".json",
        ".css",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".webp",
        ".zip",
        ".md",
      ]);

      function sanitizeFilenameComponent(name: string) {
        // remove any path traversal segments and control characters
        return name
          .replace(/\.+\\/g, "")
          .replace(/(^|\/)\.+(\/|$)/g, "")
          .replace(/[\0\x00-\x1F]/g, "");
      }

      // simple heuristic to detect server-only API usage in uploaded JS/TS
      // kept inline where needed below; helper removed to avoid unused symbol

      const plannedTreeEntries: Array<{
        path: string;
        mode?: string;
        type?: string;
      }> = [];

      if (updatedRegistryContent) {
        // include registry update
        plannedTreeEntries.push({
          path: registryPath,
          mode: "100644",
          type: "blob",
        });
        if (!dryRun) {
          const registryBlob = (await gh.createBlob(
            ghOpts,
            updatedRegistryContent
          )) as {
            sha?: string;
          } | null;
          const registrySha = registryBlob?.sha;
          if (!registrySha)
            throw new Error("Failed to create blob for component-registry");
          treeEntries.push({
            path: registryPath,
            mode: "100644",
            type: "blob",
            sha: registrySha,
          });
        }
      }

      // Prepare blobs for staged files under templates/<slug>/...
      const oversizedFiles: string[] = [];
      const disallowedFiles: Array<{ path: string; reason: string }> = [];
      const serverOnlyFiles: Array<{ path: string; reason: string }> = [];
      for (const f of stagedFiles) {
        // skip hidden files
        if (f.path.startsWith(".")) continue;
        const full = f.full;
        // sanitize components of the relative path
        const parts = f.path
          .split(/\\|\//)
          .map(sanitizeFilenameComponent)
          .filter(Boolean);
        const relPath = parts.join("/");
        const ext = path.extname(relPath).toLowerCase();

        if (!ALLOWED_EXT.has(ext)) {
          // include planned entry so dry-run shows it
          plannedTreeEntries.push({
            path: `templates/${safeSlug}/${relPath}`,
            mode: "100644",
            type: "blob",
          });
          // record disallowed file
          disallowedFiles.push({
            path: relPath,
            reason: `extension ${ext} not allowed`,
          });
          auditEvent({
            action: "disallowed-file",
            stagingId,
            file: relPath,
            ext,
          });
          continue;
        }

        const repoPath = `templates/${safeSlug}/${relPath}`;

        const stat = fs.statSync(full);
        if (stat.size > MAX_BYTES) {
          // record oversized and continue
          oversizedFiles.push(repoPath);
          // still include a planned entry so dry-run shows it
          plannedTreeEntries.push({
            path: repoPath,
            mode: "100644",
            type: "blob",
          });
          continue;
        }

        plannedTreeEntries.push({
          path: repoPath,
          mode: "100644",
          type: "blob",
        });
        if (dryRun) continue;

        const buf = fs.readFileSync(full);
        // simple binary detection: presence of null byte
        const isBinary = buf.includes(0);
        if (isBinary) {
          const contentB64 = buf.toString("base64");
          const blob = (await gh.createBlobWithEncoding(
            ghOpts,
            contentB64,
            "base64"
          )) as {
            sha?: string;
          } | null;
          const sha = blob?.sha;
          if (!sha) throw new Error(`Failed to create blob for ${repoPath}`);
          treeEntries.push({
            path: repoPath,
            mode: "100644",
            type: "blob",
            sha,
          });
        } else {
          const contentStr = buf.toString("utf8");
          // AST-based server-only API detection for JS/TS files
          try {
            const lowerExt = ext.toLowerCase();
            if ([".js", ".jsx", ".ts", ".tsx"].includes(lowerExt)) {
              let foundServerOnly = false;
              // Prefer ts-morph AST parse when available
              if (TsMorph) {
                try {
                  // narrow shape without using 'any'
                  const tm = TsMorph as unknown as {
                    Project?: new (opts?: unknown) => unknown;
                    ScriptKind?: Record<string, unknown>;
                    SyntaxKind?: Record<string, unknown>;
                  } | null;
                  const ProjectCtor = tm?.Project;
                  const ScriptKindObj = tm?.ScriptKind;
                  let src: unknown | null = null;
                  if (ProjectCtor && ScriptKindObj) {
                    const projectInstance = new ProjectCtor({
                      useInMemoryFileSystem: true,
                      compilerOptions: { allowJs: true },
                    });
                    // determine script kind value if available
                    const kind = ((): unknown => {
                      try {
                        if (
                          lowerExt === ".js" &&
                          ScriptKindObj.JS !== undefined
                        )
                          return ScriptKindObj.JS;
                        if (
                          lowerExt === ".jsx" &&
                          ScriptKindObj.JSX !== undefined
                        )
                          return ScriptKindObj.JSX;
                        if (
                          lowerExt === ".ts" &&
                          ScriptKindObj.TS !== undefined
                        )
                          return ScriptKindObj.TS;
                        if (ScriptKindObj.TSX !== undefined)
                          return ScriptKindObj.TSX;
                      } catch {
                        // ignore
                      }
                      return undefined;
                    })();
                    const projectLike = projectInstance as unknown as {
                      createSourceFile?: (
                        name: string,
                        content: string,
                        opts?: unknown
                      ) => unknown;
                    };
                    if (
                      projectLike &&
                      typeof projectLike.createSourceFile === "function"
                    ) {
                      // call createSourceFile if available
                      src = projectLike.createSourceFile!(
                        "uploaded" + lowerExt,
                        contentStr,
                        {
                          scriptKind: kind,
                        }
                      );
                    }
                  }
                  // check for imports of node builtins
                  const srcLike = src as unknown as {
                    getImportDeclarations?: () => unknown[];
                  } | null;
                  const imports =
                    srcLike &&
                    typeof srcLike.getImportDeclarations === "function"
                      ? srcLike.getImportDeclarations() || []
                      : [];
                  const builtins = [
                    "fs",
                    "child_process",
                    "net",
                    "tls",
                    "os",
                    "path",
                    "crypto",
                    "dns",
                    "dns/promises",
                  ];
                  // imports may be AST nodes; attempt to extract module specifier text safely
                  const importStrings: string[] = [];
                  type ImportLike = {
                    getModuleSpecifierValue?: () => unknown;
                    getText?: () => unknown;
                  };
                  for (const imp of imports || []) {
                    try {
                      if (
                        imp &&
                        typeof (imp as ImportLike).getModuleSpecifierValue ===
                          "function"
                      ) {
                        importStrings.push(
                          String((imp as ImportLike).getModuleSpecifierValue!())
                        );
                      } else if (typeof imp === "string") {
                        importStrings.push(imp);
                      } else if (
                        imp &&
                        typeof (imp as ImportLike).getText === "function"
                      ) {
                        importStrings.push(
                          String((imp as ImportLike).getText!())
                        );
                      }
                    } catch {
                      // ignore
                    }
                  }
                  for (const im of importStrings) {
                    if (
                      builtins.includes(im) ||
                      builtins.some((b) => im === `node:${b}`)
                    ) {
                      foundServerOnly = true;
                      serverOnlyFiles.push({
                        path: relPath,
                        reason: `imports builtin module ${im}`,
                      });
                      auditEvent({
                        action: "server-only-file",
                        stagingId,
                        file: relPath,
                        reason: `import ${im}`,
                      });
                      break;
                    }
                  }
                  // detect process.env usage
                  if (!foundServerOnly) {
                    const srcDesc = src as unknown as {
                      getDescendantsOfKind?: (k: unknown) => unknown[];
                    } | null;
                    const SyntaxKindObj = (
                      tm as { SyntaxKind?: Record<string, unknown> } | null
                    )?.SyntaxKind;
                    const pas =
                      srcDesc &&
                      typeof srcDesc.getDescendantsOfKind === "function" &&
                      SyntaxKindObj
                        ? srcDesc.getDescendantsOfKind(
                            SyntaxKindObj.PropertyAccessExpression
                          )
                        : [];
                    for (const pa of pas) {
                      try {
                        const getTextFunc = (pa as { getText?: () => unknown })
                          ?.getText;
                        const txt =
                          typeof getTextFunc === "function"
                            ? String(getTextFunc.call(pa))
                            : "";
                        if (txt.includes("process.env")) {
                          foundServerOnly = true;
                          serverOnlyFiles.push({
                            path: relPath,
                            reason: `process.env usage`,
                          });
                          auditEvent({
                            action: "server-only-file",
                            stagingId,
                            file: relPath,
                            reason: `process.env`,
                          });
                          break;
                        }
                      } catch {
                        // ignore
                      }
                    }
                  }
                } catch {
                  // parsing failure, fall back to text heuristics below
                }
              }
              // fallback heuristic if ts-morph not available or nothing found
              if (
                !TsMorph ||
                !serverOnlyFiles.some((s) => s.path === relPath)
              ) {
                const lc = contentStr.toLowerCase();
                const serverPatterns = [
                  "fs.",
                  "require('fs')",
                  'require("fs")',
                  "child_process",
                  "process.env",
                  "net.",
                  "tls.",
                ];
                if (serverPatterns.some((p) => lc.includes(p))) {
                  serverOnlyFiles.push({
                    path: relPath,
                    reason: "heuristic match",
                  });
                  auditEvent({
                    action: "server-only-file",
                    stagingId,
                    file: relPath,
                    reason: "heuristic match",
                  });
                }
              }
            }
          } catch (err) {
            // best effort; do not fail parsing
            console.error("Server-side AST check failed:", err);
          }
          const blob = (await gh.createBlobWithEncoding(
            ghOpts,
            contentStr,
            "utf-8"
          )) as {
            sha?: string;
          } | null;
          const sha = blob?.sha;
          if (!sha) throw new Error(`Failed to create blob for ${repoPath}`);
          treeEntries.push({
            path: repoPath,
            mode: "100644",
            type: "blob",
            sha,
          });
        }
      }

      if (dryRun) {
        const planned = {
          branchName,
          refName,
          registryPath,
          updatedRegistryContent,
          plannedTreeEntries,
          oversizedFiles,
          disallowedFiles,
          serverOnlyFiles,
          commitMessage: `Add template ${slug} from staging ${stagingId}`,
          prTitle: `Add template ${slug}`,
          prBody: `Automated template import from staging ${stagingId}\nUploaded by: ${adminEmail}`,
        };
        return NextResponse.json({ dryRun: true, planned }, { status: 200 });
      }

      // if there are disallowed/server-only files, fail fast on real commit
      if (!dryRun) {
        if (oversizedFiles.length > 0) {
          auditEvent({
            action: "reject-commit-oversize",
            stagingId,
            files: oversizedFiles,
          });
          return NextResponse.json(
            {
              error: "One or more files exceed the maximum allowed size",
              oversizedFiles,
            },
            { status: 413 }
          );
        }
        if (disallowedFiles.length > 0) {
          auditEvent({
            action: "reject-commit-disallowed",
            stagingId,
            files: disallowedFiles,
          });
          return NextResponse.json(
            {
              error: "One or more files have disallowed file types",
              disallowedFiles,
            },
            { status: 422 }
          );
        }
        if (serverOnlyFiles.length > 0) {
          auditEvent({
            action: "reject-commit-server-only",
            stagingId,
            files: serverOnlyFiles,
          });
          return NextResponse.json(
            {
              error: "One or more files reference server-only APIs",
              serverOnlyFiles,
            },
            { status: 422 }
          );
        }
      }

      // create tree using develop's tree as base if available
      if (treeEntries.length === 0) {
        // Nothing prepared to commit (no registry update computed)
        return NextResponse.json(
          {
            error:
              "No changes to commit. Registry unchanged and no tree entries were prepared.",
          },
          { status: 400 }
        );
      }

      const newTree = (await gh.createTree(
        ghOpts,
        treeEntries,
        baseTreeSha
      )) as {
        sha?: string;
      } | null;
      const treeSha = newTree?.sha;
      if (!treeSha) throw new Error("Failed to create tree");

      // create commit
      const commit = (await gh.createCommit(
        ghOpts,
        `Add template ${slug} from staging ${stagingId}`,
        treeSha,
        [baseSha]
      )) as { sha?: string } | null;
      const commitSha = commit?.sha;
      if (!commitSha) throw new Error("Failed to create commit");

      // create ref with retry on collision (rare) - try a few times with a random suffix
      const maxRefAttempts = 5;
      let createdRef = false;
      let lastRefErr: unknown = null;
      for (let attempt = 0; attempt < maxRefAttempts; attempt++) {
        try {
          await gh.createRef(ghOpts, refName, commitSha);
          createdRef = true;
          break;
        } catch (err: unknown) {
          lastRefErr = err;
          // if the error indicates ref already exists, try a new name
          const anyErr = err as unknown;
          let message = String(anyErr || "");
          if (anyErr && typeof anyErr === "object") {
            const obj = anyErr as Record<string, unknown>;
            const body = obj.body as unknown;
            if (
              body &&
              typeof body === "object" &&
              typeof (body as Record<string, unknown>).message === "string"
            ) {
              message = (body as Record<string, unknown>).message as string;
            } else if (typeof obj.message === "string") {
              message = obj.message as string;
            }
          }
          if (
            typeof message === "string" &&
            message.toLowerCase().includes("reference already exists")
          ) {
            // append a short random suffix and retry
            const suffix = Math.random().toString(36).slice(2, 7);
            branchName = `feature/template/${safeSlug}-${ts}-${suffix}`;
            refName = `refs/heads/${branchName}`;
            continue;
          }
          // otherwise break and rethrow
          break;
        }
      }
      if (!createdRef) {
        throw lastRefErr || new Error("Failed to create git ref");
      }

      // open PR
      const prTitle = `Add template ${slug}`;
      const prBody = `Automated template import from staging ${stagingId}\nUploaded by: ${adminEmail}`;
      const pr = await gh.createPR(
        ghOpts,
        branchName,
        "develop",
        prTitle,
        prBody
      );

      return NextResponse.json({ success: true, pr }, { status: 200 });
    } catch (err: unknown) {
      console.error(
        "Registry update failed, falling back to normal tree creation:",
        err
      );
      // fallback to regular flow below
    }

    // create tree based on develop tree
    const newTree = (await gh.createTree(ghOpts, treeEntries, undefined)) as {
      sha?: string;
    } | null;
    const treeSha = newTree?.sha;
    if (!treeSha) throw new Error("Failed to create tree");

    // create commit
    const commit = (await gh.createCommit(
      ghOpts,
      `Add template ${slug} from staging ${stagingId}`,
      treeSha,
      [baseSha]
    )) as { sha?: string } | null;
    const commitSha = commit?.sha;
    if (!commitSha) throw new Error("Failed to create commit");

    // create ref
    await gh.createRef(ghOpts, refName, commitSha);

    // open PR
    const prTitle = `Add template ${slug}`;
    const prBody = `Automated template import from staging ${stagingId}\nUploaded by: ${adminEmail}`;
    const pr = await gh.createPR(
      ghOpts,
      branchName,
      "develop",
      prTitle,
      prBody
    );

    return NextResponse.json({ success: true, pr }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If the error originated from GitHub helper it may include a body with details
    const anyErr = err as unknown;
    let details: unknown = undefined;
    let statusCode = 500;
    if (anyErr && typeof anyErr === "object") {
      const obj = anyErr as Record<string, unknown>;
      if (obj.body) details = obj.body;
      if (typeof obj.status === "number") statusCode = obj.status as number;
    }
    console.error("PR creation failed:", err);
    const payload: Record<string, unknown> = { error: msg };
    if (details) payload.details = details;
    return NextResponse.json(payload, { status: statusCode });
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
