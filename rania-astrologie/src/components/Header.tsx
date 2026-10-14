"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ServiceKey } from "@/content/services/types";
import { localeMeta, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { href, routes } from "@/lib/paths";
import { Logo } from "./Logo";
import { ServiceGlyph } from "./ServiceGlyph";

type Props = {
  locale: Locale;
  nav: Dictionary["nav"];
  brandLabel: string;
  services: { key: ServiceKey; title: string; tagline: string }[];
};

export function Header({ locale, nav, brandLabel, services }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const lastY = useRef(0);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 320 && y > lastY.current + 4);
      if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (adjusting state during render, per React guidance).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMega(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), setMega(false));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const rest = pathname.split("/").slice(2).join("/");
  const switchHref = (l: Locale) => `/${l}${rest ? `/${rest}` : ""}`;
  const isActive = (path: string) => {
    const full = href(locale, path);
    return path === "" ? pathname === full : pathname === full || pathname.startsWith(`${full}/`);
  };

  const links = [
    { path: routes.about, label: nav.about },
    { path: routes.consultations, label: nav.consultations, mega: true },
    { path: routes.pricing, label: nav.pricing },
    { path: routes.journal, label: nav.journal },
    { path: routes.contact, label: nav.contact },
  ];

  const openMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    megaTimer.current = setTimeout(() => setMega(false), 160);
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2 focus:text-ink">
        {nav.skip}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-700 ease-[var(--ease-out-expo)] ${
          hidden && !open && !mega ? "-translate-y-full" : "translate-y-0"
        } ${scrolled || mega ? "border-b border-line bg-ink/55 backdrop-blur-xl" : "border-b border-transparent"}`}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href={href(locale)} className="group relative z-10" aria-label="Rania — accueil">
            <Logo label={brandLabel} />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {links.map((l) =>
              l.mega ? (
                <div key={l.path} onMouseEnter={openMega} onMouseLeave={closeMega} className="relative">
                  <Link
                    href={href(locale, l.path)}
                    aria-expanded={mega}
                    onFocus={openMega}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.88rem] tracking-wide transition-colors ${
                      isActive(l.path) ? "text-gold-bright" : "text-ivory/80 hover:text-ivory"
                    }`}
                  >
                    {l.label}
                    <svg viewBox="0 0 10 6" className={`h-1.5 w-2.5 transition-transform duration-500 ${mega ? "rotate-180" : ""}`} aria-hidden="true">
                      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <Link
                  key={l.path}
                  href={href(locale, l.path)}
                  className={`relative rounded-full px-4 py-2 text-[0.88rem] tracking-wide transition-colors ${
                    isActive(l.path) ? "text-gold-bright" : "text-ivory/80 hover:text-ivory"
                  }`}
                >
                  {l.label}
                  {isActive(l.path) && <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-full border border-line p-1 sm:flex" role="group" aria-label={nav.language}>
              {locales.map((l) => (
                <Link
                  key={l}
                  href={switchHref(l)}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === locale ? "true" : undefined}
                  className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-[0.72rem] tracking-wider transition-colors ${
                    l === locale ? "bg-gold/15 text-gold-bright" : "text-mist hover:text-ivory"
                  }`}
                >
                  {localeMeta[l].short}
                </Link>
              ))}
            </div>
            <Link href={href(locale, routes.pricing)} className="btn btn-primary hidden !h-10 !px-5 !text-[0.8rem] md:inline-flex">
              {nav.book}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? nav.close : nav.menu}
              className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden"
            >
              <span className={`absolute h-px w-5 bg-ivory transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`absolute h-px w-5 bg-ivory transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </div>

        {/* Mega menu: the seven approaches */}
        <div
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          className={`absolute inset-x-0 top-full hidden border-b border-line bg-ink/80 backdrop-blur-2xl transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] lg:block ${
            mega ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <div className="container-x grid grid-cols-4 gap-3 py-8">
            {services.map((s, i) => (
              <Link
                key={s.key}
                href={href(locale, routes.service(s.key))}
                tabIndex={mega ? 0 : -1}
                className="group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-ivory/[0.04]"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <ServiceGlyph k={s.key} className="h-10 w-10 shrink-0 text-gold transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" />
                <span>
                  <span className="block font-display text-xl text-ivory">{s.title}</span>
                  <span className="mt-1 block text-[0.82rem] leading-snug text-mist">{s.tagline}</span>
                </span>
              </Link>
            ))}
            <Link
              href={href(locale, routes.consultations)}
              tabIndex={mega ? 0 : -1}
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/30 p-4 text-sm text-gold-bright transition-colors hover:border-gold"
            >
              {nav.allConsultations} <span className="rtl-flip">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col bg-ink/95 backdrop-blur-2xl transition-[opacity,visibility] duration-700 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="container-x flex flex-1 flex-col justify-center gap-1 pt-24 pb-10" data-lenis-prevent>
          {[{ path: routes.home, label: nav.home }, ...links].map((l, i) => (
            <Link
              key={l.path}
              href={href(locale, l.path)}
              tabIndex={open ? 0 : -1}
              className={`font-display text-[2.4rem] leading-tight transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              } ${isActive(l.path) ? "text-gold-bright" : "text-ivory"}`}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
            >
              {l.label}
            </Link>
          ))}
          <div className={`mt-6 grid grid-cols-2 gap-2 transition-opacity delay-500 duration-700 ${open ? "opacity-100" : "opacity-0"}`}>
            {services.map((s) => (
              <Link key={s.key} href={href(locale, routes.service(s.key))} tabIndex={open ? 0 : -1} className="flex items-center gap-2 py-1.5 text-sm text-mist">
                <ServiceGlyph k={s.key} className="h-5 w-5 text-gold" /> {s.title}
              </Link>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3">
            {locales.map((l) => (
              <Link
                key={l}
                href={switchHref(l)}
                hrefLang={l}
                lang={l}
                tabIndex={open ? 0 : -1}
                className={`rounded-full border px-4 py-2 text-sm ${l === locale ? "border-gold text-gold-bright" : "border-line text-mist"}`}
              >
                {localeMeta[l].label}
              </Link>
            ))}
          </div>
          <Link href={href(locale, routes.pricing)} tabIndex={open ? 0 : -1} className="btn btn-primary mt-8 w-full">
            {nav.book}
          </Link>
        </div>
      </div>
    </>
  );
}
