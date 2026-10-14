import type { MetadataRoute } from "next";
import { serviceKeys } from "@/content/services/types";
import { locales } from "@/i18n/config";
import { env } from "@/lib/env";
import { routes } from "@/lib/paths";
import { listAllPublished, type Article } from "@/lib/repo/articles";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [routes.home, routes.about, routes.consultations, ...serviceKeys.map(routes.service), routes.pricing, routes.journal, routes.contact, routes.privacy, routes.legal];
  const entries: MetadataRoute.Sitemap = paths.map((p) => ({
    url: `${env.siteUrl}/fr${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.startsWith("/consultations") ? 0.9 : 0.6,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${env.siteUrl}/${l}${p}`])) },
  }));
  // List every locale explicitly too (some crawlers ignore alternates).
  for (const l of locales.filter((x) => x !== "fr")) for (const p of paths) entries.push({ url: `${env.siteUrl}/${l}${p}`, changeFrequency: "monthly", priority: 0.5 });
  let articles: Article[] = [];
  try {
    articles = await listAllPublished();
  } catch {}
  for (const a of articles)
    entries.push({ url: `${env.siteUrl}/${a.locale}${routes.article(a.slug)}`, lastModified: new Date(a.updatedAt), changeFrequency: "yearly", priority: 0.7 });
  return entries;
}
