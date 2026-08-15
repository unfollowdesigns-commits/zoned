import Link from "@/components/SiteLink";
import LinkedInIcon from "./LinkedInIcon";
import Logo from "./Logo";
import { FOOTER_COLUMNS, LINKEDIN_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--v-border)] bg-[var(--v-bg-2)]/60">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label="District Partners home">
              <Logo />
            </Link>
            <p className="mt-5 max-w-[30ch] text-[length:var(--t-small)] leading-[1.6] text-[var(--v-muted)]">
              An independent, partner-led firm built to serve clients wherever they need us
              most.
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[length:var(--t-small)] text-[var(--v-muted)] transition-colors hover:text-[var(--v-ink)]"
            >
              <LinkedInIcon size={16} />
              LinkedIn
            </a>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="v-eyebrow mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[length:var(--t-small)] leading-[1.5] text-[var(--v-muted)] transition-colors hover:text-[var(--v-ink)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="v-rule my-10" />

        <div className="flex flex-col gap-3 text-[length:var(--t-small)] text-[var(--v-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} District Partners. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-[var(--v-ink)]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--v-ink)]">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
