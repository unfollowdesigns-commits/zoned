"use client"

/**
 * The hero, as a working reference.
 *
 * This exists because the hero is the part that never survives a description.
 * Told "a big headline", a model writes `text-5xl` and the result is a 48px
 * heading with 1.1 leading that looks like a section title. The actual thing is
 * nearly twice that, with leading BELOW 1 and much tighter tracking, and those
 * three numbers together are most of what makes a hero read as designed.
 *
 * The numbers, and why:
 *
 *   fontSize: clamp(44px, 5.6vw, 88px)
 *     Fluid, not a breakpoint ladder. A hero headline should fill its column at
 *     every width, and a stepped scale leaves it visibly too small just before
 *     each breakpoint. 5.6vw is tuned so the line breaks where it should on a
 *     1440 screen with the layout below.
 *
 *   lineHeight: 0.95
 *     BELOW one. This is the single most commonly missed value. Display type
 *     at 88px with 1.1 leading has a canyon between the lines and reads as a
 *     paragraph that happens to be large. At 0.95 the lines lock together into
 *     one shape.
 *
 *   letterSpacing: -0.035em
 *     Tighter than the -0.028em used for section titles. Tracking has to
 *     decrease as size increases or large type looks loose and cheap.
 *
 * The accent span is what makes the headline an image rather than a sentence.
 * Turn the second half of the claim, never the first, and never more than half.
 */

import * as React from "react"
import { Stagger, Reveal, ScrollReveal } from "./Motion"

export function Hero({
  eyebrow,
  headline,
  accent,
  lede,
  actions,
  footnote,
  panel,
}: {
  /** Uppercase label. A letterspaced caps line, NOT a bordered pill: a pill
      sits next to the headline as a second object and competes with it. */
  eyebrow: string
  /** The first, unaccented part of the headline. */
  headline: string
  /** The phrase the headline turns on. Carries the gradient. */
  accent: string
  lede: string
  actions: React.ReactNode
  /** One quiet line under the buttons that removes an objection. */
  footnote?: string
  /** The live demo surface. A real fragment of the product, never a screenshot. */
  panel?: React.ReactNode
}) {
  return (
    <section className="grid items-center gap-12 pb-16 pt-16 lg:grid-cols-[1.22fr_1fr] lg:pt-24">
      <Stagger>
        <Reveal>
          <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[var(--v-positive)] shadow-[0_0_8px_var(--v-positive)]"
            />
            {eyebrow}
          </span>
        </Reveal>

        <Reveal>
          <h1
            className="v-display mt-6 text-balance font-bold text-white"
            style={{
              fontSize: "clamp(44px, 5.6vw, 88px)",
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
            }}
          >
            {headline} <span className="v-accent-text">{accent}</span>
          </h1>
        </Reveal>

        <Reveal>
          {/* 46ch, not the 68ch body measure. A lede sitting beside a panel
              needs to break earlier or it runs under the panel's gutter. */}
          <p className="mt-7 max-w-[46ch] text-pretty text-[19px] leading-[1.55] text-zinc-400">
            {lede}
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div>
        </Reveal>

        {footnote && (
          <Reveal>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-zinc-500">
              <span aria-hidden className="h-px w-6 bg-white/20" />
              {footnote}
            </p>
          </Reveal>
        )}
      </Stagger>

      {panel && (
        <ScrollReveal className="lg:pt-4" delay={0.15}>
          {panel}
        </ScrollReveal>
      )}
    </section>
  )
}

/**
 * The primary call to action.
 *
 * Deliberately not magnetic. A button that drifts toward the cursor makes
 * people miss it and reads as a joke, which is the last thing the main action
 * on the page should do. Save that for a secondary link.
 */
export function HeroCta({
  href, children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white outline-none transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[var(--v-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--v-bg)] bg-[linear-gradient(180deg,var(--v-primary),var(--v-primary-deep))] shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_14px_40px_-12px_color-mix(in srgb, var(--v-primary) 85%, transparent)]"
    >
      {children}
    </a>
  )
}

/**
 * The metrics strip that sits directly under the hero.
 *
 * A one-pixel gap grid rather than bordered cards: `gap-px` over a light
 * background lets the background show through as hairlines, so the strip reads
 * as one object divided rather than as four boxes placed near each other. That
 * distinction is small and it is the difference between a strip and a card row.
 *
 * The figures count. Static numbers inside a strip making a claim about speed
 * is a wasted opportunity, and a counting number is the cheapest motion on the
 * page that carries meaning.
 */
export function MetricStrip({
  items,
}: {
  items: { value: React.ReactNode; label: string }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] lg:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="bg-[var(--v-bg)] px-6 py-7">
          <p className="v-display text-[36px] font-bold leading-none text-white">{m.value}</p>
          <p className="mt-2 text-[13px] leading-snug text-zinc-500">{m.label}</p>
        </div>
      ))}
    </div>
  )
}
