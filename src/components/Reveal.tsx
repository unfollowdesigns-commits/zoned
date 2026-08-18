"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE, staggerDelay, useReducedMotion } from "@/lib/motion";
import { whenReached } from "@/lib/in-view";

/**
 * Scroll reveal.
 *
 * The "has this been reached" question is answered by lib/in-view, which is
 * level-triggered rather than edge-triggered. Read the comment in that file
 * before replacing it with an IntersectionObserver: the observer version of
 * this component shipped twice and stranded content invisible both times.
 */

export default function Reveal({
  children,
  delay = 0,
  className,
  fill = false,
}: {
  children: React.ReactNode;
  /** Stagger hint in seconds, clamped by the shared cap. */
  delay?: number;
  className?: string;
  /**
   * Pass the parent's height straight through to the child.
   *
   * WHY THIS IS A PROP AND NOT THE DEFAULT. Reveal puts TWO elements between a
   * caller and its content, the ref wrapper and the animated div, and a
   * `h-full` on a grid item dies at the second of them. That is a silent
   * failure with a visible symptom: a grid of equal-height cards comes out
   * ragged and nobody can see why from the caller's markup, which is exactly
   * what happened to the tech stack grid twice.
   *
   * It is opt-in because `height: 100%` only resolves to auto when the parent's
   * height is auto. Inside a container with a definite height, making every
   * Reveal stretch would quietly change layouts that are currently correct.
   */
  fill?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenReached(el, () => setShown(true));
  }, []);

  const index = Math.round(delay / 0.07);

  return (
    <div ref={ref} className={className}>
      <motion.div
        className={fill ? "h-full" : undefined}
        // `shown` starts false on server and client alike, so the two renders
        // agree. Branching on the motion preference to emit different markup is
        // what leaves elements invisible forever.
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={
          shown
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 20, filter: "blur(8px)" }
        }
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.55, ease: EASE, delay: staggerDelay(index) }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
