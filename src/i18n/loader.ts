import fs from "fs";
import path from "path";

export function loadMessages(locale: string) {
  const file = path.resolve(process.cwd(), "src", "locales", `${locale}.json`);
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  }

  // fallback to english
  const enFile = path.resolve(process.cwd(), "src", "locales", `en.json`);
  return JSON.parse(fs.readFileSync(enFile, "utf8"));
}
