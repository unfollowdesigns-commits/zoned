export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeMeta: Record<Locale, { label: string; short: string; dir: "ltr" | "rtl"; htmlLang: string; og: string }> = {
  fr: { label: "Français", short: "FR", dir: "ltr", htmlLang: "fr", og: "fr_FR" },
  en: { label: "English", short: "EN", dir: "ltr", htmlLang: "en", og: "en_GB" },
  ar: { label: "العربية", short: "ع", dir: "rtl", htmlLang: "ar", og: "ar_AR" },
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}
