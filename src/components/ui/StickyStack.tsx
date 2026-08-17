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
  /* THE RECEDE TRACKS THE NEXT CARD'S ARRIVAL, NOT THIS CARD'S OWN SEGMENT.
  
     Each card used to darken across its whole slice, [i/n, (i+1)/n], which
     starts the moment that card lands. Card one therefore began fading on the
     very first pixel of scroll, with nothing on top of it yet, and by the time
     card three arrived the two beneath were already black. A card should only
     recede while something is actually coming over it.
  
     So the window is the back half of the slice: card i holds at full strength
     until card i+1 is genuinely on its way, then darkens as it lands. */
  const start = (index + 0.5) / count;
  const end = (index + 1) / count;

  // Parked cards shrink and darken. The last card never gets covered, so it is
  // excluded: scaling the final card down would leave the section ending on
  // something visibly smaller than everything before it.
  const isLast = index === count - 1;

  /* The travel is deliberately large. Earlier passes shrank a parked card by
     6 percent, which is below the threshold at which a person registers that
     anything happened at all: the pin was real, the maths was right, and it
     read as a static two-column layout. An effect nobody notices is the same
     as no effect. 14 percent, plus a lift and a backward tilt, is unmistakable
     without tipping into novelty.
     
     All of it runs on the cover window above, so a card holds its full size and
     brightness until the next one is arriving over it, then recedes as that one
     lands. Scaling on its own segment meant every card was already shrinking
     while it was still the front of the stack. */
  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.86]);
  /* Parked cards lift as they recede, so the stack fans upward and each card
     underneath keeps a visible edge instead of hiding behind the one above. */
  const y = useTransform(progress, [start, end], [0, isLast ? 0 : -34]);
  /* A few degrees of backward tilt. This is what makes the stack read as
     receding in space rather than merely getting smaller. */
  const rotateX = useTransform(progress, [start, end], [0, isLast ? 0 : 7]);

  /**
   * A parked card recedes behind a near-opaque scrim, and it has to be near
   * opaque rather than a light tint. Two versions of this were wrong for the
   * same underlying reason.
   *
   * First the parked cards were faded to 45% opacity. The cards pin within a
   * few pixels of each other, so a translucent one lets the card beneath show
   * straight through and three headings render on top of each other as grey
   * soup. Then the cards became glass, which is translucent BY CONSTRUCTION,
   * and a light scrim brought the same soup straight back: card 2 was showing
   * card 1's heading through its own backdrop.
   *
   * So the scrim goes almost solid. Only the front card reads as lit glass;
   * everything parked behind it becomes a dark plate. That is also what makes
   * the front card convincing, because glass needs something solid behind it
   * to refract, and a stack of glass on glass has nothing.
   */
  const scrim = useTransform(progress, [start, end], [0, isLast ? 0 : 0.88]);

  return (
    <motion.div
      className="sticky"
      style={{
        // Each card rests low enough below the one before to leave a visible
        // sliver of it. Too small a step and the stack looks like one card.
        top: `calc(7rem + ${index * 18}px)`,
        zIndex: index + 1,
        ...(reduced ? {} : { scale, y, rotateX }),
        // The tilt needs a perspective to be a tilt rather than a squash.
        transformPerspective: 1400,
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
  gap = "11rem",
}: {
  children: React.ReactNode;
  className?: string;
  /** Vertical travel between cards. Larger means a slower, longer deal. */
  gap?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* The longest range the track can give: progress 0 when its top reaches the
     viewport top, 1 when its bottom reaches the bottom. The previous window was
     short enough that 900px of scroll consumed 80 percent of it, so four cards
     receded inside one flick and the stack looked like it had skipped. Paired
     with a much larger gap between cards, which is what actually buys the
     scroll distance: the track is only as tall as its content, so the gap is
     the only lever on how long each card gets. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
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
