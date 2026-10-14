import { notFound } from "next/navigation";
import { SplitText } from "@/components/SplitText";
import { CtaBand, Kicker, PageHero } from "@/components/ui";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { routes } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).about;
  return pageMetadata(locale, routes.about, { title: t.title.replace(/\.$/, ""), description: t.lede });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.about;

  return (
    <>
      <PageHero kicker={t.kicker} title={t.title} lede={t.lede} />

      <section className="pb-[clamp(4rem,10vw,8rem)]">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {/* Portrait placeholder: an engraved orbit until Rania's photograph is added */}
            <figure className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] border border-line" data-reveal="scale">
              <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_35%,rgba(145,137,208,0.28),transparent_70%),radial-gradient(60%_50%_at_50%_100%,rgba(207,174,118,0.22),transparent_70%)]" />
              <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full text-gold" aria-hidden="true">
                {[30, 50, 70, 90].map((r, i) => (
                  <ellipse key={r} cx="100" cy="110" rx={r} ry={r * 0.36} fill="none" stroke="currentColor" strokeOpacity={0.4 - i * 0.07} strokeWidth=".4" transform={`rotate(${-24 + i * 6} 100 110)`} />
                ))}
                <circle cx="100" cy="110" r="14" fill="#ecd39f" fillOpacity=".9" />
                <circle cx="100" cy="110" r="26" fill="#ecd39f" fillOpacity=".08" />
                <circle cx="168" cy="82" r="2.5" fill="#d9dcff" />
                <circle cx="44" cy="130" r="1.6" fill="#cfae76" />
              </svg>
              <figcaption className="absolute inset-x-0 bottom-0 p-8 font-display text-2xl leading-snug text-ivory/90 italic-accent">
                {locale === "en" ? `“${t.quote}”` : `« ${t.quote} »`}
              </figcaption>
            </figure>
          </div>
          <div className="lg:col-span-7">
            <Kicker>{t.storyTitle}</Kicker>
            {t.story.map((p, i) => (
              <p key={i} className={`mt-8 ${i === 0 ? "font-display text-[clamp(1.4rem,2.3vw,1.9rem)] leading-[1.45] text-ivory/90" : "text-lg text-ivory/75"}`} data-reveal>
                {p}
              </p>
            ))}
            <div className="mt-16">
              <Kicker>{t.methodTitle}</Kicker>
              {t.method.map((p, i) => (
                <p key={i} className="mt-6 text-lg text-ivory/75" data-reveal>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section border-t border-line">
        <div className="container-x">
          <SplitText as="h2" text={t.valuesTitle} className="t-2 block max-w-2xl text-ivory" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.values.map((v, i) => (
              <div key={i} className="card p-8" data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                <span className="font-display text-4xl text-gold/70">{["✦", "◐", "◎", "☊"][i]}</span>
                <h3 className="mt-6 font-display text-2xl text-ivory">{v.title}</h3>
                <p className="mt-3 text-mist">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand locale={locale} dict={dict} title={dict.home.finalTitle} body={dict.home.finalBody} />
    </>
  );
}
