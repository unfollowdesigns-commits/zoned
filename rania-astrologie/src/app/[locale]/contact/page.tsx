import { notFound } from "next/navigation";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/ui";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { routes } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { getSettings, whatsappLink } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).contact;
  return pageMetadata(locale, routes.contact, { title: t.kicker, description: t.lede });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.contact;
  const settings = await getSettings();

  return (
    <>
      <PageHero kicker={t.kicker} title={t.title} lede={t.lede} />
      <section className="pb-[clamp(4rem,10vw,8rem)]">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="glass rounded-[2rem] p-6 md:p-10 lg:col-span-7" data-reveal>
            <ContactForm locale={locale} t={t} errors={dict.forms.errors} common={dict.common} />
          </div>
          <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
            <p className="eyebrow" data-reveal>{t.direct}</p>
            <a href={`mailto:${settings.contact_email}`} className="card group block p-7" data-reveal>
              <span className="field-label">{t.emailLabel}</span>
              <span className="mt-2 block break-all font-display text-2xl text-ivory transition-colors group-hover:text-gold-bright" dir="ltr">
                {settings.contact_email}
              </span>
            </a>
            <a href={whatsappLink(settings.whatsapp, dict.common.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="card group block p-7" data-reveal>
              <span className="field-label">{t.whatsappLabel}</span>
              <span className="mt-2 block font-display text-2xl text-ivory transition-colors group-hover:text-gold-bright">{t.whatsappCta} <span className="rtl-flip inline-block">→</span></span>
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
