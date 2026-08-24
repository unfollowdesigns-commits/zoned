"use client"

/**
 * The atmosphere stack, as one component.
 *
 * Drop <Atmosphere /> once, immediately inside the shell element, before any
 * content. The layers are fixed and z-negative, so they sit behind everything
 * regardless of where this renders.
 *
 * All six layers or none. Removing one and keeping the rest is what produces
 * the "almost but not quite" result: the grain alone looks like nothing, and
 * without it the colour fields read as separate gradients rather than as one
 * lit surface.
 */

export function Atmosphere({
  depth = true,
  sweep = true,
  aurora = true,
}: {
  /** The three parallax point layers. Turn off for dense application screens. */
  depth?: boolean
  /** The slow conic rotation. */
  sweep?: boolean
  /**
   * The blurred colour wash. Turn off when the app supplies its own ambient
   * field: two full-viewport blurred washes composite every frame for a result
   * muddier than either, because overlapping soft gradients average to flat.
   */
  aurora?: boolean
}) {
  return (
    <>
      {aurora && <div aria-hidden className="v-aurora" />}
      {sweep && <div aria-hidden className="v-sweep" />}
      {depth && (
        <>
          <div aria-hidden className="v-depth v-depth-far" />
          <div aria-hidden className="v-depth v-depth-mid" />
          <div aria-hidden className="v-depth v-depth-near" />
        </>
      )}
    </>
  )
}

/**
 * The shell. Carries the ambient light, the vignette, the mesh and the grain
 * as pseudo-elements, so they cost no DOM.
 *
 *   <Shell>
 *     <Atmosphere />
 *     <main>...</main>
 *   </Shell>
 */
export function Shell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`v-shell v-grain ${className ?? ""}`}>{children}</div>
}
