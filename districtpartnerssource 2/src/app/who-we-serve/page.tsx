import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import { FUNCTIONS, INDUSTRIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who We Serve | District Partners",
  description:
    "The functions and industries District Partners serves, from finance and accounting to private capital, GovCon and healthcare.",
};

export default function WhoWeServePage() {
  return (
    <>
      <PageHero
        eyebrow="Who We Serve"
        title="The functions and industries we know closest."
        crumbs={[{ label: "Home", href: "/" }, { label: "Who We Serve" }]}
      />

      <Section title="Functions" className="py-14 sm:py-16">
        <NavLedger items={FUNCTIONS} />
      </Section>

      <Section title="Industries" className="py-14 sm:py-16">
        <NavLedger items={INDUSTRIES} />
      </Section>
    </>
  );
}
