import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import { ArrowRight } from "lucide-react";
import GlowButton from "@/components/ui/GlowButton";
import LightBand from "@/components/ui/LightBand";
import SectionHeading from "@/components/ui/SectionHeading";
import FunctionArt, { type FunctionKind } from "@/components/ui/FunctionArt";
import { CardArt, type Motif } from "@/components/ui/PostArt";
import Reveal from "@/components/Reveal";
import { FUNCTIONS, INDUSTRIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who We Serve | District Partners",
  description:
    "The functions and industries District Partners serves, from finance and accounting to private capital, GovCon and healthcare.",
};

/**
 * Who We Serve.
 *
 * THE FOUR FUNCTIONS ARE THE PAGE, and each one gets a figure that is a
 * picture of what that function IS: the ledger, the branch, the boundary, the
 * ascent. See ui/FunctionArt. Those are the same drawings as the 19px marks
 * beside these names in the navigation, enlarged and elaborated, so the site
 * has one visual language rather than a set of icons and a separate set of
 * decorations.
 *
 * WHAT IS NOT HERE. The supplied design carries a paragraph and a "where we
 * focus" list under each function, and neither is legible enough in the image
 * to transcribe. Writing them would mean inventing capability claims for a
 * real firm, so the cards carry the figure, the name and the route, and the
 * copy drops in when it exists. See CONTENT-NEEDED.
 *
 * The design's industry grid is also not reproduced, and that one is a refusal
 * rather than a gap: every tile in it carries a metric ("tripled organic
 * traffic in 3 months", "session time doubled in eight weeks"), the same two
 * sentences repeated across six different industries. They are placeholder
 * text from whatever template the mock was built in, they are not District
 * Partners' numbers, and putting invented performance figures on a live site
 * is the one thing that cannot be undone by a later edit.
 */

type Fn = { kind: FunctionKind; label: string; href: string };

/* Order and labels come from lib/site.ts, so the page and the navigation can
   never disagree about what the firm covers. */
const FUNCTION_ART: FunctionKind[] = ["finance", "technology", "risk", "revenue"];
const FUNCTION_CARDS: Fn[] = FUNCTIONS.map((f, i) => ({
  kind: FUNCTION_ART[i],
  label: f.label,
  href: f.href,
}));

/* A motif and hue per industry: eight tiles that are eight different pictures
   rather than one picture eight times. The hues stay within a family a step
   wider than the UI palette, the same licence the blog archive takes, because
   a taxonomy is the one place where distinct colour is content. */
const INDUSTRY_ART: Array<{ motif: Motif; colour: string }> = [
  { motif: "lattice", colour: "#5b93ff" },
  { motif: "stripes", colour: "#d9a446" },
  { motif: "halftone", colour: "#7f8cf5" },
  { motif: "terraces", colour: "#43b98e" },
  { motif: "weave", colour: "#35b0d8" },
  { motif: "orbits", colour: "#9b7bf0" },
  { motif: "perspective", colour: "#e0748c" },
  { motif: "contours", colour: "#4fb0a5" },
];

export default function WhoWeServePage() {
  return (
    <>
      {/* ---- Hero ---------------------------------------------------------- */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto grid max-w-[1280px] items-center gap-12 px-6 pb-20 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="v-eyebrow text-[var(--v-primary)]">Who We Serve</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1
                className="v-display mt-6 max-w-[15ch] text-balance text-white"
                style={{
                  fontSize: "var(--t-display-fluid)",
                  lineHeight: "var(--lh-display-fluid)",
                  letterSpacing: "var(--tr-display-fluid)",
                }}
              >
                One partner for all your{" "}
                <span className="text-[var(--v-primary)]">talent solutions.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-7 max-w-[54ch] text-[length:var(--t-lede)] leading-[1.65] text-[var(--v-muted)]">
                Four functions we know deeply, and the industries that hire into them. One
                partner across all of it, so the brief never has to be explained twice.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9">
                <GlowButton href="#functions">See the functions</GlowButton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <div className="dp-art-hover relative aspect-[5/4] overflow-hidden rounded-[20px] ring-1 ring-inset ring-white/[0.08]">
              <CardArt seed="who-we-serve-hero" motif="weave" colour="#5b93ff" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- The claim, set large ----------------------------------------- */}
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          <Reveal>
            {/* A pull quote at display size and nothing else in the band. The
                sentence is the argument for the whole page, so it gets a band
                to itself rather than a box inside one. */}
            <figure className="mx-auto max-w-[22ch]">
              <blockquote
                className="v-display text-balance"
                style={{
                  fontSize: "var(--t-display-fluid)",
                  lineHeight: "var(--lh-display-fluid)",
                  letterSpacing: "var(--tr-display-fluid)",
                }}
              >
                Companies don&rsquo;t fail because they hire slowly.{" "}
                <span className="text-[var(--v-primary-deep)]">
                  They fail because they hire wrong.
                </span>
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </LightBand>

      {/* ---- Functions ------------------------------------------------------ */}
      <section id="functions" className="v-dark-band">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          <SectionHeading
            eyebrow="Functions"
            title="Four functions,"
            turn="known deeply."
            lede="Our work concentrates where specialization matters most. Each of these is a practice with its own network, not a keyword on a job description."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {FUNCTION_CARDS.map((f, i) => (
              <Reveal key={f.href} delay={0.06 + i * 0.06} className="h-full">
                <Link
                  href={f.href}
                  className="dp-fn-card dp-art-card group flex h-full flex-col overflow-hidden rounded-[20px] bg-white/[0.035] ring-1 ring-inset ring-white/[0.08] transition-[box-shadow,background-color] duration-300 hover:bg-white/[0.06] hover:shadow-[0_38px_70px_-40px_rgba(0,0,0,0.9)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--v-ring)]"
                >
                  {/* The figure gets the top two thirds. It is the content of
                      this card, not an illustration beside it. */}
                  <div className="flex items-center justify-center px-10 pb-4 pt-10 text-[var(--v-primary)]">
                    <FunctionArt kind={f.kind} className="max-w-[320px]" />
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/[0.07] px-7 py-6">
                    <h3 className="text-[length:var(--t-title)] font-semibold tracking-[-0.01em] text-white">
                      {f.label}
                    </h3>
                    <ArrowRight
                      size={18}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--v-muted)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 group-hover:text-white"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Industries ----------------------------------------------------- */}
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          <SectionHeading
            eyebrow="Industries"
            title="And the markets"
            turn="that hire into them."
            lede="We bring functional depth to industries we know well, so every engagement starts with context rather than with a briefing."
          />

          <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((ind, i) => {
              const art = INDUSTRY_ART[i % INDUSTRY_ART.length];
              return (
                <li key={ind.label}>
                  <Reveal delay={Math.min(0.04 + i * 0.045, 0.3)} className="h-full">
                    <Link
                      href={ind.href}
                      className="dp-art-card group flex h-full flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_18px_44px_-38px_rgba(16,23,40,0.5)] ring-1 ring-inset ring-[var(--v-ink)]/[0.06] transition-shadow duration-300 hover:shadow-[0_34px_60px_-34px_rgba(16,23,40,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--v-ring)]"
                    >
                      <div className="dp-art-frame relative aspect-[16/10] overflow-hidden">
                        <CardArt seed={ind.href} motif={art.motif} colour={art.colour} />
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-3 p-5">
                        <h3 className="text-[length:var(--t-secondary)] font-semibold leading-[1.4] text-[var(--v-ink)]">
                          {ind.label}
                        </h3>
                        <ArrowRight
                          size={15}
                          strokeWidth={2.2}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-[var(--v-muted)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-[var(--v-ink)]"
                        />
                      </div>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </LightBand>

      {/* ---- Close ---------------------------------------------------------- */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 text-center sm:py-28">
          <Reveal>
            <h2
              className="v-display mx-auto max-w-[20ch] text-balance text-white"
              style={{
                fontSize: "var(--t-display-fluid)",
                lineHeight: "var(--lh-display-fluid)",
                letterSpacing: "var(--tr-display-fluid)",
              }}
            >
              Not sure which of these{" "}
              <span className="text-[var(--v-primary)]">your search sits in?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-6 max-w-[52ch] text-[length:var(--t-lede)] leading-[1.65] text-[var(--v-muted)]">
              Most of the ones worth doing sit across two. Tell us the seat and a partner
              will come back within one business day.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <GlowButton href="/contact">Let&rsquo;s Talk</GlowButton>
              <GlowButton href="/what-we-do" tone="quiet">
                See What We Do
              </GlowButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
