import Link from "@/components/SiteLink";
import LinkedInIcon from "./LinkedInIcon";

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "What We Do",
    links: [
      { label: "Executive Search", href: "/what-we-do/executive-search" },
      { label: "Professional Search", href: "/what-we-do/professional-search" },
      { label: "Interim Solutions", href: "/what-we-do/interim-solutions" },
      { label: "Fractional", href: "/what-we-do/fractional" },
      { label: "Project Support & Expertise", href: "/what-we-do/project-support" },
    ],
  },
  {
    heading: "Who We Serve",
    links: [
      { label: "Finance | Accounting", href: "/who-we-serve/finance-accounting" },
      { label: "Technology | Digital | AI", href: "/who-we-serve/technology-digital-ai" },
      { label: "Risk | Compliance", href: "/who-we-serve/risk-compliance" },
      { label: "Marketing | Revenue", href: "/who-we-serve/marketing-revenue" },
      { label: "Private Capital", href: "/who-we-serve/private-capital" },
      { label: "GovCon & Public Sector", href: "/who-we-serve/govcon-public-sector" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/resources/blog" },
      { label: "Case Studies", href: "/resources/case-studies" },
      { label: "Current Opportunities", href: "/resources/current-opportunities" },
      { label: "Resume Builder", href: "/resources/resume-builder" },
      { label: "Job Description Engine", href: "/resources/job-description-engine" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Meet Our Team", href: "/about/team" },
      { label: "Accolades", href: "/about/accolades" },
      { label: "Careers at DP", href: "/about/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--v-border)] bg-[var(--v-bg-2)]/60">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5" aria-label="District Partners home">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--v-primary)] text-white">
                <span className="v-display text-[15px] leading-none">DP</span>
              </span>
              <span className="v-display text-[15px] leading-none tracking-tight">
                DISTRICT
                <br />
                PARTNERS
              </span>
            </Link>
            <p className="mt-5 max-w-[30ch] text-[13.5px] leading-[1.6] text-[var(--v-muted)]">
              An independent, partner-led firm built to serve clients wherever they need us
              most.
            </p>
            <a
              href="https://www.linkedin.com/company/district-partners"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[13.5px] text-[var(--v-muted)] transition-colors hover:text-[var(--v-ink)]"
            >
              <LinkedInIcon size={16} />
              LinkedIn
            </a>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="v-eyebrow mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] leading-[1.5] text-[var(--v-muted)] transition-colors hover:text-[var(--v-ink)]"
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

        <div className="flex flex-col gap-3 text-[13px] text-[var(--v-muted)] sm:flex-row sm:items-center sm:justify-between">
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
