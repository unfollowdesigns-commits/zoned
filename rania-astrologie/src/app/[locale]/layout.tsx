import "../globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Cosmos from "@/components/cosmos/Cosmos";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Interactions } from "@/components/Interactions";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { JsonLd } from "@/components/JsonLd";
import { href, routes } from "@/lib/paths";
import { abs, ids } from "@/lib/schema-org";
import { getServices, serviceKeys } from "@/content/services";
import { getDictionary } from "@/i18n";
import { isLocale, localeMeta, locales } from "@/i18n/config";
import { env } from "@/lib/env";
import { getSettings, whatsappLink } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import { fontVariables } from "../fonts";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    metadataBase: new URL(env.siteUrl),
    applicationName: "Rania",
    authors: [{ name: "Rania" }],
    formatDetection: { telephone: false, email: false, address: false },
    ...pageMetadata(locale, ""),
  };
}

export const viewport: Viewport = {
  themeColor: "#05060c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const brandLabel = { fr: "Astrologie", en: "Astrology", ar: "التنجيم" } as const;

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const services = getServices(locale);
  const settings = await getSettings();
  const serviceList = serviceKeys.map((key) => ({ key, title: services[key].title, tagline: services[key].tagline }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ids.website,
        url: abs(`/${locale}`),
        name: "Rania · Astrologie",
        description: dict.meta.description,
        inLanguage: ["fr", "en", "ar"],
        publisher: { "@id": ids.business },
      },
      {
        "@type": "ProfessionalService",
        "@id": ids.business,
        name: dict.meta.siteName,
        description: dict.meta.description,
        url: abs(`/${locale}`),
        image: abs(`/${locale}/opengraph-image`),
        logo: abs("/icon.svg"),
        email: settings.contact_email,
        telephone: `+${settings.whatsapp}`,
        areaServed: { "@type": "Place", name: "Worldwide" },
        availableLanguage: ["French", "English", "Arabic"],
        founder: { "@id": ids.person },
        priceRange: "€€",
        sameAs: settings.instagram ? [`https://instagram.com/${settings.instagram.replace(/^@/, "")}`] : undefined,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: dict.nav.consultations,
          itemListElement: serviceList.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.tagline, url: abs(href(locale, routes.service(s.key))) },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": ids.person,
        name: "Rania",
        jobTitle: locale === "fr" ? "Astrologue certifiée" : locale === "ar" ? "منجّمة معتمَدة" : "Certified astrologer",
        url: abs(href(locale, routes.about)),
        worksFor: { "@id": ids.business },
        knowsLanguage: ["fr", "en", "ar"],
        knowsAbout: ["Natal astrology", "Psychological astrology", "Synastry", "Composite chart", "Karmic astrology", "Lunar nodes", "Secondary progressions", "Planetary degrees"],
      },
    ],
  };

  return (
    <html lang={localeMeta[locale].htmlLang} dir={localeMeta[locale].dir} className={fontVariables} suppressHydrationWarning>
      <body>
        <Cosmos rtl={localeMeta[locale].dir === "rtl"} />
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}.split-word{transform:none!important}"}</style>
        </noscript>
        <SmoothScroll />
        <Interactions />
        <Header locale={locale} nav={dict.nav} brandLabel={brandLabel[locale]} services={serviceList} />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Footer
          locale={locale}
          dict={dict}
          services={serviceList}
          email={settings.contact_email}
          whatsapp={settings.whatsapp}
          instagram={settings.instagram}
        />
        <WhatsAppButton link={whatsappLink(settings.whatsapp, dict.common.whatsappMessage)} label={dict.contact.whatsappCta} />
        <JsonLd data={jsonLd} />
      </body>
    </html>
  );
}
