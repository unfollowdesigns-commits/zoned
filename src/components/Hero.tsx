"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, useReducedMotion } from "@/lib/motion";

const WORDS = ["Professionals.", "Leaders.", "Solutions.", "Yours."] as const;

export default function Hero() {
  const reduced = useReducedMotion();
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, [reduced]);

  // Derived rather than assigned in the effect: with the preference on, the
  // phrase rests on its final word instead of cycling.
  const index = reduced ? WORDS.length - 1 : tick % WORDS.length;

  return (
    <section className="relative isolate overflow-hidden bg-[#03050e]">
      <div className="v-hero-sky" aria-hidden="true" />
      <div className="v-stars" aria-hidden="true" />
      <div className="v-hero-planet" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-40 pt-28 sm:pb-52 sm:pt-36">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.62, ease: EASE }}
          className="v-display max-w-[16ch] text-[clamp(2.5rem,7vw,4.25rem)] leading-[1.05]"
        >
          Our Talent is Finding{" "}
          {/* All words share one grid cell so the box is sized by the longest
              one, and the cross-fade never leaves an empty frame. */}
          <span className="inline-grid max-w-full align-baseline">
            {WORDS.map((word, i) => (
              <motion.span
                key={word}
                aria-hidden={i !== index}
                className="text-[var(--v-primary)]"
                // Explicit grid-area stacks every word in one cell, so the box
                // is sized by the longest word and the cross-fade never leaves
                // an empty frame.
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

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
          className="v-measure mt-8 max-w-[52ch] text-[16.5px] leading-[1.75] text-[var(--v-ink)]/85"
        >
          When the talent decisions are as consequential as the capital decisions, you
          need more than a search firm. We design talent strategy from the boardroom
          down — and execute from day one.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
          className="mt-10"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-[#03050e] transition-colors duration-200 hover:bg-[var(--v-primary)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
          >
            Let&rsquo;s Talk
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
