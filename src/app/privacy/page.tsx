import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import AwaitingCopy from "@/components/ui/AwaitingCopy";

export const metadata: Metadata = { title: "Privacy Policy | District Partners" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />
      <Section className="py-16 sm:py-20">
        <AwaitingCopy page="Privacy Policy">
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[var(--v-muted)]">
            A privacy policy is a legal document. It needs to come from the firm or its
            counsel rather than be drafted here.
          </p>
        </AwaitingCopy>
      </Section>
    </>
  );
}
