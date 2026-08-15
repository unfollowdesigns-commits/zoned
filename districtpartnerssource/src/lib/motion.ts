"use client";

import * as React from "react";

// UI: snappy, for things that respond to a click or hover.
export const SPRING = { type: "spring" as const, stiffness: 350, damping: 25, mass: 1 };

// Softer, for larger objects and layout shifts.
export const SPRING_SOFT = { type: "spring" as const, stiffness: 210, damping: 26, mass: 0.8 };

// Where a duration is genuinely right (opacity, colour), use an asymmetric
// curve that decelerates hard. Never linear, never the default ease.
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const EXIT = { duration: 0.34, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Reduced-motion preference, read through useSyncExternalStore.
 *
 * The server snapshot is always false, so the server render and the first
 * client render agree. React then re-renders with the real value. Branching on
 * a value that differs between those two passes is what leaves elements
 * stranded at opacity 0 forever, because React keeps the server DOM and Framer
 * never takes ownership of the node.
 */
export function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
