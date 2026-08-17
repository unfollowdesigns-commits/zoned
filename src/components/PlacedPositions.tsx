"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE, useReducedMotion } from "@/lib/motion";
import { PLACED_POSITIONS } from "@/lib/site";
import Reveal from "@/components/Reveal";
import LightBand from "@/components/ui/LightBand";

/**
 * Frequently placed positions.
 *
 * A rail of role titles rather than a card grid. The hover is the point: a
 * search firm's proof is the seniority of the seat, so pointing at a title
 * lifts it out of the row and draws the accent rule beneath it, which acts out
 * "this is the level we work at" rather than proving the chip is hoverable.
 */
export default function PlacedPositions() {
  const reduced = useReducedMotion();

  return (
    <LightBand>
      <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
      <p className="v-eyebrow mb-7">Frequently Placed Positions</p>

      <Reveal>
      <ul className="flex flex-wrap gap-2.5">
        {PLACED_POSITIONS.map((title) => (
          <motion.li
            key={title}
            initial="rest"
            animate="rest"
            whileHover={reduced ? undefined : "hover"}
            whileFocus={reduced ? undefined : "hover"}
          >
            <motion.span
              tabIndex={0}
              className="relative inline-flex cursor-default items-center rounded-full border border-[var(--v-border)] bg-white/60 px-5 py-2.5 text-[length:var(--t-secondary)] text-[var(--v-muted)] outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
              variants={{
                rest: { y: 0, color: "var(--v-muted)" },
                hover: { y: -3, color: "var(--v-ink)" },
              }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {title}
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-5 -bottom-px h-px origin-left bg-[var(--v-primary)]"
                variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                transition={{ duration: 0.28, ease: EASE }}
              />
            </motion.span>
          </motion.li>
        ))}
      </ul>
      </Reveal>
      </div>
    </LightBand>
  );
}
