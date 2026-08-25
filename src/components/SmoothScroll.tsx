"use client";

import * as React from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/motion";

/**
 * Interpolated scrolling.
 *
 * THIS IS THE ANSWER TO "WHY DO THEIR PAGES MOVE SMOOTHLY". It is not easing on
 * the sections and it is not the animations: the reference sites interpolate the
 * scroll position itself. A native wheel event jumps the page some number of
 * pixels instantly, so every scroll is a series of small teleports and the eye
 * reads it as steps. Lenis takes the wheel delta as a TARGET and walks the real
 * scroll position toward it a fraction per frame, so the same gesture arrives as
 * a glide. Everything already on the page inherits it, because every scrubbed
 * animation on this site is a function of scroll position rather than of time.
 *
 * WHY IT IS DECLINED ON TOUCH. Phones already have momentum scrolling, tuned by
 * the platform and matched to the physics of a finger leaving glass. Replacing
 * it with a JavaScript approximation is the version of this that gets described
 * as "laggy", because the input is direct manipulation: the content must stay
 * under the thumb. Lenis is a wheel-and-keyboard improvement, so it is applied
 * to wheel-and-keyboard machines.
 *
 * WHY IT DOES NOT BREAK THE PINNED HERO. Lenis moves the real window scroll
 * position rather than transforming a wrapper element, so `position: sticky`
 * still pins against the viewport and framer's `useScroll` still reads a true
 * value. The transform-a-wrapper approach, which older smooth-scroll libraries
 * used, silently kills every sticky element on the page, and this site is built
 * on one.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced) return;
    /* Coarse pointer means touch. See the note above. */
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      /* Fraction of the remaining distance covered per frame. Lower is slower
         and heavier. 0.085 is deliberately on the slow side: the brief was
         "smooth and soothing on the eyes", and the usual default of 0.1 to 0.15
         reads as brisk rather than as weight. */
      lerp: 0.085,
      wheelMultiplier: 0.9,
      /* Anchor clicks glide instead of jumping, for free. */
      autoRaf: false,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
