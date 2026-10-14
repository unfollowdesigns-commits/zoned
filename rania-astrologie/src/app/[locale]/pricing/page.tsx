import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/forms/BookingWizard";
import { SplitText } from "@/components/SplitText";
import { Kicker, PageHero } from "@/components/ui";
import { fill, getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { listOfferings, type Offering } from "@/lib/repo/offerings";
import { listOpenSlots, type Slot } from "@/lib/repo/slots";
import { href, routes } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/time";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pricing;
  return pageMetadata(locale, routes.pricing, { title: t.kicker, description: t.lede });
}

export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ offering?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { offering } = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.pricing;
  const settings = await getSettings();
  let offerings: Offering[] = [];
  let slots: Slot[] = [];
  try {
    [offerings, slots] = await Promise.all([listOfferings(), listOpenSlots()]);
  } catch (e) {
    console.error("[pricing]", e);
  }
  const hours = Number(settings.cancellation_hours) || 48;

  return (
    <>
      <PageHero kicker={t.kicker} title={t.title} lede={t.lede} />

      <section id="booking" className="scroll-mt-24 pb-[clamp(4rem,10vw,8rem)]">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {offerings.length === 0 ? (
              <div className="card p-10 text-center text-mist">{t.noOfferings}</div>
            ) : (
              <div className="glass rounded-[2rem] p-6 md:p-10" data-reveal>
                <BookingWizard
                  locale={locale}
                  t={dict.booking}
                  errors={dict.forms.errors}
                  common={dict.common}
                  contactHref={href(locale, routes.contact)}
                  initialOfferingId={offering ? Number(offering) : undefined}
                  offerings={offerings.map((o) => ({
                    id: o.id,
                    name: o.name[locale],
                    summary: o.summary[locale],
                    duration: o.durationMin,
                    price: formatPrice(o.priceCents, o.currency, locale),
                    requiresPartner: o.requiresPartner,
                  }))}
                  slots={slots.map((s) => ({ id: s.id, startsAt: s.startsAt, durationMin: s.durationMin }))}
                />
              </div>
            )}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <Kicker>{t.termsTitle}</Kicker>
            <dl className="mt-8 space-y-8">
              {t.terms.map((term, i) => (
                <div key={i} className="border-b border-line pb-8" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
                  <dt className="font-display text-2xl text-ivory">{term.title}</dt>
                  <dd className="mt-2 text-mist">{fill(term.body, { hours })}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm leading-relaxed text-faint" data-reveal>{t.disclaimer}</p>
          </aside>
        </div>
      </section>

      {offerings.length > 0 && (
        <section className="section border-t border-line">
          <div className="container-x">
            <SplitText as="h2" text={dict.home.pricingTitle} className="t-2 block max-w-2xl text-ivory" />
            <div className="mt-12 overflow-hidden rounded-3xl border border-line">
              <table className="w-full text-start">
                <tbody>
                  {offerings.map((o) => (
                    <tr key={o.id} className="border-b border-line last:border-0">
                      <td className="p-5 md:p-7">
                        <p className="font-display text-xl text-ivory md:text-2xl">{o.name[locale]}</p>
                        {o.summary[locale] && <p className="mt-1 hidden text-sm text-mist md:block">{o.summary[locale]}</p>}
                      </td>
                      <td className="whitespace-nowrap p-5 text-sm text-mist md:p-7">{o.durationMin} {dict.common.minutes}</td>
                      <td className="whitespace-nowrap p-5 text-end font-display text-2xl text-gold-bright md:p-7">
                        {formatPrice(o.priceCents, o.currency, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
