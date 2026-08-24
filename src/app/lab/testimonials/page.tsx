import type { Metadata } from "next";
import Testimonials from "@/components/Testimonials";
import type { Testimonial } from "@/lib/proof";

export const metadata: Metadata = {
  title: "Testimonial carousel",
  robots: { index: false, follow: false },
};

/**
 * A preview so the carousel can be judged before there is anything real in it.
 *
 * THE QUOTES BELOW ARE FICTION AND ARE DELIBERATELY OBVIOUS ABOUT IT. The
 * companies do not exist and the names are not people. That is the point: a
 * preview populated with plausible-sounding quotes attributed to
 * plausible-sounding executives is a rehearsal for shipping them, and this
 * route is noindex rather than private. lib/proof.ts stays empty, so the live
 * section still renders nothing until a real client says something real.
 */
const SAMPLE: Testimonial[] = [
  {
    quote:
      "Sample text standing in for a real quote. Replace this entire array with what actual clients said.",
    name: "Sample Name",
    title: "Sample Title",
    company: "Example Co (not a real client)",
  },
  {
    quote:
      "A second placeholder, longer than the first, so the layout can be checked against quotes that do not all run to the same length.",
    name: "Second Sample",
    title: "Sample Title",
    company: "Placeholder Ltd (not a real client)",
  },
  {
    quote: "A short one, to check the short case.",
    name: "Third Sample",
    title: "Sample Title",
    company: "Fictional Group (not a real client)",
  },
  {
    quote:
      "A fourth, again a different length, because a carousel that only looks right when every card is the same size is a carousel that has never met real content.",
    name: "Fourth Sample",
    title: "Sample Title",
    company: "Nowhere Partners (not a real client)",
  },
];

export default function TestimonialCarouselPreview() {
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-6 pb-4 pt-16">
        <p className="v-eyebrow">Preview</p>
        <h1
          className="v-display mt-4 max-w-[24ch] text-balance"
          style={{
            fontSize: "var(--t-display-fluid)",
            lineHeight: "var(--lh-display-fluid)",
            letterSpacing: "var(--tr-display-fluid)",
          }}
        >
          Testimonial carousel.
        </h1>
        <p className="mt-6 max-w-[60ch] text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
          Every quote on this page is fiction and every company is invented. The
          live section reads from lib/proof.ts, which is empty, so it renders
          nothing until real named testimonials exist.
        </p>
      </section>

      <Testimonials items={SAMPLE} />
    </>
  );
}
