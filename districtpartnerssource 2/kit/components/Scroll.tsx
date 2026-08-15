"use client"

// Scroll choreography primitives. Everything here degrades to "just show the
// content" under prefers-reduced-motion, motion is an enhancement, never a
// gate on reading the page.

import * as React from "react"
import { motion, useScroll, useSpring, useTransform, type Variants } from "framer-motion"
import { SPRING_PROGRESS } from "../lib/motion"
import { useReducedMotion } from "../lib/use-reduced-motion"
import { cn } from "../lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

/** Thin progress rail pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, SPRING_PROGRESS)
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-[linear-gradient(90deg,var(--v-primary),var(--v-ring)_45%,#4ade9b)]"
      style={{ scaleX }}
      aria-hidden
    />
  )
}

/** Reveals its children the first time they scroll into view. */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 26,
  blur = true,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  blur?: boolean
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(10px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
}
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
}

/** Container whose children cascade in as the group enters the viewport. */
export function ScrollStagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-70px" }}>
      {children}
    </motion.div>
  )
}

export function ScrollStaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return <motion.div className={className} variants={staggerItem}>{children}</motion.div>
}

/**
 * Vertical parallax tied to the element's own progress through the viewport.
 * `speed` is how far it drifts, in px, across the full pass.
 */
export function Parallax({
  children,
  speed = 60,
  className,
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  if (reduce) return <div className={className}>{children}</div>
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

/**
 * Card that lights up under the cursor, a soft radial follows the pointer and
 * the border picks up the accent. Pure CSS custom properties, no re-renders.
 */
export function Spotlight({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <div ref={ref} onMouseMove={onMove} className={cn("v-spotlight", className)}>
      {children}
    </div>
  )
}

/** Scales/fades a block slightly as it approaches and leaves the viewport. */
export function ScrollScale({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1])
  if (reduce) return <div className={className}>{children}</div>
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ scale, opacity }}>{children}</motion.div>
    </div>
  )
}
