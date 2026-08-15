/**
 * A paper section.
 *
 * Dropping to warm off-white for a section gives a long page joints: you can
 * feel where one argument ends and the next begins, and it makes the dark
 * sections read as a deliberate choice rather than as the only option.
 *
 * The part that gets skipped, and that this component exists to prevent:
 * paper sections need their own atmosphere. The dark sections sit on an
 * aurora, a dot field and grain. Dropping to paper and losing all of that
 * makes the light bands read as a different, flatter website. The three layers
 * below are the same ones inverted.
 *
 * Rules that come with it:
 *   - Never more than two paper sections in a page. A third stops being a
 *     joint and starts being a second website.
 *   - The accent darkens for paper. The blue that reads well on near-black is
 *     weak on cream, so `.v-light` swaps the eyebrow to --v-primary-deep.
 *   - Seam the boundary, so the join reads as deliberate.
 */
export default function LightBand({
  children,
  className = "",
  seam = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Hairline of accent at the top and bottom edges. */
  seam?: boolean;
}) {
  return (
    <section className={`v-light ${seam ? "v-paper-seam" : ""} ${className}`}>
      <div aria-hidden="true" className="v-paper-dots" />
      <div aria-hidden="true" className="v-paper-bloom v-paper-bloom-a" />
      <div aria-hidden="true" className="v-paper-bloom v-paper-bloom-b" />
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}
