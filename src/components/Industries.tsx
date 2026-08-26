import Link from "@/components/SiteLink";
import { ArrowUpRight } from "lucide-react";
import { INDUSTRIES } from "@/lib/site";
import { ICONS } from "@/components/icons";
import GlowButton from "@/components/ui/GlowButton";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * The industries, on a lit dark ground.
 *
 * This is the section that answers "do they know my world", so it earns the
 * page's strongest surface: the `.v-dark-band` gradient, which is the same
 * device the reference sites use and the one most often left out. A dark
 * section with a flat background is a black rectangle; the two off-centre
 * radials give it a lit side and a shadowed side, and that alone is most of the
 * difference between a section that looks designed and one that looks default.
 *
 * The cards are the quiet part on purpose. Against a lit ground they only need
 * a hairline and a hover, and anything more competes with the gradient they are
 * sitting on.
 */
export default function Industries() {
  return (
    <section className="v-dark-band">
      <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
        <SectionHeading
          eyebrow="Who We Serve"
          title="Industries"
          turn="we know deeply."
          lede="Eight sectors we work in every week, and the operators, boards and sponsors inside them."
          /* Split row. The heading gets its own column and can therefore be
             much larger than it could be with a paragraph sitting under it. */
          aside={
            <GlowButton href="/who-we-serve" className="mt-7">
              See every market
            </GlowButton>
          }
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-16">
          {INDUSTRIES.map((industry, i) => {
            const Icon = ICONS[industry.icon ?? "briefcase"];
            return (
              <Reveal key={industry.href} delay={Math.min(i, 5) * 0.06}>
                <Link
                  href={industry.href}
                  className="group flex h-full items-center gap-5 rounded-[20px] bg-white/[0.055] p-6 transition-colors duration-300 hover:bg-white/[0.09] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)] sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--v-primary)]/14 text-[var(--v-ring)] transition-colors duration-300 group-hover:bg-[var(--v-primary)]/25"
                  >
                    {Icon ? <Icon size={19} strokeWidth={1.7} /> : null}
                  </span>
                  <span className="v-display min-w-0 flex-1 text-[length:var(--t-heading)] leading-[1.25]">
                    {industry.label}
                  </span>
                  <ArrowUpRight
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--v-muted)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--v-ink)]"
                  />
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
