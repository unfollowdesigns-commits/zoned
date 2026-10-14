import type { Locale } from "./config";
import ar from "./dictionaries/ar";
import en from "./dictionaries/en";
import fr, { type Dictionary } from "./dictionaries/fr";

const dictionaries: Record<Locale, Dictionary> = { fr, en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

export type { Dictionary };
