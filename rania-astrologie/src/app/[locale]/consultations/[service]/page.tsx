import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceGlyph } from "@/components/ServiceGlyph";
import { SplitText } from "@/components/SplitText";
import { Arrow, CtaBand, Kicker } from "@/components/ui";
import { getServices, isServiceKey, serviceKeys } from "@/content/services";
import { getDictionary } from "@/i18n";
import { isLocale, locales } from "@/i18n/config";
import { listOfferings, type Offering } from "@/lib/repo/offerings";
import { href, routes } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/time";

export function generateStaticParams() {
  return locales.flatMap((locale) => serviceKeys.map((service) => ({ locale, service })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; service: string }> }) {
  const { locale, service } = await params;
  if (!isLocale(locale) || !isServiceKey(service)) return {};
  const s = getServices(locale)[service];
  return pageMetadata(locale, routes.service(service), { title: s.title, description: s.seoDescription });
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

export default async function ServicePage({ params }: { params: Promise<{ locale: string; service: string }> }) {
  const { locale, service } = await params;
  if (!isLocale(locale) || !isServiceKey(service)) notFound();
  const dict = getDictionary(locale);
  const all = getServices(locale);
  const s = all[service];
  const t = dict.services;
  let offerings: Offering[] = [];
  try {
    offerings = (await listOfferings()).filter((o) => o.serviceKey === service);
  } catch (e) {
    console.error("[service]", e);
  }
  const index = serviceKeys.indexOf(service);
  const related = serviceKeys.filter((k) => k !== service).slice(0, 6);
  const bookHref = `${href(locale, routes.pricing)}${offerings[0] ? `?offering=${offerings[0].id}` : ""}#booking`;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-[calc(var(--header-h)+clamp(4rem,12vw,9rem))] pb-[clamp(3rem,8vw,6rem)]">
        <div className="container-x">
          <div className="max-w-4xl">
            <Kicker>
              {t.kicker} · {ROMAN[index]}
            </Kicker>
            <div className="mt-8 flex items-center gap-6" data-reveal>
              <ServiceGlyph k={service} className="h-16 w-16 text-gold md:h-20 md:w-20" />
            </div>
            <SplitText as="h1" text={s.title} className="t-1 mt-6 block text-ivory" />
            <p className="lede mt-8 max-w-2xl" data-reveal style={{ ["--d" as string]: "200ms" }}>
              {s.lede}
            </p>
            <div className="mt-10 flex flex-wrap gap-4" data-reveal style={{ ["--d" as string]: "350ms" }}>
              <Link href={bookHref} className="btn btn-primary group">
                {dict.common.bookConsultation} <Arrow />
              </Link>
              <Link href={href(locale, routes.contact)} className="btn btn-ghost">
                {dict.common.writeToMe}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="pb-[clamp(4rem,10vw,8rem)]">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {s.intro.map((p, i) => (
              <p key={i} className={i === 0 ? "font-display text-[clamp(1.4rem,2.3vw,1.9rem)] leading-[1.45] text-ivory/90" : "text-lg text-ivory/75"} data-reveal>
                {p}
              </p>
            ))}

            {s.sections?.map((sec, i) => (
              <div key={i} className="card mt-10 p-8 md:p-10" data-reveal>
                <p className="font-display text-sm text-gold">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="t-3 mt-2 text-ivory">{sec.title}</h2>
                {sec.body.map((p, j) => (
                  <p key={j} className="mt-4 text-ivory/75">{p}</p>
                ))}
              </div>
            ))}

            <div className="pt-12">
              <h2 className="t-2 text-ivory" data-reveal>{t.explores}</h2>
              <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
                {s.explores.map((e, i) => (
                  <li key={i} className="bg-ink/80 p-6 backdrop-blur" data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                    <span className="font-display text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-2 text-ivory/85">{e}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-12">
              <h2 className="t-2 text-ivory" data-reveal>{t.approach}</h2>
              {s.approach.map((p, i) => (
                <p key={i} className="mt-6 text-lg text-ivory/75" data-reveal>{p}</p>
              ))}
            </div>

            <div className="pt-12">
              <h2 className="t-2 text-ivory" data-reveal>{t.forWhom}</h2>
              <ul className="mt-8 space-y-4">
                {s.questions.map((q, i) => (
                  <li key={i} className="flex gap-4 border-b border-line pb-4 font-display text-xl text-ivory/90 italic-accent md:text-2xl" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                    <span className="text-gold not-italic">✦</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {s.note && (
              <p className="mt-12 rounded-2xl border border-gold/20 bg-gold/[0.04] p-6 text-sm leading-relaxed text-mist" data-reveal>
                {s.note}
              </p>
            )}
          </div>

          {/* Practical — sticky */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="glass sticky top-28 rounded-3xl p-8" data-reveal>
              <p className="eyebrow">{t.practical}</p>
              <dl className="mt-6 space-y-5 text-sm">
                {offerings.length > 0 ? (
                  offerings.map((o) => (
                    <div key={o.id} className="border-b border-line pb-5">
                      <dt className="font-display text-lg text-ivory">{o.name[locale]}</dt>
                      <dd className="mt-1 flex justify-between text-mist">
                        <span>
                          {t.duration} · {o.durationMin} {dict.common.minutes}
                        </span>
                        <span className="font-display text-xl text-gold-bright">{formatPrice(o.priceCents, o.currency, locale)}</span>
                      </dd>
                    </div>
                  ))
                ) : null}
                <div>
                  <dt className="text-mist">{t.format}</dt>
                  <dd className="mt-1 text-ivory">{t.formatValue}</dd>
                </div>
                <div>
                  <dt className="text-mist">{t.prepare}</dt>
                  <dd className="mt-2 space-y-1.5 text-ivory">
                    {t.prepareItems.map((p) => (
                      <p key={p} className="flex gap-2">
                        <span className="text-gold">·</span>
                        {p}
                      </p>
                    ))}
                    {service === "relational" && <p className="text-xs text-gold/80">✦ {dict.pricing.partnerNeeded}</p>}
                  </dd>
                </div>
              </dl>
              <Link href={bookHref} className="btn btn-primary group mt-8 w-full">
                {dict.nav.book} <Arrow />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="section border-t border-line">
        <div className="container-x">
          <Kicker>{t.related}</Kicker>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((k, i) => (
              <Link key={k} href={href(locale, routes.service(k))} className="card group flex items-center gap-5 p-6" data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                <ServiceGlyph k={k} className="h-11 w-11 shrink-0 text-gold transition-transform duration-700 group-hover:rotate-12" />
                <span className="flex-1">
                  <span className="block font-display text-xl text-ivory">{all[k].title}</span>
                  <span className="mt-0.5 block text-sm text-mist line-clamp-2">{all[k].tagline}</span>
                </span>
                <span className="text-gold">
                  <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand locale={locale} dict={dict} title={dict.home.finalTitle} body={dict.home.finalBody} />
    </>
  );
}
