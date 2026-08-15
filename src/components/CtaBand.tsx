import GlowButton from "@/components/ui/GlowButton";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * The page's closing call to action.
 *
 * A full-bleed lit dark band rather than a card. The card version reads as a
 * banner ad sitting inside the page; the band reads as the page arriving
 * somewhere, which is what a closing section is for. It is the same
 * `.v-dark-band` gradient the industries section uses, so the two dark moments
 * on the page are recognisably the same surface.
 *
 * Two actions, weighted. The filled pill is the one being asked for and the
 * outlined one is the way out for anyone not ready, which is most people. Two
 * equally-weighted buttons make the visitor choose before they have decided,
 * and the usual result is that they choose neither.
 */
export default function CtaBand({
  eyebrow = "Get Started",
  title = "Your next leader",
  turn = "is one conversation away.",
  lede,
  primary = { href: "/contact", label: "Let’s Talk" },
  secondary = { href: "/what-we-do", label: "See How We Work" },
}: {
  eyebrow?: string;
  title?: string;
  turn?: string;
  lede?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="v-dark-band">
      <div className="relative z-[1] mx-auto flex max-w-[1280px] flex-col gap-10 px-6 py-24 sm:py-28 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <SectionHeading eyebrow={eyebrow} title={title} turn={turn} lede={lede} />

        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:pb-2">
          <GlowButton href={primary.href}>{primary.label}</GlowButton>
          <GlowButton href={secondary.href} tone="quiet">
            {secondary.label}
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
