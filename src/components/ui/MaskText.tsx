"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE, useReducedMotion } from "@/lib/motion";
import { whenReached } from "@/lib/in-view";

/**
 * A heading that rises out of a mask, word by word.
 *
 * WHY THIS RATHER THAN ANOTHER FADE. Everything on the site already fades and
 * lifts on arrival, which is fine for a paragraph or a card but says nothing
 * about a heading: it treats the most important line in a section exactly like
 * the least important. A mask reveal is the difference because it implies a
 * physical edge. The type is not appearing, it is arriving from behind
 * something, which is what makes the motion read as staged rather than as a
 * transition applied to a div.
 *
 * The stagger is what carries the eye left to right along the line, so the
 * heading is read in the order it was written instead of landing as a block.
 *
 * THREE THINGS THIS GETS RIGHT THAT THE OBVIOUS VERSION DOES NOT:
 *
 *   1. THE SPACES ARE REAL TEXT NODES. Splitting on whitespace and rendering
 *      only the words gives a heading that a screen reader reads as
 *      "OurtalentisfindingYours", and that is not hypothetical: it shipped on
 *      this site once already. Emitting the separator as its own text node
 *      keeps the accessible name and the selectable text intact, so no
 *      aria-label patch is needed to paper over it.
 *
 *   2. DESCENDERS SURVIVE. `overflow: hidden` on a line box cuts the tails off
 *      g, y, p and j, which looks like a font bug rather than a mask. The
 *      padding below the mask and the matching negative margin give the glyph
 *      room without moving the baseline or changing the height of the heading.
 *
 *   3. IT IS LEVEL-TRIGGERED. Same reasoning as Reveal: see lib/in-view. An
 *      IntersectionObserver misses anything already past the line on load and
 *      strands it invisible, which on a heading means the section has no title.
 */

/** Travel is in em so it scales with the type rather than fighting it. */
const RISE = "0.9em";

export default function MaskText({
  text,
  /** Seconds before the first word moves. */
  delay = 0,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  delay?: number;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [shown, setShown] = React.useState(false);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenReached(el, () => setShown(true));
  }, []);

  /* Split on whitespace but KEEP it, so the separators can be emitted as their
     own nodes rather than inferred from the gaps between spans. */
  const parts = React.useMemo(() => text.split(/(\s+)/), [text]);

  const MotionTag = motion[Tag as "span"];

  return (
    <MotionTag
      ref={ref as React.Ref<HTMLSpanElement>}
      className={className}
      style={{ display: "block" }}
    >
      {parts.map((part, i) => {
        // Whitespace goes through untouched, as text, for the reasons above.
        if (/^\s+$/.test(part)) return <React.Fragment key={i}>{part}</React.Fragment>;

        /* Only words are counted for the stagger, so a run of spaces does not
           silently add steps and drift the tail of a long heading late. */
        const wordIndex = parts.slice(0, i).filter((p) => !/^\s+$/.test(p)).length;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              // Room for descenders, taken back so the baseline does not move.
              paddingBottom: "0.14em",
              marginBottom: "-0.14em",
              verticalAlign: "bottom",
            }}
          >
            <motion.span
              style={{ display: "inline-block", willChange: "transform" }}
              /* Identical on server and client, so the two renders agree.
                 Branching on the motion preference to emit different markup is
                 what leaves elements hidden forever. */
              initial={{ y: RISE }}
              animate={{ y: shown ? "0em" : RISE }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: 0.72,
                      ease: EASE,
                      /* Tight, and capped. Per-word stagger is what makes this
                         read as a line rather than a block, but uncapped it
                         turns a ten word heading into a two second wait for the
                         full stop, by which time the reader has moved on. */
                      delay: delay + Math.min(wordIndex * 0.055, 0.42),
                    }
              }
            >
              {part}
            </motion.span>
          </span>
        );
      })}
    </MotionTag>
  );
}
