"use client";

import { MotionConfig } from "framer-motion";

/**
 * Framer defaults to reducedMotion: "never", which means the CSS
 * prefers-reduced-motion backstop in globals.css never reaches JS-driven
 * animation. "user" defers to the OS setting: transform and layout animations
 * are skipped to their target, opacity still animates, so nothing is left
 * stranded at its initial (invisible) state.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
