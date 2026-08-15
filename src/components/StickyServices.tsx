"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SPRING_SOFT, useReducedMotion } from "@/lib/motion";
import { SERVICES } from "@/lib/site";
import LightBand from "@/components/ui/LightBand";
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
 * The services, as a sticky rail rather than a grid.
 *
 * The heading and progress pin while the five panels pass them, so the section
 * reads as one continuous move through the offer instead of five boxes seen at
 * once. Pinning is CSS `position: sticky`, not a scroll listener, so it stays
 * on the compositor and cannot desync from the scroll position.
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
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-24 sm:py-32 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* pinned rail */}
        <div className="v-sticky-rail">
          <p className="v-eyebrow mb-4">What We Do</p>
          <h2
            className="v-display text-balance"
            style={{
              fontSize: "var(--t-display-fluid)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Search and interim solutions, under one partner.
          </h2>
          <p className="mt-6 max-w-[42ch] text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
            Five ways we work, depending on whether the need is permanent, urgent,
            partial, or bounded by a project.
          </p>

          <div className="mt-10 flex items-center gap-4">
            {/* progress rail: fills as the panels pass */}
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

        {/* the panels that pass it */}
        <div ref={trackRef} className="flex flex-col gap-5">
          {SERVICES.map((service, i) => {
            const Glyph = GLYPHS[i];
            return (
              <article
                key={service.href}
                // CSS scroll timeline, not whileInView. An observer attached
                // after hydration never fires for an element already scrolled
                // past, which strands the panel at opacity 0 permanently. The
                // reveal's base style is the visible one, so it cannot.
                style={{ "--reveal-i": Math.min(i, 4) } as React.CSSProperties}
                className="v-reveal v-spotlight group relative overflow-hidden rounded-[var(--radius)] border border-[var(--v-border)] bg-white p-7 transition-colors duration-300 hover:border-[var(--v-primary)]/45 sm:p-8"
                onPointerMove={(e) => {
                  const el = e.currentTarget;
                  const r = el.getBoundingClientRect();
                  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  el.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="mb-3 text-[length:var(--t-small)] font-semibold tabular-nums text-[var(--v-muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="v-display text-[length:var(--t-heading)] leading-[1.25] sm:text-[length:var(--t-heading)]">
                      {service.label}
                    </h3>
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none h-14 w-28 shrink-0 opacity-70 [color:var(--v-primary-deep)]"
                  >
                    <Glyph />
                  </div>
                </div>

                <Link
                  href={service.href}
                  className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--v-border)] py-2 pl-4 pr-3 text-[length:var(--t-small)] font-medium transition-colors duration-200 hover:border-[var(--v-primary)] hover:text-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                >
                  <span className="sr-only">{service.label}: </span>
                  Explore
                  <ArrowRight
                    size={15}
                    strokeWidth={2}
                    className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                  />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </LightBand>
  );
}
