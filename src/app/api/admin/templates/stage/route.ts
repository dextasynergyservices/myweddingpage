import { NextResponse, type NextRequest } from "next/server";
// admin utilities are imported dynamically to avoid NextResponse.next() usage in app routes
import fs from "fs";
import path from "path";
import staging from "@/lib/staging";
import unzipper from "unzipper";
import ts from "typescript";

// Config
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const runtime = "nodejs";

// We use Request.formData() to parse multipart uploads in this route.
// No formidable types are required here.

// Type guard for manifest shape
function hasPlanIds(obj: unknown): obj is { planIds: unknown } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Object.prototype.hasOwnProperty.call(obj, "planIds")
  );
}

async function handle(req: NextRequest) {
  // Admin check - use requireAdmin() to avoid NextResponse.next() in app routes
  const { requireAdmin } = await import("@/lib/middleware/admin");
  const authError = await requireAdmin();
  if (authError) return authError;

  // Only accept POST
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Parse multipart using the web-standard formData() available on Next.js Request
  let formData: FormData;
  try {
    formData = await (req as unknown as Request).formData();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Failed to parse formData:", msg);
    return NextResponse.json(
      { error: "Failed to parse multipart form data" },
      { status: 400 }
    );
  }

  // Helper to collect files from FormData
  const files: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const entry of formData.entries()) {
    const [key, value] = entry;
    if (files[key]) {
      const existing = files[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        files[key] = [existing, value];
      }
    } else {
      files[key] = value;
    }
  }

  // require manifest
  const manifestEntry = files.manifest;
  if (!manifestEntry) {
    return NextResponse.json(
      { error: "manifest file is required" },
      { status: 400 }
    );
  }

  // Support single or array
  const manifestValue = Array.isArray(manifestEntry)
    ? manifestEntry[0]
    : manifestEntry;
  const isFile = (v: unknown): v is File => {
    try {
      if (!v || typeof v !== "object") return false;
      return typeof (v as { arrayBuffer?: unknown }).arrayBuffer === "function";
    } catch {
      return false;
    }
  };

  if (!isFile(manifestValue)) {
    return NextResponse.json(
      { error: "manifest must be a file" },
      { status: 400 }
    );
  }

  let manifestJson: unknown;
  try {
    const manifestBuffer = Buffer.from(await manifestValue.arrayBuffer());
    manifestJson = JSON.parse(manifestBuffer.toString("utf-8"));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Invalid manifest JSON:", msg);
    return NextResponse.json(
      { error: "manifest is not valid JSON" },
      { status: 400 }
    );
  }

  // enforce planIds
  if (
    !hasPlanIds(manifestJson) ||
    !Array.isArray(manifestJson.planIds) ||
    manifestJson.planIds.length === 0
  ) {
    return NextResponse.json(
      { error: "manifest.planIds must be an array with at least one plan id" },
      { status: 400 }
    );
  }

  // create staging directory
  const dir = staging.createStagingDir();

  // save manifest
  const manifestOut = path.join(dir, "manifest.json");
  fs.writeFileSync(manifestOut, JSON.stringify(manifestJson, null, 2));

  // helper to save File from FormData
  const saveUploaded = async (file: File, subdir = "assets") => {
    const origName = path.basename(file.name || "file");
    const size = file.size ?? 0;
    if (size > MAX_FILE_BYTES) {
      throw new Error(
        `${origName} exceeds max file size of ${MAX_FILE_BYTES} bytes`
      );
    }
    const targetDir = path.join(dir, subdir);
    const dest = path.join(targetDir, origName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    return dest;
  };

  // Save files: manifest was uploaded as 'manifest'; other files may be in files.assets or files.components
  try {
    // Save assets (may be single or array)
    const assetsEntry = files.assets;
    if (assetsEntry) {
      const list = Array.isArray(assetsEntry) ? assetsEntry : [assetsEntry];
      for (const ent of list) {
        if (isFile(ent)) await saveUploaded(ent, "assets");
      }
    }

    // Save components.zip if provided
    const componentsEntry = files.components;
    if (componentsEntry) {
      const comp = Array.isArray(componentsEntry)
        ? componentsEntry[0]
        : componentsEntry;
      if (isFile(comp)) await saveUploaded(comp, "components");
    }
  } catch (err: unknown) {
    const msg = (err instanceof Error && err.message) || String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // If a components zip was uploaded, attempt to extract it and validate .tsx presence
  const componentsDir = path.join(dir, "components");
  let componentsValidation = { hasComponents: false, files: [] as string[] };
  try {
    const entries = fs.readdirSync(componentsDir);
    const zipFile = entries.find((n) => n.toLowerCase().endsWith(".zip"));
    if (zipFile) {
      const zipPath = path.join(componentsDir, zipFile);
      // Extract zip into componentsDir/extracted
      const extractDir = path.join(componentsDir, "extracted");
      fs.mkdirSync(extractDir, { recursive: true });
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(zipPath)
          .pipe(unzipper.Extract({ path: extractDir }))
          .on("close", () => resolve())
          .on("error", (e: unknown) => reject(e));
      });

      // Walk extracted files and find .tsx and perform quick export checks
      function walkAndValidate(dirPath: string, base = "") {
        for (const name of fs.readdirSync(dirPath)) {
          const full = path.join(dirPath, name);
          const rel = base ? base + "/" + name : name;
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            walkAndValidate(full, rel);
          } else if (rel.toLowerCase().endsWith(".tsx")) {
            // read file and run TypeScript parse/AST validation to find exports
            try {
              const content = fs.readFileSync(full, "utf-8");

              // Parse using TypeScript to detect syntax errors
              const sourceFile = ts.createSourceFile(
                full,
                content,
                ts.ScriptTarget.Latest,
                true,
                ts.ScriptKind.TSX
              );

              // Simple diagnostics via a quick parse: we will also attempt to collect syntax errors via createSourceFile + forEachChild
              const syntaxDiagnostics: string[] = [];
              // collect top-level export info
              let hasDefaultExport = false;
              const namedExports: string[] = [];

              const visit = (node: ts.Node) => {
                if (ts.isExportAssignment(node)) {
                  hasDefaultExport = true;
                }
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
                    if (nameNode && ts.isIdentifier(nameNode)) {
                      namedExports.push(nameNode.text);
                    }
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

              // gather some basic diagnostics text
              const diagText: string[] = [];
              try {
                // use a minimal program to get parse diagnostics
                const program = ts.createProgram([full], {
                  allowJs: true,
                  jsx: ts.JsxEmit.React,
                });
                let diags = [] as readonly ts.Diagnostic[];
                try {
                  diags = ts.getPreEmitDiagnostics(program, sourceFile);
                } catch {
                  // fallback to syntactic diagnostics if full program diagnostics fail
                  // use the Program API which is available on the created program instance
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
  } catch (err: unknown) {
    console.error("components zip extraction/validation failed:", err);
    // don't fail the whole request for extraction errors; include validation error
    componentsValidation = { hasComponents: false, files: [] };
  }

  // Build preview JSON referencing staged assets
  const stagedFiles = staging.listStagingFiles(dir);
  const assetUrls = stagedFiles.map(
    (f: string) => `/staging/${path.basename(dir)}/${f}`
  );

  const preview = {
    stagingId: path.basename(dir),
    manifest: manifestJson,
    assets: assetUrls,
    componentsValidation,
  };

  return NextResponse.json({ success: true, preview }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    // Next's Request implements NextRequest in the server environment, cast for handler
    return await handle(req as unknown as NextRequest);
  } catch (err: unknown) {
    const msg = (err instanceof Error && err.message) || String(err);
    console.error("Unexpected error in templates/stage POST:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
