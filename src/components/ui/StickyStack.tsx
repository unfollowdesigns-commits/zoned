"use client";

import * as React from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

/**
 * A stack of cards that deal themselves as the page scrolls.
 *
 * Each card is `position: sticky` at the same offset, so as you scroll, card 2
 * rises and comes to rest on top of card 1, card 3 on top of card 2, and so on.
 * The cards underneath do not just sit there: each one scales down and takes a
 * scrim as the next lands on it, so the stack gains real depth instead of being
 * a pile of flat rectangles.
 *
 * Why sticky rather than a scroll-driven translate: sticky pinning is done by
 * the compositor from the scroll position itself, so it cannot desync, cannot
 * jitter, and costs nothing on the main thread. A JS scroll listener setting
 * `translateY` produces the same picture and lags behind the scroll by a frame,
 * which is exactly what makes a site feel heavy no matter how high the frame
 * rate is. The only thing driven from JS here is the scale and scrim of the
 * cards already parked, which is a transform and an opacity on a composited
 * layer.
 *
 * TWO THINGS THIS DEPENDS ON, both easy to break:
 *
 *   1. `overflow-x: clip` on html and body, never `hidden`. `hidden` on an
 *      ancestor silently turns every descendant `position: sticky` into
 *      `position: relative` and the whole effect vanishes with no error. The
 *      tokens file sets `clip` for this reason.
 *   2. No ancestor between the scroller and the cards may have `overflow`
 *      or `transform` set, for the same reason.
 *
 * The cards keep their natural document height, so nothing is pinned by
 * hard-coding viewport units and the section is as tall as its content needs.
 */

function Card({
  children,
  index,
  count,
  progress,
  reduced,
}: {
  children: React.ReactNode;
  index: number;
  count: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  // How far through the section this card gets covered by the next one.
  const start = index / count;
  const end = (index + 1) / count;

  // Parked cards shrink and darken. The last card never gets covered, so it is
  // excluded: scaling the final card down would leave the section ending on
  // something visibly smaller than everything before it.
  const isLast = index === count - 1;

  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.93]);

  /**
   * A parked card recedes by getting darker, NOT by getting transparent.
   *
   * The first version faded parked cards to 45% opacity, and it was unreadable:
   * the cards are the same size and pin within a few pixels of each other, so a
   * translucent one lets the card beneath show straight through it and three
   * headings render on top of each other as grey soup. The stack has to be a
   * stack of solid objects. A scrim laid over the card keeps it opaque and
   * still pushes it back in space, which is what the eye actually reads as
   * depth.
   */
  const scrim = useTransform(progress, [start, end], [0, isLast ? 0 : 0.34]);

  return (
    <motion.div
      className="sticky"
      style={{
        // Each card rests low enough below the one before to leave a visible
        // sliver of it. Too small a step and the stack looks like one card.
        top: `calc(7rem + ${index * 26}px)`,
        zIndex: index + 1,
        ...(reduced ? {} : { scale }),
        // The card must own a paint layer or the scale re-rasterises its text
        // on every frame, which is the usual cause of a stack like this looking
        // soft while it moves.
        willChange: reduced ? undefined : "transform",
        transformOrigin: "50% 0%",
      }}
    >
      <div className="relative">
        {children}
        {!reduced && !isLast && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[var(--radius)] bg-[#0a0d1c]"
            style={{ opacity: scrim }}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function StickyStack({
  children,
  className = "",
  gap = "3.5rem",
}: {
  children: React.ReactNode;
  className?: string;
  /** Vertical travel between cards. Larger means a slower, longer deal. */
  gap?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 25%", "end 85%"],
  });

  const items = React.Children.toArray(children);

  return (
    <div ref={ref} className={`flex flex-col ${className}`} style={{ gap }}>
      {items.map((child, i) => (
        <Card
          key={i}
          index={i}
          count={items.length}
          progress={scrollYProgress}
          reduced={reduced}
        >
          {child}
        </Card>
      ))}
    </div>
  );
}
