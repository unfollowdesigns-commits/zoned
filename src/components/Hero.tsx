"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
 * The headline arrives as a mask reveal, word by word, which is the section's
 * actual animation. See the comment on the h1: the distinction between that and
 * a fade is the whole difference between a hero that looks composed and one
 * that looks like it finished loading.
 *
 * Scrolling out of the hero is its own move. The statement drifts up faster
 * than the page, shrinks slightly and blurs, so the next section reads as
 * arriving over it rather than the whole page sliding as one flat sheet. The
 * wave field behind travels at a different rate again, which is what gives the
 * fold depth: two planes moving at two speeds is parallax, one plane moving is
 * a scroll. Everything here is transform and opacity on composited layers, so
 * it costs nothing on the main thread.
 */

const WORDS = ["Professionals.", "Leaders.", "Solutions.", "Yours."] as const;

export default function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const [tick, setTick] = React.useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* The copy leaves faster than the page and softens as it goes. Blur is worth
     the cost here and nowhere else: it is what makes the layer read as passing
     behind the next section rather than simply moving up. */
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const copyBlur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(6px)"]);
  /* The field behind travels the other way and slower. Two planes, two rates. */
  const fieldY = useTransform(scrollYProgress, [0, 1], [0, 70]);

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
    <section ref={sectionRef} className="relative">
      <motion.div style={reduced ? undefined : { y: fieldY }}>
        <WaveField height={0.86} opacity={1} />
      </motion.div>

      <motion.div
        className="relative mx-auto max-w-[1280px] px-6 pb-16 pt-28 lg:pb-20 lg:pt-36"
        style={
          reduced
            ? undefined
            : {
                y: copyY,
                scale: copyScale,
                opacity: copyOpacity,
                filter: copyBlur,
                transformOrigin: "0% 0%",
                willChange: "transform, opacity",
              }
        }
      >
        <motion.p {...rise(0)} className="v-eyebrow">
          Talent Infrastructure
        </motion.p>

        {/* The headline is the hero's animation, and it is a mask reveal
            rather than a fade. Each word sits inside its own overflow-hidden
            box and rises from fully below it, so the letters are wiped into
            existence by the edge of the mask instead of appearing at reduced
            opacity. That difference is the whole effect: a fade says "this
            content loaded", a mask reveal says "this was composed". It is also
            why the words must not be spaced with a plain space character. A
            space inside the mask gets clipped with everything else, so the
            gap is padding on the mask box itself.

            Slow, and slower than it feels it should be: 0.9s per word with a
            small stagger. Display type at this size needs the extra time or
            the reveal reads as a flicker. */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: 0.12 }}
          className="v-display mt-8 max-w-[15ch] text-balance"
          style={{
            fontSize: "var(--t-hero)",
            lineHeight: "var(--lh-hero)",
            letterSpacing: "var(--tr-hero)",
          }}
        >
          {["Our", "Talent", "is", "Finding"].map((word, i) => (
            <span
              key={word}
              className="inline-block overflow-hidden align-bottom pr-[0.26em]"
              /* The mask has to be taller than the glyphs or descenders and the
                 tracking's overhang get shaved off at rest. */
              style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
            >
              <motion.span
                className="inline-block"
                initial={reduced ? false : { y: "115%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.18 + i * 0.075 }}
              >
                {word}
              </motion.span>
            </span>
          ))}

          {/* The rotating word gets the same treatment on entry, then switches
              to a cross-fade in place. Never AnimatePresence with mode="wait":
              that leaves a frame with nothing on screen between exit and enter,
              which is a visible dead beat every cycle. Every word shares one
              grid cell, so the box is sized by the longest. */}
          <span
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
          >
            <motion.span
              className="inline-grid max-w-full"
              initial={reduced ? false : { y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.18 + 4 * 0.075 }}
            >
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
            </motion.span>
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
      </motion.div>

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
