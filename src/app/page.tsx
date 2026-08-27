import CinematicHero from "@/components/CinematicHero";
import SearchConsole from "@/components/SearchConsole";
import ClientStripe from "@/components/ClientStripe";
import Stats from "@/components/Stats";
import StickyServices from "@/components/StickyServices";
import Specializations from "@/components/Specializations";
import AskAI from "@/components/AskAI";
import Testimonials from "@/components/Testimonials";
import Proof from "@/components/Proof";
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
      <CinematicHero />

      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          {/* No eyebrow, no heading. The second break in the page's template:
              this section is a statement, the prose that argues it, and the
              machinery that does it, side by side. An eyebrow-and-heading stack
              in front of body copy is furniture that delays the reading.

              THE COPY RUNS IN ONE COLUMN, NOT TWO. It used to be two equal
              columns across the full width, which reads as a wall: a hundred
              character measure doubled up guarantees the section is skimmed,
              and being read is this section's whole job. One column at a sane
              measure, and the space beside it carries the argument instead of
              carrying nothing. */}
          <div className="grid items-start gap-x-20 gap-y-16 lg:grid-cols-[1fr_minmax(0,420px)]">
            <div>
              <Reveal>
                <p
                  className="v-display max-w-[24ch] text-balance"
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

              <div className="mt-12 grid max-w-[62ch] gap-8">
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
                    We understand that our success isn&rsquo;t measured by the people we place or
                    the professionals we deploy, but by the outcomes and impact we help our clients
                    achieve. We&rsquo;re proud to{" "}
                    <strong className="font-semibold text-[var(--v-ink)]">
                      partner with teams building something great
                    </strong>
                    .
                  </p>
                </Reveal>
              </div>
            </div>

            {/* The claim, as machinery. The paragraph beside it says the firm
                adapts as a client's needs evolve; this is the stack that does
                the adapting, running a search end to end on a loop. See
                components/SearchConsole: every label in it is the firm's own,
                off The DP Difference.

                `lg` only, and by measurement rather than taste: everything
                inside it is sized in container query units, so under about
                340px of column width its labels fall below nine pixels, and a
                picture of the work nobody can read is worse than the section
                without one. */}
            <Reveal delay={0.24}>
              <div className="hidden w-full justify-self-end lg:block">
                <SearchConsole />
              </div>
            </Reveal>
          </div>

          {/* The names behind the copy above, on the first scroll. Ambient
              here, the readable record in the proof band below: see the note
              in ClientStripe. */}
          <Reveal delay={0.22}>
            <div className="mt-20">
              <ClientStripe />
            </div>
          </Reveal>
        </div>
      </LightBand>

      <Specializations />

      <Stats />

      <StickyServices />

      {/* One band of evidence rather than two thin strips. The seats we fill
          and the firms we fill them for were separate cream sections of 306px
          and 479px stacked directly on each other, which broke the alternation
          and left the middle of the page flat. See components/Proof. */}
      <Proof />

      {/* Renders nothing until lib/proof.ts has a real named quote in it. The
          slot is wired so content appears the moment it exists, and the page
          reads correctly without it rather than showing an empty promise. */}
      <Testimonials />

      <AskAI />
    </>
  );
}
