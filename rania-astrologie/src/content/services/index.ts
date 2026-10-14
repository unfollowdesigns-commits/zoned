import type { Locale } from "@/i18n/config";
import ar from "./ar";
import en from "./en";
import fr from "./fr";
import type { ServiceCatalog } from "./types";

export * from "./types";

const catalogs: Record<Locale, ServiceCatalog> = { fr, en, ar };

export function getServices(locale: Locale): ServiceCatalog {
  return catalogs[locale];
}
