import { STATS } from "@/lib/site";
import Reveal from "@/components/Reveal";

export default function Stats() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 pb-4 pt-16 sm:pt-20">
      <Reveal>
        <h2 className="v-display mb-12 text-center text-[clamp(1.75rem,4.5vw,2.6rem)] leading-[1.1]">
          Our <em className="not-italic font-extrabold italic">performance</em> speaks for itself
        </h2>
      </Reveal>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.value} delay={i * 0.07} className="text-center">
            <div>
              <dt className="v-display text-[clamp(2.25rem,5.5vw,3.25rem)] leading-none">
                {stat.value}
              </dt>
              <dd className="mx-auto mt-3 max-w-[22ch] text-[13.5px] leading-[1.6] text-[var(--v-muted)]">
                <span aria-hidden="true" className="text-[var(--v-primary)]">
                  &rarr;{" "}
                </span>
                {stat.label}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
