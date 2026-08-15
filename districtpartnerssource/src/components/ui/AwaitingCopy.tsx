import Link from "@/components/SiteLink";
import Reveal from "@/components/Reveal";

/**
 * Explicit stand-in for a page whose copy has not been supplied yet.
 *
 * Deliberately not filler prose: inventing body text for a real firm would put
 * claims in their mouth. This states plainly that the page is scaffolded and
 * what it is waiting for, and stays out of the way once real copy lands.
 */
export default function AwaitingCopy({
  page,
  children,
}: {
  page: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="v-well rounded-[var(--radius)] p-8 sm:p-10">
        <p className="v-eyebrow mb-3">Awaiting copy</p>
        <h2 className="v-display text-[19px] leading-[1.3]">
          The {page} page is built and routed. Its wording is not written yet.
        </h2>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[var(--v-muted)]">
          Layout, navigation, typography and motion for this page follow the same
          system as the rest of the site. Send the real text for this page and it
          drops into this slot without any further design work.
        </p>
        {children}
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-[var(--v-primary)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[var(--v-primary-deep)]"
          >
            Get Started
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--v-border)] px-5 py-2.5 text-[14px] font-medium transition-colors duration-200 hover:border-[var(--v-border-strong)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
