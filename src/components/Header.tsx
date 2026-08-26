"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, ArrowRight } from "lucide-react";
import { EASE, SPRING_SOFT, useReducedMotion } from "@/lib/motion";
import LinkedInIcon from "./LinkedInIcon";
import Logo from "./Logo";
import MenuVisual from "@/components/ui/MenuVisual";
import BubbleBackground from "@/components/ui/BubbleBackground";
import {
  WHAT_WE_DO_MENU,
  FUNCTIONS,
  INDUSTRIES,
  RESOURCES,
  NEW_TOOLS,
  COMPANY,
  BLOG_POSTS_BY_DATE,
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
 * already there and was being crowded by a picture of a briefcase.
 *
 * THE HOVER IS THE TYPE, NOT A SHAPE BEHIND IT. Two shapes were tried and both
 * were wrong for the same reason: a tinted rounded rectangle and a rule down
 * the left edge are both a decoration ABOUT the row rather than anything
 * happening to it, and they are what every generated menu reaches for first.
 *
 * Instead the row steps aside. The title slides right into a gutter that was
 * already reserved, an arrow takes the space it vacated, and the description
 * comes up from muted to readable. Nothing is drawn that was not already
 * there; the only new mark is the arrow, and an arrow beside a link is a
 * statement of where it goes rather than an ornament. It also means the row
 * has no edges to get wrong at any width.
 */
function MenuLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      className="group relative flex flex-col py-3 pl-7 pr-3"
    >
      {/* Sits in the gutter the title is about to move out of. */}
      <ArrowRight
        aria-hidden="true"
        size={13}
        className="pointer-events-none absolute left-1 top-[1.05rem] -translate-x-1.5 text-[var(--v-primary)] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
      />
      <span className="flex items-center gap-2 text-[length:var(--t-secondary)] font-medium text-[var(--v-ink)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
        {item.label}
        {item.badge && (
          <span className="rounded-full bg-[var(--v-primary)]/15 px-2 py-0.5 text-[length:var(--t-label)] font-semibold uppercase tracking-wide text-[var(--v-ring)]">
            {item.badge}
          </span>
        )}
      </span>
      {item.note && (
        <span className="mt-1 text-[length:var(--t-small)] leading-snug text-[var(--v-muted)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:text-[var(--v-ink)]/80">
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
  /* HONOURED HERE TOO, not only in the components that obviously move. The
     panels open, morph height and stagger their rows, which is exactly the
     class of motion the preference asks to be spared. Everything below
     collapses to a zero-duration transition when it is set, so the menus
     still function, they simply arrive. */
  const reduced = useReducedMotion();
  const [open, setOpen] = React.useState<NavName | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  /* False over the hero, true once past it, and it stays true. See the effect. */
  const [condensed, setCondensed] = React.useState(false);
  /* The open panel's content height, so the box can be animated to it. */
  const panelInner = React.useRef<HTMLDivElement>(null);
  const [panelH, setPanelH] = React.useState<number | null>(null);
  /**
   * Where the panel should grow FROM, as a percentage across its own width.
   *
   * A panel that scales from its centre appears to arrive from nowhere in
   * particular. Growing it from the item that was actually hovered is the
   * difference between a box appearing below the nav and THAT item opening,
   * and it costs one measurement taken at the moment of opening.
   */
  const [originPct, setOriginPct] = React.useState(50);

  const openFrom = React.useCallback((name: NavName, el: HTMLElement | null) => {
    if (el) {
      const r = el.getBoundingClientRect();
      /* The panel is centred and capped at 880, so its left edge is derivable
         without waiting for it to exist: measuring the panel itself would mean
         measuring a thing that has not rendered yet on the first open. */
      const w = Math.min(880, window.innerWidth - 32);
      const left = (window.innerWidth - w) / 2;
      setOriginPct(Math.max(4, Math.min(96, ((r.left + r.width / 2 - left) / w) * 100)));
    }
    setOpen(name);
  }, []);
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

  /**
   * Measures the open panel so its box can be animated between menus.
   *
   * WHY THIS IS MEASURED RATHER THAN framer's `layout`. `layout` was tried
   * first and did nothing: the panel still went 367px to 422px in a single
   * frame. The wrapper above animates `filter: blur()`, and a filter on an
   * ancestor creates a containing block, which breaks the layout projection
   * framer relies on to measure an element before and after. Rather than
   * unpick which ancestor property is safe, the height is a number this
   * component owns and animates, which cannot be defeated from outside.
   *
   * A ResizeObserver rather than a measurement on open, because the panels
   * contain a visual whose aspect ratio resolves after first paint and the
   * height would otherwise be captured a few pixels short.
   */
  React.useEffect(() => {
    const el = panelInner.current;
    if (!el) {
      setPanelH(null);
      return;
    }
    const measure = () => setPanelH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

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
              /* A LINK, NOT A BUTTON, AND THAT WAS A REAL DEAD END. Every
                 top level item opened a panel and went nowhere: clicking
                 "What We Do" toggled the menu, so the section landing pages
                 existed and could not be reached from the bar that names
                 them. A section header in a mega menu has to do both jobs,
                 which is the standard pattern: hover or focus opens the
                 panel, click navigates.

                 Keeping the panel open on click would be wrong too. The
                 navigation is happening, so the menu is closed here rather
                 than left hanging over the page that is arriving. */
              <Link
                key={name}
                href={SECTION_PREFIX[name]}
                className="relative rounded-full px-4 py-2 text-[length:var(--t-secondary)] font-medium text-[var(--v-ink)] transition-colors hover:text-white"
                aria-expanded={open === name}
                aria-current={active ? "page" : undefined}
                onMouseEnter={(e) => {
                  cancelClose();
                  openFrom(name, e.currentTarget);
                }}
                onFocus={(e) => {
                  cancelClose();
                  openFrom(name, e.currentTarget);
                }}
                onClick={() => setOpen(null)}
              >
                {open === name && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={reduced ? { duration: 0 } : SPRING_SOFT}
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
              </Link>
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
            /* THE PANEL UNFOLDS FROM THE ITEM YOU HOVERED.
            
               It used to fade, slide down six pixels and unblur, which is the
               entrance every generated dropdown ships with: it says a box has
               arrived, and says nothing about where it came from or what
               opened it. Scaling up from the trigger's own x position says
               THIS item opened, and the vertical scale makes it unfold rather
               than slide, which is what a panel attached to a bar should do.
            
               The blur is gone. A backdrop-blurred panel that also animates a
               `filter: blur()` is asking the compositor to blur a blur for a
               fifth of a second, and it was the one thing here that could drop
               frames on a laptop.
            
               In on a spring, out on a short curve. Opening is the moment worth
               shaping; closing should get out of the way, and a symmetric exit
               is what makes a menu feel slow to browse. */
            <motion.div
              style={{ transformOrigin: `${originPct}% top` }}
              initial={{ opacity: 0, scaleY: 0.86, scaleX: 0.97, y: -4 }}
              animate={{ opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.94, y: -4, transition: { duration: reduced ? 0 : 0.13, ease: EASE } }}
              transition={reduced ? { duration: 0 } : SPRING_SOFT}
              className="absolute left-0 right-0 top-full flex justify-center px-4"
            >
              {/* THE PANEL MORPHS BETWEEN MENUS INSTEAD OF SNAPPING.
              
                  Measured before this: moving from What We Do to About took the
                  panel from 367px to 422px in a single frame, with no
                  intermediate sizes at all. That hard cut is the difference
                  between a menu that feels built and one that feels assembled,
                  and it is the most visible moment in the whole navigation
                  because it happens every time anyone browses the menus.
              
                  `layout` lets framer measure before and after and interpolate
                  the box; the contents cross-fade inside it on a shorter clock
                  than the box takes to resize, so the new panel has arrived by
                  the time the box stops moving rather than sliding around after
                  it. A spring rather than a duration, because the panel is an
                  object changing size and springs are what give that weight. */}
              <motion.div
                /* The box springs to the new content's height. A spring rather
                   than a duration because this is an object changing size, and
                   the weight is what stops it reading as a swap. */
                animate={{ height: panelH ?? "auto" }}
                transition={reduced ? { duration: 0 } : SPRING_SOFT}
                className="g-glass relative mt-2 w-full max-w-[880px] overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#070a15]/88 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]"
              >
              {/* THE SAME DRIFTING FIELD THAT LIGHTS THE PAGE, INSIDE THE PANEL.
                  This was a flat near-black rectangle, the one surface on the
                  site with no light moving across it, and it is the surface
                  people look at most often and most directly. The contained
                  variant fills this box instead of the viewport; see the
                  is-contained rules for why the geometry is retuned rather
                  than reused. It sits under the content, not over it: the
                  rows below carry their own stacking context so nothing
                  legible is ever compositing against a moving glow. */}
              <BubbleBackground contained />

              {/* Padding lives on the measured element, not on the animated box:
                  the height being animated has to be the height being measured
                  or the two disagree by exactly the padding. */}
              <div ref={panelInner} className="relative z-10 p-5">
              <motion.div
                key={open}
                /* No exit. The outgoing panel leaving while the box is still
                   resizing puts two sets of content in a box that fits
                   neither; the new one fading in over the resize reads as one
                   move. The small delay lets the box commit to its new size
                   first. */
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.22, ease: EASE, delay: 0.04 }}
                /* Rows arrive in sequence rather than as one block. See the
                   dp-menu-stagger rules: the delay is per row within its
                   column, so the columns cascade together and the whole panel
                   fills in about a quarter of a second. */
                className="dp-menu-stagger"
              >
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
                              className="group relative py-2 pl-7 pr-3 text-[length:var(--t-secondary)] font-medium text-[var(--v-ink)]"
                            >
                              <ArrowRight
                                aria-hidden="true"
                                size={13}
                                className="pointer-events-none absolute left-1 top-[0.72rem] -translate-x-1.5 text-[var(--v-primary)] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
                              />
                              <span className="block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                                {item.label}
                              </span>
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
                        {/* THREE, NOT ALL NINE. Every post was being listed, which
                            made this panel taller than the viewport on a laptop
                            and turned a menu into a page. A menu's job is to
                            show the way in, so it carries the three most recent
                            and hands the rest to the archive, which is the
                            thing actually built for a long list.

                            REAL POSTS ONLY. Six of the nine entries are flagged
                            `placeholder`, meaning their titles are invented to
                            fill out the index; the post page for one says in as
                            many words that nothing on it came from District
                            Partners. Those are honest on a page that explains
                            itself and dishonest as a headline in the navigation,
                            where a visitor reads them as articles the firm
                            published. Sorted by date because "most recent" has
                            to be true, not just written in a comment. */}
                        <div className="flex flex-col gap-3">
                          {BLOG_POSTS_BY_DATE.filter((p) => !p.placeholder)
                            .slice(0, 3)
                            .map((post) => (
                            <Link
                              key={post.slug}
                              href={`/resources/blog/${post.slug}`}
                              className="group relative py-1.5 pl-7 pr-2"
                            >
                              <ArrowRight
                                aria-hidden="true"
                                size={13}
                                className="pointer-events-none absolute left-1 top-[0.62rem] -translate-x-1.5 text-[var(--v-primary)] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
                              />
                              <span className="block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                                <span className="block text-[length:var(--t-small)] font-medium leading-snug text-[var(--v-ink)]">
                                  {post.title}
                                </span>
                                <span className="mt-1 block text-[length:var(--t-small)] text-[var(--v-muted)]">
                                  {post.date}
                                </span>
                              </span>
                            </Link>
                          ))}
                          {/* No count. Nine would be counting six invented
                              entries as things the firm has published, and any
                              smaller number goes stale the moment the real
                              archive lands. */}
                          <Link
                            href="/resources/blog"
                            className="group mt-1 inline-flex items-center gap-1.5 pl-7 text-[length:var(--t-small)] font-semibold text-[var(--v-ring)]"
                          >
                            All articles
                            <ArrowRight
                              size={13}
                              className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                            />
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
              </motion.div>
              </div>
              </motion.div>
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
              <MobileSection
                title="What We Do"
                href="/what-we-do"
                items={SERVICES}
                pathname={pathname}
              />
              <MobileSection
                title="Who We Serve"
                href="/who-we-serve"
                items={[...FUNCTIONS, ...INDUSTRIES]}
                pathname={pathname}
              />
              <MobileSection
                title="Resources"
                href="/resources"
                items={[...RESOURCES, ...NEW_TOOLS]}
                pathname={pathname}
              />
              <MobileSection
                title="About"
                href="/about"
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

/**
 * One accordion in the mobile sheet.
 *
 * THE SECTION PAGE IS THE FIRST ROW INSIDE IT. On the desktop bar the section
 * title is itself a link, but on touch a title that navigates and also expands
 * is a coin toss for the person tapping it, so here the title keeps its one
 * job and the landing page gets an explicit row of its own. Without it the
 * four section pages are unreachable from the mobile menu entirely, which is
 * the same dead end the desktop bar had.
 */
function MobileSection({
  title,
  href,
  items,
  pathname,
}: {
  title: string;
  /** The section landing page, listed first inside the panel. */
  href: string;
  items: NavItem[];
  pathname: string;
}) {
  const [open, setOpen] = React.useState(false);
  /* Its own call: this is a separate component, so the page-level one is not
     in scope here. */
  const reduced = useReducedMotion();
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
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-col pb-2">
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`py-2.5 pl-6 text-[length:var(--t-secondary)] font-medium ${
                  pathname === href ? "text-[var(--v-primary)]" : "text-[var(--v-ink)]"
                }`}
              >
                {title} overview
              </Link>
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
