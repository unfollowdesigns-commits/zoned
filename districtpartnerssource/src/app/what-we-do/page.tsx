import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import { WHAT_WE_DO_MENU } from "@/lib/site";

export const metadata: Metadata = {
  title: "What We Do | District Partners",
  description:
    "Executive search, professional search, interim solutions, fractional leadership and project support from District Partners.",
};

export default function WhatWeDoPage() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Search and interim solutions, under one partner."
        crumbs={[{ label: "Home", href: "/" }, { label: "What We Do" }]}
      />

      {WHAT_WE_DO_MENU.map((group) => (
        <Section key={group.heading} title={group.heading} className="py-14 sm:py-16">
          <NavLedger items={group.items} />
        </Section>
      ))}
    </>
  );
}
