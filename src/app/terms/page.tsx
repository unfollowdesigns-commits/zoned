import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import AwaitingCopy from "@/components/ui/AwaitingCopy";

export const metadata: Metadata = { title: "Terms of Use | District Partners" };

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="Terms of Use"
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms of Use" }]}
      />
      <Section className="py-16 sm:py-20">
        <AwaitingCopy page="Terms of Use">
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[var(--v-muted)]">
            Terms of use are a legal document. They need to come from the firm or its
            counsel rather than be drafted here.
          </p>
        </AwaitingCopy>
      </Section>
    </>
  );
}
