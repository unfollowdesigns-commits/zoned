import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import StickyServices from "@/components/StickyServices";
import Industries from "@/components/Industries";
import PlacedPositions from "@/components/PlacedPositions";
import CtaBand from "@/components/CtaBand";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import LightBand from "@/components/ui/LightBand";

/**
 * The homepage.
 *
 * The order is an argument, not a list of available components: who we are,
 * what it is worth, what we do, where we do it, at what level, then the ask.
 *
 * The grounds alternate, and the rule is that no two adjacent sections share
 * one. Paper for the two sections that are mostly reading, the lit dark band
 * for the two that are mostly looking. Three paper sections in a row would stop
 * being a joint in the page and start being a second website.
 */
export default function Home() {
  return (
    <>
      <Hero />

      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          <SectionHeading
            eyebrow="About District Partners"
            title="National reach."
            turn="Personal touch."
            lede="When your business evolves, your talent strategy should too."
          />

          <div className="mt-12 grid max-w-[92ch] gap-8 md:grid-cols-2">
            <Reveal delay={0.2}>
              <p className="text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                District Partners is an independent, partner-led firm built to serve clients
                wherever they need us most, bringing deep expertise to solve complex business
                challenges. Whether you&rsquo;re scaling after an acquisition, building a new
                function, navigating transformation, or filling a critical leadership gap, you
                need more than a recruiting firm. You need a talent infrastructure partner that
                can adapt as your needs evolve.
              </p>
            </Reveal>

            <Reveal delay={0.27}>
              <p className="text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                We understand that our success isn&rsquo;t measured by the people we place or the
                professionals we deploy, but by the outcomes and impact we help our clients
                achieve. We&rsquo;re proud to{" "}
                <strong className="font-semibold text-[var(--v-ink)]">
                  partner with teams building something great
                </strong>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </LightBand>

      <Industries />

      <Stats />

      <PlacedPositions />

      <StickyServices />

      <CtaBand />
    </>
  );
}
