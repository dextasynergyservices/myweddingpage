import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const STAGING_ROOT =
  process.env.TEMPLATE_STAGING_ROOT || path.join(process.cwd(), "staging");

export function ensureStagingRoot() {
  if (!fs.existsSync(STAGING_ROOT)) {
    fs.mkdirSync(STAGING_ROOT, { recursive: true });
  }
}

export function createStagingDir(): string {
  ensureStagingRoot();
  const id = randomUUID();
  const dir = path.join(STAGING_ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, "assets"), { recursive: true });
  fs.mkdirSync(path.join(dir, "components"), { recursive: true });
  fs.mkdirSync(path.join(dir, "styles"), { recursive: true });
  return dir;
}

export function saveFile(targetDir: string, filename: string, buffer: Buffer) {
  const safeName = path.basename(filename);
  const outPath = path.join(targetDir, safeName);
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

export function listStagingFiles(dir: string) {
  function walk(dirPath: string, base = "") {
    const entries: string[] = [];
    for (const name of fs.readdirSync(dirPath)) {
      const full = path.join(dirPath, name);
      const rel = base ? base + "/" + name : name;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        entries.push(...walk(full, rel));
      } else {
        entries.push(rel);
      }
    }
    return entries;
  }
  return walk(dir);
}

const staging = {
  createStagingDir,
  saveFile,
  listStagingFiles,
  STAGING_ROOT,
};

export default staging;
