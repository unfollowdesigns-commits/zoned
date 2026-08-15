"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, useReducedMotion } from "@/lib/motion";
import Reveal from "@/components/Reveal";
import {
  ExecutiveSearchGlyph,
  ProfessionalSearchGlyph,
  InterimGlyph,
  FractionalGlyph,
  ProjectSupportGlyph,
} from "./ServiceGlyphs";

type Service = {
  title: string;
  href: string;
  span: string;
  glyph: React.ComponentType;
};

const SERVICES: Service[] = [
  {
    title: "Executive Search",
    href: "/what-we-do/executive-search",
    span: "md:col-span-3 md:row-span-2",
    glyph: ExecutiveSearchGlyph,
  },
  {
    title: "Professional Search",
    href: "/what-we-do/professional-search",
    span: "md:col-span-3",
    glyph: ProfessionalSearchGlyph,
  },
  {
    title: "Interim Leadership",
    href: "/what-we-do/interim-solutions",
    span: "md:col-span-3",
    glyph: InterimGlyph,
  },
  {
    title: "Fractional",
    href: "/what-we-do/fractional",
    span: "md:col-span-2",
    glyph: FractionalGlyph,
  },
  {
    title: "Project Support & Expertise",
    href: "/what-we-do/project-support",
    span: "md:col-span-4",
    glyph: ProjectSupportGlyph,
  },
];

function Tile({ service, index }: { service: Service; index: number }) {
  const Glyph = service.glyph;
  const ref = React.useRef<HTMLDivElement>(null);
  // The glyphs animate SVG attributes (r, width, pathLength), which are not
  // transforms, so MotionConfig reducedMotion="user" does not skip them.
  // Withhold the hover variant entirely instead.
  const reduced = useReducedMotion();

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      data-testid="service-tile"
      onPointerMove={onPointerMove}
      initial="rest"
      animate="rest"
      whileHover={reduced ? undefined : "hover"}
      whileFocus={reduced ? undefined : "hover"}
      whileTap={reduced ? undefined : "hover"}
      className={`v-spotlight g-glass group relative flex min-h-[168px] flex-col justify-between overflow-hidden p-6 ${service.span}`}
      variants={{ rest: {}, hover: {} }}
    >
      <div
        className="v-reveal flex h-full flex-col justify-between"
        style={{ "--reveal-i": Math.min(index, 4) } as React.CSSProperties}
      >
        <h3 className="v-display max-w-[14ch] text-[21px] leading-[1.25]">{service.title}</h3>

        <div className="pointer-events-none flex flex-1 items-center justify-center py-6">
          <div className="h-[96px] w-full max-w-[300px]">
            <Glyph />
          </div>
        </div>

        <Link
          href={service.href}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--v-border)] py-2 pl-4 pr-3 text-[13.5px] font-medium text-[var(--v-ink)] transition-colors duration-200 hover:border-[var(--v-primary)] hover:text-[var(--v-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
        >
          <span className="sr-only">{service.title}: </span>
          Explore
          <motion.span
            variants={{ rest: { x: 0 }, hover: { x: 3 } }}
            transition={{ duration: 0.22, ease: EASE }}
            className="inline-flex"
          >
            <ArrowRight size={15} strokeWidth={2} />
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}

export default function WhatWeDo() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24 sm:pb-28 sm:pt-24">
      <Reveal className="mb-10">
        <h2 className="v-display text-[clamp(1.75rem,4vw,2.25rem)] italic leading-[1.1] text-[var(--v-primary)]">
          What We Do:
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {SERVICES.map((service, i) => (
          <Tile key={service.title} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}
