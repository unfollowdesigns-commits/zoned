import * as React from "react";
import Link from "@/components/SiteLink";
import { ArrowRight } from "lucide-react";

/**
 * The site's primary action.
 *
 * One component so that every primary call to action on the site is the same
 * object: same radius, same glow, same arrow behaviour. The moment these are
 * hand-rolled per section they drift, and a page with three slightly different
 * primary buttons reads as three different sites.
 *
 * The glow itself is `.v-glow` in globals.css: a blurred copy of the shape
 * behind the pill, not a box-shadow, so it can bloom past its own edge.
 */
export default function GlowButton({
  href,
  children,
  tone = "accent",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  /** `accent` is the filled blue pill; `quiet` is the outlined companion. */
  tone?: "accent" | "quiet";
  className?: string;
}) {
  const base =
    "group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[length:var(--t-action)] font-semibold " +
    "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]";

  const skin =
    tone === "accent"
      ? "v-glow bg-[var(--v-primary)] text-white hover:bg-[var(--v-primary-deep)]"
      : "border border-[var(--v-border-strong)] text-[var(--v-ink)] hover:border-[var(--v-primary)]";

  return (
    <Link href={href} className={`${base} ${skin} ${className}`}>
      {children}
      <ArrowRight
        size={17}
        strokeWidth={2.2}
        aria-hidden="true"
        className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
      />
    </Link>
  );
}
