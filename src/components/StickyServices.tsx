"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SPRING_SOFT, useReducedMotion } from "@/lib/motion";
import { SERVICES } from "@/lib/site";
import LightBand from "@/components/ui/LightBand";
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
 * The services, as a stack that deals itself.
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
    <LightBand>
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-24 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
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
                  className="v-spotlight group relative overflow-hidden rounded-[var(--radius)] border border-[var(--v-border)] p-8 shadow-[0_2px_4px_-2px_rgba(18,21,31,0.08),0_24px_48px_-28px_rgba(18,21,31,0.28)] transition-colors duration-300 hover:border-[var(--v-primary)]/45 sm:p-10 bg-[linear-gradient(150deg,#ffffff_0%,#ffffff_52%,color-mix(in_srgb,var(--v-primary)_9%,#ffffff)_100%)]"
                  onPointerMove={(e) => {
                    const el = e.currentTarget;
                    const r = el.getBoundingClientRect();
                    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
                    el.style.setProperty("--my", `${e.clientY - r.top}px`);
                  }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <p className="text-[length:var(--t-small)] font-semibold tabular-nums text-[var(--v-primary-deep)]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none h-14 w-28 shrink-0 [color:var(--v-ink)]"
                    >
                      <Glyph />
                    </div>
                  </div>

                  <h3 className="v-display mt-8 max-w-[14ch] text-[length:var(--t-title)] leading-[1.1]">
                    {service.label}
                  </h3>

                  <Link
                    href={service.href}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--v-border)] py-2.5 pl-5 pr-4 text-[length:var(--t-small)] font-medium transition-colors duration-200 hover:border-[var(--v-primary)] hover:text-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
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
    </LightBand>
  );
}
