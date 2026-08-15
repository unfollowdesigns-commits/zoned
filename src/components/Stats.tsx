"use client";

import * as React from "react";
import { animate, motion, useInView, useMotionValue } from "framer-motion";
import { EASE, useReducedMotion } from "@/lib/motion";
import { STATS, type Stat } from "@/lib/site";

/**
 * The metrics strip.
 *
 * A one-pixel gap grid rather than bordered cards: `gap-px` over a lit
 * background lets the background show through as hairlines, so the strip reads
 * as one object divided rather than as four boxes placed near each other.
 *
 * The figures count. A static number inside a strip making a claim about volume
 * is a wasted opportunity, and a counting number is the cheapest motion on the
 * page that carries meaning. Units are set as superscripts so the numeral keeps
 * the full display size and the row of figures aligns on one baseline.
 */

function Figure({ stat }: { stat: Stat }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const [shown, setShown] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setShown(stat.value);
      return;
    }
    const controls = animate(mv, stat.value, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, stat.value, mv]);

  return (
    <p
      ref={ref}
      className="v-display flex items-start text-[length:var(--t-title)] font-bold leading-none"
      // tabular while it moves so the digits do not jitter as they change width
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {stat.prefix && <span aria-hidden="true">{stat.prefix}</span>}
      <span>{shown.toLocaleString()}</span>
      {stat.unit && (
        <span aria-hidden="true" className="mt-1 text-[length:var(--t-heading)] text-[var(--v-primary)]">
          {stat.unit}
        </span>
      )}
      {/* The figure is announced once, in full, rather than on every tick. */}
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
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: EASE, delay: Math.min(i * 0.07, 0.3) }}
            className="bg-[var(--v-bg)] px-6 py-8"
          >
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <Figure stat={stat} />
              <p className="mt-3 max-w-[24ch] text-[length:var(--t-small)] leading-snug text-[var(--v-muted)]">
                {stat.label}
              </p>
            </dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
