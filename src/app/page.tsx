import Link from "@/components/SiteLink";
import Hero from "@/components/Hero";
import Clients from "@/components/Clients";
import Stats from "@/components/Stats";
import StickyServices from "@/components/StickyServices";
import PlacedPositions from "@/components/PlacedPositions";
import Reveal from "@/components/Reveal";
import LightBand from "@/components/ui/LightBand";

export default function Home() {
  return (
    <>
      <Hero />

      <Stats />

      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
        <Reveal>
          <h2
            className="v-display max-w-[16ch] text-balance"
            style={{ fontSize: "var(--t-display-fluid)", lineHeight: 1.02, letterSpacing: "-0.032em" }}
          >
            National Reach. Personal Touch.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-7 max-w-[46ch] text-[length:var(--t-body)] font-semibold leading-[1.5] text-[var(--v-primary-deep)]">
            When your business evolves, your talent strategy should too.
          </p>
        </Reveal>

        <div className="mt-10 grid max-w-[92ch] gap-6 md:grid-cols-2">
          <Reveal delay={0.14}>
            <p className="text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
              District Partners is an independent, partner-led firm built to serve clients
              wherever they need us most, bringing deep expertise to solve complex business
              challenges. Whether you&rsquo;re scaling after an acquisition, building a new
              function, navigating transformation, or filling a critical leadership gap, you
              need more than a recruiting firm. You need a talent infrastructure partner that
              can adapt as your needs evolve.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
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

      <Clients />

      <StickyServices />

      <PlacedPositions />

      <section className="mx-auto max-w-[1280px] px-6 pb-28">
        <Reveal>
          <div className="g-glass g-ring-accent flex flex-col items-start gap-6 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="v-eyebrow mb-3">Get Started</p>
              <h2 className="v-display max-w-[20ch] text-[length:var(--t-display-fluid)] leading-[1.15]">
                Let&rsquo;s talk about the roles that matter most.
              </h2>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-full bg-[var(--v-primary)] px-7 py-3.5 text-[length:var(--t-secondary)] font-semibold text-white transition-colors duration-200 hover:bg-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
            >
              Let&rsquo;s Talk
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
