import "../globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Cosmos from "@/components/cosmos/Cosmos";
import { CursorAura } from "@/components/CursorAura";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Interactions } from "@/components/Interactions";
import { Preloader } from "@/components/Preloader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WhatsAppButton } from "@/components/WhatsAppButton";
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
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const serviceList = serviceKeys.map((key) => ({ key, title: services[key].title, tagline: services[key].tagline }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: dict.meta.siteName,
    description: dict.meta.description,
    url: `${env.siteUrl}/${locale}`,
    email: settings.contact_email,
    areaServed: "Worldwide",
    availableLanguage: ["fr", "en", "ar"],
    founder: { "@type": "Person", name: "Rania", jobTitle: locale === "fr" ? "Astrologue certifiée" : locale === "ar" ? "منجّمة معتمَدة" : "Certified astrologer" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: dict.nav.consultations,
      itemListElement: serviceList.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.tagline } })),
    },
  };

  return (
    <html lang={localeMeta[locale].htmlLang} dir={localeMeta[locale].dir} className={fontVariables} suppressHydrationWarning>
      <body className="noise">
        <Preloader />
        <Cosmos rtl={localeMeta[locale].dir === "rtl"} />
        <SmoothScroll />
        <Interactions />
        <CursorAura />
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
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
