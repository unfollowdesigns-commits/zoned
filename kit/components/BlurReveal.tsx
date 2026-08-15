"use client"

/**
 * Defocus reveal.
 *
 * Content arrives slightly out of focus and low, then sharpens and settles.
 * The blur is what makes it feel smooth rather than mechanical: a pure fade
 * changes only one property and reads as a switch flipping, while resolving
 * focus reads as something coming into view, which is the same thing your eye
 * does when it lands on a new object.
 *
 * The easing is asymmetric on purpose. Most of the distance is covered early
 * and the last few percent take their time, so it decelerates into place
 * instead of arriving on a beat.
 */

import * as React from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { useReducedMotion } from "../lib/use-reduced-motion"
import { useCurtainDone } from "../lib/use-curtain"

const EASE = [0.16, 1, 0.3, 1] as const

export function BlurReveal({
  children,
  className,
  delay = 0,
  distance = 16,
  blur = 12,
  as: Tag = "div",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  distance?: number
  blur?: number
  as?: "div" | "section" | "li" | "span"
}) {
  const reduce = useReducedMotion()
  const ready = useCurtainDone()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" })
  const M = motion[Tag] as typeof motion.div

  if (reduce) return <Tag className={className}>{children}</Tag>

  return (
    <M
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance, filter: `blur(${blur}px)` }}
      animate={ready && inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}

const GROUP: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

/** Children resolve one after another rather than all at once. */
export function BlurStagger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const ready = useCurtainDone()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={GROUP}
      initial="hidden"
      // Both conditions, not just visibility. The metrics strip is above the
      // fold, so it is "in view" from the first frame, which is the frame the
      // curtain is covering.
      animate={ready && inView ? "shown" : "hidden"}
    >
      {children}
    </motion.div>
  )
}

export function BlurStaggerItem({
  children,
  className,
  distance = 18,
  blur = 14,
}: {
  children: React.ReactNode
  className?: string
  distance?: number
  blur?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance, filter: `blur(${blur}px)` },
        shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}
