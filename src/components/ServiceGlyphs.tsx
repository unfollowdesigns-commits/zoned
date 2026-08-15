"use client";

import { motion } from "framer-motion";
import { SPRING, SPRING_SOFT, EASE } from "@/lib/motion";

/**
 * Each glyph declares only what the parent's "hover" variant means for it.
 * The parent tile owns the variant name, so keyboard focus drives the same
 * animation as pointer hover.
 */

const ACCENT = "var(--v-primary)";
const MUTED = "var(--v-muted)";

/* The neutral parts of every glyph are `currentColor` at alpha, never a fixed
   white at alpha. These were drawn against the dark ground; once the service
   cards moved to paper, every white-alpha fill went invisible and only the
   accent strokes survived, so each glyph read as two or three stray marks in
   the corner of a card. Tracking currentColor means one drawing works on both
   grounds, which is the same rule the logo follows. */

/** Executive Search: a reticle closes in and locks onto one candidate. */
export function ExecutiveSearchGlyph() {
  return (
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={i}
          cx={18 + i * 21}
          cy={36}
          r={4}
          fill={i === 2 ? ACCENT : `color-mix(in srgb, currentColor 18%, transparent)`}
          variants={{
            rest: { r: 4, opacity: i === 2 ? 0.75 : 1 },
            hover: { r: i === 2 ? 6.5 : 3, opacity: i === 2 ? 1 : 0.35 },
          }}
          transition={SPRING}
        />
      ))}
      {/* left bracket */}
      <motion.path
        d="M14 22 L8 22 L8 50 L14 50"
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.75}
        strokeLinecap="round"
        variants={{ rest: { x: 0, opacity: 0.4 }, hover: { x: 42, opacity: 1 } }}
        transition={SPRING}
      />
      {/* right bracket */}
      <motion.path
        d="M106 22 L112 22 L112 50 L106 50"
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.75}
        strokeLinecap="round"
        variants={{ rest: { x: 0, opacity: 0.4 }, hover: { x: -42, opacity: 1 } }}
        transition={SPRING}
      />
    </svg>
  );
}

/** Professional Search: a shortlist filters, one row rising to the top. */
export function ProfessionalSearchGlyph() {
  const rows = [0, 1, 2, 3];
  return (
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true">
      {rows.map((i) => {
        const isPick = i === 2;
        return (
          <motion.g
            key={i}
            variants={{
              rest: { y: 0, opacity: 1 },
              hover: { y: isPick ? -1 * (i * 16) : 16, opacity: isPick ? 1 : 0.28 },
            }}
            transition={{ ...SPRING_SOFT, delay: isPick ? 0 : 0.04 * i }}
          >
            <rect
              x={14}
              y={10 + i * 16}
              width={92}
              height={11}
              rx={3}
              fill={isPick ? ACCENT : `color-mix(in srgb, currentColor 14%, transparent)`}
              opacity={isPick ? 0.9 : 1}
            />
            <rect
              x={18}
              y={13.5 + i * 16}
              width={isPick ? 44 : 30 + i * 7}
              height={4}
              rx={2}
              fill={isPick ? `color-mix(in srgb, currentColor 85%, transparent)` : `color-mix(in srgb, currentColor 28%, transparent)`}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}

/** Interim Leadership: a gap in the org line is filled immediately. */
export function InterimGlyph() {
  return (
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true">
      <rect x={14} y={30} width={34} height={12} rx={3} fill={`color-mix(in srgb, currentColor 16%, transparent)`} />
      <rect x={72} y={30} width={34} height={12} rx={3} fill={`color-mix(in srgb, currentColor 16%, transparent)`} />
      {/* the gap outline */}
      <motion.rect
        x={52}
        y={30}
        width={16}
        height={12}
        rx={3}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeDasharray="3 3"
        variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
        transition={{ duration: 0.2, ease: EASE }}
      />
      {/* the interim leader drops in */}
      <motion.rect
        x={52}
        y={30}
        width={16}
        height={12}
        rx={3}
        fill={ACCENT}
        variants={{ rest: { y: -26, opacity: 0 }, hover: { y: 0, opacity: 1 } }}
        transition={SPRING}
      />
    </svg>
  );
}

/** Fractional: one whole bar resolves into a claimed fraction. */
export function FractionalGlyph() {
  return (
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true">
      <rect x={14} y={30} width={92} height={12} rx={3} fill={`color-mix(in srgb, currentColor 12%, transparent)`} />
      <motion.rect
        y={30}
        height={12}
        rx={3}
        fill={ACCENT}
        x={14}
        width={92}
        variants={{ rest: { width: 92, opacity: 0.35 }, hover: { width: 34, opacity: 1 } }}
        transition={SPRING_SOFT}
      />
      <motion.g
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.24, ease: EASE }}
      >
        {[48, 67, 86].map((x) => (
          <rect key={x} x={x} y={30} width={2} height={12} fill="rgba(6,8,20,0.9)" />
        ))}
      </motion.g>
    </svg>
  );
}

/** Project Support: work advances node by node along the rail. */
export function ProjectSupportGlyph() {
  const nodes = [20, 45, 70, 95];
  return (
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true">
      <line x1={20} y1={36} x2={95} y2={36} stroke={`color-mix(in srgb, currentColor 14%, transparent)`} strokeWidth={1.5} />
      <motion.line
        x1={20}
        y1={36}
        x2={95}
        y2={36}
        stroke={ACCENT}
        strokeWidth={1.5}
        variants={{ rest: { pathLength: 0.08 }, hover: { pathLength: 1 } }}
        transition={{ duration: 0.5, ease: EASE }}
      />
      {nodes.map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={36}
          r={4.5}
          fill="var(--v-surface)"
          stroke={ACCENT}
          strokeWidth={1.5}
          variants={{
            rest: { scale: i === 0 ? 1 : 0.72, opacity: i === 0 ? 1 : 0.4 },
            hover: { scale: 1, opacity: 1 },
          }}
          transition={{ ...SPRING, delay: i * 0.07 }}
          style={{ originX: `${cx}px`, originY: "36px" }}
        />
      ))}
      <motion.circle
        cy={36}
        r={2}
        fill={ACCENT}
        variants={{ rest: { cx: 20 }, hover: { cx: 95 } }}
        transition={{ duration: 0.62, ease: EASE }}
      />
      <line x1={20} y1={48} x2={95} y2={48} stroke="transparent" />
      <text x={20} y={60} fill={MUTED} fontSize={0} aria-hidden="true">
        pipeline
      </text>
    </svg>
  );
}
