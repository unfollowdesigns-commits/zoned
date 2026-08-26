"use client";

import { STATS, type Stat } from "@/lib/site";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import LightBand from "@/components/ui/LightBand";

/**
 * The numbers.
 *
 * THE GAUGES ARE GONE, AND THE REASON IS WORTH KEEPING. Two of these four are
 * percentages, so a ring filled to ninety percent was a defensible reading of
 * the data. It was still the wrong design, for two reasons that only show up
 * once it is on screen.
 *
 * First, a ring puts its number INSIDE it, which caps how big that number can
 * be. So ">90%" and "100%", which are the strongest things on this row, ended
 * up rendering smaller than the plain counts beside them. The chart was
 * actively arguing against the content.
 *
 * Second, a full ring for 100% is a circle. It carries no information at all;
 * it just sits there being round. A chart whose most impressive value is also
 * its least readable shape is not helping.
 *
 * Four scalars are a typographic problem, not a charting one. The reference
 * this site is being measured against sets its figures exactly this way: small
 * label, large number, no chart. A graph earns its place when there is a SHAPE
 * to show, a series over time or a distribution. There is no shape in "1,100".
 *
 * THE ROW SITS BESIDE THE HEADING RATHER THAN UNDER IT. Stacked, the heading
 * occupied the top third of the band and left an empty rectangle the width of
 * the page beside it. Paired, the heading has something to talk to and the
 * figures get the width they need to be the size they should be.
 *
 * A rule above each figure rather than a box around it. These are one argument
 * in four parts; a box around each says they are four unrelated facts.
 */
function Figure({ stat }: { stat: Stat }) {
  return (
    <p className="v-display flex items-start leading-[0.85]">
      <span className="text-[length:clamp(44px,4.6vw,76px)] font-bold tracking-[-0.045em]">
        {stat.prefix && <span aria-hidden="true">{stat.prefix}</span>}
        <CountUp to={stat.value} />
      </span>
      {stat.unit && (
        <span
          aria-hidden="true"
          className="mt-[0.14em] text-[length:var(--t-title)] font-bold text-[var(--v-primary)]"
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
      <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-20">
          <SectionHeading
            eyebrow="By the numbers"
            title="The difference,"
            turn="in numbers."
          />

          <dl className="grid grid-cols-1 gap-x-10 gap-y-11 sm:grid-cols-2">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={Math.min(i * 0.07, 0.28)}>
                <div className="border-t border-[var(--v-ink)]/[0.14] pt-6">
                  <dd>
                    <Figure stat={stat} />
                  </dd>
                  <dt className="mt-4 max-w-[26ch] text-[length:var(--t-small)] leading-[1.55] text-[var(--v-muted)]">
                    {stat.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </LightBand>
  );
}
