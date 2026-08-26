import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import GlowButton from "@/components/ui/GlowButton";
import LightBand from "@/components/ui/LightBand";
import SectionHeading from "@/components/ui/SectionHeading";
import DrawIcon from "@/components/ui/DrawIcon";
import { CardArt } from "@/components/ui/PostArt";
import EngagementMap from "@/components/EngagementMap";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "What We Do | District Partners",
  description:
    "Executive search, professional search, interim solutions, fractional leadership and project support from District Partners.",
};

/**
 * The What We Do page, rebuilt to the supplied design.
 *
 * WHAT IS TAKEN FROM THE DESIGN AND WHAT IS HELD BACK. Every line of copy
 * below is legible in the supplied mock and carried verbatim (or with an em
 * dash rewritten, which the house style bans). Two things in the mock are NOT
 * here, on the standing rule that nothing gets invented:
 *
 *   - The paragraph under "The work starts before the search does". Its
 *     opening is cut off in the image, and half a paragraph cannot be
 *     completed by guessing. See CONTENT-NEEDED.md.
 *   - The FAQ answers. The mock shows the accordions closed, so only the
 *     questions exist. They render as a ledger of questions that route to
 *     contact; the moment answers arrive they become accordions. An accordion
 *     that opens onto nothing is the empty-card mistake again.
 *
 * EVERY FRAME CARRIES A GENERATED FIGURE, NOT A HELD PLACEHOLDER. The frames
 * were MediaSlot stand-ins, which were honest and looked like what they were:
 * empty. They now carry the same construction as the cards, each on a motif
 * nothing else on the page uses, so the page is finished rather than waiting.
 * Real photography still replaces any of them by swapping one element for an
 * <Image>; stock never does.
 */

/* Hues match components/EngagementMap.tsx, which is the whole connection
   between the cards and the plot: same service, same colour, in both. */
const OFFERS = [
  {
    label: "Executive Search",
    href: "/what-we-do/executive-search",
    icon: "search",
    motif: "contours" as const,
    colour: "#9b7bf0",
    copy: "We build high-performing executive and leadership teams.",
  },
  {
    label: "Professional Search",
    href: "/what-we-do/professional-search",
    icon: "briefcase",
    motif: "halftone" as const,
    colour: "#5b93ff",
    copy: "The management teams and individual contributors who execute the leadership vision. Same network. Same search rigor.",
  },
  {
    label: "Interim Solutions",
    href: "/what-we-do/interim-solutions",
    icon: "timer",
    motif: "chevrons" as const,
    colour: "#35b0d8",
    copy: "When you need someone in the building now. Fractional, project-based, or full-time until the permanent hire is in place. We deploy this talent within days.",
  },
];

const COMMITMENTS = [
  {
    title: "Partner-Led",
    body: "Experienced partners run your search from initiation through onboarding.",
  },
  {
    title: "Fast",
    body: "We move with the urgency your talent need requires.",
  },
  {
    title: "Complete",
    body: "We thoroughly cover your market. We don't stop at the first option or offer. We stay engaged through onboarding.",
  },
];

/** Questions from the design. Answers are pending: see CONTENT-NEEDED.md. */
const FAQ_QUESTIONS = [
  "What services do you offer?",
  "Do you work with companies nationwide?",
  "What level of roles do you place?",
  "How quickly can you place an interim leader?",
  "What does 'partner-led' actually mean?",
];

export default function WhatWeDoPage() {
  return (
    <>
      {/* ---- Hero: the claim, and a frame held for the photograph ---------- */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto grid max-w-[1280px] items-center gap-12 px-6 pb-20 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <Reveal>
              <h1
                className="v-display max-w-[16ch] text-balance text-white"
                style={{
                  fontSize: "var(--t-display-fluid)",
                  lineHeight: "var(--lh-display-fluid)",
                  letterSpacing: "var(--tr-display-fluid)",
                }}
              >
                What <span className="text-[var(--v-primary)]">we do.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              {/* The design's own sentence, whole. Splitting it into a punchy
                  headline and a paraphrased lede would have meant writing copy
                  for the firm, which is off the table. */}
              <p className="mt-7 max-w-[52ch] text-[length:var(--t-lede)] leading-[1.65] text-[var(--v-muted)]">
                From CXO search to full-function buildouts and interim solutions, District
                Partners is the firm you call when the talent is too important to get wrong.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9">
                <GlowButton href="#what-we-offer">What We Offer</GlowButton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            {/* The page's own figure rather than a held grey frame. Same
                construction as the cards below, a motif none of them uses, so
                the hero states the language the rest of the page speaks. */}
            <div className="dp-art-hover relative aspect-[5/4] overflow-hidden rounded-[20px] ring-1 ring-inset ring-white/[0.08]">
              <CardArt seed="what-we-do-hero" motif="perspective" colour="#5b93ff" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- How we work, then the offer: one paper band, two arguments ---- */}
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.38fr_0.62fr] lg:gap-20">
            <Reveal>
              <p className="v-eyebrow">How we work</p>
            </Reveal>
            <div>
              <Reveal>
                <h2
                  className="v-display max-w-[22ch] text-balance"
                  style={{
                    fontSize: "var(--t-display-fluid)",
                    lineHeight: "var(--lh-display-fluid)",
                    letterSpacing: "var(--tr-display-fluid)",
                  }}
                >
                  The work starts{" "}
                  <span className="text-[var(--v-primary-deep)]">before the search does.</span>
                </h2>
              </Reveal>

              {/* A ledger, not three cards. Three titles with one line each do
                  not earn boxes; rules carry them and the page stays calm. */}
              <div className="mt-12">
                {COMMITMENTS.map((c, i) => (
                  <Reveal key={c.title} delay={0.08 + i * 0.06}>
                    <div className="grid gap-2 border-t border-[var(--v-border)] py-6 sm:grid-cols-[0.32fr_0.68fr] sm:gap-8">
                      <h3 className="text-[length:var(--t-body)] font-semibold text-[var(--v-ink)]">
                        {c.title}
                      </h3>
                      <p className="text-[length:var(--t-body)] leading-[1.7] text-[var(--v-muted)]">
                        {c.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* The brief card: the one boxed object in the section, because
                  it is the one thing asking to be acted on. */}
              <Reveal delay={0.28}>
                <div className="mt-10 flex flex-wrap items-center gap-6 rounded-[18px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(16,23,40,0.4)] ring-1 ring-inset ring-[var(--v-ink)]/[0.06] sm:flex-nowrap">
                  <div className="dp-art-hover relative aspect-square w-20 shrink-0 overflow-hidden rounded-[12px]">
                    <CardArt seed="brief-a-search" motif="orbits" colour="#5b93ff" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="v-eyebrow">Ready to brief a search?</p>
                    <p className="mt-2 text-[length:var(--t-secondary)] leading-[1.6] text-[var(--v-muted)]">
                      A partner responds within one business day.
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--v-primary)] px-5 py-2.5 text-[length:var(--t-small)] font-semibold text-white transition-colors duration-200 hover:bg-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                  >
                    Let&rsquo;s Talk
                    <ArrowRight
                      size={15}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ---- What we offer --------------------------------------------- */}
          <div id="what-we-offer" className="mt-24 border-t border-[var(--v-border)] pt-20 sm:mt-28">
            <SectionHeading eyebrow="The offer" title="What we" turn="offer." />

            {/* THREE TALL CARDS ACROSS, NOT THREE WIDE ONES DOWN. Stacked
                full-width rows are what the supplied mock does, and the shape
                has a cost: three rows of image-left, text-right is the same
                object printed three times, so the eye reads "a list" and stops.
                Side by side they are three DIFFERENT things to choose between,
                which is what they actually are, and each one gets its own
                colour and its own generated figure rather than a crop of
                whatever photograph was to hand. */}
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {OFFERS.map((o, i) => (
                /* h-full on the wrapper as well as the card: a grid item
                   stretches, but the Reveal div between the item and the card
                   does not pass that height on unless it is told to, so the
                   three cards ended at three different depths. */
                <Reveal key={o.href} delay={0.06 + i * 0.07} className="h-full">
                  <Link
                    href={o.href}
                    data-draw-group
                    className="dp-art-card group flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_20px_48px_-36px_rgba(16,23,40,0.45)] ring-1 ring-inset ring-[var(--v-ink)]/[0.06] hover:shadow-[0_38px_70px_-32px_rgba(16,23,40,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--v-ring)]"
                  >
                    {/* The generated figure, and the light crossing it speeds
                        up on hover: see .dp-art-card. */}
                    <div className="dp-art-frame relative aspect-[16/11] overflow-hidden">
                      <CardArt seed={o.href} motif={o.motif} colour={o.colour} />
                      <span
                        aria-hidden="true"
                        className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-[11px] bg-white/10 text-white backdrop-blur-md ring-1 ring-inset ring-white/25"
                      >
                        <DrawIcon name={o.icon} size={20} />
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-[length:var(--t-title)] font-semibold tracking-[-0.01em] text-[var(--v-ink)]">
                        {o.label}
                      </h3>
                      <p className="mt-3 text-[length:var(--t-secondary)] leading-[1.7] text-[var(--v-muted)]">
                        {o.copy}
                      </p>
                      {/* mt-auto, so the three links sit on one line across
                          the row: the copy lengths differ enough that without
                          it they land at three different heights and the grid
                          reads as ragged. */}
                      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[length:var(--t-small)] font-semibold text-[var(--v-primary-deep)]">
                        Explore {o.label}
                        <ArrowRight
                          size={15}
                          strokeWidth={2.2}
                          aria-hidden="true"
                          className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
                        />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </LightBand>

      {/* ---- The map: which one you actually need -------------------------- */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          <SectionHeading
            eyebrow="Choosing"
            title="Not three sizes"
            turn="of the same thing."
            lede="Each engagement sits somewhere different on how fast the seat gets filled and how long it stays filled. That is usually the real question underneath 'what do you offer'."
          />
          <div className="mt-14">
            <EngagementMap />
          </div>
        </div>
      </section>

      {/* ---- The follow-up questions --------------------------------------
          Paper, because the map above it is dark and the alternation is the
          rule: two navy sections back to back read as one long one that forgot
          where it ended. */}
      <LightBand>
        <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-24 sm:py-28 lg:grid-cols-[0.42fr_0.58fr] lg:gap-24">
          <div>
            {/* SectionHeading reveals itself: wrapping it again would run the
                entrance twice. */}
            <SectionHeading
              eyebrow="Questions"
              title="Here for the"
              turn="follow-ups too."
              lede="Reach out and a partner will respond within one business day."
            />
            <Reveal delay={0.1}>
              <div className="mt-8">
                <GlowButton href="/contact">Let&rsquo;s Talk</GlowButton>
              </div>
            </Reveal>
          </div>

          {/* A ledger of the questions, each routed to a person. The answers
              are not written yet (see CONTENT-NEEDED.md): until they are,
              every question is a working link to contact rather than an
              accordion that opens onto nothing. */}
          <div>
            {FAQ_QUESTIONS.map((q, i) => (
              <Reveal key={q} delay={0.05 + i * 0.05}>
                <Link
                  href="/contact"
                  className="group flex items-center justify-between gap-6 border-t border-[var(--v-border)] py-5 transition-colors duration-200 last:border-b last:border-[var(--v-border)] hover:bg-[var(--v-ink)]/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                >
                  <span className="text-[length:var(--t-body)] leading-[1.5] text-[var(--v-ink)]/90 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                    {q}
                  </span>
                  <ArrowUpRight
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--v-muted)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--v-ink)]"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </LightBand>

      {/* ---- The close: the founder, the firm, the difference --------------
          ONE DARK BAND, THREE ARGUMENTS. The supplied mock ends on three
          separate full-height sections (a quote, a who-we-are, a call to
          action), which is three endings in a row: each one announces itself
          as the last thing, and by the third nobody believes it. They are one
          band here, separated by rules, so the page closes once. */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          <div className="grid items-stretch gap-8 lg:grid-cols-[0.44fr_0.56fr]">
            <Reveal>
              <div className="dp-art-hover relative h-full min-h-[280px] overflow-hidden rounded-[18px] ring-1 ring-inset ring-white/[0.08]">
                <CardArt seed="founder-quote" motif="terraces" colour="#9b7bf0" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <figure className="flex h-full flex-col justify-between rounded-[18px] bg-[var(--v-primary-deep)] p-8 sm:p-10">
                <blockquote className="max-w-[46ch] text-balance text-[length:var(--t-lede)] leading-[1.6] text-white">
                  &ldquo;At District Partners, we believe that talent acquisition is more than
                  just search and staffing; our solutions help you strategically grow,
                  intuitively scale, and creatively address your company&rsquo;s unique needs.
                  We are committed to finding the people or solution that fits your culture
                  and helps transform your business.&rdquo;
                </blockquote>
                <figcaption className="mt-10">
                  <p className="text-[length:var(--t-body)] font-semibold text-white">
                    Josh Fisher
                  </p>
                  <p className="mt-1 text-[length:var(--t-small)] text-white/70">
                    Founder &amp; Managing Partner
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="mt-24 grid items-center gap-12 border-t border-white/10 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <SectionHeading eyebrow="Who we are" title="Get to" turn="know us." />
              <Reveal delay={0.08}>
                <p className="mt-8 max-w-[58ch] text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                  District Partners was founded by industry professionals who were tired of the
                  way search and interim solutions was done: volume over value, partners who
                  disappear after the kickoff call, candidates and consultants who don&rsquo;t
                  match their bio.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="mt-5 max-w-[58ch] text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                  We built an alternative. Every search is led by a senior recruiter with at
                  least a decade of experience. Our founders and most of our team are former
                  practitioners. We speak your language and know the difference between a good
                  candidate and the right one. One of Inc.&rsquo;s fastest-growing companies in
                  America, because we don&rsquo;t do it the way everyone else does.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-9">
                  <GlowButton href="/about" tone="quiet">
                    About Us
                  </GlowButton>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.12}>
              <div className="dp-art-hover relative aspect-[4/5] overflow-hidden rounded-[20px] ring-1 ring-inset ring-white/[0.08]">
                <CardArt seed="who-we-are" motif="lattice" colour="#35b0d8" />
              </div>
            </Reveal>
          </div>

          {/* The close. Part of the same band: two navy sections back to back
              read as one long one that forgot where it ended. */}
          <div className="mt-24 border-t border-white/10 pt-20 text-center">
            <Reveal>
              <h2
                className="v-display mx-auto max-w-[18ch] text-balance text-white"
                style={{
                  fontSize: "var(--t-display-fluid)",
                  lineHeight: "var(--lh-display-fluid)",
                  letterSpacing: "var(--tr-display-fluid)",
                }}
              >
                The DP <span className="text-[var(--v-primary)]">Difference.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mx-auto mt-6 max-w-[54ch] text-[length:var(--t-lede)] leading-[1.65] text-[var(--v-muted)]">
                Our approach blends deep relationships with proprietary technology to uncover
                the best leaders and connect with them through the most direct, trusted path.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="mt-9 flex justify-center">
                <GlowButton href="/the-dp-difference">What Makes Us Different</GlowButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
