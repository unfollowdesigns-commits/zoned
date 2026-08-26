"use client";

import * as React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { SPRING_VELOCITY, useReducedMotion } from "@/lib/motion";

/**
 * A belt that runs continuously and answers the scroll.
 *
 * Extracted from PlacedPositions when the client stripe needed the same
 * physics: one belt implementation, or the two would drift apart in feel and
 * the page would carry two marquees that almost match, which is worse than
 * either alone.
 *
 * THE SPEED IS COUPLED TO SCROLL VELOCITY, and that is what separates this
 * from the marquee on every template. A constant-speed banner is wallpaper: it
 * moves whether or not anyone is there, so the eye files it as decoration
 * within a second. The rails have a slow base drift, and scrolling drives them
 * faster; scrolling UP reverses them, which is the detail that makes it read
 * as a physical belt being driven rather than a loop being played.
 *
 * The loop is seamless because the content is rendered four times and the
 * offset wraps at 25 percent; there is no reset frame to catch.
 */

/** Keeps a value inside a range, so the rail can loop without a jump. */
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

export default function Rail({
  direction,
  baseSpeed,
  children,
}: {
  /** 1 runs left to right, -1 right to left. */
  direction: 1 | -1;
  baseSpeed: number;
  children: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  /* Softened, or every wheel tick jolts the rail. The spring is on the INPUT
     here, not on the position, which is the difference between a belt with
     inertia and a rubber band. */
  const smooth = useSpring(scrollVelocity, SPRING_VELOCITY);
  /* Clamped: a trackpad flick can produce velocities that would otherwise blur
     the type into an unreadable smear. Held to 2.5 rather than 4, because the
     coupling should be felt as the rail responding, not seen as it lurching:
     past about this much the row stops being readable during a fast scroll and
     the effect reads as a glitch. */
  const factor = useTransform(smooth, [-2200, 0, 2200], [-2.5, 0, 2.5], {
    clamp: true,
  });

  const previous = React.useRef(0);
  const reduced = useReducedMotion();

  useAnimationFrame((t) => {
    /* BELT AND BRACES. Both callers already render a static list when the
       preference is set, so this frame loop should never be reachable. It is
       checked here anyway because a perpetually moving band of text is one of
       the specific things the preference exists to stop, and a future caller
       that forgets would ship exactly that with nothing to catch it. */
    if (reduced) return;
    const dt = previous.current ? (t - previous.current) / 1000 : 0;
    previous.current = t;

    /* Base drift plus whatever the scroll is contributing. Direction flips with
       the sign of the velocity, so scrolling back up runs the rail backwards. */
    const v = factor.get();
    const moved = direction * baseSpeed * dt + direction * baseSpeed * v * dt;
    x.set(wrap(-25, 0, x.get() + moved / 10));
  });

  const percent = useTransform(x, (v) => `${v}%`);

  return (
    <div
      className="flex overflow-hidden"
      /* THE RAILS DISSOLVE AT THE EDGES INSTEAD OF BEING CUT.

         Without this the viewport edge guillotines whatever word happens to be
         crossing it, so the row begins and ends on half a letter. The mask
         means type arrives and leaves rather than starting and stopping, and
         it costs one composited layer. 12 percent is enough to fade a whole
         word at this size. */
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
      }}
    >
      <motion.div
        className="flex shrink-0 whitespace-nowrap"
        style={{ x: percent }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
