import * as React from "react"
import { cn } from "../lib/utils"

/**
 * A button with a light running around its edge.
 *
 * The structure is load bearing. The ring is a real element because it carries
 * the mask that narrows it to the one-pixel stroke, and a pseudo-element cannot
 * be both the mask and the thing being masked. Inside it sits a short train of
 * points a few hundredths of a second apart: that is the comet, and it has to
 * be several separate points rather than one long streak because a rigid streak
 * cannot bend around the caps of a pill. The glow layer rides the same path
 * outside the mask so the bloom can spill past the edge.
 *
 * All of it is decorative and hidden from assistive technology; the label is
 * the only thing announced.
 */
const TRAIL = [0, 1, 2, 3]
export function EdgeButton({
  as = "a",
  className,
  children,
  ...rest
}: {
  as?: "a" | "button"
  className?: string
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const Tag = as as "a"

  return (
    <Tag
      className={cn(
        "v-edge group relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[var(--t-action)] font-semibold text-zinc-200 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--v-ring)]",
        className
      )}
      {...rest}
    >
      <span aria-hidden className="v-edge-glow">
        <i />
      </span>
      <span aria-hidden className="v-edge-ring">
        {TRAIL.map((i) => (
          <i key={i} />
        ))}
      </span>
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </Tag>
  )
}
