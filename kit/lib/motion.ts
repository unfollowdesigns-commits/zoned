/**
 * Motion constants.
 *
 * Import these. Do not write inline transition objects, and do not tune these
 * numbers per component: the reason a set of interfaces feels like one product
 * is that everything in it obeys the same physics.
 *
 * The rules these encode:
 *
 *   Nothing linear. Real objects have mass. `linear` is correct for a rotating
 *   ambient layer and wrong for anything a person perceives as an object
 *   responding to them.
 *
 *   Exits are always shorter than entrances, and use a different curve.
 *   Symmetric timing is the most common tell that motion was applied rather
 *   than designed.
 *
 *   Where a duration is genuinely right (opacity, colour), the curve
 *   decelerates hard. Never the browser default `ease`.
 */

/** UI spring. Things that respond to a click or a hover. Enters fast, settles with life. */
export const SPRING = { type: "spring", stiffness: 350, damping: 25, mass: 1 } as const

/** Softer spring. Larger objects, layout shifts, values that update while you watch. */
export const SPRING_SOFT = { type: "spring", stiffness: 210, damping: 26, mass: 0.8 } as const

/**
 * Icon gestures. Tighter and lighter than the UI spring, because a 16px glyph
 * acting out a small movement settles faster than a button does, and reusing
 * the button spring makes icon hovers feel sluggish.
 */
export const SPRING_ICON = { type: "spring", stiffness: 300, damping: 20, mass: 0.7 } as const

/**
 * Card tilt. Heavier than a pointer follower because a whole surface rotating
 * needs to feel like a plate, not a leaf.
 */
export const SPRING_TILT = { stiffness: 260, damping: 22, mass: 0.6 } as const

/**
 * Magnetic pull on a small element. Light and quick: the element should arrive
 * before the pointer leaves, or the effect reads as lag rather than attraction.
 */
export const SPRING_MAGNET = { stiffness: 300, damping: 20, mass: 0.5 } as const

/**
 * Scroll progress rail. High damping so it never overshoots past 100 percent,
 * and restDelta so it settles instead of jittering at the end of a long page.
 */
export const SPRING_PROGRESS = { stiffness: 220, damping: 34, restDelta: 0.001 } as const

/**
 * Pointer-tracked surfaces: tilt, magnetic pull, cursor followers.
 * Low stiffness and high damping, so the surface trails the pointer instead of
 * snapping to it. Snapping reads as a jitter rather than as weight.
 */
export const SPRING_TRACK = { type: "spring", stiffness: 150, damping: 18, mass: 0.6 } as const

/** Deceleration curve for opacity and colour. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** Exit. Shorter than any entrance, different curve. */
export const EXIT = { duration: 0.34, ease: [0.4, 0, 0.2, 1] } as const

/**
 * Stagger step and cap.
 *
 * 60 to 80ms per item, capped around 300ms total. Past the cap the last item
 * does not read as choreographed, it reads as broken.
 */
export const STAGGER_STEP = 0.07
export const STAGGER_CAP = 0.3

export function staggerDelay(index: number): number {
  return Math.min(index * STAGGER_STEP, STAGGER_CAP)
}

/* ---------------------------------------------------------------- variants */

/**
 * Entrance: blur to sharp, plus a small rise.
 *
 * The blur is what makes it read as focus pulling rather than as a div sliding.
 * It costs one property and it is most of the difference between "animated"
 * and "designed".
 */
export const ITEM = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING },
  exit: { opacity: 0, y: 8, filter: "blur(4px)", transition: EXIT },
} as const

export const CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER_STEP, delayChildren: 0.02 } },
} as const
