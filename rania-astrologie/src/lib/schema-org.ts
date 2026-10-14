import type { Locale } from "@/i18n/config";
import { env } from "./env";

// Stable entity ids so search and answer engines can connect the pages into one knowledge graph.
export const ids = {
  website: `${env.siteUrl}/#website`,
  business: `${env.siteUrl}/#business`,
  person: `${env.siteUrl}/#rania`,
};

export const abs = (path: string) => `${env.siteUrl}${path}`;

export function faqPage(items: { q: string; a: string }[], locale: Locale, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: locale,
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}
