"use client"

// Interaction primitives that give surfaces real dimension, tilt with
// perspective, type that reveals from behind a mask, magnetic controls, and
// SVG paths that draw as they scroll into view.
//
// Deliberately restrained: small angles, short distances, spring settle. The
// goal is a surface that responds to you, not a page that performs at you.

import * as React from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { SPRING_TILT, SPRING_MAGNET } from "../lib/motion"
import { useReducedMotion } from "../lib/use-reduced-motion"
import { cn } from "../lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * 3D tilt card. The surface rotates a few degrees toward the cursor and a
 * specular sheen tracks across it, so cards read as physical panels rather
 * than flat rectangles.
 */
export function TiltCard({
  children,
  className,
  max = 7,
  glare = true,
}: {
  children: React.ReactNode
  className?: string
  max?: number
  glare?: boolean
}) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const spring = SPRING_TILT
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring)
  const glareX = useTransform(px, [0, 1], ["0%", "100%"])
  const glareY = useTransform(py, [0, 1], ["0%", "100%"])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  function onLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  if (reduce) return <div className={className}>{children}</div>

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ z: 24 }}
        transition={spring}
        className={cn("relative h-full", className)}
      >
        {glare && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[3] rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: useTransform(
                [glareX, glareY],
                ([x, y]) => `radial-gradient(420px circle at ${x} ${y}, rgba(255,255,255,0.10), transparent 60%)`
              ),
            }}
          />
        )}
        <div style={{ transform: "translateZ(28px)", transformStyle: "preserve-3d" }} className="h-full">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Headline that reveals word-by-word from behind a mask as it scrolls in.
 * `accentFrom` marks the index where the accent styling begins.
 *
 * The trigger has to live on the wrapper, and this is not a style preference.
 * Each word starts translated 110% down inside a parent with overflow: hidden,
 * which means it starts fully clipped. An IntersectionObserver honours ancestor
 * clipping, so a word in that pose never intersects the viewport, whileInView
 * never fires, and the word never moves out of the pose that is hiding it. It
 * is a deadlock, and a silent one: the heading is present, has opacity 1, is
 * readable by a screen reader and shows up in the DOM, but every visitor sees
 * an empty space where the title should be. Every section heading on the site
 * was in that state.
 *
 * Watching the wrapper instead is safe because the wrapper is never clipped.
 */
export function WordReveal({
  text,
  className,
  accentFrom,
  accentClassName = "v-accent-text",
  delay = 0,
}: {
  text: string
  className?: string
  accentFrom?: number
  accentClassName?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const words = text.split(" ")

  if (reduce) {
    return (
      <span className={className}>
        {words.map((w, i) => (
          <span key={i} className={accentFrom !== undefined && i >= accentFrom ? accentClassName : undefined}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </span>
    )
  }

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: "0.08em" }}>
          <motion.span
            className={cn("inline-block", accentFrom !== undefined && i >= accentFrom && accentClassName)}
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : { y: "110%" }}
            transition={{ duration: 0.75, ease: EASE, delay: delay + i * 0.055 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}

/** Control that drifts toward the cursor, then springs home. */
export function Magnetic({
  children,
  className,
  strength = 0.28,
}: {
  children: React.ReactNode
  className?: string
  strength?: number
}) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), SPRING_MAGNET)
  const y = useSpring(useMotionValue(0), SPRING_MAGNET)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function reset() { x.set(0); y.set(0) }

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x, y }} className={cn("inline-block", className)}>
      {children}
    </motion.div>
  )
}

/** An SVG path that draws itself once scrolled into view. */
export function DrawnPath({
  d,
  className,
  stroke = "rgba(255,255,255,0.14)",
  strokeWidth = 1.5,
  duration = 1.6,
  dashed,
}: {
  d: string
  className?: string
  stroke?: string
  strokeWidth?: number
  duration?: number
  dashed?: boolean
}) {
  return (
    <motion.path
      d={d}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={dashed ? "5 6" : undefined}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, ease: EASE }}
    />
  )
}

/**
 * Seamless marquee. Duplicates its children once and translates by exactly
 * -50%, so the loop never shows a seam.
 */
export function Marquee({
  children,
  speed = 34,
  reverse,
  className,
}: {
  children: React.ReactNode
  speed?: number
  reverse?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <div
      className={cn("group relative overflow-hidden", className)}
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}
    >
      <motion.div
        className="flex w-max gap-3"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}   /* linear-ok: ambient loop, any easing would pulse */
      >
        <div className="flex shrink-0 gap-3">{children}</div>
        <div className="flex shrink-0 gap-3" aria-hidden>{children}</div>
      </motion.div>
    </div>
  )
}

/** Number that counts up when it enters the viewport. */
export function ScrollCount({
  to,
  suffix,
  className,
  duration = 1.4,
}: {
  to: number
  suffix?: string
  className?: string
  duration?: number
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = React.useState(0)
  const [started, setStarted] = React.useState(false)
  const [settled, setSettled] = React.useState(false)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    const el = ref.current
    if (!el || started) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setStarted(true)
        io.disconnect()
        if (reduce) { setDisplay(to); setSettled(true); return }
        const t0 = performance.now()
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / (duration * 1000))
          setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * to))
          if (p < 1) requestAnimationFrame(step)
          else setSettled(true)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration, started, reduce])

  /**
   * Tabular figures while it counts, proportional once it lands.
   *
   * Equal-width digits are what stops the number jittering sideways as it runs,
   * but they are the wrong choice for a large standalone figure: at display size
   * a value like 100 sits visibly loose. So the constraint is dropped the moment
   * it stops needing it.
   */
  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: settled ? "normal" : "tabular-nums" }}
    >
      {display}
      {suffix}
    </span>
  )
}
