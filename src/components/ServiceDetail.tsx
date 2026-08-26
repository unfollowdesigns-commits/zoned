import Link from "@/components/SiteLink";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import DrawIcon from "@/components/ui/DrawIcon";
import PointerLight from "@/components/ui/PointerLight";
import LightBand from "@/components/ui/LightBand";
import NavLedger from "@/components/ui/NavLedger";
import { FUNCTIONS, INDUSTRIES, type NavItem } from "@/lib/site";
import type { ServiceContent } from "@/lib/services";

/**
 * The body of a service page, rendered from lib/services.ts.
 *
 * EVERY SECTION IS CONDITIONAL. A page fills in as its copy arrives rather than
 * standing empty or being padded with invented prose, so this file is a long
 * run of guards by design. The alternative, a page that renders a heading over
 * an empty grid, is worse than the section not existing.
 *
 * The treatments here are the ones settled on for the rest of the site: cards
 * separate by FILL rather than by outline, headings split so the title can be
 * large with its lede beside it, icons draw themselves on arrival. Nothing new
 * is invented for this page, which is the point of having a system.
 */

/** A card that separates by fill. No ring: see the note in Industries. */
const CARD =
  "group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white/[0.055] p-7 transition-colors duration-300 hover:bg-white/[0.085]";

export default function ServiceDetail({
  content,
  others,
}: {
  content: ServiceContent;
  others: NavItem[];
}) {
  return (
    <>
      {/* ---- Functions ---------------------------------------------------- */}
      {content.functionsHeading && (
        <section className="mx-auto max-w-[1280px] px-6 py-20 sm:py-28">
          <SectionHeading
            title={content.functionsHeading}
            lede={content.lede}
            split={Boolean(content.lede)}
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FUNCTIONS.map((fn, i) => {
              /* Seats are client copy. Where they are missing the card is the
                 function alone, which is a smaller card rather than a broken
                 one. */
              const seats = content.functions?.find((f) => f.label === fn.label)?.seats;
              return (
                <li key={fn.href} className="h-full">
                  <Reveal delay={Math.min(i * 0.05, 0.2)} className="h-full" fill>
                    <Link href={fn.href} data-draw-group="" className={CARD}>
                      <PointerLight size={220} />
                      <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-[var(--v-primary)]/14 text-[var(--v-primary)]">
                        <DrawIcon name={fn.icon ?? "briefcase"} size={19} delay={i * 0.05} />
                      </span>
                      <h3 className="v-display mt-6 text-[length:var(--t-heading)] leading-[1.25]">
                        {fn.label}
                      </h3>
                      {seats && (
                        <ul className="mt-3 flex flex-col gap-1">
                          {seats.map((s) => (
                            <li
                              key={s}
                              className="text-[length:var(--t-small)] text-[var(--v-muted)]"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[length:var(--t-small)] font-medium text-[var(--v-ring)]">
                        Learn more
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ---- How we search ------------------------------------------------ */}
      {content.approach && content.approach.length > 0 && (
        <LightBand>
          <div className="mx-auto max-w-[1280px] px-6 py-20 sm:py-28">
            <SectionHeading
              title={content.approachHeading ?? "How we"}
              turn={content.approachTurn}
            />
            <ul className="mt-14 grid gap-4 sm:grid-cols-2">
              {content.approach.map((a, i) => (
                <li key={a.title} className="h-full">
                  <Reveal delay={Math.min(i * 0.06, 0.24)} className="h-full" fill>
                    <div className="flex h-full flex-col rounded-[20px] bg-[var(--v-ink)]/[0.04] p-8">
                      <h3 className="v-display text-[length:var(--t-title)] leading-[1.2] text-[var(--v-ink)]">
                        {a.title}
                      </h3>
                      {a.body && (
                        <p className="v-serif mt-4 text-[length:var(--t-secondary)] leading-[1.7] text-[var(--v-muted)]">
                          {a.body}
                        </p>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </LightBand>
      )}

      {/* ---- Who we place -------------------------------------------------- */}
      {content.placements && content.placements.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 py-20 sm:py-24">
          <SectionHeading title={content.placementsHeading ?? "Who we place"} />
          <ul className="mt-10 flex flex-wrap gap-2.5">
            {content.placements.map((title, i) => (
              <li key={title}>
                <Reveal delay={Math.min(i * 0.03, 0.3)}>
                  <span className="inline-flex rounded-full bg-white/[0.06] px-4 py-2 text-[length:var(--t-small)] text-[var(--v-ink)]">
                    {title}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- When it fits --------------------------------------------------
          A band rather than a grid: this is the qualifying section, the one a
          buyer reads to decide whether to keep going, so it gets a ground of
          its own instead of being a fifth row of cards. */}
      {content.fit && content.fit.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 py-8">
          <div className="v-dark-band relative overflow-hidden rounded-[26px] px-8 py-14 sm:px-14 sm:py-16">
            <SectionHeading title={content.fitHeading ?? "When this fits"} glow={false} />
            <ul className="mt-10 grid gap-3">
              {content.fit.map((line, i) => (
                <li key={line}>
                  <Reveal delay={Math.min(i * 0.06, 0.24)}>
                    <div className="flex items-start gap-4 rounded-[14px] bg-white/[0.06] p-5">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--v-primary)] text-white">
                        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                          <path
                            d="M4 12.5 L9.5 18 L20 6.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <p className="text-[length:var(--t-secondary)] leading-[1.65] text-white/85">
                        {line}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---- Industries ---------------------------------------------------- */}
      {content.showIndustries && (
        <section className="mx-auto max-w-[1280px] px-6 py-20 sm:py-28">
          <SectionHeading title={content.industriesHeading ?? "Industries we know deeply."} />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((ind, i) => (
              <li key={ind.href} className="h-full">
                <Reveal delay={Math.min(i * 0.04, 0.24)} className="h-full" fill>
                  <Link href={ind.href} data-draw-group="" className={CARD}>
                    <PointerLight size={200} />
                    <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-[var(--v-primary)]/14 text-[var(--v-primary)]">
                      <DrawIcon name={ind.icon ?? "briefcase"} size={18} delay={i * 0.04} />
                    </span>
                    <h3 className="v-display mt-5 text-[length:var(--t-body)] leading-[1.3]">
                      {ind.label}
                    </h3>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- Process -------------------------------------------------------
          A RAIL, NOT FIVE CARDS. The five steps are a sequence, and cards in a
          row say "five options" rather than "one after another". The connecting
          line is what carries the order, so it is drawn rather than implied. */}
      {content.process && content.process.length > 0 && (
        <LightBand>
          <div className="mx-auto max-w-[1280px] px-6 py-20 sm:py-28">
            <SectionHeading title={content.processHeading ?? "How it works"} />
            <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {/* The rail. Sits behind the numbers, only on the wide layout
                  where the steps actually run in a row. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 top-[19px] hidden h-px bg-[var(--v-ink)]/[0.14] lg:block"
              />
              {content.process.map((step, i) => (
                <li key={step.title} className="relative">
                  <Reveal delay={Math.min(i * 0.08, 0.36)}>
                    <div>
                      <span className="relative z-[1] grid h-10 w-10 place-items-center rounded-full bg-[var(--v-primary)] text-[length:var(--t-small)] font-semibold tabular-nums text-white">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="v-display mt-5 max-w-[16ch] text-[length:var(--t-heading)] leading-[1.25] text-[var(--v-ink)]">
                        {step.title}
                      </h3>
                      {step.body && (
                        <p className="v-serif mt-3 text-[length:var(--t-small)] leading-[1.7] text-[var(--v-muted)]">
                          {step.body}
                        </p>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </LightBand>
      )}

      {/* ---- FAQ ------------------------------------------------------------
          Native details/summary. An accordion is one of the few widgets the
          platform ships correctly: keyboard, screen reader and find-in-page all
          work without a line of JavaScript, and a hand-rolled one has to earn
          back all three. */}
      {content.faq && content.faq.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 py-20 sm:py-28">
          <SectionHeading title={content.faqHeading ?? "Questions, answered."} />
          <div className="mt-12 border-t border-[var(--v-border)]">
            {content.faq.map((item) => (
              <details key={item.q} className="group border-b border-[var(--v-border)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[length:var(--t-body)] font-medium text-[var(--v-ink)] transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] transition-transform duration-300 group-open:rotate-45"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path
                        d="M12 5v14M5 12h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="v-serif max-w-[70ch] pb-7 text-[length:var(--t-secondary)] leading-[1.75] text-[var(--v-muted)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ---- Other ways we work -------------------------------------------- */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 sm:py-20">
        <SectionHeading title="Other ways we work" size="column" />
        <div className="mt-10">
          <NavLedger items={others} />
        </div>
      </section>
    </>
  );
}
