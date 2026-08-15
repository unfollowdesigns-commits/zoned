"use client";

/**
 * Re-export of the kit's motion constants and reduced-motion hook.
 *
 * The kit is the source of physics. This file exists so that existing
 * `@/lib/motion` imports across src keep resolving, and so there is exactly
 * one place the constants come from.
 */

export {
  SPRING,
  SPRING_SOFT,
  SPRING_ICON,
  SPRING_TILT,
  SPRING_MAGNET,
  SPRING_PROGRESS,
  SPRING_TRACK,
  EASE,
  EXIT,
  STAGGER_STEP,
  STAGGER_CAP,
  staggerDelay,
  ITEM,
  CONTAINER,
} from "@/kit/lib/motion";

export { useReducedMotion } from "@/kit/lib/use-reduced-motion";
