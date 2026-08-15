import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import AwaitingCopy from "@/components/ui/AwaitingCopy";
import { FUNCTIONS, INDUSTRIES } from "@/lib/site";

const ALL = [
  ...FUNCTIONS.map((i) => ({ ...i, kind: "Function" as const })),
  ...INDUSTRIES.map((i) => ({ ...i, kind: "Industry" as const })),
];

function find(slug: string) {
  return ALL.find((s) => s.href === `/who-we-serve/${slug}`);
}

export function generateStaticParams() {
  // Two industries share an href-free duplicate label upstream; dedupe by slug.
  const slugs = new Set(ALL.map((s) => s.href.split("/").pop()!));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = find(slug);
  if (!entry) return {};
  return {
    title: `${entry.label} | District Partners`,
    description: `${entry.kind === "Function" ? "Talent solutions for" : "Search and interim solutions in"} ${entry.label}, from District Partners.`,
  };
}

export default async function AudiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = find(slug);
  if (!entry) notFound();

  const siblings = (entry.kind === "Function" ? FUNCTIONS : INDUSTRIES).filter(
    (s) => s.href !== entry.href,
  );

  return (
    <>
      <PageHero
        eyebrow={entry.kind}
        title={entry.label}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Who We Serve", href: "/who-we-serve" },
          { label: entry.label },
        ]}
      />

      <Section className="py-16 sm:py-20">
        <AwaitingCopy page={entry.label} />
      </Section>

      <Section
        title={entry.kind === "Function" ? "Other functions" : "Other industries"}
        className="py-14 sm:py-16"
      >
        <NavLedger items={siblings} />
      </Section>
    </>
  );
}
