import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ArticleCard, CtaBand } from "@/components/ui";
import { abs, ids } from "@/lib/schema-org";
import { getDictionary } from "@/i18n";
import { isLocale, localeMeta, type Locale } from "@/i18n/config";
import { env } from "@/lib/env";
import { renderMarkdown } from "@/lib/markdown";
import { getPublished, listAllPublished, listPublished, listTranslations, readingMinutes } from "@/lib/repo/articles";
import { href, routes } from "@/lib/paths";
import { formatDate } from "@/lib/time";

const load = cache(async (locale: Locale, slug: string) => getPublished(locale, slug));

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const a = await load(locale, decodeURIComponent(slug));
  if (!a) return {};
  const languages: Record<string, string> = {};
  if (a.groupKey) for (const tr of await listTranslations(a.groupKey)) languages[tr.locale] = `${env.siteUrl}/${tr.locale}${routes.article(tr.slug)}`;
  const url = `${env.siteUrl}/${locale}${routes.article(a.slug)}`;
  return {
    title: `${a.title} · Rania`,
    description: a.excerpt,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "article",
      url,
      title: a.title,
      description: a.excerpt,
      locale: localeMeta[locale].og,
      publishedTime: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
      images: [a.coverMediaId ? { url: `${env.siteUrl}/media/${a.coverMediaId}`, alt: a.coverAlt } : { url: `${env.siteUrl}/${locale}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug: rawSlug } = await params;
  if (!isLocale(locale)) notFound();
  const slug = decodeURIComponent(rawSlug);
  const dict = getDictionary(locale);
  const a = await load(locale, slug);

  if (!a) {
    // Arriving from the language switcher with another locale's slug → go to the translation if it exists.
    const any = (await listAllPublished()).find((x) => x.slug === slug);
    if (any?.groupKey) {
      const tr = (await listTranslations(any.groupKey)).find((x) => x.locale === locale);
      if (tr) redirect(href(locale, routes.article(tr.slug)));
    }
    if (any) redirect(href(locale, routes.journal));
    notFound();
  }

  const html = renderMarkdown(a.contentMd);
  const others = (await listPublished(locale, 4)).filter((x) => x.id !== a.id).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    inLanguage: locale,
    datePublished: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
    dateModified: new Date(a.updatedAt).toISOString(),
    author: { "@id": ids.person, "@type": "Person", name: "Rania", url: abs(href(locale, routes.about)) },
    publisher: { "@id": ids.business },
    image: a.coverMediaId ? `${env.siteUrl}/media/${a.coverMediaId}` : undefined,
    mainEntityOfPage: `${env.siteUrl}/${locale}${routes.article(a.slug)}`,
  };

  return (
    <>
      <article className="pt-[calc(var(--header-h)+clamp(3rem,10vw,7rem))]">
        <header className="container-narrow">
          <Breadcrumbs
            items={[
              { name: dict.nav.home, href: href(locale) },
              { name: dict.nav.journal, href: href(locale, routes.journal) },
              { name: a.title, href: href(locale, routes.article(a.slug)) },
            ]}
          />
          <h1 className="t-1 mt-8 text-ivory" data-reveal>{a.title}</h1>
          <p className="mt-6 text-sm text-mist" data-reveal>
            {dict.journal.publishedOn} {a.publishedAt ? formatDate(a.publishedAt, locale) : ""} · {readingMinutes(a.contentMd)} {dict.common.readingTime}
          </p>
          {a.excerpt && <p className="lede mt-8" data-reveal>{a.excerpt}</p>}
        </header>
        {a.coverMediaId && (
          <figure className="container-x mt-14" data-reveal="scale">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/media/${a.coverMediaId}`} alt={a.coverAlt} className="mx-auto max-h-[70vh] w-full max-w-5xl rounded-[2rem] object-cover" />
          </figure>
        )}
        <div className="container-narrow mt-16">
          <div className="prose-astro" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <JsonLd data={jsonLd} />
      </article>

      {others.length > 0 && (
        <section className="section mt-16 border-t border-line">
          <div className="container-x">
            <h2 className="t-2 text-ivory" data-reveal>{dict.journal.otherArticles}</h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {others.map((o, i) => (
                <ArticleCard key={o.id} a={o} locale={locale} dict={dict} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand locale={locale} dict={dict} title={dict.home.finalTitle} body={dict.home.finalBody} />
    </>
  );
}
