import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { ServiceKey } from "@/content/services/types";
import { href, routes } from "@/lib/paths";
import { whatsappLink } from "@/lib/settings";
import { LogoMark } from "./Logo";

type Props = {
  locale: Locale;
  dict: Dictionary;
  services: { key: ServiceKey; title: string }[];
  email: string;
  whatsapp: string;
  instagram: string;
};

export function Footer({ locale, dict, services, email, whatsapp, instagram }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 mt-24 border-t border-line bg-gradient-to-b from-transparent to-ink/90">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="container-x grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <LogoMark className="h-14 w-14 text-gold-bright" />
          <p className="mt-6 font-display text-3xl leading-tight text-ivory">Rania</p>
          <p className="mt-2 max-w-sm text-mist">{dict.footer.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${email}`} className="btn btn-ghost !h-11 !text-[0.82rem]">{email}</a>
            <a href={whatsappLink(whatsapp, dict.common.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !h-11 !text-[0.82rem]">
              {dict.common.whatsapp}
            </a>
            {instagram && (
              <a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !h-11 !text-[0.82rem]">
                Instagram
              </a>
            )}
          </div>
        </div>
        <div className="md:col-span-4">
          <p className="eyebrow">{dict.nav.consultations}</p>
          <ul className="mt-5 space-y-2.5">
            {services.map((s) => (
              <li key={s.key}>
                <Link href={href(locale, routes.service(s.key))} className="link-underline text-ivory/80 hover:text-ivory">{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow">{dict.footer.explore}</p>
          <ul className="mt-5 space-y-2.5">
            {[
              [routes.about, dict.nav.about],
              [routes.pricing, dict.nav.pricing],
              [routes.journal, dict.nav.journal],
              [routes.contact, dict.nav.contact],
              [routes.privacy, dict.footer.privacy],
              [routes.legal, dict.footer.legalNotice],
            ].map(([p, label]) => (
              <li key={p}>
                <Link href={href(locale, p)} className="link-underline text-ivory/80 hover:text-ivory">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-3 border-t border-line py-8 text-[0.78rem] text-faint md:flex-row md:items-center md:justify-between">
        <p>© {year} Rania · {dict.footer.rights}</p>
        <p className="max-w-2xl md:text-end">{dict.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
