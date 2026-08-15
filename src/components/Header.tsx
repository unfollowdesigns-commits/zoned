"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Briefcase,
  Timer,
  Brackets,
  Presentation,
  Calculator,
  Laptop,
  Binoculars,
  TrendingUp,
  Coins,
  BrainCircuit,
  Building2,
  Landmark,
  HeartPulse,
  Newspaper,
  GitBranch,
  Accessibility,
  Paperclip,
  MessagesSquare,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { SPRING_SOFT, EASE } from "@/lib/motion";
import LinkedInIcon from "./LinkedInIcon";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  note?: string;
  badge?: string;
};

const whatWeDo: { heading: string; items: Item[] }[] = [
  {
    heading: "Search",
    items: [
      { label: "Executive Search", href: "/what-we-do/executive-search", icon: Search },
      { label: "Professional Search", href: "/what-we-do/professional-search", icon: Briefcase },
    ],
  },
  {
    heading: "Interim Solutions",
    items: [
      { label: "Interim Solutions", href: "/what-we-do/interim-solutions", icon: Timer },
      { label: "Fractional", href: "/what-we-do/fractional", icon: Brackets },
      { label: "Project Support & Expertise", href: "/what-we-do/project-support", icon: Presentation },
    ],
  },
];

const whoWeServeFunctions: Item[] = [
  { label: "Finance | Accounting", href: "/who-we-serve/finance-accounting", icon: Calculator },
  { label: "Technology | Digital | AI", href: "/who-we-serve/technology-digital-ai", icon: Laptop },
  { label: "Risk | Compliance", href: "/who-we-serve/risk-compliance", icon: Binoculars },
  { label: "Marketing | Revenue", href: "/who-we-serve/marketing-revenue", icon: TrendingUp },
];

const whoWeServeIndustries: Item[] = [
  { label: "Professional & Business Services", href: "/who-we-serve/professional-business-services", icon: Briefcase },
  { label: "Private Capital", href: "/who-we-serve/private-capital", icon: Coins },
  { label: "Tech, AI, & Digital Platforms", href: "/who-we-serve/tech-ai-digital-platforms", icon: BrainCircuit },
  { label: "GovCon & Public Sector", href: "/who-we-serve/govcon-public-sector", icon: Briefcase },
  { label: "Financial Services", href: "/who-we-serve/financial-services", icon: Building2 },
  { label: "Wealth Management", href: "/who-we-serve/wealth-management", icon: BrainCircuit },
  { label: "Real Estate, Construction, & Manufacturing", href: "/who-we-serve/real-estate-construction-manufacturing", icon: Landmark },
  { label: "Healthcare", href: "/who-we-serve/healthcare", icon: HeartPulse },
];

const resources: Item[] = [
  { label: "Blog", href: "/resources/blog", icon: Newspaper },
  { label: "Case Studies", href: "/resources/case-studies", icon: GitBranch },
  { label: "Current Opportunities", href: "/resources/current-opportunities", icon: Accessibility, badge: "New" },
];

const newTools: Item[] = [
  { label: "Resume Builder", href: "/resources/resume-builder", icon: Paperclip, note: "Level up your professional profile" },
  { label: "Job Description Engine", href: "/resources/job-description-engine", icon: MessagesSquare, note: "Build a better spec. Attract better candidates." },
];

const company: { label: string; href: string }[] = [
  { label: "About Us", href: "/about" },
  { label: "Meet Our Team", href: "/about/team" },
  { label: "Accolades", href: "/about/accolades" },
  { label: "Careers at DP", href: "/about/careers" },
];

const blogPosts: { title: string; date: string; href: string }[] = [
  {
    title: "Understanding the Big Picture to Get Ahead in Your Accounting Career",
    date: "Feb 13, 2020",
    href: "/resources/blog/understanding-the-big-picture-accounting-career",
  },
  {
    title: "District Partners Ranks No. 1 in Washington, D.C. on the 2023 Inc. 5000",
    date: "Mar 15, 2024",
    href: "/resources/blog/inc-5000-washington-dc-no-1",
  },
  {
    title: "The 5 Candidates Who Thrive as Independent Consultants, and the 2 Who Shouldn't",
    date: "Mar 5, 2026",
    href: "/resources/blog/candidates-who-thrive-as-independent-consultants",
  },
];

function IconTile({
  icon: Icon,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--v-border)] bg-white/[0.04] text-[var(--v-muted)] transition-colors group-hover:border-[var(--v-primary)]/50 group-hover:text-[var(--v-primary)]">
      <Icon size={18} strokeWidth={1.75} />
    </span>
  );
}

function NavLink({ item }: { item: Item }) {
  return (
    <Link
      href={item.href}
      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.05]"
    >
      <IconTile icon={item.icon} />
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 text-[14.5px] font-medium text-[var(--v-ink)]">
          {item.label}
          {item.badge && (
            <span className="rounded-full border border-[var(--v-primary)]/40 bg-[var(--v-primary)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--v-primary)]">
              {item.badge}
            </span>
          )}
        </span>
        {item.note && (
          <span className="mt-0.5 text-[13px] leading-snug text-[var(--v-muted)]">{item.note}</span>
        )}
      </span>
    </Link>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="v-eyebrow mb-3 border-b border-[var(--v-border)] pb-2.5">{children}</div>
  );
}

const NAV = ["What We Do", "Who We Serve", "Resources", "About"] as const;
type NavName = (typeof NAV)[number];

export default function Header() {
  const [open, setOpen] = React.useState<NavName | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLElement>(null);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <header
      ref={containerRef}
      className="v-bg2 sticky top-0 z-50 border-b border-[var(--v-border)] bg-[var(--v-bg-2)]/85 backdrop-blur-md"
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
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

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((name) => (
            <button
              key={name}
              type="button"
              className="relative rounded-full px-4 py-2 text-[14.5px] font-medium text-[var(--v-ink)] transition-colors hover:text-white"
              aria-expanded={open === name}
              onMouseEnter={() => {
                cancelClose();
                setOpen(name);
              }}
              onFocus={() => {
                cancelClose();
                setOpen(name);
              }}
              onClick={() => setOpen(open === name ? null : name)}
            >
              {open === name && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={SPRING_SOFT}
                />
              )}
              <span className="relative">{name}</span>
            </button>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="rounded-full bg-[var(--v-primary)] px-5 py-2.5 text-[14.5px] font-semibold text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-[var(--v-ring)] active:scale-[0.97]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-[var(--v-ink)] lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Desktop mega-menus */}
      <div
        className="hidden lg:block"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute left-0 right-0 top-full flex justify-center px-6"
            >
              <div className="g-glass mt-3 w-full max-w-[720px] overflow-hidden rounded-2xl p-6">
                {open === "What We Do" && (
                  <div className="grid grid-cols-2 gap-8">
                    {whatWeDo.map((col) => (
                      <div key={col.heading}>
                        <ColumnHeading>{col.heading}</ColumnHeading>
                        <div className="flex flex-col gap-1">
                          {col.items.map((item) => (
                            <NavLink key={item.label} item={item} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {open === "Who We Serve" && (
                  <div className="grid grid-cols-[1fr_1.6fr] gap-8">
                    <div>
                      <ColumnHeading>Functions</ColumnHeading>
                      <div className="flex flex-col gap-1">
                        {whoWeServeFunctions.map((item) => (
                          <NavLink key={item.label} item={item} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <ColumnHeading>Industries</ColumnHeading>
                      <div className="grid grid-cols-2 gap-x-4">
                        {whoWeServeIndustries.map((item) => (
                          <NavLink key={item.label} item={item} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {open === "Resources" && (
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <ColumnHeading>Resources</ColumnHeading>
                      <div className="flex flex-col gap-1">
                        {resources.map((item) => (
                          <NavLink key={item.label} item={item} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <ColumnHeading>New Tools</ColumnHeading>
                      <div className="flex flex-col gap-1">
                        {newTools.map((item) => (
                          <NavLink key={item.label} item={item} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {open === "About" && (
                  <div>
                    <div className="grid grid-cols-[1fr_1.4fr] gap-8">
                      <div className="flex flex-col">
                        <ColumnHeading>Company</ColumnHeading>
                        <div className="flex flex-col gap-1">
                          {company.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="rounded-xl px-2.5 py-2 text-[14.5px] font-medium text-[var(--v-ink)] transition-colors hover:bg-white/[0.05]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/contact"
                          className="mt-4 rounded-full bg-[var(--v-primary)] px-4 py-2.5 text-center text-[14px] font-semibold text-white transition-colors hover:bg-[var(--v-primary-deep)]"
                        >
                          Contact
                        </Link>
                      </div>
                      <div>
                        <ColumnHeading>From the Blog</ColumnHeading>
                        <div className="flex flex-col gap-3">
                          {blogPosts.map((post) => (
                            <Link
                              key={post.href}
                              href={post.href}
                              className="rounded-xl p-2 transition-colors hover:bg-white/[0.05]"
                            >
                              <p className="text-[13.5px] font-medium leading-snug text-[var(--v-ink)]">
                                {post.title}
                              </p>
                              <p className="mt-1 text-[12px] text-[var(--v-muted)]">{post.date}</p>
                            </Link>
                          ))}
                          <Link
                            href="/resources/blog"
                            className="px-2 text-[13px] font-semibold text-[var(--v-muted)] hover:text-[var(--v-primary)]"
                          >
                            All Articles
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="v-rule mt-5" />
                    <a
                      href="https://www.linkedin.com/company/district-partners"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-[13.5px] text-[var(--v-muted)] hover:text-[var(--v-ink)]"
                    >
                      <LinkedInIcon size={16} />
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden border-t border-[var(--v-border)] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              <MobileSection title="What We Do" items={whatWeDo.flatMap((c) => c.items)} />
              <MobileSection
                title="Who We Serve"
                items={[...whoWeServeFunctions, ...whoWeServeIndustries]}
              />
              <MobileSection title="Resources" items={[...resources, ...newTools]} />
              <div className="mt-2 flex items-center gap-1 py-2 text-[15px] font-semibold">
                <ArrowRight size={16} className="text-[var(--v-primary)]" />
                About
              </div>
              {company.map((item) => (
                <Link key={item.label} href={item.href} className="py-2 pl-6 text-[14px] text-[var(--v-muted)]">
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-3 rounded-full bg-[var(--v-primary)] px-5 py-3 text-center text-[15px] font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileSection({ title, items }: { title: string; items: Item[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-[var(--v-border)] py-1">
      <button
        type="button"
        className="flex w-full items-center justify-between py-2.5 text-[15px] font-semibold"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <ArrowRight
          size={16}
          className="text-[var(--v-primary)] transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-col pb-2">
              {items.map((item) => (
                <Link key={item.label} href={item.href} className="py-2 pl-6 text-[14px] text-[var(--v-muted)]">
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
