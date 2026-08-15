import Link from "@/components/SiteLink";
import NavLedger from "@/components/ui/NavLedger";
import { SERVICES } from "@/lib/site";

export const metadata = { title: "Page not found | District Partners" };

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
      <p className="v-eyebrow mb-4">404</p>
      <h1 className="v-display max-w-[18ch] text-[length:var(--t-display-fluid)] leading-[1.05]">
        That page isn&rsquo;t here.
      </h1>
      <p className="mt-6 max-w-[54ch] text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
        The link may be out of date, or the page may not have been built yet. Everything we do
        is below.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-[var(--v-primary)] px-6 py-3 text-[length:var(--t-secondary)] font-semibold text-white transition-colors duration-200 hover:bg-[var(--v-primary-deep)]"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-[var(--v-border)] px-6 py-3 text-[length:var(--t-secondary)] font-medium transition-colors duration-200 hover:border-[var(--v-border-strong)]"
        >
          Get Started
        </Link>
      </div>

      <div className="mt-16">
        <NavLedger items={SERVICES} />
      </div>
    </section>
  );
}
