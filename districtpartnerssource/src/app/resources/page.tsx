import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import { RESOURCES, NEW_TOOLS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources | District Partners",
  description:
    "Articles, case studies, current opportunities, and tools from District Partners.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Reading, openings, and tools."
        crumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      />

      <Section title="Resources" className="py-14 sm:py-16">
        <NavLedger items={RESOURCES} />
      </Section>

      <Section title="New Tools" className="py-14 sm:py-16">
        <NavLedger items={NEW_TOOLS} />
      </Section>
    </>
  );
}
