"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, AnimatePresence } from "framer-motion";
import { EASE, SPRING_ICON, useReducedMotion } from "@/lib/motion";
import { FUNCTIONS, INDUSTRIES } from "@/lib/site";
import { ICONS } from "@/components/icons";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * Functions and industries, as two disclosures that take turns.
 *
 * Opening one closes the other. That is the reference behaviour and it is worth
 * keeping for a reason beyond imitation: these are two answers to the same
 * question, so showing both at once makes the visitor compare across thirty
 * labels instead of reading twelve. One open row is a decision; two open rows
 * are a list.
 *
 * Where this goes further than the reference:
 *
 *   - The chips stagger in rather than appearing all at once, so the row reads
 *     as unfolding rather than as a layout shift.
 *   - The count next to each label is derived from the data, so it cannot drift
 *     from the number of chips underneath it the way a hand-typed one does.
 *   - The rows animate their own height, so the section below is pushed rather
 *     than jumped, and the exchange between the two rows is continuous.
 *   - Every chip is a real link to that discipline's page. The reference's are
 *     links too, and a row of chips that only sits there is the version of this
 *     pattern that wastes the space it takes.
 *
 * The disclosure is a real button with `aria-expanded` and a controlled region,
 * so the whole thing works from a keyboard and announces its state.
 */

const ROWS = [
  { id: "functions", label: "All functions", items: FUNCTIONS },
  { id: "industries", label: "All industries", items: INDUSTRIES },
] as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
        open
          ? "border-transparent bg-[var(--v-primary)] text-white"
          : "border-[var(--v-border-strong)] text-[var(--v-muted)]"
      }`}
      animate={{ rotate: open ? 180 : 0 }}
      /* A spring here and an ease on the panel height below, deliberately.
         The chevron is a small object the visitor just acted on, so overshoot
         reads as responsiveness. Height is not: a spring on height overshoots
         the page's own layout and every section underneath bounces with it. */
      transition={SPRING_ICON}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
        <path
          d="M6 9.5 12 15l6-5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

export default function Specializations() {
  // Null rather than an index, because "both closed" is a real state: the
  // section opens closed so its shape is legible before anything expands.
  const [open, setOpen] = React.useState<string | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="v-dark-band">
      <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
        <SectionHeading
          eyebrow="Breadth"
          title="More specializations"
          turn="for your business."
          lede="Wherever you're building, the expertise is already in the room. Twelve disciplines, and the same partners across all of them."
        />

        <div className="mt-16 border-t border-[var(--v-border)]">
          {ROWS.map((row) => {
            const isOpen = open === row.id;
            return (
              <div key={row.id} className="border-b border-[var(--v-border)]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : row.id)}
                  aria-expanded={isOpen}
                  aria-controls={`spec-${row.id}`}
                  className="group flex w-full items-center justify-between gap-6 py-8 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--v-ring)]"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="v-display text-[length:var(--t-title)] leading-none transition-colors duration-200 group-hover:text-[var(--v-ring)]">
                      {row.label}
                    </span>
                    <span className="text-[length:var(--t-small)] tabular-nums text-[var(--v-muted)]">
                      {row.items.length}
                    </span>
                  </span>
                  <Chevron open={isOpen} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`spec-${row.id}`}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.3 } }
                      }
                      // The panel animates its own height, so it must clip while
                      // it does. Without this the chips spill past the row's
                      // border for the length of the animation.
                      style={{ overflow: "hidden" }}
                    >
                      {/* A GRID OF TILES, NOT A WRAPPED CLOUD OF PILLS.

                          The outlined full-radius pill is the dated part, and
                          the ragged right edge is why. These labels run from
                          "Controller" to "Professional & Business Services", so
                          wrapping them produced rows of wildly uneven blocks
                          ending wherever the text happened to stop: the cloud
                          read as leftover text rather than as a set of
                          destinations. A grid aligns them, and alignment is most
                          of what reads as considered.

                          The icons were the other half of it. Every function and
                          industry in lib/site.ts already carries an icon key and
                          the pills threw it away, so twelve links looked
                          identical and the eye had nothing to scan by. */}
                      <ul className="grid gap-2 pb-9 sm:grid-cols-2 lg:grid-cols-3">
                        {row.items.map((item, i) => {
                          const Icon = item.icon ? ICONS[item.icon] : undefined;
                          return (
                            <motion.li
                              key={item.href}
                              initial={reduced ? false : { opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.4,
                                ease: EASE,
                                // Capped, so a twelve-item row does not take three
                                // times as long to finish as a four-item one.
                                delay: Math.min(i * 0.035, 0.28),
                              }}
                            >
                              <Link
                                href={item.href}
                                /* `ring-1` rather than `border`, so the hairline
                                   sits on the edge instead of adding a pixel to
                                   the box and shifting the text by half of one.
                                   A named group so the icon and the arrow can
                                   react to the tile being hovered, not to
                                   themselves. */
                                className="group/tile flex items-center gap-3 rounded-[14px] bg-white/[0.035] px-4 py-3.5 ring-1 ring-inset ring-white/[0.08] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:ring-[var(--v-primary)]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                              >
                                {Icon && (
                                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--v-primary)]/14 text-[var(--v-primary)] transition-colors duration-300 group-hover/tile:bg-[var(--v-primary)] group-hover/tile:text-white">
                                    <Icon size={17} strokeWidth={1.75} />
                                  </span>
                                )}
                                <span className="text-[length:var(--t-small)] leading-[1.35] text-[var(--v-ink)]/85 transition-colors duration-300 group-hover/tile:text-[var(--v-ink)]">
                                  {item.label}
                                </span>
                                {/* Arrives on hover. Present but transparent at
                                    rest so nothing reflows when it appears. */}
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  width="15"
                                  height="15"
                                  fill="none"
                                  className="ml-auto shrink-0 -translate-x-1 text-[var(--v-primary)] opacity-0 transition-[opacity,transform] duration-300 group-hover/tile:translate-x-0 group-hover/tile:opacity-100"
                                >
                                  <path
                                    d="M5 12h13M13 6.5 18.5 12 13 17.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Link>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
