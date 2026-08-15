"use client"

// Nav icons that act out what they mean.
//
// A hover state that scales an icon up two percent is decoration: it proves the
// row is hoverable, which the background already proved. These do something
// specific instead. The batch icon fans its sheets, the compare icon swaps its
// two columns, the search icon sweeps its lens, the rank icon sorts. Each one
// is a two second explanation of the view it leads to, and the only cost is
// pointing at it.
//
// The mechanism is framer's variant propagation: the nav button declares
// whileHover="hover" and every motion child inside inherits it, so the icons
// need no state, no handlers and no knowledge of the button. They only declare
// what "hover" looks like for them.
//
// Everything is drawn on a 24 grid with a 1.7 stroke so the set is optically
// consistent, and nothing here is a generic library glyph.
//
// ON prefers-reduced-motion: these icons deliberately do not check it
// themselves. The variant name is supplied by the parent row, so the row is the
// only place the preference can be honoured without every icon duplicating the
// same guard. The consuming nav must pass whileHover={reduced ? undefined :
// "hover"}. Verify it: hover every item under reducedMotion "reduce" and assert
// the geometry does not change.

import * as React from "react"
import { motion, type Variants } from "framer-motion"
import { SPRING_ICON as SPRING } from "../lib/motion"

export interface NavIconProps {
  className?: string
  /** True for the current view: the icon rests in a slightly forward pose. */
  active?: boolean
}

const EASE = [0.16, 1, 0.3, 1] as const

function Svg({
  className,
  active,
  children,
}: {
  className?: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      // The current view carries a little more weight, the way the label does.
      strokeWidth={active ? 2.05 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

/* --------------------------------------------------------------- overview */
/* Four panels. On hover they breathe apart, the way a dashboard resolves into
   separate readings rather than one block. */

const panel = (dx: number, dy: number): Variants => ({
  rest: { x: 0, y: 0 },
  hover: { x: dx, y: dy, transition: SPRING },
})

export function NavOverview({ className, active }: NavIconProps) {
  return (
    <Svg className={className} active={active}>
      <motion.rect variants={panel(-0.9, -0.9)} x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <motion.rect variants={panel(0.9, -0.9)} x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <motion.rect variants={panel(-0.9, 0.9)} x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <motion.rect variants={panel(0.9, 0.9)} x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </Svg>
  )
}

/* ------------------------------------------------------------------- jobs */
/* A pipeline: three stages on a rail, and a candidate advancing one place. */

export function NavJobs({ className, active }: NavIconProps) {
  return (
    <Svg className={className} active={active}>
      {/* The rail stops at the outer nodes. Running it past them turned the
          glyph into a chain link at 16px, which is a different icon. */}
      <line x1="5" y1="12" x2="19" y2="12" strokeOpacity={0.38} />
      <circle cx="12" cy="12" r="2.6" strokeOpacity={0.5} />
      <circle cx="19" cy="12" r="2.6" strokeOpacity={0.5} />
      <motion.circle
        cx="5" cy="12" r="2.6"
        variants={{ rest: { cx: 5 }, hover: { cx: 19, transition: { ...SPRING, stiffness: 210 } } }}
        fill="currentColor" stroke="none"
      />
    </Svg>
  )
}

/* ---------------------------------------------------------------- compare */
/* A split view whose handle scrubs across, the way you drag a before and after.
   Two columns trading places was drawn first and thrown away: two identical
   shapes crossing through each other overlap exactly at the midpoint, so the
   animation reads as one panel blinking rather than as two swapping. This has
   one silhouette that never self-occludes, and it survives a 16px render
   because it is a rectangle and a line. */

const SCRUB = { duration: 1.15, ease: EASE } as const

export function NavCompare({ className, active }: NavIconProps) {
  // Stable across server and client, so the clip reference does not break on
  // hydration the way a random id would.
  const clip = `v-cmp-${React.useId().replace(/:/g, "")}`
  return (
    <Svg className={className} active={active}>
      <defs>
        <clipPath id={clip}>
          <rect x="3.5" y="5" width="17" height="14" rx="2.2" />
        </clipPath>
      </defs>
      {/* The lit side. Clipped to the frame so the fill never spills past the
          rounded corners. */}
      <motion.rect
        x="3.5" y="5" width="8.5" height="14"
        clipPath={`url(#${clip})`}
        fill="currentColor" stroke="none" fillOpacity={0.2}
        variants={{
          rest: { width: 8.5 },
          hover: { width: [8.5, 5, 12.5, 8.5], transition: SCRUB },
        }}
      />
      <rect x="3.5" y="5" width="17" height="14" rx="2.2" />
      <motion.line
        x1="12" y1="5" x2="12" y2="19"
        variants={{
          rest: { x: 0 },
          hover: { x: [0, -3.5, 4, 0], transition: SCRUB },
        }}
      />
    </Svg>
  )
}

/* ------------------------------------------------------------------ batch */
/* A stack of sheets that fans, because the point of the view is that it takes
   many at once rather than one. */

export function NavBatch({ className, active }: NavIconProps) {
  return (
    <Svg className={className} active={active}>
      <motion.rect
        x="7" y="4" width="12" height="15" rx="2" strokeOpacity={0.4}
        variants={{ rest: { x: 7, y: 4, rotate: 0 }, hover: { x: 9, y: 3, rotate: 7, transition: SPRING } }}
        style={{ transformOrigin: "13px 11px" }}
      />
      <motion.rect
        x="6" y="4.5" width="12" height="15" rx="2" strokeOpacity={0.7}
        variants={{ rest: { x: 6, y: 4.5, rotate: 0 }, hover: { x: 6, y: 4, rotate: 0, transition: SPRING } }}
        style={{ transformOrigin: "12px 12px" }}
      />
      <motion.rect
        x="5" y="5" width="12" height="15" rx="2"
        variants={{ rest: { x: 5, y: 5, rotate: 0 }, hover: { x: 3, y: 6, rotate: -7, transition: SPRING } }}
        style={{ transformOrigin: "11px 12.5px" }}
      />
    </Svg>
  )
}

/* ---------------------------------------------------------------- analyse */
/* Not a sparkle. A document with its lines resolving into a judgement: two
   grey lines and one that lands lit, which is what the view actually does. */

export function NavAnalyse({ className, active }: NavIconProps) {
  const line = (i: number): Variants => ({
    rest: { pathLength: 1, opacity: 0.45 },
    hover: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: EASE, delay: i * 0.07 },
    },
  })
  return (
    <Svg className={className} active={active}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.2" strokeOpacity={0.5} />
      <motion.line x1="8" y1="9" x2="16" y2="9" variants={line(0)} />
      <motion.line x1="8" y1="12.5" x2="14" y2="12.5" variants={line(1)} />
      <motion.line
        x1="8" y1="16" x2="12" y2="16"
        variants={{
          rest: { opacity: 0.45, x: 0 },
          hover: { opacity: 1, x: 1.5, transition: { duration: 0.34, ease: EASE, delay: 0.14 } },
        }}
      />
    </Svg>
  )
}

/* ----------------------------------------------------------------- search */
/* The lens sweeps across, which is what a search over a whole pipeline is,
   rather than a magnifier that jiggles. */

export function NavSearch({ className, active }: NavIconProps) {
  return (
    <Svg className={className} active={active}>
      <motion.g
        variants={{
          rest: { x: 0, y: 0 },
          hover: { x: [0, 3.5, -1.5, 0], y: [0, -1.5, 1, 0], transition: { duration: 1.05, ease: EASE } },
        }}
      >
        <circle cx="10.5" cy="10.5" r="6" />
        <line x1="15" y1="15" x2="20.5" y2="20.5" />
      </motion.g>
    </Svg>
  )
}

/* --------------------------------------------------------------- settings */
/* Two sliders whose handles trade positions.
   The gear was tried first and rejected twice over: an eight spoke gear at a
   16px render collapses into a sun, which is the brightness icon, and a gear
   that spins on hover is the single most copied hover on the internet. Sliders
   survive the size, and a handle sliding is literally the act of adjusting. */

export function NavSettings({ className, active }: NavIconProps) {
  const handle = (from: number, to: number, delay: number): Variants => ({
    rest: { cx: from },
    hover: { cx: to, transition: { ...SPRING, stiffness: 260, delay } },
  })
  return (
    <Svg className={className} active={active}>
      <line x1="3.5" y1="8.5" x2="20.5" y2="8.5" strokeOpacity={0.4} />
      <line x1="3.5" y1="15.5" x2="20.5" y2="15.5" strokeOpacity={0.4} />
      <motion.circle cx="8.5" cy="8.5" r="2.6" variants={handle(8.5, 16, 0)} fill="var(--v-bg, #0b0d18)" />
      <motion.circle cx="15.5" cy="15.5" r="2.6" variants={handle(15.5, 7.5, 0.05)} fill="var(--v-bg, #0b0d18)" />
    </Svg>
  )
}

export type NavIcon = (p: NavIconProps) => React.ReactElement
