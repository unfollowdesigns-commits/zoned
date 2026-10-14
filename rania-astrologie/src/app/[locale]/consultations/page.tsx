import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceGlyph } from "@/components/ServiceGlyph";
import { Arrow, CtaBand, PageHero } from "@/components/ui";
import { getServices, serviceKeys } from "@/content/services";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { href, routes } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata(locale, routes.consultations, { title: dict.services.indexTitle, description: dict.services.indexLede });
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

export default async function ConsultationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const services = getServices(locale);

  return (
    <>
      <PageHero
        kicker={dict.nav.consultations}
        title={dict.services.indexTitle}
        lede={dict.services.indexLede}
        crumbs={[{ name: dict.nav.home, href: href(locale) }, { name: dict.nav.consultations, href: href(locale, routes.consultations) }]}
      />
      <section className="pb-24">
        <div className="container-x">
          <ul className="border-t border-line">
            {serviceKeys.map((k, i) => (
              <li key={k} className="border-b border-line" data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                <Link href={href(locale, routes.service(k))} className="group grid items-center gap-6 py-10 md:grid-cols-12 md:py-12">
                  <span className="font-display text-lg text-gold/70 md:col-span-1">{ROMAN[i]}</span>
                  <span className="flex items-center gap-6 md:col-span-6">
                    <ServiceGlyph k={k} className="h-12 w-12 shrink-0 text-gold transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:rotate-[24deg] group-hover:scale-110" />
                    <span className="font-display text-[clamp(1.9rem,3.6vw,3.1rem)] leading-tight text-ivory transition-colors duration-500 group-hover:text-gold-bright">
                      {services[k].title}
                    </span>
                  </span>
                  <span className="text-mist md:col-span-4">{services[k].tagline}</span>
                  <span className="hidden justify-end text-2xl text-gold md:col-span-1 md:flex">
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand locale={locale} dict={dict} title={dict.home.finalTitle} body={dict.home.finalBody} />
    </>
  );
}
