"use client"

/**
 * Motion primitives.
 *
 * These exist as files rather than as a description because a description gets
 * reimplemented, and a reimplementation gets different physics. Import them.
 */

import * as React from "react"
import { animate, motion, useInView, useMotionValue, useSpring, useTransform,
  type HTMLMotionProps } from "framer-motion"
import { SPRING, SPRING_SOFT, EASE, CONTAINER, ITEM, staggerDelay } from "../lib/motion"
import { useReducedMotion } from "../lib/use-reduced-motion"

/* ------------------------------------------------------------------ entrance */

/** Choreographs a staggered spring entrance for its children. */
export function Stagger({
  children, className, ready = true,
}: {
  children: React.ReactNode
  className?: string
  /** Hold until a loading curtain lifts. Animating under a cover means the
      entrance plays and finishes while nobody can see it. */
  ready?: boolean
}) {
  return (
    <motion.div
      className={className}
      variants={CONTAINER}
      initial="hidden"
      animate={ready ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  )
}

/** One item inside a Stagger, or a standalone reveal. */
export function Reveal({
  children, className, standalone,
}: {
  children: React.ReactNode
  className?: string
  standalone?: boolean
}) {
  return (
    <motion.div
      className={className}
      variants={ITEM}
      {...(standalone ? { initial: "hidden", animate: "show" } : {})}
    >
      {children}
    </motion.div>
  )
}

/**
 * Reveal on scroll, once.
 *
 * `once: true` is not optional. Re-animating on scroll-back is irritating
 * within thirty seconds of using the page.
 */
export function ScrollReveal({
  children, className, delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------------------------------------------------------- interaction */

/**
 * A button with mass.
 *
 * Lifts 1px on hover, depresses to 0.98 on press, springs both ways. Renders a
 * real <button>, so keyboard activation and the focus ring come free.
 */
export function TactileButton({
  children, className, variant = "primary", ...props
}: HTMLMotionProps<"button"> & { variant?: "primary" | "ghost" }) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 " +
    "text-sm font-semibold outline-none transition-colors select-none " +
    "focus-visible:ring-2 focus-visible:ring-[var(--v-ring)] focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-[var(--v-bg)] disabled:opacity-50 disabled:pointer-events-none"
  const look =
    variant === "primary"
      ? "text-white bg-[linear-gradient(180deg,var(--v-primary),var(--v-primary-deep))] " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_10px_30px_-10px_color-mix(in srgb, var(--v-primary) 80%, transparent)]"
      : "text-zinc-200 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"

  return (
    <motion.button
      className={[base, look, className].filter(Boolean).join(" ")}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={SPRING}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/**
 * Cursor spotlight. Pair with `.v-spotlight` from 02-primitives.css.
 *
 * Writes --mx / --my as percentages on pointermove. Stops a grid of panels
 * sitting there as one dead slab.
 */
export function Spotlight({
  children, className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div ref={ref} onPointerMove={onMove} className={`v-spotlight ${className ?? ""}`}>
      {children}
    </div>
  )
}

/* --------------------------------------------------------------------- text */

/**
 * Words rising into place, once, on scroll.
 *
 * THE TRAP THIS AVOIDS: the obvious implementation wraps each word in
 * overflow:hidden and puts the viewport observer on the inner element. An
 * IntersectionObserver honours ancestor clipping, so an element fully clipped
 * by its parent NEVER intersects, so the animation never fires, so it stays
 * clipped forever. Every heading on the site is invisible and nothing errors.
 *
 * The observer goes on the WRAPPER. The animation goes on the child.
 */
export function WordReveal({
  text, className, delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduced = useReducedMotion()
  const words = text.split(" ")

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.08em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={inView || reduced ? { y: 0 } : { y: "110%" }}
            transition={reduced ? { duration: 0 } : { ...SPRING_SOFT, delay: delay + i * 0.04 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* ------------------------------------------------------------------ numbers */

/** Counts up once, when scrolled into view. For a figure that does not change. */
export function CountUp({
  value, decimals = 0, duration = 1.1, className, suffix, prefix,
}: {
  value: number
  decimals?: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduced = useReducedMotion()
  const mv = useMotionValue(0)
  const [display, setDisplay] = React.useState("0")

  React.useEffect(() => {
    if (!inView) return
    if (reduced) { setDisplay(value.toFixed(decimals)); return }
    const controls = animate(mv, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    })
    return () => controls.stop()
  }, [inView, value, decimals, duration, mv, reduced])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}{display}{suffix}
    </span>
  )
}

/**
 * Springs to whatever the value currently is. For a figure that updates while
 * you watch: a calculator output, a live count.
 *
 * CountUp is wrong here. It fires once on view, so a value that changes after
 * that snaps while the rest of the panel eases, and reads as a different
 * component.
 *
 * Never print a trailing .0: a decimal that is always zero claims a precision
 * the number does not have. Use `dp()` below.
 */
export function LiveNumber({
  value, decimals = 0, prefix = "", suffix = "", className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const reduced = useReducedMotion()
  const mv = useMotionValue(value)
  const spring = useSpring(mv, SPRING_SOFT)
  const text = useTransform(spring, (v) =>
    (Math.round(v * 10 ** decimals) / 10 ** decimals).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  )

  React.useEffect(() => { mv.set(value) }, [value, mv])

  if (reduced) {
    return (
      <span className={className}>
        {prefix}
        {value.toLocaleString(undefined, {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        })}
        {suffix}
      </span>
    )
  }
  return (
    <span className={className}>
      {prefix}
      <motion.span style={{ fontVariantNumeric: "tabular-nums" }}>{text}</motion.span>
      {suffix}
    </span>
  )
}

/** Decimals only when there are any. */
export function dp(value: number, max: number): number {
  return Number.isInteger(value) ? 0 : max
}

export { staggerDelay }
