import * as React from "react";
import Reveal from "@/components/Reveal";

/**
 * A section's title block: eyebrow, two-tone heading, optional lede.
 *
 * Exists so that every section on the site is the same object. Section titles
 * are the element most likely to drift when they are hand-rolled per page, and
 * a page whose four h2s are four different sizes reads as assembled rather than
 * designed. The size, leading and tracking live together in `.v-section-title`
 * for the same reason.
 *
 * `turn` is the half of the statement that lands in the accent. Splitting the
 * heading into `title` and `turn` rather than passing markup keeps the device
 * consistent: ink first, brand colour on the phrase that carries the meaning,
 * always in that order. A heading that is entirely accent has no contrast to
 * make, which is the whole point of the treatment.
 */
export default function SectionHeading({
  eyebrow,
  title,
  turn,
  lede,
  align = "left",
  size = "full",
  className = "",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  /** The phrase that turns to the accent, on its own line. */
  turn?: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  /**
   * "full" is the section title sized for a heading that owns the page's whole
   * measure. "column" steps it down for a heading that shares a row with
   * something else.
   *
   * THIS IS NOT A STYLE KNOB, IT IS THE MISSING HALF OF THE TOKEN. A display
   * size is only correct relative to the width it is given: `--t-display-fluid`
   * scales with the viewport, not with the container, so the same 64px that
   * reads as confident across a 1280px measure wraps to four lines and swamps
   * everything beside it in a half width column. Two sections hit this before
   * it was worth naming, and both had been patched with a hand-written clamp,
   * which is exactly the per-page drift this component exists to prevent.
   */
  size?: "full" | "column";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const centred = align === "center";
  const columnar = size === "column";

  return (
    <div className={`${centred ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && (
        <Reveal>
          <p className="v-eyebrow mb-5">{eyebrow}</p>
        </Reveal>
      )}

      <Reveal delay={eyebrow ? 0.07 : 0}>
        <Tag
          /* The measure widens as the size steps down. 18ch is tuned to the
             full display step; holding it at a smaller size just forces the
             same number of wraps out of shorter lines, which was the actual
             cause of the four line heading, not the font size. */
          className={`v-section-title ${
            centred ? "mx-auto max-w-[20ch]" : columnar ? "max-w-[23ch]" : "max-w-[18ch]"
          }`}
          style={
            columnar
              ? { fontSize: "clamp(28px, 3.2vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.028em" }
              : undefined
          }
        >
          {title}
          {turn && (
            <>
              {/* A block, not a space: the turn takes its own line, which is
                  what gives the heading its two-beat shape. */}
              <span className="block turn">{turn}</span>
            </>
          )}
        </Tag>
      </Reveal>

      {lede && (
        <Reveal delay={0.14}>
          <p
            className={`text-[length:var(--t-lede)] leading-[1.65] text-[var(--v-muted)] ${
              columnar ? "mt-6" : "mt-8"
            } ${centred ? "mx-auto max-w-[58ch]" : "max-w-[52ch]"}`}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}
