import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import Reveal from "@/components/Reveal";
import Stats from "@/components/Stats";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us | District Partners",
  description:
    "District Partners is an independent, partner-led firm built to serve clients wherever they need us most.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="National Reach. Personal Touch."
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <section className="mx-auto max-w-[1280px] px-6 py-16 sm:py-20">
        <div className="flex max-w-[68ch] flex-col gap-6">
          <Reveal>
            <p className="text-[16px] font-semibold italic leading-[1.6] text-[var(--v-ink)]">
              When your business evolves, your talent strategy should too.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[16.5px] leading-[1.75] text-[var(--v-muted)]">
              District Partners is an independent, partner-led firm built to serve clients
              wherever they need us most, bringing deep expertise to solve complex business
              challenges. Whether you&rsquo;re scaling after an acquisition, building a new
              function, navigating transformation, or filling a critical leadership gap, you
              need more than a recruiting firm. You need a talent infrastructure partner that
              can adapt as your needs evolve.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
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

      <Stats />

      <Section title="More about the firm" className="py-16 sm:py-20">
        <NavLedger items={COMPANY.filter((c) => c.href !== "/about")} />
      </Section>
    </>
  );
}
