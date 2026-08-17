"use client";

import Link from "@/components/SiteLink";
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, useReducedMotion, staggerDelay } from "@/lib/motion";
import { STATS } from "@/lib/site";

/**
 * The hero, rebuilt by subtraction.
 *
 * WHAT WAS HERE BEFORE, AND WHY IT IS GONE: a canvas particle field, two radial
 * blooms, a glass panel, two filled pill buttons, a line of microcopy and a
 * client strip. Nine or ten separate effects in one viewport. The reference
 * this is measured against has a photograph, an eyebrow, a heading, one
 * paragraph, one text link and three figures, and it looks better. It looks
 * better BECAUSE of that, not despite it.
 *
 * The mistake was systematic: with no photography available, effects kept
 * getting added to fill the hole, and effects cannot do that job. They read as
 * decoration precisely because there is nothing underneath them. The correct
 * response to having no image is to leave the space and go and get one.
 *
 * The rules this section now follows, each read off the reference:
 *
 *   TWO COLOURS. Ink and one accent. No gradient on the type, none on the
 *   control, no accent rim on an accent panel over an accent radial.
 *
 *   TWO TYPE SIZES in the viewport, plus the eyebrow and the figures. Every
 *   additional size is one more thing competing to be read first.
 *
 *   THE GROUND IS NOT BLACK. A warm near-black with a slow vertical fall-off.
 *   Pure black carrying coloured radials is the palette that reads as a dark
 *   template no matter what sits on top of it.
 *
 *   THE HEADING STARTS A THIRD OF THE WAY DOWN. The space above it is doing
 *   work. Filling it is what makes a page feel cheap.
 *
 *   ONE CALL TO ACTION, and it is a text link. Two filled pills is a section
 *   that has not decided what it wants and is asking the visitor to.
 *
 * THE IMAGE SLOT IS DELIBERATELY EMPTY UNTIL A REAL PHOTOGRAPH EXISTS. Drop a
 * file at public/hero.jpg and it fills, already treated: desaturated, tinted to
 * the brand hue, bled off the right edge and masked so it dissolves into the
 * ground rather than ending on a hard edge. Until then the space stays open,
 * which is honest, and still better than filling it with a widget.
 */

const HERO_IMAGE = "/hero.jpg";

export default function Hero() {
  const reduced = useReducedMotion();

  /* The treatment only mounts once the photograph actually loads.
     Rendering the layers unconditionally meant the colour-blend layer painted
     against bare ground and left a hard vertical seam at its own edge, which is
     a worse artefact than the empty space it was covering. Probing the file
     costs one request that the browser caches for the real element anyway, and
     it means this section degrades to clean empty ground with no seam at all
     until a real image exists. */
  const [hasPhoto, setHasPhoto] = React.useState(false);
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => setHasPhoto(true);
    img.src = HERO_IMAGE;
  }, []);

  const rise = (i: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay: staggerDelay(i) },
  });

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#22242a_0%,#181a20_46%,#0e1016_100%)]">
      {hasPhoto && (
        <>
          {/* The photograph. Treated in CSS so a raw file dropped in still
              lands correctly: desaturated, bled off the right edge, and masked
              to nothing on the left so it never ends on a visible boundary. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] lg:block"
            style={{
              backgroundImage: `url(${HERO_IMAGE})`,
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              filter: "grayscale(1) contrast(1.05) brightness(0.7)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 44%)",
              maskImage: "linear-gradient(90deg, transparent 0%, #000 44%)",
            }}
          />
          {/* The tint is its own layer so the photograph underneath can be
              swapped without re-grading it, and it carries the SAME mask: an
              unmasked blend layer ends on a hard edge of its own. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] mix-blend-color lg:block"
            style={{
              background: "var(--v-primary)",
              opacity: 0.3,
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 44%)",
              maskImage: "linear-gradient(90deg, transparent 0%, #000 44%)",
            }}
          />
        </>
      )}

      <div className="relative mx-auto max-w-[1280px] px-6 pb-14 pt-40 lg:pb-16 lg:pt-56">
        <motion.p {...rise(0)} className="v-eyebrow text-[var(--v-muted)]">
          Talent Infrastructure
        </motion.p>

        <motion.h1
          {...rise(1)}
          className="v-display mt-8 max-w-[13ch] text-balance"
          style={{
            fontSize: "var(--t-hero)",
            lineHeight: "var(--lh-hero)",
            letterSpacing: "var(--tr-hero)",
          }}
        >
          Our talent is finding <span className="text-[var(--v-primary)]">yours.</span>
        </motion.h1>

        <motion.p
          {...rise(2)}
          className="mt-9 max-w-[46ch] text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]"
        >
          When the talent decisions are as consequential as the capital decisions, you
          need more than a search firm. We design talent strategy from the boardroom
          down, and execute from day one.
        </motion.p>

        {/* One action, and it is a link rather than a button. */}
        <motion.div {...rise(3)} className="mt-12">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 text-[length:var(--t-action)] font-semibold text-[var(--v-primary)] transition-colors duration-200 hover:text-[var(--v-ring)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--v-ring)]"
          >
            Start a conversation
            <ArrowRight
              size={17}
              strokeWidth={2.2}
              aria-hidden="true"
              className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>

      {/* Three figures, unboxed. No cards, no rules, no borders: the numbers are
          large enough to be the object themselves, and a box around each would
          say they are three unrelated facts. Three rather than four, because the
          fourth was there to complete a grid, and a grid is not a reason. */}
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 pb-20 sm:grid-cols-3 lg:pb-28">
        {STATS.slice(0, 3).map((stat, i) => (
          <motion.div key={stat.label} {...rise(4 + i)}>
            <p className="v-display flex items-start leading-[0.9]">
              <span className="text-[length:var(--t-display)] font-bold tracking-[-0.04em]">
                {stat.prefix}
                {stat.value.toLocaleString()}
              </span>
              {stat.unit && (
                <span className="mt-[0.15em] text-[length:var(--t-heading)] font-bold text-[var(--v-primary)]">
                  {stat.unit}
                </span>
              )}
            </p>
            <p className="mt-4 max-w-[28ch] text-[length:var(--t-secondary)] leading-[1.55] text-[var(--v-muted)]">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
