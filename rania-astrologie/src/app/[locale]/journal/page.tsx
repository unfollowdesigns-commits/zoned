import { notFound } from "next/navigation";
import { ArticleCard, PageHero } from "@/components/ui";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { listPublished, type Article } from "@/lib/repo/articles";
import { href, routes } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).journal;
  return pageMetadata(locale, routes.journal, { title: t.kicker, description: t.lede });
}

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  let articles: Article[] = [];
  try {
    articles = await listPublished(locale);
  } catch (e) {
    console.error("[journal]", e);
  }

  return (
    <>
      <PageHero
        kicker={dict.journal.kicker}
        title={dict.journal.title}
        lede={dict.journal.lede}
        crumbs={[{ name: dict.nav.home, href: href(locale) }, { name: dict.nav.journal, href: href(locale, routes.journal) }]}
      />
      <section className="pb-[clamp(4rem,10vw,8rem)]">
        <div className="container-x">
          {articles.length === 0 ? (
            <p className="card p-12 text-center text-mist">{dict.journal.empty}</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <ArticleCard key={a.id} a={a} locale={locale} dict={dict} i={i % 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
