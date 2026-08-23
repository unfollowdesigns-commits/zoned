import LightBand from "@/components/ui/LightBand";
import SectionHeading from "@/components/ui/SectionHeading";
import PlacedPositions from "@/components/PlacedPositions";
import Clients from "@/components/Clients";

/**
 * One band of evidence: the seats we fill, and the firms we fill them for.
 *
 * THIS IS A STRUCTURAL FIX, NOT A TIDY-UP. Measured against the whole page,
 * these were two separate cream sections of 306px and 479px sitting directly
 * on top of each other, each carrying one eyebrow and nothing else. Two thin
 * pale strips in a row read as one washed-out zone with no argument in it, and
 * they broke the dark/paper alternation the rest of the page keeps, so the
 * middle of the homepage went flat exactly where it should have been making
 * its case.
 *
 * They belong together for a better reason than saving space. Neither is
 * something the firm says about itself: one is the level it actually operates
 * at, the other is who actually hired it. Presented apart, each is a decorative
 * strip. Presented as one section under one heading, they are the page's proof.
 *
 * AND IT HAS A HEADING NOW, which neither had. A section whose entire top is an
 * 11px eyebrow has no voice: it reads as a caption for whatever is beneath it
 * rather than as a claim in its own right. That was most of why both felt
 * skippable.
 */
export default function Proof() {
  return (
    <LightBand>
      <div className="py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-6">
          <SectionHeading
            eyebrow="The record"
            title="The seats we fill,"
            turn="and who trusts us to fill them."
          />
        </div>

        {/* The rails run full bleed, so they keep their edge masks and read as
            a belt passing through the page rather than as a box of text. */}
        <div className="mt-16">
          <PlacedPositions />
        </div>

        {/* A rule, not another band. The two halves are one argument, and a
            hairline says "and also" where a change of ground would say "new
            subject". */}
        <div className="mx-auto mt-16 max-w-[1280px] px-6">
          <div className="border-t border-[var(--v-border)] pt-16">
            <Clients />
          </div>
        </div>
      </div>
    </LightBand>
  );
}
