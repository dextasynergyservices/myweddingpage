import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import staging from "@/lib/staging";
import unzipper from "unzipper";
import ts from "typescript";
import { requireAdmin } from "@/lib/middleware/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const url = new URL(req.url);
  const stagingId = url.searchParams.get("stagingId");
  if (!stagingId)
    return NextResponse.json({ error: "missing stagingId" }, { status: 400 });

  const dir = path.join(staging.STAGING_ROOT, stagingId);
  if (!fs.existsSync(dir))
    return NextResponse.json({ error: "stagingId not found" }, { status: 404 });

  // read manifest
  const manifestPath = path.join(dir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return NextResponse.json(
      { error: "manifest.json not found in staging" },
      { status: 400 }
    );
  }

  let manifestJson: unknown;
  try {
    const buf = fs.readFileSync(manifestPath);
    manifestJson = JSON.parse(buf.toString("utf-8"));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `invalid manifest: ${msg}` },
      { status: 400 }
    );
  }

  // stronger manifest validation
  if (typeof manifestJson !== "object" || manifestJson === null) {
    return NextResponse.json(
      { error: "manifest must be a JSON object" },
      { status: 400 }
    );
  }

  const m = manifestJson as Record<string, unknown>;
  if (!m.name || typeof m.name !== "string" || m.name.trim().length === 0) {
    return NextResponse.json(
      { error: "manifest.name must be a non-empty string" },
      { status: 400 }
    );
  }

  if (!Array.isArray(m.categoryIds) || m.categoryIds.length === 0) {
    return NextResponse.json(
      { error: "manifest.categoryIds must be a non-empty array" },
      { status: 400 }
    );
  }

  if (m.sections && !Array.isArray(m.sections)) {
    return NextResponse.json(
      { error: "manifest.sections must be an array when present" },
      { status: 400 }
    );
  }

  // simple type guard
  function hasPlanIds(obj: unknown): obj is { planIds: unknown } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      Object.prototype.hasOwnProperty.call(obj, "planIds")
    );
  }

  if (
    !hasPlanIds(manifestJson) ||
    !Array.isArray(manifestJson.planIds) ||
    manifestJson.planIds.length === 0
  ) {
    return NextResponse.json(
      { error: "manifest.planIds must be a non-empty array" },
      { status: 400 }
    );
  }

  // components zip extraction & validation
  const componentsDir = path.join(dir, "components");
  let componentsValidation = { hasComponents: false, files: [] as string[] };
  try {
    if (fs.existsSync(componentsDir)) {
      const entries = fs.readdirSync(componentsDir);
      const zipFile = entries.find((n) => n.toLowerCase().endsWith(".zip"));
      if (zipFile) {
        const zipPath = path.join(componentsDir, zipFile);
        const extractDir = path.join(componentsDir, "extracted");
        fs.mkdirSync(extractDir, { recursive: true });
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractDir }))
            .on("close", () => resolve())
            .on("error", (e: unknown) => reject(e));
        });

        function walkAndValidate(dirPath: string, base = "") {
          for (const name of fs.readdirSync(dirPath)) {
            const full = path.join(dirPath, name);
            const rel = base ? base + "/" + name : name;
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
              walkAndValidate(full, rel);
            } else if (rel.toLowerCase().endsWith(".tsx")) {
              try {
                const content = fs.readFileSync(full, "utf-8");
                const sourceFile = ts.createSourceFile(
                  full,
                  content,
                  ts.ScriptTarget.Latest,
                  true,
                  ts.ScriptKind.TSX
                );

                const syntaxDiagnostics: string[] = [];
                let hasDefaultExport = false;
                const namedExports: string[] = [];

                const visit = (node: ts.Node) => {
                  if (ts.isExportAssignment(node)) hasDefaultExport = true;
                  if (
                    (ts.isFunctionDeclaration(node) ||
                      ts.isClassDeclaration(node) ||
                      ts.isVariableStatement(node)) &&
                    node.modifiers &&
                    node.modifiers.some(
                      (m) => m.kind === ts.SyntaxKind.ExportKeyword
                    )
                  ) {
                    if (
                      ts.isFunctionDeclaration(node) ||
                      ts.isClassDeclaration(node)
                    ) {
                      const nameNode = node.name;
                      if (nameNode && ts.isIdentifier(nameNode))
                        namedExports.push(nameNode.text);
                    } else if (ts.isVariableStatement(node)) {
                      for (const decl of (node as ts.VariableStatement)
                        .declarationList.declarations) {
                        if (ts.isIdentifier(decl.name))
                          namedExports.push(decl.name.text);
                      }
                    }
                  }
                  ts.forEachChild(node, visit);
                };

                try {
                  visit(sourceFile);
                } catch (e) {
                  syntaxDiagnostics.push(String(e));
                }

                const diagText: string[] = [];
                try {
                  const program = ts.createProgram([full], {
                    allowJs: true,
                    jsx: ts.JsxEmit.React,
                  });
                  let diags: readonly ts.Diagnostic[] = [];
                  try {
                    diags = ts.getPreEmitDiagnostics(program, sourceFile);
                  } catch {
                    diags = program.getSyntacticDiagnostics(sourceFile) || [];
                  }
                  for (const d of diags) {
                    const msg = ts.flattenDiagnosticMessageText(
                      d.messageText,
                      "\n"
                    );
                    const pos = d.start != null ? `@${d.start}` : "";
                    diagText.push(`${msg} ${pos}`);
                  }
                } catch (errDiag) {
                  diagText.push(String(errDiag));
                }

                componentsValidation.files.push(
                  JSON.stringify({
                    path: rel,
                    hasDefaultExport,
                    namedExports,
                    diagnostics: [...syntaxDiagnostics, ...diagText],
                  })
                );
              } catch (e) {
                componentsValidation.files.push(
                  JSON.stringify({ path: rel, error: String(e) })
                );
              }
            }
          }
        }

        walkAndValidate(extractDir);
        componentsValidation.hasComponents =
          componentsValidation.files.length > 0;
      }
    }
  } catch (err) {
    console.error("components validation error:", err);
    componentsValidation = { hasComponents: false, files: [] };
  }

  const stagedFiles = staging.listStagingFiles(dir);
  const assetUrls = stagedFiles.map(
    (f: string) => `/staging/${stagingId}/${f}`
  );

  const preview = {
    stagingId,
    manifest: manifestJson,
    assets: assetUrls,
    componentsValidation,
  };

  return NextResponse.json({ success: true, preview }, { status: 200 });
}
