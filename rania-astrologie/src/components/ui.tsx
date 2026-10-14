import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { Offering } from "@/lib/repo/offerings";
import type { Article } from "@/lib/repo/articles";
import { readingMinutes } from "@/lib/article-utils";
import { href, routes } from "@/lib/paths";
import { formatDate, formatPrice } from "@/lib/time";
import { Breadcrumbs } from "./Breadcrumbs";
import { ServiceGlyph } from "./ServiceGlyph";
import { SplitText } from "./SplitText";

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`} data-reveal>
      <span className="h-px w-8 bg-gold/60" />
      {children}
    </p>
  );
}

export function PageHero({
  kicker,
  title,
  lede,
  children,
  crumbs,
}: {
  kicker: string;
  title: string;
  lede?: string;
  children?: ReactNode;
  crumbs?: { name: string; href: string }[];
}) {
  return (
    <section className="hero-intro relative pt-[calc(var(--header-h)+clamp(4rem,12vw,9rem))] pb-[clamp(3rem,8vw,6rem)]">
      <div className="container-x">
        <div className="max-w-4xl">
          {crumbs && <Breadcrumbs items={crumbs} />}
          <Kicker>{kicker}</Kicker>
          <SplitText as="h1" text={title} className="t-1 mt-6 block text-ivory" />
          {lede && (
            <p className="lede mt-8 max-w-2xl" data-reveal style={{ ["--d" as string]: "250ms" }}>
              {lede}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function Arrow() {
  return <span className="rtl-flip inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>;
}

export function OfferingCard({ o, locale, dict, i = 0, action }: { o: Offering; locale: Locale; dict: Dictionary; i?: number; action?: ReactNode }) {
  return (
    <article className="card group flex h-full flex-col p-7 md:p-8" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
      <div className="flex items-start justify-between gap-6">
        <h3 className="font-display text-[1.7rem] leading-tight text-ivory">{o.name[locale]}</h3>
        <p className="shrink-0 text-end">
          <span className="block font-display text-3xl text-gold-bright">{formatPrice(o.priceCents, o.currency, locale)}</span>
          <span className="text-xs tracking-wider text-mist">
            {o.durationMin} {dict.common.minutes}
          </span>
        </p>
      </div>
      {o.summary[locale] && <p className="mt-4 flex-1 text-mist">{o.summary[locale]}</p>}
      {o.requiresPartner && <p className="mt-4 text-xs text-gold/80">{dict.pricing.partnerNeeded}</p>}
      <div className="mt-6">{action}</div>
    </article>
  );
}

export function ArticleCard({ a, locale, dict, i = 0 }: { a: Article; locale: Locale; dict: Dictionary; i?: number }) {
  return (
    <Link href={href(locale, routes.article(a.slug))} className="card group flex h-full flex-col overflow-hidden" data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
      <div className="relative aspect-[16/10] overflow-hidden bg-deep">
        {a.coverMediaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/media/${a.coverMediaId}`} alt={a.coverAlt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[var(--ease-out-expo)] group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_30%,rgba(145,137,208,0.25),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(207,174,118,0.2),transparent_55%)]">
            <ServiceGlyph k="natal" className="h-20 w-20 text-gold/45 transition-transform duration-[1500ms] group-hover:rotate-45" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-7">
        <p className="text-xs tracking-wider text-mist">
          {a.publishedAt ? formatDate(a.publishedAt, locale) : ""} · {readingMinutes(a.contentMd)} {dict.common.readingTime}
        </p>
        <h3 className="mt-3 font-display text-2xl leading-snug text-ivory">{a.title}</h3>
        <p className="mt-3 line-clamp-3 flex-1 text-mist">{a.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold-bright">
          {dict.common.readMore} <Arrow />
        </span>
      </div>
    </Link>
  );
}

export function CtaBand({ locale, dict, title, body }: { locale: Locale; dict: Dictionary; title: string; body: string }) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] border border-line px-6 py-20 text-center md:px-16 md:py-28" data-reveal="scale">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(145,137,208,0.22),transparent_70%),radial-gradient(50%_60%_at_50%_100%,rgba(207,174,118,0.16),transparent_70%)]" />
          <svg className="spin-slow absolute left-1/2 top-1/2 -z-10 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 text-gold opacity-[0.08]" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth=".2" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth=".2" />
            {Array.from({ length: 72 }, (_, i) => {
              const a = (i / 72) * Math.PI * 2;
              return <line key={i} x1={50 + Math.cos(a) * 46} y1={50 + Math.sin(a) * 46} x2={50 + Math.cos(a) * 48} y2={50 + Math.sin(a) * 48} stroke="currentColor" strokeWidth=".2" />;
            })}
          </svg>
          <SplitText as="h2" text={title} className="t-2 mx-auto block max-w-3xl text-ivory" />
          <p className="lede mx-auto mt-6 max-w-xl" data-reveal>{body}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4" data-reveal>
            <Link href={href(locale, routes.pricing)} className="btn btn-primary group">
              {dict.common.bookConsultation} <Arrow />
            </Link>
            <Link href={href(locale, routes.contact)} className="btn btn-ghost">
              {dict.common.writeToMe}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
