import Link from "@/components/SiteLink";
import Hero from "@/components/Hero";
import Clients from "@/components/Clients";
import Stats from "@/components/Stats";
import WhatWeDo from "@/components/WhatWeDo";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Hero />

      {/* Sits outside the hero (which clips its own overflow) so the planet's
          flat bottom edge dissolves into the page ground instead of ending on
          a hard line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-32 bg-gradient-to-b from-[#03050e] to-transparent"
      />

      <section className="mx-auto max-w-[1280px] px-6 pb-24 pt-12 sm:pb-24 sm:pt-16">
        <Reveal>
          <h2 className="v-display text-center text-[clamp(1.9rem,5vw,2.75rem)] leading-[1.1]">
            National Reach. Personal Touch.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mx-auto mt-8 max-w-[56ch] text-center text-[16px] font-semibold italic leading-[1.6] text-[var(--v-ink)]">
            When your business evolves, your talent strategy should too.
          </p>
        </Reveal>

        <div className="mx-auto mt-8 flex max-w-[68ch] flex-col gap-6">
          <Reveal delay={0.14}>
            <p className="text-[16.5px] leading-[1.75] text-[var(--v-muted)]">
              District Partners is an independent, partner-led firm built to serve clients
              wherever they need us most, bringing deep expertise to solve complex business
              challenges. Whether you&rsquo;re scaling after an acquisition, building a new
              function, navigating transformation, or filling a critical leadership gap, you
              need more than a recruiting firm. You need a talent infrastructure partner that
              can adapt as your needs evolve.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[16.5px] leading-[1.75] text-[var(--v-muted)]">
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
      </section>

      <Clients />

      <Stats />

      <WhatWeDo />

      <section className="mx-auto max-w-[1280px] px-6 pb-28">
        <Reveal>
          <div className="g-glass g-ring-accent flex flex-col items-start gap-6 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="v-eyebrow mb-3">Get Started</p>
              <h2 className="v-display max-w-[20ch] text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.15]">
                Let&rsquo;s talk about the roles that matter most.
              </h2>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-full bg-[var(--v-primary)] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
            >
              Let&rsquo;s Talk
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
