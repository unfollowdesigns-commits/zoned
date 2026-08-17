"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE, useReducedMotion } from "@/lib/motion";
import { PLACED_POSITIONS } from "@/lib/site";
import { whenReached } from "@/lib/in-view";
import LightBand from "@/components/ui/LightBand";

/**
 * The seats we fill, as one sentence rather than another grid.
 *
 * THIS SECTION EXISTS TO BREAK THE PAGE'S OWN TEMPLATE, and that is a real
 * design job rather than a preference. Every other section on this page opens
 * eyebrow, then a two-tone heading, then a lede, then a grid. Five of those in
 * a row is what makes a page read as generated no matter how good any single
 * one of them is: the rhythm of a page comes from sections having genuinely
 * different anatomy, not from alternating the background colour underneath the
 * same anatomy. So this one has no eyebrow, no lede, no grid and no cards. It
 * is a paragraph.
 *
 * Setting the titles as running text rather than as chips also states something
 * a chip row cannot. A row of pills reads as filters, as though the visitor is
 * meant to pick one. A sentence reads as a list of seats this firm has actually
 * sat people in, which is the claim being made.
 *
 * The titles brighten in sequence as the paragraph is reached, so the eye is
 * walked along the line instead of being handed the whole block at once.
 */
export default function PlacedPositions() {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const [lit, setLit] = React.useState(false);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenReached(el, () => setLit(true));
  }, []);

  return (
    <LightBand>
      <div className="mx-auto max-w-[1280px] px-6 py-28 sm:py-36">
        <p
          ref={ref}
          className="v-display max-w-[24ch] text-[length:var(--t-title)] leading-[1.35] tracking-[-0.02em] sm:max-w-[38ch]"
        >
          <span className="text-[var(--v-muted)]">We have placed </span>
          {PLACED_POSITIONS.map((title, i) => (
            <React.Fragment key={title}>
              <motion.span
                initial={reduced ? false : { opacity: 0.25 }}
                animate={{ opacity: lit ? 1 : 0.25 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : // Capped, so a longer list does not take proportionally
                      // longer to finish reading itself out.
                      { duration: 0.5, ease: EASE, delay: Math.min(i * 0.09, 0.8) }
                }
                className="text-[var(--v-ink)]"
              >
                {title}
              </motion.span>
              <span className="text-[var(--v-muted)]">
                {i === PLACED_POSITIONS.length - 1 ? ", and many more." : ", "}
              </span>
            </React.Fragment>
          ))}
        </p>
      </div>
    </LightBand>
  );
}
