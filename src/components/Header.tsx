"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { EASE, SPRING_SOFT } from "@/lib/motion";
import LinkedInIcon from "./LinkedInIcon";
import Logo from "./Logo";
import MenuVisual from "@/components/ui/MenuVisual";
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

/**
 * A row in a menu panel.
 *
 * NO ICON, AND THAT IS THE FIX RATHER THAN A SIMPLIFICATION. Each row used to
 * carry a rounded tile with a stock line glyph in it: a magnifier for search, a
 * briefcase for professional, a stopwatch for interim. Those glyphs are not
 * drawn for this firm and they are not drawn for each other, so the set reads as
 * a stock icon pack rather than as one house, and a magnifier next to the word
 * "Search" adds nothing a reader did not already have.
 *
 * What replaces it is the line of copy that says what the service IS, which was
 * already there and was being crowded by a picture of a briefcase. A rule that
 * appears on the left edge on hover marks the active row instead: it belongs to
 * the type, it costs no artwork, and it cannot look borrowed.
 */
function MenuLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      className="group relative flex flex-col rounded-[13px] py-3 pl-4 pr-3 transition-colors duration-200 hover:bg-white/[0.06]"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-0 top-3 w-[2px] origin-top scale-y-0 rounded-full bg-[var(--v-primary)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
      />
      <span className="flex items-center gap-2 text-[length:var(--t-secondary)] font-medium text-[var(--v-ink)]">
        {item.label}
        {item.badge && (
          <span className="rounded-full bg-[var(--v-primary)]/15 px-2 py-0.5 text-[length:var(--t-label)] font-semibold uppercase tracking-wide text-[var(--v-ring)]">
            {item.badge}
          </span>
        )}
      </span>
      {item.note && (
        <span className="mt-1 text-[length:var(--t-small)] leading-snug text-[var(--v-muted)]">
          {item.note}
        </span>
      )}
    </Link>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return <div className="v-eyebrow mb-2 px-3">{children}</div>;
}

export default function Header() {
  const [open, setOpen] = React.useState<NavName | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  /* False over the hero, true once past it, and it stays true. See the effect. */
  const [condensed, setCondensed] = React.useState(false);
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

  /**
   * The header condenses once you leave the hero, and stays condensed.
   *
   * OVER THE HERO IT IS BARELY THERE: full measure, no fill, no edge, so the
   * picture behind it is the thing you see. Past the hero there is content
   * under it that has to stay readable, so it pulls in, takes a ground and an
   * edge, and lifts off the page. One transition, in one direction, at the one
   * moment the page changes character.
   *
   * THE THRESHOLD HAS HYSTERESIS. Condensing and expanding at the same scroll
   * position means a single pixel of wheel jitter at the boundary flips the
   * header back and forth, which is the classic version of this effect and it
   * looks broken. Expanding needs 90px more travel than condensing did, so the
   * boundary can never be sat on.
   *
   * Reading scrollY inside a rAF rather than in the listener: with Lenis the
   * scroll position is interpolated and fires often, and the state only needs to
   * be correct once per frame.
   */
  React.useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const y = window.scrollY;
      /* Tied to the viewport so a tall hero and a short interior header both
         hand over at roughly their own end, and capped so a very tall screen
         does not leave the header expanded halfway down the page. */
      const enter = Math.min(window.innerHeight * 0.45, 360);
      setCondensed((was) => (was ? y > enter - 90 : y > enter));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      /* A DETACHED ISLAND, NOT A BAR ACROSS THE TOP.

         The old header was full width with a border along the bottom, which
         pinned the logo to one corner of a 1440px screen and the button to the
         other, 1170px apart, with nothing between them but air. That reads as a
         browser chrome rather than as part of the page. Contained and floated,
         the same elements become one object: the eye takes the nav in as a
         single thing, and the page visibly passes BEHIND it, which is what
         makes a site feel like it has layers.

         No bottom border, on purpose. A rule across the full width would put
         back the exact line this is getting rid of. */
      className="sticky top-0 z-50 px-4 pt-3 sm:pt-4"
      onMouseLeave={scheduleClose}
    
      /* Anchors the header through a page transition. See the
         ::view-transition-group(site-header) rules in globals.css: without a
         name it is part of the root snapshot and dissolves with the page. */
      style={{ viewTransitionName: "site-header" }}
    >
      <div
        className={`mx-auto flex items-center justify-between gap-4 rounded-[17px] border pl-5 pr-2 backdrop-blur-xl transition-[max-width,height,background-color,border-color,box-shadow] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          condensed
            ? "h-[58px] max-w-[1040px] border-white/[0.08] bg-[#070a15]/80 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.95)]"
            : "h-[70px] max-w-[1280px] border-transparent bg-transparent shadow-none"
        }`}
      >
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
                className="relative rounded-full px-4 py-2 text-[length:var(--t-secondary)] font-medium text-[var(--v-ink)] transition-colors hover:text-white"
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
                  /* A dot, not an underline. The underline was positioned
                     against the old bar's bottom edge; inside a rounded island
                     it sat off the shape entirely. */
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-[var(--v-primary)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="rounded-[12px] bg-[var(--v-primary)] px-4 py-2 text-[length:var(--t-secondary)] font-semibold text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--v-primary-deep)] active:scale-[0.97]"
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
              className="absolute left-0 right-0 top-full flex justify-center px-4"
            >
              <div className="g-glass mt-2 w-full max-w-[880px] overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#070a15]/92 p-5 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]">
                {open === "What We Do" && (
                  /* Links left, picture right, which is the reference's shape.
                     The panel is wider than the others because it is carrying a
                     visual; the rest stay at their own natural width. */
                  <div className="grid grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className="grid grid-cols-2 gap-6">
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
                    <MenuVisual kind="services" />
                  </div>
                )}

                {open === "Who We Serve" && (
                  <div className="grid grid-cols-[0.62fr_1.05fr_0.82fr] gap-6">
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
                    <MenuVisual kind="markets" />
                  </div>
                )}

                {open === "Resources" && (
                  <div className="grid grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className="grid grid-cols-2 gap-6">
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
                    <MenuVisual kind="resources" />
                  </div>
                )}

                {open === "About" && (
                  <div>
                    <div className="grid grid-cols-[0.66fr_1.05fr_0.82fr] gap-6">
                      <div className="flex flex-col">
                        <ColumnHeading>Company</ColumnHeading>
                        <div className="flex flex-col gap-1">
                          {COMPANY.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="rounded-xl px-2.5 py-2 text-[length:var(--t-secondary)] font-medium text-[var(--v-ink)] transition-colors hover:bg-white/[0.05]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/contact"
                          className="mt-4 rounded-full bg-[var(--v-primary)] px-4 py-2.5 text-center text-[length:var(--t-secondary)] font-semibold text-white transition-colors hover:bg-[var(--v-primary-deep)]"
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
                              <p className="text-[length:var(--t-small)] font-medium leading-snug text-[var(--v-ink)]">
                                {post.title}
                              </p>
                              <p className="mt-1 text-[length:var(--t-small)] text-[var(--v-muted)]">{post.date}</p>
                            </Link>
                          ))}
                          <Link
                            href="/resources/blog"
                            className="px-2 text-[length:var(--t-small)] font-semibold text-[var(--v-muted)] hover:text-[var(--v-primary)]"
                          >
                            All Articles
                          </Link>
                        </div>
                      </div>
                      <MenuVisual kind="about" />
                    </div>
                    <div className="v-rule mt-5" />
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-[length:var(--t-small)] text-[var(--v-muted)] hover:text-[var(--v-ink)]"
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
                className="mt-4 rounded-full bg-[var(--v-primary)] px-5 py-3 text-center text-[length:var(--t-secondary)] font-semibold text-white"
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
        className="flex w-full items-center justify-between py-3 text-[length:var(--t-secondary)] font-semibold"
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
                    className={`py-2.5 pl-6 text-[length:var(--t-secondary)] ${
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
