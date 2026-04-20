import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import es from "@/locales/es.json";
import yoruba from "@/locales/yoruba.json";
import igbo from "@/locales/igbo.json";
import hausa from "@/locales/hausa.json";

type Messages = Record<string, unknown>;

const MESSAGES: Record<string, Messages> = {
  en,
  fr,
  es,
  yoruba,
  igbo,
  hausa,
};

export function getMessage(key: string, locale = "en"): string {
  const parts = key.split(".");
  const messages = MESSAGES[locale] ?? MESSAGES["en"];
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      // fallback to english
      return getMessageFallback(key);
    }
  }

  return typeof cur === "string" ? cur : getMessageFallback(key);
}

function getMessageFallback(key: string): string {
  const parts = key.split(".");
  let cur: unknown = MESSAGES["en"];
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key; // final fallback: return key itself
    }
  }

  return typeof cur === "string" ? cur : key;
}
