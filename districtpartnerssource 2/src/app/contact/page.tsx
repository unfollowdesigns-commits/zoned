import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import LinkedInIcon from "@/components/LinkedInIcon";
import { LINKEDIN_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | District Partners",
  description:
    "Talk to District Partners about executive search, professional search, interim solutions, fractional leadership and project support.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get Started"
        title="Let's talk about the roles that matter most."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="mx-auto max-w-[1280px] px-6 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-8">
              <div>
                <p className="v-eyebrow mb-3">Elsewhere</p>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[length:var(--t-secondary)] text-[var(--v-muted)] transition-colors hover:text-[var(--v-ink)]"
                >
                  <LinkedInIcon size={17} />
                  LinkedIn
                </a>
              </div>

              <hr className="v-rule" />

              <div>
                <p className="v-eyebrow mb-3">Note</p>
                <p className="max-w-[40ch] text-[length:var(--t-secondary)] leading-[1.7] text-[var(--v-muted)]">
                  Postal address, phone number and direct contacts are not published here yet.
                  Send them through and they will sit in this column.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
