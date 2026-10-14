import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CancelForm } from "@/components/forms/CancelForm";
import { PageHero } from "@/components/ui";
import { fill, getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getBookingByToken } from "@/lib/repo/bookings";
import { getSettings } from "@/lib/settings";
import { formatDateTime, formatPrice } from "@/lib/time";

export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ManageBookingPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.manage;
  const booking = await getBookingByToken(decodeURIComponent(token));
  const settings = await getSettings();

  if (!booking) {
    return <PageHero kicker={t.title} title={t.invalid} />;
  }
  const canCancel = ["pending", "confirmed"].includes(booking.status);
  const hours = Number(settings.cancellation_hours) || 48;

  return (
    <>
      <PageHero kicker={t.title} title={booking.offeringName} />
      <section className="pb-32">
        <div className="container-narrow">
          <div className="glass rounded-[2rem] p-8 md:p-12" data-reveal>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="field-label">{t.status}</dt>
                <dd className="mt-2 font-display text-2xl text-gold-bright">{t.statuses[booking.status]}</dd>
              </div>
              <div>
                <dt className="field-label">{dict.booking.reference}</dt>
                <dd className="mt-2 font-display text-2xl tracking-wider text-ivory" dir="ltr">{booking.ref}</dd>
              </div>
              {booking.startsAt && (
                <div className="sm:col-span-2">
                  <dt className="field-label">{t.when}</dt>
                  <dd className="mt-2 text-lg text-ivory">
                    {formatDateTime(booking.startsAt, locale, settings.timezone)} <span className="text-sm text-mist">({settings.timezone})</span>
                  </dd>
                </div>
              )}
              <div>
                <dt className="field-label">{dict.services.price}</dt>
                <dd className="mt-2 text-lg text-ivory">{formatPrice(booking.priceCents, booking.currency, locale)}</dd>
              </div>
              <div>
                <dt className="field-label">{dict.booking.format}</dt>
                <dd className="mt-2 text-lg text-ivory">{dict.booking.formats[booking.format as "video" | "phone" | "whatsapp"] ?? booking.format}</dd>
              </div>
            </dl>
            {canCancel && (
              <div className="mt-10 border-t border-line pt-8">
                <p className="mb-5 text-sm text-mist">{fill(dict.pricing.terms[3].body, { hours })}</p>
                <CancelForm token={decodeURIComponent(token)} t={t} rateLimited={dict.forms.errors.rateLimited} />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
