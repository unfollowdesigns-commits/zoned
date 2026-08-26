import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import LightBand from "@/components/ui/LightBand";
import ToolEmbed from "@/components/ui/ToolEmbed";
import GlowButton from "@/components/ui/GlowButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { CardArt } from "@/components/ui/PostArt";
import Reveal from "@/components/Reveal";

/**
 * The Job Description Engine.
 *
 * A HAND BUILT ROUTE, WHICH IS WHY IT SITS HERE RATHER THAN IN [slug]. A
 * static segment beats a dynamic sibling in the App Router, so this file wins
 * over /resources/[slug] for this path the same way /resources/blog does. The
 * dynamic route's list is filtered to match, because leaving it in there would
 * have it prerendering a second, unreachable copy of this page.
 *
 * The tool itself runs on a separate host and is framed rather than linked
 * out to: see ui/ToolEmbed for why, and for the escape hatch it always ships.
 */

const TOOL_URL = "https://ccckaandve.zite.so";

export const metadata: Metadata = {
  title: "Job Description Engine | District Partners",
  description:
    "Explore our custom tool to create job descriptions for all your search needs quickly and easily.",
};

export default function JobDescriptionEnginePage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Job Description Engine"
        standfirst="Explore our custom tool to create job descriptions for all your search needs quickly and easily."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: "Job Description Engine" },
        ]}
      />

      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-16 sm:py-20">
          <Reveal>
            <ToolEmbed src={TOOL_URL} title="District Partners Job Description Engine" />
          </Reveal>
        </div>
      </LightBand>

      {/* The tool is the page, so the close is short: one reason to talk to a
          person, and a route back into the rest of the site. */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto grid max-w-[1280px] items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="After the spec"
              title="A good description"
              turn="is where a search starts."
              lede="It is not where one finishes. When the seat matters enough to get the wording right, it usually matters enough to have a partner run the search."
            />
            <Reveal delay={0.12}>
              <div className="mt-9 flex flex-wrap gap-3">
                <GlowButton href="/contact">Let&rsquo;s Talk</GlowButton>
                <GlowButton href="/what-we-do" tone="quiet">
                  See What We Do
                </GlowButton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <div className="dp-art-hover relative aspect-[5/4] overflow-hidden rounded-[20px] ring-1 ring-inset ring-white/[0.08]">
              <CardArt seed="job-description-engine" motif="terraces" colour="#43b98e" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
