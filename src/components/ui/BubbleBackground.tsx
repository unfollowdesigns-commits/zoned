"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, type SpringOptions } from "framer-motion";
import { SPRING_SOFT, useReducedMotion } from "@/lib/motion";

/**
 * Gradient bubbles drifting behind the whole site.
 *
 * IT REPLACES THE AURORA RATHER THAN JOINING IT. The atmosphere already carried
 * `.v-aurora`: four blurred radial gradients on a slow transform loop, which is
 * the same idea with fewer moving parts. Running both would mean two
 * full-viewport blurred colour fields compositing every frame for a result that
 * is muddier than either, because two overlapping soft washes average toward
 * flat. One ambient layer.
 *
 * THE PALETTE IS ONE HUE FAMILY, NOT THE REFERENCE'S SIX. The component ships
 * with blue, magenta, cyan, red, yellow and violet, which is the right choice
 * for the playful demo it was written for and the wrong one here: six competing
 * hues behind an executive search firm's copy reads as a screensaver, and it
 * would fight the wave field in every hero. These six are royal, deep royal,
 * the cyan that matches the wave's crests, deep navy, near-black navy and a
 * pale highlight. That is a range of DEPTH within one hue, which is what reads
 * as a lit volume rather than as coloured lamps, and it is the same principle
 * the rest of the atmosphere was moved to.
 *
 * SCREEN, NOT HARD-LIGHT, AND THAT IS A CORRECTNESS FIX ON THIS GROUND. The
 * reference blends `hard-light`, which multiplies wherever the source is darker
 * than mid grey and screens where it is lighter. Against its own mid-tone
 * backdrop that gives the bubbles their bite. Against this site's near-black
 * ground it would multiply half the palette straight to nothing: the deep navy
 * and near-black bubbles, which are three of the six, would simply not exist.
 * `screen` always lightens, so every bubble contributes on a dark page.
 *
 * Interactivity is off. The background is not the thing to look at, and the
 * pointer already has nothing to do here by request.
 */

export type BubbleColors = {
  first: string;
  second: string;
  third: string;
  fourth: string;
  fifth: string;
  sixth: string;
};

/** Comma-separated RGB triples, so the CSS can vary alpha per stop. */
const DP_COLORS: BubbleColors = {
  first: "62,123,250",
  second: "47,95,214",
  third: "56,158,224",
  fourth: "29,61,138",
  fifth: "16,34,88",
  sixth: "143,176,255",
};

export default function BubbleBackground({
  interactive = false,
  transition = SPRING_SOFT,
  colors = DP_COLORS,
  className = "",
  ...props
}: React.ComponentProps<"div"> & {
  /** Follow the pointer with a sixth bubble. */
  interactive?: boolean;
  transition?: SpringOptions;
  colors?: BubbleColors;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* Hooks run whether or not the pointer bubble is rendered: a hook behind a
     condition is the classic way this component would break the first time
     someone toggled the prop at runtime. */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, transition);
  const sy = useSpring(y, transition);

  React.useEffect(() => {
    if (!interactive || reduced) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left - r.width / 2);
      y.set(e.clientY - r.top - r.height / 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, reduced, x, y]);

  return (
    <div ref={ref} aria-hidden="true" className={`dp-bubbles ${className}`} {...props}>
      {/* The metaball filter. Blur, then push the alpha channel through a steep
          contrast so touching blurs fuse into one shape with a hard edge rather
          than overlapping as two soft discs. That fusing is the whole look; a
          plain blur gives clouds, not bubbles. */}
      <svg className="dp-bubbles-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="dp-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="dp-bubbles-goo">
        <div className="dp-bubble dp-bubble-1" style={{ ["--c" as string]: colors.first }} />
        <div className="dp-bubble dp-bubble-2" style={{ ["--c" as string]: colors.second }} />
        <div className="dp-bubble dp-bubble-3" style={{ ["--c" as string]: colors.third }} />
        <div className="dp-bubble dp-bubble-4" style={{ ["--c" as string]: colors.fourth }} />
        <div className="dp-bubble dp-bubble-5" style={{ ["--c" as string]: colors.fifth }} />
        {interactive && !reduced && (
          <motion.div
            className="dp-bubble dp-bubble-i"
            style={{ ["--c" as string]: colors.sixth, x: sx, y: sy }}
          />
        )}
      </div>
    </div>
  );
}
