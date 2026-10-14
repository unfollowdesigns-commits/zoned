import type { Locale } from "@/i18n/config";

export const href = (locale: Locale, path = "") => `/${locale}${path === "/" ? "" : path}`;

export const routes = {
  home: "",
  about: "/about",
  consultations: "/consultations",
  service: (key: string) => `/consultations/${key}`,
  pricing: "/pricing",
  contact: "/contact",
  journal: "/journal",
  article: (slug: string) => `/journal/${encodeURIComponent(slug)}`,
  privacy: "/privacy",
  legal: "/legal",
};
