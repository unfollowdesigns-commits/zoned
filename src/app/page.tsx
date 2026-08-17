import VideoHero from "@/components/VideoHero";
import Stats from "@/components/Stats";
import StickyServices from "@/components/StickyServices";
import Specializations from "@/components/Specializations";
import PlacedPositions from "@/components/PlacedPositions";
import AskAI from "@/components/AskAI";
import Reveal from "@/components/Reveal";
import LightBand from "@/components/ui/LightBand";

/**
 * The homepage.
 *
 * The order is an argument, not a list of available components: who we are,
 * what it is worth, what we do, where we do it, at what level, then the ask.
 *
 * The close does two jobs in one band rather than two. A separate "ask an AI"
 * section followed by a separate call to action gives the page two endings,
 * and the second one always reads as the page not knowing when to stop.
 *
 * The grounds alternate, and the rule is that no two adjacent sections may
 * share one: dark, paper, dark, paper, dark, paper, dark.
 *
 * SO DOES THE ANATOMY, and that matters more. Five sections that all open
 * eyebrow, heading, lede, grid is what makes a page read as generated, however
 * good any one of them is: rhythm comes from sections being shaped differently,
 * not from alternating the colour behind the same shape. Two here deliberately
 * break it. This one leads with a statement and drops straight into two columns
 * of prose with no eyebrow at all, and the placed positions are a single running
 * paragraph rather than another grid of cards.
 */
export default function Home() {
  return (
    <>
      <VideoHero />

      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          {/* No eyebrow, no heading, no grid. The second break in the page's
              template: this section is two columns of prose with one sentence
              pulled out above them at display size, because what it has to do
              is be read, and an eyebrow-and-heading stack in front of body copy
              is furniture that delays the reading. */}
          <Reveal>
            <p
              className="v-display max-w-[26ch] text-balance"
              style={{
                fontSize: "var(--t-display-fluid)",
                lineHeight: "var(--lh-display-fluid)",
                letterSpacing: "var(--tr-display-fluid)",
              }}
            >
              When your business evolves,{" "}
              <span className="text-[var(--v-primary-deep)]">
                your talent strategy should too.
              </span>
            </p>
          </Reveal>

          {/* Wide gutter, narrow columns. Two paragraphs 2rem apart read as one
              block of text that happens to be broken in half; the reference
              runs a gutter wide enough that each column is its own object. */}
          <div className="mt-16 grid max-w-[100ch] gap-x-24 gap-y-12 md:grid-cols-2">
            <Reveal delay={0.1}>
              <p className="text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                District Partners is an independent, partner-led firm built to serve clients
                wherever they need us most, bringing deep expertise to solve complex business
                challenges. Whether you&rsquo;re scaling after an acquisition, building a new
                function, navigating transformation, or filling a critical leadership gap, you
                need more than a recruiting firm. You need a talent infrastructure partner that
                can adapt as your needs evolve.
              </p>
            </Reveal>

            <Reveal delay={0.17}>
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

      <Specializations />

      <Stats />

      <StickyServices />

      <PlacedPositions />

      <AskAI />
    </>
  );
}
