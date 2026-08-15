"use client"

/**
 * Full-bleed light section.
 *
 * The site is one continuous dark surface, which makes a long page read as a
 * single undifferentiated scroll. Dropping to a warm off-white for two sections
 * gives the page joints: you can feel where one argument ends and the next
 * begins, and it makes the dark sections read as deliberate rather than as the
 * only option.
 *
 * Colours are declared locally rather than through the global tokens, because
 * those tokens describe the dark surface and every component that reads them
 * would need a second set. The palette here is the inverse of the site's: warm
 * paper, warm near-black ink, and the same violet accent, which stays legible
 * on cream where the mint would not.
 *
 * The layout is deliberately the same two-column shape used elsewhere: a large
 * statement on the left, hairline-divided points on the right. Reusing the shape
 * is what keeps a colour change from reading as a different website.
 */

import * as React from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "../lib/use-reduced-motion"
import { cn } from "../lib/utils"

export const PAPER = "#F4F1EB"
const INK = "#14120E"
const MUTED = "#55514A"
const RULE = "rgba(20,18,14,0.12)"
/** Same violet as the dark sections, darkened to stay legible on paper. */
export const PAPER_ACCENT = "#4B37C4"
/** Same mint, darkened for the same reason. */
export const PAPER_MINT = "#1F7F58"
const ACCENT = PAPER_ACCENT

/** Reads as the brand accent on paper. Use for the phrase a heading turns on. */
export function PaperAccent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: ACCENT }}>{children}</span>
}

/**
 * Breaks out of the parent's max-width so the colour runs edge to edge.
 * `overflow-x: clip` on html and body absorbs the scrollbar's width, which is
 * why 100vw is safe here and would not be otherwise.
 */
export function LightBand({
  eyebrow,
  title,
  lede,
  items,
  footnote,
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  lede?: string
  items: { title: string; body: string }[]
  footnote?: React.ReactNode
  className?: string
}) {
  return (
    <section
      // No overflow-hidden here. It would clip the blooms, but overflow on an
      // ancestor turns off position: sticky, and the heading column beside these
      // items is sticky. The backdrop wrapper below does the clipping instead.
      className={cn("v-paper-seam relative mx-[calc(50%-50vw)] w-[100vw]", className)}
      style={{ background: PAPER }}
    >
      {/* The dark sections sit on an aurora, a dot field and grain. Paper with
          none of that read as a flatter, separate site, so the same three
          layers run here inverted and at a much lower alpha. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <span className="v-paper-bloom v-paper-bloom-a" />
        <span className="v-paper-bloom v-paper-bloom-b" />
        <span className="v-paper-dots" />
      </div>

      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-6 py-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20 lg:py-32">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[var(--t-micro)] font-semibold uppercase tracking-[0.14em]"
            style={{ color: ACCENT }}
          >
            {eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="v-display mt-5 text-balance text-[var(--t-band)] font-bold leading-[1.03] tracking-[-0.025em] sm:text-[var(--t-band)] lg:text-[var(--t-band)]"
            style={{ color: INK }}
          >
            {title}
          </motion.h2>
          {lede && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-md text-[var(--t-body)] leading-[1.65]"
              style={{ color: MUTED }}
            >
              {lede}
            </motion.p>
          )}
        </div>

        <ul className="lg:pt-1">
          {items.map((it, i) => (
            <motion.li
              key={it.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="py-8 first:pt-0"
              style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${RULE}` }}
            >
              <div className="flex items-baseline gap-3.5">
                <span
                  aria-hidden
                  className="font-mono text-[var(--t-label)] tabular-nums"
                  style={{ color: i % 2 === 0 ? ACCENT : PAPER_MINT }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="v-display flex-1 text-[var(--t-heading)] font-bold leading-tight tracking-[-0.01em] sm:text-[var(--t-heading)]"
                  style={{ color: INK }}
                >
                  {it.title}
                </h3>
              </div>
              <p className="mt-2.5 max-w-[62ch] pl-[30px] text-[var(--t-body)] leading-[1.65]" style={{ color: MUTED }}>
                {it.body}
              </p>
            </motion.li>
          ))}

          {footnote && (
            <li className="pt-2 text-[var(--t-secondary)] leading-relaxed" style={{ color: MUTED }}>
              {footnote}
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}
