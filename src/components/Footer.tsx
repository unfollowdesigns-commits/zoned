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

      </div>

      {/* THE NAME, EDGE TO EDGE.

          It used to sit inside the 1280px column with a rule above and below,
          which made it one more block in a stack of blocks. The reference ends
          on the name running the full width of the window, and the reason it
          works is that nothing else on the page is allowed to be that size:
          the jump from 14px legal type to a word as wide as the screen is the
          whole effect, and a container around it caps exactly that jump. So it
          breaks out of the column, takes a small side gutter and nothing else,
          and the rule above it is gone. One hairline, under it, before the
          legal line. */}
      <div className="px-4 sm:px-6">
        <div className="v-footer-wordmark" aria-hidden="true">
          <span>DISTRICT PARTNERS</span>
        </div>
      </div>

      <div className="border-t border-[var(--v-border)]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-6 pb-12 pt-6 text-[length:var(--t-small)] text-[var(--v-muted)] sm:flex-row sm:items-center sm:justify-between sm:pr-32">
          {/* Compact and quiet. The legal line is the one part of a footer
              nobody is looking for, so it gets no more room than it needs. */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>District Partners &copy; {new Date().getFullYear()}</p>
            <Link href="/terms" className="transition-colors hover:text-[var(--v-ink)]">
              Terms of Use
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[var(--v-ink)]">
              Privacy Policy
            </Link>
          </div>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="District Partners on LinkedIn"
            className="text-[var(--v-muted)] transition-colors hover:text-[var(--v-ink)]"
          >
            <LinkedInIcon size={17} />
          </a>
        </div>
      </div>
    </footer>
  );
}
