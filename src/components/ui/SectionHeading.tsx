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
  className = "",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  /** The phrase that turns to the accent, on its own line. */
  turn?: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const centred = align === "center";

  return (
    <div className={`${centred ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && (
        <Reveal>
          <p className="v-eyebrow mb-5">{eyebrow}</p>
        </Reveal>
      )}

      <Reveal delay={eyebrow ? 0.07 : 0}>
        <Tag className={`v-section-title ${centred ? "mx-auto max-w-[20ch]" : "max-w-[18ch]"}`}>
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
            className={`mt-7 text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)] ${
              centred ? "mx-auto max-w-[58ch]" : "max-w-[52ch]"
            }`}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}
