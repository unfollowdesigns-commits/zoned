import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { legalNotice } from "@/content/legal";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { routes } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, routes.legal, { title: getDictionary(locale).footer.legalNotice });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const s = await getSettings();
  const doc = legalNotice(locale, {
    name: s.legal_name,
    email: s.contact_email,
    address: s.legal_address,
    legalId: s.legal_id,
    host: s.host_info,
    retentionMonths: Number(s.retention_months) || 24,
  });
  return <LegalPage doc={doc} kicker={getDictionary(locale).footer.legal} />;
}
