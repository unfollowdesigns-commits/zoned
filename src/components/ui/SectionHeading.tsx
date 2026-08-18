import * as React from "react";
import Reveal from "@/components/Reveal";
import MaskText from "@/components/ui/MaskText";

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
  glow = true,
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
  /**
   * The ambient focal glow behind the heading. On by default, because the point
   * of putting it here is that every section gets it without anyone
   * remembering to ask, and off for the cases where a section already has its
   * own light behind it and a second source would read as a smudge.
   */
  glow?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const centred = align === "center";
  const columnar = size === "column";

  return (
    /* `relative` anchors the glow and `isolate` contains it. Without the
       isolation the glow's negative z-index escapes this stacking context and
       paints behind the section's own background, where it is invisible. */
    <div
      className={`relative isolate ${centred ? "mx-auto text-center" : ""} ${className}`}
    >
      {glow && <span aria-hidden="true" className="v-heading-glow" />}
      {eyebrow && (
        <Reveal>
          <p className="v-eyebrow mb-5">{eyebrow}</p>
        </Reveal>
      )}

      {/* NOT WRAPPED IN `Reveal`. Reveal fades and lifts the whole block, and
          running that underneath a mask reveal gives the words two competing
          motions: they slide up out of the mask while the mask itself is also
          sliding up, which reads as sloppy rather than as layered. The mask is
          the reveal here, so the heading owns its own arrival. */}
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
          {/* Only a plain string can be split into words. Anything richer keeps
              the old behaviour rather than being silently flattened. */}
          {typeof title === "string" ? (
            <MaskText text={title} delay={eyebrow ? 0.07 : 0} />
          ) : (
            title
          )}
          {turn && (
            <>
              {/* A real space before the block. The turn takes its own line, so
                  this collapses visually and changes nothing on screen, but
                  without it the heading's text content runs the two halves
                  together as "specializationsfor your business", which is what
                  an accessible name and a copied selection are built from. */}
              {" "}
              <span className="block turn">
                {typeof turn === "string" ? (
                  /* The turn starts as the title is finishing rather than after
                     it, so the two halves read as one sentence landing in two
                     beats instead of as two separate animations queued up. */
                  <MaskText text={turn} delay={(eyebrow ? 0.07 : 0) + 0.18} />
                ) : (
                  turn
                )}
              </span>
            </>
          )}
        </Tag>

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
