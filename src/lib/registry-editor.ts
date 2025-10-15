import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment } from "ts-morph";

export interface RegistryEditOptions {
  slug: string;
  fileContent: string;
}

/**
 * Take the source text of component-registry.ts and return an updated source
 * with imports and componentMap entries for the given slug. Returns null if
 * no changes were necessary.
 */
export function addTemplateToRegistry(opts: RegistryEditOptions): string | null {
  const { slug, fileContent } = opts;
  const project = new Project({ useInMemoryFileSystem: true });
  const sf = project.createSourceFile("component-registry.ts", fileContent, { overwrite: true });

  const pascal = slug[0].toUpperCase() + slug.slice(1);
  const importNameHero = `${pascal}Hero`;
  const importNameStory = `${pascal}Story`;
  const importNameGallery = `${pascal}Gallery`;
  const importNameGift = `${pascal}Gift`;
  const importNameGuest = `${pascal}Guest`;

  // Check if the hero import already exists (use as marker)
  const alreadyImported = sf
    .getImportDeclarations()
    .some((d) => d.getModuleSpecifierValue() === `@/app/templates/${slug}/${pascal}Hero`);

  if (!alreadyImported) {
    // add import declarations
    sf.addImportDeclaration({
      defaultImport: importNameHero,
      moduleSpecifier: `@/app/templates/${slug}/${pascal}Hero`,
    });
    sf.addImportDeclaration({
      defaultImport: importNameStory,
      moduleSpecifier: `@/app/templates/${slug}/${pascal}Story`,
    });
    sf.addImportDeclaration({
      defaultImport: importNameGallery,
      moduleSpecifier: `@/app/templates/${slug}/${pascal}Gallery`,
    });
    sf.addImportDeclaration({
      defaultImport: importNameGift,
      moduleSpecifier: `@/app/templates/${slug}/${pascal}Gift`,
    });
    sf.addImportDeclaration({
      defaultImport: importNameGuest,
      moduleSpecifier: `@/app/templates/${slug}/${pascal}Guest`,
    });
  }

  // Find componentMap variable
  const varStmts = sf.getVariableStatements();
  const componentMapStmt = varStmts.find((v) => v.getText().includes("componentMap"));
  if (!componentMapStmt) return null;
  const decl = componentMapStmt.getDeclarations()[0];
  const initializer = decl.getInitializer();
  if (!initializer) return null;
  const objNode = initializer.asKind(SyntaxKind.ObjectLiteralExpression) as
    | ObjectLiteralExpression
    | undefined;
  if (!objNode) return null; // unsupported
  const properties = objNode.getProperties();
  const keyPrefix = slug.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  // Check existing keys
  const existingKeys = properties
    .map((p) => (p instanceof PropertyAssignment ? p.getName() : undefined))
    .filter((k): k is string => typeof k === "string");

  const entriesToAdd: Array<{ name: string; initializer: string }> = [];
  const candidates = [
    { name: `${keyPrefix}_hero`, initializer: importNameHero },
    { name: `${keyPrefix}_story`, initializer: importNameStory },
    { name: `${keyPrefix}_gallery`, initializer: importNameGallery },
    { name: `${keyPrefix}_gift`, initializer: importNameGift },
    { name: `${keyPrefix}_guest`, initializer: importNameGuest },
  ];
  for (const c of candidates) {
    if (!existingKeys.includes(c.name)) entriesToAdd.push(c);
  }

  if (entriesToAdd.length === 0 && alreadyImported) return null; // nothing to do

  // Append properties to the object literal
  if (entriesToAdd.length > 0) {
    for (const e of entriesToAdd) {
      objNode.addPropertyAssignment({ name: `"${e.name}"`, initializer: e.initializer });
    }
  }

  // Format and return
  const out = sf.getFullText();
  return out;
}
