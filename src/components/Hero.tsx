"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE, useReducedMotion, staggerDelay } from "@/lib/motion";
import { WaveField } from "@/kit/components/WaveField";
import { CLIENTS } from "@/lib/site";
import GlowButton from "@/components/ui/GlowButton";

/**
 * The hero.
 *
 * One column, not two. The previous version put a panel of function and
 * industry chips beside the headline, and it was the weakest thing on the site:
 * twelve pills at twelve different widths is a ragged block that reads as a
 * filter UI with nothing to filter, and it stole half the width from the only
 * sentence that has to land. Those twelve labels already have a home in the
 * navigation and in the sections below, which is where a visitor looks for
 * them. What replaced it is width: the statement now runs at full measure, and
 * the space under it goes to proof rather than to a widget.
 *
 * The three numbers that carry the type: clamp(44px, 5.6vw, 88px) fluid rather
 * than stepped, leading BELOW one so the lines lock into a single shape rather
 * than sitting as a large paragraph, and tracking tightened to -0.035em,
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

      <div className="relative mx-auto max-w-[1280px] px-6 pb-16 pt-28 lg:pb-20 lg:pt-36">
        <motion.p {...rise(0)} className="v-eyebrow">
          Talent Infrastructure
        </motion.p>

        <motion.h1
          {...rise(1)}
          className="v-display mt-8 max-w-[15ch] text-balance"
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

        <motion.p
          {...rise(2)}
          className="mt-9 max-w-[54ch] text-pretty text-[length:var(--t-lede)] leading-[1.55] text-[var(--v-muted)]"
        >
          When the talent decisions are as consequential as the capital decisions, you
          need more than a search firm. We design talent strategy from the boardroom
          down, and execute from day one.
        </motion.p>

        <motion.div {...rise(3)} className="mt-11 flex flex-wrap items-center gap-3">
          <GlowButton href="/contact">Let&rsquo;s Talk</GlowButton>
          <GlowButton href="/what-we-do" tone="quiet">
            What We Do
          </GlowButton>
        </motion.div>

        {/* One quiet line that removes an objection. */}
        <motion.p
          {...rise(4)}
          className="mt-8 flex items-center gap-2.5 text-[length:var(--t-small)] text-[var(--v-muted)]"
        >
          <span aria-hidden="true" className="h-px w-6 bg-white/20" />
          Partner-led from first call to close.
        </motion.p>
      </div>

      <TrustStrip />
    </section>
  );
}

/**
 * The proof strip that closes the hero.
 *
 * A hero that ends at the buttons ends on a claim. Ending it on names ends it
 * on evidence, and it puts something one screen down that is worth scrolling
 * to, which is what stops the fold reading as the whole page.
 *
 * Names only. The reference site pairs each logo with the role it placed there,
 * and it is a better strip for it, but this site has the client list and the
 * placed-role list as two separate facts. Pairing them would invent a
 * placement that may not have happened, so the roles keep their own section
 * below and nothing here claims more than the source does.
 */
function TrustStrip() {
  return (
    <div className="relative border-t border-[var(--v-border)] bg-[var(--v-bg-2)]/50 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <p className="v-eyebrow mb-7 text-[var(--v-muted)]">
          Trusted by teams building something great
        </p>
        <ul className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {CLIENTS.map((name, i) => (
            <motion.li
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.5 + staggerDelay(i) }}
              className="v-display text-[length:var(--t-secondary)] leading-[1.3] tracking-tight text-[var(--v-muted)] transition-colors duration-200 hover:text-[var(--v-ink)]"
            >
              {name}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
