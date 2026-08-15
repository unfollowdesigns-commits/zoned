"use client"

import * as React from "react"
import { useReducedMotion as useFramerReducedMotion } from "framer-motion"

/**
 * Reduced motion, gated on mount.
 *
 * READ THIS BEFORE REPLACING IT WITH THE FRAMER HOOK.
 *
 * Framer's useReducedMotion() returns false during server rendering and may
 * return true on the client. If you branch on it to produce structurally
 * different markup, React hydrates, finds a mismatched tree, and keeps the
 * server DOM. It prints "This won't be patched up" and moves on. Framer never
 * takes ownership of those elements, so anything that started at opacity 0
 * stays at opacity 0.
 *
 * The symptom is a panel or a heading that is permanently invisible, with no
 * error, on some machines and not others, depending on an OS setting. It costs
 * hours to find. It cost hours to find.
 *
 * Gating on mount makes the server render and the first client render always
 * agree. The preference is applied on the second render, by which point React
 * owns the tree and can update it normally.
 */
export function useReducedMotion(): boolean {
  const preference = useFramerReducedMotion()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted && preference === true
}
