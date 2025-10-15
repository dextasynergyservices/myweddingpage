import { NextResponse } from "next/server";
import staging from "@/lib/staging";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const root = staging.STAGING_ROOT;
    if (!root) return NextResponse.json({ items: [], total: 0 });

    // support pagination via query params
    // Default: page=1, perPage=20
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1") || 1;
    const perPage = Number(url.searchParams.get("perPage") || "20") || 20;

    const allDirents = fs.readdirSync(root, { withFileTypes: true });
    const dirs = allDirents.filter((d) => d.isDirectory()).map((d) => d.name);
    const items: Array<{
      id: string;
      createdAt: number;
      manifest: Record<string, unknown> | null;
      componentsValidation?: { hasComponents: boolean; files: string[] } | null;
      assets: string[];
    }> = [];

    for (const d of dirs) {
      const dirPath = path.join(root, d);
      const stat = fs.statSync(dirPath);
      // try to read manifest.json
      let manifest: Record<string, unknown> | null = null;
      try {
        const mpath = path.join(dirPath, "manifest.json");
        if (fs.existsSync(mpath)) {
          manifest = JSON.parse(fs.readFileSync(mpath, "utf-8"));
        }
      } catch {
        manifest = null;
      }

      // try to read components validation if exists under components/extracted or recorded
      let componentsValidation: { hasComponents: boolean; files: string[] } | null = null;
      try {
        const compExtracted = path.join(dirPath, "components", "extracted");
        if (fs.existsSync(compExtracted)) {
          const files: Array<{
            path: string;
            namedExports?: string[];
            hasDefaultExport?: boolean;
            diagnostics?: string[];
          }> = [];
          async function walk(dirPath2: string, base = "") {
            for (const name of fs.readdirSync(dirPath2)) {
              const full = path.join(dirPath2, name);
              const rel = base ? base + "/" + name : name;
              const stat2 = fs.statSync(full);
              if (stat2.isDirectory()) {
                // recurse
                await walk(full, rel);
              } else if (rel.toLowerCase().endsWith(".tsx")) {
                try {
                  const content = fs.readFileSync(path.join(dirPath2, name), "utf-8");
                  // Dynamically import typescript to avoid bundling issues
                  const tsModule = (await import("typescript")) as typeof import("typescript");
                  const sourceFile = tsModule.createSourceFile(
                    full,
                    content,
                    tsModule.ScriptTarget.Latest,
                    true,
                    tsModule.ScriptKind.TSX
                  );
                  const namedExports: string[] = [];
                  let hasDefaultExport = false;
                  const visit = (node: import("typescript").Node): void => {
                    // detect export assignment (default export)
                    if (tsModule.isExportAssignment(node)) {
                      hasDefaultExport = true;
                    }

                    // Handle exported function and class declarations
                    if (tsModule.isFunctionDeclaration(node) || tsModule.isClassDeclaration(node)) {
                      const decl = node;
                      const isExported = !!decl.modifiers?.some(
                        (m) => m.kind === tsModule.SyntaxKind.ExportKeyword
                      );
                      if (isExported) {
                        const name = decl.name;
                        if (name && tsModule.isIdentifier(name)) {
                          namedExports.push(String(name.escapedText ?? name.text));
                        }
                      }
                    } else if (tsModule.isVariableStatement(node)) {
                      const varStmt = node;
                      const isExported = !!varStmt.modifiers?.some(
                        (m) => m.kind === tsModule.SyntaxKind.ExportKeyword
                      );
                      if (isExported) {
                        for (const decl of varStmt.declarationList.declarations) {
                          const nm = decl.name;
                          if (tsModule.isIdentifier(nm)) {
                            namedExports.push(String(nm.escapedText ?? nm.text));
                          }
                        }
                      }
                    }

                    tsModule.forEachChild(node, visit);
                  };
                  visit(sourceFile);
                  // collect diagnostics using a minimal program
                  const program = tsModule.createProgram([full], {
                    allowJs: true,
                    jsx: tsModule.JsxEmit.React,
                  });
                  const diags = tsModule.getPreEmitDiagnostics(program, sourceFile) || [];
                  const diagText: string[] = diags.map((d) =>
                    tsModule.flattenDiagnosticMessageText(d.messageText, "\n")
                  );
                  files.push({ path: rel, namedExports, hasDefaultExport, diagnostics: diagText });
                } catch (errImport) {
                  files.push({ path: rel, diagnostics: [String(errImport)] });
                }
              }
            }
          }
          // ensure async walk completes
          await walk(compExtracted);
          componentsValidation = {
            hasComponents: files.length > 0,
            files: files.map((f) => JSON.stringify(f)),
          };
        }
      } catch {
        componentsValidation = null;
      }

      const staged = staging.listStagingFiles(dirPath).map((f: string) => `/staging/${d}/${f}`);
      items.push({
        id: d,
        createdAt: stat.ctimeMs,
        manifest,
        componentsValidation,
        assets: staged,
      });
    }

    const total = items.length;
    const start = (page - 1) * perPage;
    const paged = items.slice(start, start + perPage);
    return NextResponse.json({ items: paged, total });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const root = staging.STAGING_ROOT;
    const dir = path.join(root, id);
    if (!fs.existsSync(dir)) return NextResponse.json({ error: "not found" }, { status: 404 });
    // Recursively remove
    fs.rmSync(dir, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
