import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartTicker } from "@/components/home/ChartTicker";
import { Constellation } from "@/components/home/Constellation";
import { MethodDial } from "@/components/home/MethodDial";
import { SplitText } from "@/components/SplitText";
import { Arrow, ArticleCard, CtaBand, Kicker, OfferingCard } from "@/components/ui";
import { getServices, serviceKeys } from "@/content/services";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { listPublished } from "@/lib/repo/articles";
import { listOfferings } from "@/lib/repo/offerings";
import { href, routes } from "@/lib/paths";

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error("[home]", e instanceof Error ? e.message : e);
    return fallback;
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.home;
  const services = getServices(locale);
  const [offerings, articles] = await Promise.all([safe(listOfferings(), []), safe(listPublished(locale, 3), [])]);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="hero-intro relative flex min-h-[100svh] flex-col justify-end pb-10 pt-[calc(var(--header-h)+4rem)] md:justify-center md:pb-24">
        <div className="container-x relative">
          <p className="eyebrow mb-8 max-md:mt-[38svh]" data-reveal style={{ ["--d" as string]: "100ms" }}>
            {t.eyebrow}
          </p>
          <h1 className="t-hero text-ivory">
            <SplitText text={t.titleA} className="block" delay={200} />
            <SplitText text={t.titleB} className="block md:ps-[6vw]" delay={200} startIndex={2} />
            <SplitText text={t.titleC} className="block" wordClassName="text-gradient-gold italic-accent" delay={200} startIndex={4} />
          </h1>
          <div className="mt-10 max-w-xl">
            <p className="lede" data-reveal style={{ ["--d" as string]: "800ms" }}>
              {t.lede}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4" data-reveal style={{ ["--d" as string]: "1000ms" }}>
              <Link href={href(locale, routes.consultations)} className="btn btn-primary group">
                {t.ctaPrimary} <Arrow />
              </Link>
              <Link href={href(locale, routes.pricing)} className="btn btn-ghost">
                {t.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.65rem] uppercase tracking-[0.4em] text-mist md:flex" data-reveal="fade" style={{ ["--d" as string]: "1500ms" }}>
          {dict.common.scroll}
          <span className="relative h-12 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-gold [animation:scroll-cue_2.4s_var(--ease-in-out-quint)_infinite]" />
          </span>
        </div>
      </section>

      <ChartTicker />

      {/* ───────── Manifesto ───────── */}
      <section className="section">
        <div className="container-x grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Kicker>{t.manifestoKicker}</Kicker>
          </div>
          <div className="md:col-span-8">
            <p className="font-display text-[clamp(1.6rem,3.1vw,2.7rem)] leading-[1.3] text-ivory/90" data-reveal>
              {t.manifesto}
            </p>
            <dl className="mt-16 grid grid-cols-3 gap-6 border-t border-line pt-10">
              {t.manifestoPoints.map((pt, i) => (
                <div key={i} data-reveal style={{ ["--d" as string]: `${i * 120}ms` }}>
                  <dt className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-none text-gradient-gold" dir="ltr">
                    {pt.k}
                  </dt>
                  <dd className="mt-3 text-sm text-mist">{pt.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ───────── Constellation of expertise ───────── */}
      <section className="section">
        <div className="container-x">
          <div className="max-w-3xl">
            <Kicker>{t.constellationKicker}</Kicker>
            <SplitText as="h2" text={t.constellationTitle} className="t-2 mt-6 block text-ivory" />
            <p className="mt-6 hidden text-sm text-mist md:block" data-reveal>{t.constellationHint}</p>
          </div>
          <div className="mt-16">
            <Constellation
              rtl={locale === "ar"}
              cta={dict.common.discover}
              items={serviceKeys.map((k) => ({
                key: k,
                title: services[k].short,
                tagline: services[k].tagline,
                href: href(locale, routes.service(k)),
              }))}
            />
          </div>
        </div>
      </section>

      {/* ───────── Method (pinned dial) ───────── */}
      <section className="py-[clamp(4rem,8vw,6rem)]">
        <MethodDial steps={t.methodSteps} kicker={t.methodKicker} title={t.methodTitle} />
      </section>

      {/* ───────── About teaser ───────── */}
      <section className="section">
        <div className="container-x grid items-center gap-16 md:grid-cols-12">
          <div className="relative md:col-span-5" data-reveal="scale">
            <div className="relative mx-auto aspect-square max-w-md">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-gold" aria-hidden="true">
                <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth=".4" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth=".4" strokeDasharray="1 3" />
                <g className="spin-slow" style={{ transformOrigin: "100px 100px" }}>
                  <circle cx="100" cy="4" r="2.2" fill="#ecd39f" />
                  <circle cx="196" cy="100" r="1.2" fill="#cfae76" />
                </g>
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-[clamp(9rem,22vw,15rem)] leading-none text-gradient-gold" dir="ltr">8</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <Kicker>{t.aboutKicker}</Kicker>
            <SplitText as="h2" text={t.aboutTitle} className="t-2 mt-6 block text-ivory" />
            <p className="lede mt-8 max-w-xl" data-reveal>{t.aboutBody}</p>
            <div className="mt-10" data-reveal>
              <Link href={href(locale, routes.about)} className="btn btn-ghost group">
                {t.aboutCta} <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Process ───────── */}
      <section className="section">
        <div className="container-x">
          <Kicker>{t.processKicker}</Kicker>
          <SplitText as="h2" text={t.processTitle} className="t-2 mt-6 block max-w-2xl text-ivory" />
          <ol className="relative mt-16 grid gap-6 md:grid-cols-4">
            <span className="absolute inset-x-0 top-[2.15rem] hidden h-px bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 md:block" aria-hidden="true" />
            {t.process.map((s, i) => (
              <li key={i} className="relative" data-reveal style={{ ["--d" as string]: `${i * 120}ms` }}>
                <span className="relative z-10 grid h-[4.3rem] w-[4.3rem] place-items-center rounded-full border border-gold/40 bg-ink font-display text-2xl text-gold-bright">
                  {i + 1}
                </span>
                <h3 className="mt-6 font-display text-2xl text-ivory">{s.title}</h3>
                <p className="mt-2 text-mist">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Offerings ───────── */}
      {offerings.length > 0 && (
        <section className="section">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-2xl">
                <Kicker>{t.pricingKicker}</Kicker>
                <SplitText as="h2" text={t.pricingTitle} className="t-2 mt-6 block text-ivory" />
              </div>
              <Link href={href(locale, routes.pricing)} className="btn btn-ghost group" data-reveal>
                {t.pricingCta} <Arrow />
              </Link>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offerings.slice(0, 6).map((o, i) => (
                <OfferingCard
                  key={o.id}
                  o={o}
                  locale={locale}
                  dict={dict}
                  i={i}
                  action={
                    <Link href={`${href(locale, routes.pricing)}?offering=${o.id}#booking`} className="inline-flex items-center gap-2 text-sm text-gold-bright group">
                      {dict.nav.book} <Arrow />
                    </Link>
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Journal ───────── */}
      {articles.length > 0 && (
        <section className="section">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-2xl">
                <Kicker>{t.journalKicker}</Kicker>
                <SplitText as="h2" text={t.journalTitle} className="t-2 mt-6 block text-ivory" />
              </div>
              <Link href={href(locale, routes.journal)} className="btn btn-ghost group" data-reveal>
                {t.journalCta} <Arrow />
              </Link>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {articles.map((a, i) => (
                <ArticleCard key={a.id} a={a} locale={locale} dict={dict} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand locale={locale} dict={dict} title={t.finalTitle} body={t.finalBody} />
    </>
  );
}
