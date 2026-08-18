import type { Metadata } from "next";
import ScrollSequence, { type SequenceOverlay } from "@/components/ScrollSequence";

/**
 * A preview route for the scroll-scrubbed sequence.
 *
 * DELIBERATELY NOT THE HOMEPAGE. The homepage already has a hero that has been
 * through a lot of revisions, and dropping a second full-bleed pinned section
 * in front of it would give the page two openings, which is the same mistake as
 * before. This is where the technique gets judged on its own; if it earns the
 * slot, it replaces CinematicHero rather than joining it.
 */
export const metadata: Metadata = {
  title: "Scroll sequence",
  /* Not a real page: keep it out of search results and the sitemap. */
  robots: { index: false, follow: false },
};

const OVERLAYS: SequenceOverlay[] = [
  {
    from: 0.08,
    to: 0.26,
    eyebrow: "The mandate",
    title: "Senior seats, filled with intent.",
    body: "The roles where a wrong hire costs a year. We work a shortlist, not a pipeline.",
    align: "center",
  },
  {
    from: 0.44,
    to: 0.62,
    eyebrow: "The method",
    title: "Partner-led, first call to first day.",
    body: "The person who scopes the search runs it. Nothing is handed down to a junior desk.",
    align: "center",
  },
  {
    from: 0.78,
    to: 0.94,
    eyebrow: "The outcome",
    title: "Teams that hold.",
    body: "Placement is the midpoint, not the finish. We are measured on who is still there in two years.",
    align: "center",
  },
];

export default function ScrollSequencePage() {
  return (
    <>
      {/* Lead-in, so the pin can be seen engaging rather than being the first
          thing on screen. A pinned section that starts pinned reads as a static
          image until you have already scrolled past the interesting part. */}
      <section className="mx-auto flex min-h-[70vh] max-w-[1280px] flex-col justify-center px-6">
        <p className="v-eyebrow">Preview</p>
        <h1
          className="v-display mt-4 max-w-[20ch] text-balance"
          style={{
            fontSize: "var(--t-display-fluid)",
            lineHeight: "var(--lh-display-fluid)",
            letterSpacing: "var(--tr-display-fluid)",
          }}
        >
          Scroll-scrubbed sequence.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
          120 frames on a canvas, scrubbed from scroll position with a damped
          catch-up. Keep scrolling.
        </p>
      </section>

      <ScrollSequence
        dir="/sequence/hero"
        count={120}
        depth={300}
        overlays={OVERLAYS}
        label="An abstract field of light contours drifting as the camera moves through it."
      />

      {/* Run-out, so releasing the pin is visible too. */}
      <section className="mx-auto flex min-h-[70vh] max-w-[1280px] flex-col justify-center px-6">
        <p className="max-w-[52ch] text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
          The pin has released and the page is scrolling normally again.
        </p>
      </section>
    </>
  );
}
