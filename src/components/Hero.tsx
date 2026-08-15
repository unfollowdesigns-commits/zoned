"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, useReducedMotion, staggerDelay } from "@/lib/motion";
import { WaveField } from "@/kit/components/WaveField";
import CoveragePanel from "@/components/CoveragePanel";

/**
 * The hero.
 *
 * Two columns, per the house shape: the claim on the left, a live surface on
 * the right. A hero with one column and empty space beside it is the shape that
 * reads as a template, and the panel is what stops the section being a headline
 * on a background.
 *
 * The three numbers that carry it are the type: clamp(44px, 5.6vw, 88px) fluid
 * rather than stepped, leading BELOW one so the lines lock into a single shape
 * rather than sitting as a large paragraph, and tracking tightened to -0.035em
 * because tracking has to decrease as size increases.
 *
 * The rotating word is a cross-fade in place, never AnimatePresence with
 * mode="wait": that leaves a frame with nothing on screen between exit and
 * enter, which is a visible dead beat every cycle.
 */

const WORDS = ["Professionals.", "Leaders.", "Solutions.", "Yours."] as const;

export default function Hero() {
  const reduced = useReducedMotion();
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, [reduced]);

  const index = reduced ? WORDS.length - 1 : tick % WORDS.length;

  const rise = (i: number) => ({
    initial: { opacity: 0, y: 18, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.6, ease: EASE, delay: staggerDelay(i) },
  });

  return (
    <section className="relative">
      <WaveField height={0.86} opacity={1} />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-6 pb-20 pt-28 lg:grid-cols-[1.22fr_1fr] lg:gap-16 lg:pb-28 lg:pt-32">
        <div>
          <motion.p {...rise(0)} className="v-eyebrow">
            Talent Infrastructure
          </motion.p>

          <motion.h1
            {...rise(1)}
            className="v-display mt-7 max-w-[14ch] text-balance"
            style={{
              fontSize: "var(--t-hero)",
              lineHeight: "var(--lh-hero)",
              letterSpacing: "var(--tr-hero)",
            }}
          >
            Our Talent is Finding{" "}
            {/* Every word shares one grid cell, so the box is sized by the
                longest and the cross-fade never leaves an empty frame. */}
            <span className="inline-grid max-w-full align-baseline">
              {WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  aria-hidden={i !== index}
                  className="v-accent-text"
                  style={{ gridArea: "1 / 1" }}
                  initial={false}
                  animate={{ opacity: i === index ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* 46ch, not the 68ch body measure: a lede beside a panel has to
              break earlier or it runs under the panel's gutter. */}
          <motion.p
            {...rise(2)}
            className="mt-8 max-w-[46ch] text-pretty text-[length:var(--t-lede)] leading-[1.55] text-[var(--v-muted)]"
          >
            When the talent decisions are as consequential as the capital decisions, you
            need more than a search firm. We design talent strategy from the boardroom
            down, and execute from day one.
          </motion.p>

          <motion.div {...rise(3)} className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[length:var(--t-action)] font-semibold text-white outline-none transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)] bg-[linear-gradient(180deg,var(--v-primary),var(--v-primary-deep))] shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_14px_40px_-12px_color-mix(in_srgb,var(--v-primary)_85%,transparent)]"
            >
              Let&rsquo;s Talk
              <ArrowRight
                size={17}
                strokeWidth={2}
                className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1"
              />
            </Link>
            <Link
              href="/what-we-do"
              className="rounded-full border border-[var(--v-border)] px-7 py-3.5 text-[length:var(--t-action)] font-medium text-[var(--v-ink)] transition-colors duration-200 hover:border-[var(--v-border-strong)] hover:bg-white/[0.04]"
            >
              What We Do
            </Link>
          </motion.div>

          {/* One quiet line that removes an objection. */}
          <motion.p
            {...rise(4)}
            className="mt-7 flex items-center gap-2.5 text-[length:var(--t-small)] text-[var(--v-muted)]"
          >
            <span aria-hidden="true" className="h-px w-6 bg-white/20" />
            Partner-led from first call to close.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
        >
          <CoveragePanel />
        </motion.div>
      </div>
    </section>
  );
}
