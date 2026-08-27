"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SPRING_SOFT, useReducedMotion } from "@/lib/motion";
import { SERVICES } from "@/lib/site";
import SectionHeading from "@/components/ui/SectionHeading";
import StickyStack from "@/components/ui/StickyStack";
import PointerLight from "@/components/ui/PointerLight";
import ServicePlate from "@/components/ui/ServicePlate";

/* THE FIVE BESPOKE GLYPHS ARE GONE, and what replaced them is the icon the
   service already carries in lib/site.ts.

   They were drawn as little scenes: a reticle closing on a candidate, a
   skeleton of rows, a segmented bar. Each mixed the accent blue with
   `currentColor` at 12 to 28 percent alpha, and on a dark card that alpha
   renders as pale grey. The result was not a diagram, it was a row of white
   blobs in the corner: card one read as a loading spinner and card two as a
   skeleton screen that had failed to load. A mark nobody can identify is worse
   than no mark, because the reader spends attention deciding it means nothing.

   They also carried real rot: a hardcoded `rgba(6,8,20,0.9)` that only worked
   on one ground, and a `<text>` element at `fontSize={0}`.

   One icon, one colour, in the same tinted well used by the specializations
   tiles, is quieter and says more. It is also the same drawing the visitor has
   already seen against this service in the navigation. */

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
              return (
                <motion.article
                  key={service.href}
                  initial="rest"
                  animate="rest"
                  whileHover={reduced ? undefined : "hover"}
                  whileFocus={reduced ? undefined : "hover"}
                  /* `v-spotlight` is gone with the inline handler: its
                     ::before is the same pseudo-element as the glass rim, so it
                     never drew anything. PointerLight below replaces both, and
                     carries its own listener. */
                  /* Arms the icon redraw. See ui/DrawIcon: the 19px mark is not
                     what anyone is pointing at, so the card is what triggers it. */
                  className="dp-svc v-lift group relative overflow-hidden p-8 sm:p-10"
                >
                  <PointerLight size={300} />
                  {/* Two columns, and the second one is the reason the card is
                      this size. It used to hold nothing: an index, a title and
                      a pill in a 940 by 420 box, with four fifths of it empty
                      and a 44 pixel icon chip in the corner, which is the most
                      recognisable move in generated software marketing. The
                      figure is the card's subject now. See ui/ServicePlate. */}
                  <div className="relative z-[2] grid items-center gap-8 sm:grid-cols-[1fr_minmax(0,270px)] sm:gap-10">
                    <div className="min-w-0">
                      <p className="dp-svc-index tabular-nums">{String(i + 1).padStart(2, "0")}</p>

                      <h3 className="v-display mt-5 max-w-[15ch] text-[length:var(--t-title)] leading-[1.08]">
                        {service.label}
                      </h3>

                      {/* The line that says what the service IS, which the
                          navigation has carried all along and the card did
                          not. Nothing here is copy written to fill a shape. */}
                      {service.note && (
                        <p className="mt-4 max-w-[34ch] text-[length:var(--t-secondary)] leading-[1.6] text-[var(--v-muted)]">
                          {service.note}
                        </p>
                      )}

                      <Link
                        href={service.href}
                        className="group/cta mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--v-border-strong)] py-2.5 pl-5 pr-4 text-[length:var(--t-small)] font-medium text-[var(--v-ink)] transition-colors duration-200 hover:border-[var(--v-primary)] hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                      >
                        <span className="sr-only">{service.label}: </span>
                        Explore
                        <ArrowRight
                          size={15}
                          strokeWidth={2}
                          className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-x-1"
                        />
                      </Link>
                    </div>

                    <ServicePlate
                      name={service.icon}
                      className="hidden justify-self-end sm:block"
                    />
                  </div>
                </motion.article>
              );
            })}
          </StickyStack>
        </div>
      </div>
    </section>
  );
}
