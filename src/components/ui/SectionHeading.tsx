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
  aside,
  split: splitProp = false,
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
  /**
   * Supporting content set BESIDE the heading rather than under it: usually the
   * lede and a call to action, sharing the heading's top edge.
   *
   * WHY THIS IS A LAYOUT AND NOT A MARGIN. Stacking eyebrow, heading and lede
   * down the centre of a column gives every section on the site the same
   * silhouette, and a page of identical silhouettes reads as generated no
   * matter how good each one is. Splitting the row lets the heading be much
   * larger than it could be if it had to leave room underneath, and the size
   * jump between a 46px headline and a 15px paragraph next to it is the
   * contrast an editorial page is built on. Passing this switches the block to
   * two columns and moves the lede across into the second one.
   */
  aside?: React.ReactNode;
  /**
   * Force the two-column row without supplying anything beside the heading. A
   * section whose action lives further down the page still wants the split,
   * because the point of it is the heading's SIZE, not the column's contents.
   */
  split?: boolean;
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
  /* A split row only makes sense left-aligned: centred type with a column
     hanging off one side is not a composition, it is a mistake. */
  /* NEVER SPLIT A HEADING THAT IS ALREADY IN A COLUMN. `size="column"` means
     the caller has put this inside a narrow measure, and dividing that again
     gives a lede a hundred and fifty pixels wide. The split exists to let a
     heading be BIG across a full measure; in a column there is no width to
     split. */
  const split = (splitProp || Boolean(aside)) && Boolean(lede) && !centred && !columnar;

  const block = (
    /* `relative` anchors the glow and `isolate` contains it. Without the
       isolation the glow's negative z-index escapes this stacking context and
       paints behind the section's own background, where it is invisible. */
    <div
      className={`relative isolate ${centred ? "mx-auto text-center" : ""} ${split ? "" : className}`}
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

      {!split && lede && (
        <Reveal delay={0.14}>
          <p
            className={`v-serif text-[length:var(--t-lede)] leading-[1.65] text-[var(--v-muted)] ${
              columnar ? "mt-6" : "mt-8"
            } ${centred ? "mx-auto max-w-[58ch]" : "max-w-[52ch]"}`}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );

  if (!split) return block;

  /* The aside column starts at the heading's top edge, not the eyebrow's, which
     is why it is padded down rather than simply aligned start: the eyebrow is a
     label on the heading and the supporting column is a peer of the heading
     itself. */
  return (
    <div className={`grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16 ${className}`}>
      {block}
      <div className="lg:pt-[calc(var(--t-label)+2.1rem)]">
        {lede && (
          <Reveal delay={0.14}>
            <p className="v-serif max-w-[46ch] text-[length:var(--t-lede)] leading-[1.65] text-[var(--v-muted)]">
              {lede}
            </p>
          </Reveal>
        )}
        {aside && <Reveal delay={0.2}>{aside}</Reveal>}
      </div>
    </div>
  );
}
