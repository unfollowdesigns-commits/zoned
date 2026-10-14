import Link from "next/link";
import { notFound } from "next/navigation";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { ServiceGlyph } from "@/components/ServiceGlyph";
import { CtaBand, PageHero } from "@/components/ui";
import { getServices, serviceKeys } from "@/content/services";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { href, routes } from "@/lib/paths";
import { abs, faqPage } from "@/lib/schema-org";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).faq;
  return pageMetadata(locale, routes.faq, { title: t.title, description: t.seo });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const services = getServices(locale);
  const all = [...dict.faq.items, ...serviceKeys.flatMap((k) => services[k].faq)];

  return (
    <>
      <PageHero
        kicker={dict.faq.nav}
        title={dict.faq.title}
        lede={dict.faq.lede}
        crumbs={[{ name: dict.nav.home, href: href(locale) }, { name: dict.faq.nav, href: href(locale, routes.faq) }]}
      />
      <section className="pb-24">
        <div className="container-narrow">
          <Faq items={dict.faq.items} level={2} />
        </div>
      </section>
      {serviceKeys.map((k) => (
        <section key={k} className="pb-20" aria-labelledby={`faq-${k}`}>
          <div className="container-narrow">
            <Link href={href(locale, routes.service(k))} className="group mb-4 flex items-center gap-4" data-reveal>
              <ServiceGlyph k={k} className="h-9 w-9 text-gold" />
              <h2 id={`faq-${k}`} className="t-3 text-ivory transition-colors group-hover:text-gold-bright">{services[k].title}</h2>
            </Link>
            <Faq items={services[k].faq} />
          </div>
        </section>
      ))}
      <JsonLd data={faqPage(all, locale, abs(href(locale, routes.faq)))} />
      <CtaBand locale={locale} dict={dict} title={dict.home.finalTitle} body={dict.home.finalBody} />
    </>
  );
}
