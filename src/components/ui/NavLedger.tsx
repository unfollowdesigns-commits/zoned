"use client";

import Link from "@/components/SiteLink";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ICONS } from "@/components/icons";
import { EASE, SPRING_ICON, useReducedMotion } from "@/lib/motion";
import type { NavItem } from "@/lib/site";

/**
 * Bordered rows with a numbered left rail, used instead of a grid of equal
 * cards. The hover moves the rail rule and advances the arrow rather than
 * lifting the row.
 *
 * The icons animate rather than only changing colour. A colour swap is not a
 * response: the eye reads it as the same object recoloured, not as the object
 * reacting. The tile tips and the glyph inside rises against it on a stiffer
 * spring, so the two move at different rates and the pair reads as something
 * being picked up.
 */
export default function NavLedger({ items }: { items: NavItem[] }) {
  const reduced = useReducedMotion();

  return (
    <ul className="border-t border-[var(--v-border)]">
      {items.map((item, i) => {
        const Icon = item.icon ? ICONS[item.icon] : undefined;
        return (
          <li key={item.href} className="border-b border-[var(--v-border)]">
            <motion.div
              initial="rest"
              animate="rest"
              whileHover={reduced ? undefined : "hover"}
              whileFocus={reduced ? undefined : "hover"}
            >
              <Link
                href={item.href}
                className="group relative flex items-center gap-5 py-5 pl-4 pr-2 transition-colors duration-200 hover:bg-white/[0.03] sm:gap-7 sm:pl-6"
              >
                {/* rail */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-px bg-[var(--v-primary)]"
                  variants={{ rest: { scaleY: 0 }, hover: { scaleY: 1 } }}
                  transition={{ duration: 0.28, ease: EASE }}
                  style={{ originY: 0 }}
                />
                <span
                  aria-hidden="true"
                  className="w-7 shrink-0 text-[length:var(--t-small)] tabular-nums text-[var(--v-muted)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {Icon && (
                  /* The tile and the glyph move on different springs, and that
                     is the whole trick. One element scaling up is a button
                     growing; a tile that tips slightly while the glyph inside it
                     rises and settles reads as an object being handled. The
                     glyph is also the livelier of the two, because the small
                     thing moving faster than the big thing is what parallax is
                     at any scale. */
                  <motion.span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--v-border)] bg-white/[0.04] text-[var(--v-muted)] transition-colors duration-300 group-hover:border-[var(--v-primary)]/50 group-hover:bg-[var(--v-primary)]/10 group-hover:text-[var(--v-primary)]"
                    variants={{
                      rest: { scale: 1, rotate: 0 },
                      hover: { scale: 1.07, rotate: -5 },
                    }}
                    transition={SPRING_ICON}
                  >
                    <motion.span
                      className="grid place-items-center"
                      variants={{
                        rest: { y: 0, rotate: 0 },
                        /* Counter-rotates the tile's tilt, so the glyph stays
                           upright while its container turns under it. */
                        hover: { y: -2, rotate: 5 },
                      }}
                      transition={{ ...SPRING_ICON, stiffness: 420 }}
                    >
                      <Icon size={19} strokeWidth={1.75} />
                    </motion.span>
                  </motion.span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="v-display text-[length:var(--t-body)] leading-[1.3] sm:text-[length:var(--t-body)]">
                    {item.label}
                  </span>
                  {item.note && (
                    <span className="mt-1 text-[length:var(--t-small)] leading-[1.6] text-[var(--v-muted)]">
                      {item.note}
                    </span>
                  )}
                </span>
                {item.badge && (
                  <span className="hidden rounded-full border border-[var(--v-primary)]/40 bg-[var(--v-primary)]/10 px-2.5 py-1 text-[length:var(--t-label)] font-semibold uppercase tracking-wide text-[var(--v-primary)] sm:inline">
                    {item.badge}
                  </span>
                )}
                <motion.span
                  aria-hidden="true"
                  className="shrink-0 text-[var(--v-muted)] transition-colors group-hover:text-[var(--v-primary)]"
                  variants={{ rest: { x: 0 }, hover: { x: 4 } }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <ArrowRight size={18} strokeWidth={1.75} />
                </motion.span>
              </Link>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
