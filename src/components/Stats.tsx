"use client";

import { STATS, type Stat } from "@/lib/site";
import { ScrollCount } from "@/kit/components/Interactions";
import Reveal from "@/components/Reveal";

/**
 * The metrics strip.
 *
 * A one-pixel gap grid rather than bordered cards: `gap-px` over a lit
 * background lets the background show through as hairlines, so the strip reads
 * as one object divided rather than as four boxes placed near each other.
 *
 * The figures count, using the kit's ScrollCount so the counting physics match
 * every other number on the site. Units are superscripts, so the numerals hold
 * one baseline across the row.
 */
function Figure({ stat }: { stat: Stat }) {
  return (
    <p className="v-display flex items-start text-[length:var(--t-title)] font-bold leading-none">
      {stat.prefix && <span aria-hidden="true">{stat.prefix}</span>}
      <ScrollCount to={stat.value} />
      {stat.unit && (
        <span aria-hidden="true" className="mt-1 text-[length:var(--t-heading)] text-[var(--v-primary)]">
          {stat.unit}
        </span>
      )}
      {/* Announced once, in full, rather than on every tick of the count. */}
      <span className="sr-only">
        {stat.prefix}
        {stat.value.toLocaleString()}
        {stat.unit}
      </span>
    </p>
  );
}

export default function Stats() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--v-border)] bg-white/[0.06] lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.07} className="bg-[var(--v-bg)]">
            <div className="px-6 py-8">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <Figure stat={stat} />
                <p className="mt-3 max-w-[24ch] text-[length:var(--t-small)] leading-snug text-[var(--v-muted)]">
                  {stat.label}
                </p>
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
