"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, useReducedMotion } from "@/lib/motion";
import WaveField from "@/components/WaveField";

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

  return (
    <section className="relative">
      <WaveField height={0.86} opacity={1} />

      <div className="relative mx-auto flex min-h-[86vh] max-w-[1280px] flex-col justify-center px-6 py-32">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="v-eyebrow mb-7"
        >
          Talent Infrastructure
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.62, ease: EASE, delay: 0.06 }}
          className="v-display max-w-[15ch] text-balance"
          // Fluid, not a breakpoint ladder. Leading BELOW one: at 88px with 1.1
          // there is a canyon between the lines and it reads as a large
          // paragraph; at 0.95 the lines lock into one shape. Tracking tightens
          // as size grows or large type looks loose.
          style={{
            fontSize: "clamp(44px, 5.6vw, 88px)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
          }}
        >
          Our Talent is Finding{" "}
          {/* One grid cell for every word: the box is sized by the longest, and
              the cross-fade never leaves an empty frame. */}
          <span className="inline-grid max-w-full align-baseline">
            {WORDS.map((word, i) => (
              <motion.span
                key={word}
                aria-hidden={i !== index}
                className="text-[var(--v-primary)]"
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
          transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
          className="mt-9 max-w-[54ch] text-[16.5px] leading-[1.75] text-[var(--v-ink)]/80"
        >
          When the talent decisions are as consequential as the capital decisions, you
          need more than a search firm. We design talent strategy from the boardroom
          down — and execute from day one.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.26 }}
          className="mt-11 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 rounded-full bg-[var(--v-primary)] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
          >
            Let&rsquo;s Talk
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1"
            />
          </Link>
          <Link
            href="/what-we-do"
            className="rounded-full border border-[var(--v-border)] px-7 py-3.5 text-[15px] font-medium text-[var(--v-ink)] transition-colors duration-200 hover:border-[var(--v-border-strong)]"
          >
            What We Do
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
