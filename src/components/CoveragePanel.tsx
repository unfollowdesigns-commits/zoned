"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE, SPRING, useReducedMotion } from "@/lib/motion";
import { FUNCTIONS, INDUSTRIES } from "@/lib/site";

/**
 * The hero's live surface.
 *
 * The house rule for a hero panel is that it carries a working fragment rather
 * than a picture of one, and the rule for figures is that a number is either
 * computed from real input in the page or carries a source. Both are satisfied
 * here without inventing anything: the chips are the firm's actual coverage
 * taxonomy, and the count is that array's length, so it cannot drift from the
 * navigation the way a hand-written "12 disciplines" would.
 *
 * The scan is the point. A static grid of twelve chips is a list; one moving
 * through them reads as a search running, which is what the firm sells.
 */

const ALL = [
  ...FUNCTIONS.map((f) => ({ label: f.label, kind: "Function" as const })),
  ...INDUSTRIES.map((i) => ({ label: i.label, kind: "Industry" as const })),
];

export default function CoveragePanel() {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActive((i) => (i + 1) % ALL.length), 1500);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="g-glass g-ring-accent v-sheen relative overflow-hidden p-6 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="v-eyebrow">Coverage</p>
        <p className="text-[length:var(--t-small)] tabular-nums text-[var(--v-muted)]">
          {/* Derived from the taxonomy, so it can never contradict the nav. */}
          {ALL.length} disciplines
        </p>
      </div>

      <h2 className="v-display mt-4 text-[length:var(--t-heading)] leading-[1.25]">
        Functions and industries we cover
      </h2>

      <ul className="mt-6 flex flex-wrap gap-2">
        {ALL.map((item, i) => {
          const on = i === active;
          return (
            <motion.li
              key={item.label}
              className="relative rounded-[10px] border px-3 py-1.5 text-[length:var(--t-small)] leading-tight"
              animate={{
                borderColor: on
                  ? "color-mix(in srgb, var(--v-primary) 55%, transparent)"
                  : "var(--v-border)",
                color: on ? "var(--v-ink)" : "var(--v-muted)",
                backgroundColor: on
                  ? "color-mix(in srgb, var(--v-primary) 12%, transparent)"
                  : "rgba(255,255,255,0.02)",
              }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {item.label}
              {on && !reduced && (
                <motion.span
                  layoutId="coverage-scan"
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-px bg-[var(--v-primary)]"
                  transition={SPRING}
                />
              )}
            </motion.li>
          );
        })}
      </ul>

      <div className="v-rule my-6" />

      <p className="text-[length:var(--t-small)] leading-[1.6] text-[var(--v-muted)]">
        Search, interim and project support across every one of them, delivered by
        the same partners.
      </p>
    </div>
  );
}
