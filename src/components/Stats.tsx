"use client";

import { STATS, type Stat } from "@/lib/site";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import LightBand from "@/components/ui/LightBand";

/**
 * The numbers, given a section rather than a strip.
 *
 * The first version was four bordered cards in a row under no heading, and it
 * read as a stat widget dropped into the page. Four figures this good deserve
 * the section they carry, so they get a title, room, and a size that makes them
 * the largest thing on the screen after the hero.
 *
 * Hairline dividers between columns rather than boxes: the numbers are one
 * argument in four parts, and a box around each says they are four unrelated
 * facts. The rules are on the left edge of every column but the first, so the
 * row has no dangling rule at either end.
 */
function Figure({ stat }: { stat: Stat }) {
  return (
    <p className="v-display flex items-start leading-[0.9]">
      <span className="text-[length:var(--t-display-fluid)] font-bold tracking-[-0.04em]">
        {stat.prefix && <span aria-hidden="true">{stat.prefix}</span>}
        <CountUp to={stat.value} />
      </span>
      {stat.unit && (
        <span
          aria-hidden="true"
          className="mt-[0.15em] text-[length:var(--t-title)] font-bold text-[var(--v-primary-deep)]"
        >
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
    <LightBand>
      <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
        <SectionHeading
          eyebrow="By the numbers"
          title="The difference,"
          turn="in numbers."
        />

        <dl className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-y-0">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.07}
              className={
                i > 0
                  ? "lg:border-l lg:border-[var(--v-border)] lg:pl-10"
                  : "lg:pr-10"
              }
            >
              <div className={i > 0 ? "lg:pr-10" : ""}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <Figure stat={stat} />
                  <p className="mt-5 max-w-[26ch] text-[length:var(--t-secondary)] leading-[1.55] text-[var(--v-muted)]">
                    {stat.label}
                  </p>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </LightBand>
  );
}
