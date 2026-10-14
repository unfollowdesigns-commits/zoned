import type { Metadata } from "next";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { env } from "./env";

/** Builds per-page metadata with canonical + hreflang alternates for all locales. */
export function pageMetadata(locale: Locale, path: string, opts: { title?: string; description?: string; noindex?: boolean } = {}): Metadata {
  const dict = getDictionary(locale);
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${env.siteUrl}/${l}${path}`;
  languages["x-default"] = `${env.siteUrl}/fr${path}`;
  const title = opts.title ? `${opts.title} · Rania` : dict.meta.defaultTitle;
  const description = opts.description ?? dict.meta.description;
  return {
    title,
    description,
    alternates: { canonical: `${env.siteUrl}/${locale}${path}`, languages },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      locale: localeMeta[locale].og,
      url: `${env.siteUrl}/${locale}${path}`,
      title,
      description,
      images: [{ url: `${env.siteUrl}/${locale}/opengraph-image`, width: 1200, height: 630, alt: dict.meta.defaultTitle }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${env.siteUrl}/${locale}/opengraph-image`] },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}
