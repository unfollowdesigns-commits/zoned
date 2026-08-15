"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { SPRING_SOFT, EASE } from "@/lib/motion";
import { ICONS } from "@/components/icons";
import LinkedInIcon from "./LinkedInIcon";
import Logo from "./Logo";
import {
  WHAT_WE_DO_MENU,
  FUNCTIONS,
  INDUSTRIES,
  RESOURCES,
  NEW_TOOLS,
  COMPANY,
  BLOG_POSTS,
  SERVICES,
  LINKEDIN_URL,
  type NavItem,
} from "@/lib/site";

const NAV = ["What We Do", "Who We Serve", "Resources", "About"] as const;
type NavName = (typeof NAV)[number];

/** Which top-level menu owns a given pathname, for the active indicator. */
const SECTION_PREFIX: Record<NavName, string> = {
  "What We Do": "/what-we-do",
  "Who We Serve": "/who-we-serve",
  Resources: "/resources",
  About: "/about",
};

function MenuLink({ item }: { item: NavItem }) {
  const Icon = item.icon ? ICONS[item.icon] : undefined;
  return (
    <Link
      href={item.href}
      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.05]"
    >
      {Icon && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--v-border)] bg-white/[0.04] text-[var(--v-muted)] transition-colors group-hover:border-[var(--v-primary)]/50 group-hover:text-[var(--v-primary)]">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      )}
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
  return <div className="v-eyebrow mb-3 border-b border-[var(--v-border)] pb-2.5">{children}</div>;
}

export default function Header() {
  const [open, setOpen] = React.useState<NavName | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLElement>(null);
  const pathname = usePathname();

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  // Any navigation closes both menus. Adjusting during render rather than in an
  // effect is React's documented pattern for reacting to a changed value: it
  // avoids the extra commit an effect would cause, and covers browser back as
  // well as link clicks.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
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
      className="sticky top-0 z-50 border-b border-[var(--v-border)] bg-[var(--v-bg-2)]/85 backdrop-blur-md"
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <Link href="/" aria-label="District Partners home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((name) => {
            const active = pathname.startsWith(SECTION_PREFIX[name]);
            return (
              <button
                key={name}
                type="button"
                className="relative rounded-full px-4 py-2 text-[14.5px] font-medium text-[var(--v-ink)] transition-colors hover:text-white"
                aria-expanded={open === name}
                aria-current={active ? "true" : undefined}
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
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 -bottom-px h-px bg-[var(--v-primary)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="rounded-full bg-[var(--v-primary)] px-5 py-2.5 text-[14.5px] font-semibold text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--v-primary-deep)] active:scale-[0.97]"
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
      <div className="hidden lg:block" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
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
                    {WHAT_WE_DO_MENU.map((col) => (
                      <div key={col.heading}>
                        <ColumnHeading>{col.heading}</ColumnHeading>
                        <div className="flex flex-col gap-1">
                          {col.items.map((item) => (
                            <MenuLink key={item.href} item={item} />
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
                        {FUNCTIONS.map((item) => (
                          <MenuLink key={item.href} item={item} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <ColumnHeading>Industries</ColumnHeading>
                      <div className="grid grid-cols-2 gap-x-4">
                        {INDUSTRIES.map((item) => (
                          <MenuLink key={item.label} item={item} />
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
                        {RESOURCES.map((item) => (
                          <MenuLink key={item.href} item={item} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <ColumnHeading>New Tools</ColumnHeading>
                      <div className="flex flex-col gap-1">
                        {NEW_TOOLS.map((item) => (
                          <MenuLink key={item.href} item={item} />
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
                          {COMPANY.map((item) => (
                            <Link
                              key={item.href}
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
                          {BLOG_POSTS.map((post) => (
                            <Link
                              key={post.slug}
                              href={`/resources/blog/${post.slug}`}
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
                      href={LINKEDIN_URL}
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
            <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto px-6 py-4">
              <MobileSection title="What We Do" items={SERVICES} pathname={pathname} />
              <MobileSection
                title="Who We Serve"
                items={[...FUNCTIONS, ...INDUSTRIES]}
                pathname={pathname}
              />
              <MobileSection
                title="Resources"
                items={[...RESOURCES, ...NEW_TOOLS]}
                pathname={pathname}
              />
              <MobileSection
                title="About"
                items={[...COMPANY, { label: "Contact", href: "/contact" }]}
                pathname={pathname}
              />
              <Link
                href="/contact"
                className="mt-4 rounded-full bg-[var(--v-primary)] px-5 py-3 text-center text-[15px] font-semibold text-white"
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

function MobileSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-[var(--v-border)] py-1">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-[15px] font-semibold"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <ChevronRight
          size={17}
          aria-hidden="true"
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
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`py-2.5 pl-6 text-[14px] ${
                      active ? "text-[var(--v-primary)]" : "text-[var(--v-muted)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
