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
}: {
  children: React.ReactNode;
  /** Stagger hint in seconds, clamped by the shared cap. */
  delay?: number;
  className?: string;
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
