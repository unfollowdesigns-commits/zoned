"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

// Figures as published on the District Partners homepage.
const STATS = [
  { value: "1,100+", label: "Professionals delivered to 187 clients" },
  { value: "30+", label: "Clients who've engaged us 5+ times" },
  { value: ">90%", label: "Of clients through referrals" },
  { value: "100%", label: "Placement on retainers" },
];

export default function Stats() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 pb-4 pt-16 sm:pt-20">
      <motion.h2
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="v-display mb-12 text-center text-[clamp(1.75rem,4.5vw,2.6rem)] leading-[1.1]"
      >
        Our <em className="not-italic font-extrabold italic">performance</em> speaks for itself
      </motion.h2>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.value}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.07, 0.3) }}
            className="text-center"
          >
            <dt className="v-display text-[clamp(2.25rem,5.5vw,3.25rem)] leading-none">
              {stat.value}
            </dt>
            <dd className="mx-auto mt-3 max-w-[22ch] text-[13.5px] leading-[1.6] text-[var(--v-muted)]">
              <span aria-hidden="true" className="text-[var(--v-primary)]">
                &rarr;{" "}
              </span>
              {stat.label}
            </dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
