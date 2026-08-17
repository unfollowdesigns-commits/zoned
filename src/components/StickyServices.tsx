"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SPRING_SOFT, useReducedMotion } from "@/lib/motion";
import { SERVICES } from "@/lib/site";
import SectionHeading from "@/components/ui/SectionHeading";
import StickyStack from "@/components/ui/StickyStack";
import {
  ExecutiveSearchGlyph,
  ProfessionalSearchGlyph,
  InterimGlyph,
  FractionalGlyph,
  ProjectSupportGlyph,
} from "./ServiceGlyphs";

const GLYPHS = [
  ExecutiveSearchGlyph,
  ProfessionalSearchGlyph,
  InterimGlyph,
  FractionalGlyph,
  ProjectSupportGlyph,
];

/**
 * The services, as a stack of glass that deals itself.
 *
 * The band is dark, and that is a requirement rather than a preference. These
 * cards are glass, and glass needs something to refract: a translucent panel on
 * a cream ground has nothing behind it to blur, no contrast for its lit rim to
 * register against, and no way for its shadow to read. The paper version of
 * this section looked flat because a pale card on a pale ground IS flat, and no
 * amount of tuning the fill fixes it.
 *
 * The previous version pinned only the heading and let five cards scroll past
 * it, which is the weakest form of a sticky section: the pin is real but
 * nothing happens, so it reads as a two-column layout that happens not to move.
 * Here both halves are pinned. The heading holds while the cards arrive one at
 * a time and come to rest on each other, each parked card shrinking and dimming
 * under the weight of the next, so the section has actual depth and scrolling
 * through it is the thing that reveals the offer.
 *
 * The cards are deliberately tall and the type inside them large. A stack only
 * works if each card is worth stopping on; a stack of small cards is a list
 * with extra steps.
 */
export default function StickyServices() {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 60%", "end 85%"],
  });
  // Softened so the bar settles rather than tracking every wheel tick exactly.
  const progress = useSpring(scrollYProgress, SPRING_SOFT);
  const scaleY = useTransform(progress, (v) => (reduced ? 1 : v));

  return (
    <section className="v-dark-band">
      <div className="relative z-[1] mx-auto grid max-w-[1280px] gap-14 px-6 py-24 sm:py-32 lg:grid-cols-[0.78fr_1.22fr] lg:gap-28 xl:gap-32">
        {/* pinned rail */}
        <div className="v-sticky-rail">
          <SectionHeading
            eyebrow="What We Do"
            title="Search and interim,"
            turn="under one partner."
            lede="Five ways we work, depending on whether the need is permanent, urgent, partial, or bounded by a project."
          />

          <div className="mt-10 flex items-center gap-4">
            {/* progress rail: fills as the cards land */}
            <div
              aria-hidden="true"
              className="relative h-24 w-0.5 overflow-hidden rounded-full bg-[var(--v-border)]"
            >
              <motion.div
                className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-[var(--v-primary)]"
                style={{ scaleY }}
              />
            </div>
            <Link
              href="/what-we-do"
              className="group inline-flex items-center gap-2 text-[length:var(--t-secondary)] font-semibold text-[var(--v-ink)] transition-colors hover:text-[var(--v-primary-deep)]"
            >
              All services
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* the stack that deals against it */}
        <div ref={trackRef}>
          <StickyStack>
            {SERVICES.map((service, i) => {
              const Glyph = GLYPHS[i];
              return (
                <motion.article
                  key={service.href}
                  initial="rest"
                  animate="rest"
                  whileHover={reduced ? undefined : "hover"}
                  whileFocus={reduced ? undefined : "hover"}
                  className="v-glass v-lift v-spotlight group relative overflow-hidden p-8 sm:p-10"
                  onPointerMove={(e) => {
                    const el = e.currentTarget;
                    const r = el.getBoundingClientRect();
                    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
                    el.style.setProperty("--my", `${e.clientY - r.top}px`);
                  }}
                >
                  <div className="relative z-[2] flex items-start justify-between gap-6">
                    <p className="text-[length:var(--t-small)] font-semibold tabular-nums text-[var(--v-ring)]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none h-14 w-28 shrink-0 [color:var(--v-ring)]"
                    >
                      <Glyph />
                    </div>
                  </div>

                  <h3 className="v-display relative z-[2] mt-8 max-w-[14ch] text-[length:var(--t-title)] leading-[1.1]">
                    {service.label}
                  </h3>

                  <Link
                    href={service.href}
                    className="relative z-[2] mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--v-border-strong)] py-2.5 pl-5 pr-4 text-[length:var(--t-small)] font-medium text-[var(--v-ink)] transition-colors duration-200 hover:border-[var(--v-primary)] hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                  >
                    <span className="sr-only">{service.label}: </span>
                    Explore
                    <ArrowRight
                      size={15}
                      strokeWidth={2}
                      className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    />
                  </Link>
                </motion.article>
              );
            })}
          </StickyStack>
        </div>
      </div>
    </section>
  );
}
