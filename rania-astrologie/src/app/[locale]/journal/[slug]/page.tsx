import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { ArticleCard, CtaBand } from "@/components/ui";
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
      images: a.coverMediaId ? [{ url: `${env.siteUrl}/media/${a.coverMediaId}`, alt: a.coverAlt }] : undefined,
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
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const others = (await listPublished(locale, 4)).filter((x) => x.id !== a.id).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    inLanguage: locale,
    datePublished: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
    dateModified: new Date(a.updatedAt).toISOString(),
    author: { "@type": "Person", name: "Rania" },
    image: a.coverMediaId ? `${env.siteUrl}/media/${a.coverMediaId}` : undefined,
    mainEntityOfPage: `${env.siteUrl}/${locale}${routes.article(a.slug)}`,
  };

  return (
    <>
      <article className="pt-[calc(var(--header-h)+clamp(3rem,10vw,7rem))]">
        <header className="container-narrow">
          <Link href={href(locale, routes.journal)} className="eyebrow inline-flex items-center gap-2" data-reveal>
            <span className="rtl-flip">←</span> {dict.journal.back}
          </Link>
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
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
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
