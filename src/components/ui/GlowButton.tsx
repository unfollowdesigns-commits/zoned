import * as React from "react";
import Link from "@/components/SiteLink";
import { ArrowRight } from "lucide-react";

/**
 * The site's actions.
 *
 * One component so that every call to action on the site is the same object.
 * The moment these are hand-rolled per section they drift, and a page with
 * three slightly different primary buttons reads as three different sites.
 *
 * THE LIGHT IS A COMET ON THE EDGE, NOT A HALO BEHIND THE PILL. The first
 * version put a blurred copy of the shape behind the button and brightened it
 * on hover. On a dark ground, three of those in a row is a wall of blue bloom
 * that is genuinely painful to look at, and the effect grows worse the more
 * buttons a section has, which is exactly backwards. The house treatment is a
 * single point of light travelling around the one-pixel stroke: it reads as
 * energy without adding any area of brightness at all, and six of them on
 * screen cost the same as one. See `.v-edge` in kit/styles/03-effects.css, and
 * kit/components/EdgeButton.tsx for the structure this mirrors.
 *
 * The trail is four separate points a few hundredths of a second apart rather
 * than one long streak, because a rigid streak cannot bend around the caps of
 * a pill. All of it is decorative and hidden from assistive technology.
 */

const TRAIL = [0, 1, 2, 3];

/** The travelling edge light. Decorative, so it carries no semantics. */
function EdgeLight() {
  return (
    <>
      <span aria-hidden="true" className="v-edge-glow">
        <i />
      </span>
      <span aria-hidden="true" className="v-edge-ring">
        {TRAIL.map((i) => (
          <i key={i} />
        ))}
      </span>
    </>
  );
}

export default function GlowButton({
  href,
  children,
  tone = "accent",
  external = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  /** `accent` is the filled blue pill; `quiet` is the edge-lit companion. */
  tone?: "accent" | "quiet";
  external?: boolean;
  className?: string;
}) {
  const base =
    "group relative inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 " +
    "text-[length:var(--t-action)] font-semibold outline-none " +
    "focus-visible:ring-2 focus-visible:ring-[var(--v-ring)] focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-[var(--v-bg)]";

  const skin =
    tone === "accent"
      ? // A contained inner highlight and a tight shadow, not a bloom. The pill
        // is already the brightest object in its section; it does not need to
        // light the paint around it as well.
        "bg-[linear-gradient(180deg,var(--v-primary),var(--v-primary-deep))] text-white " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_8px_20px_-10px_rgba(47,95,214,0.7)] " +
        "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] " +
        "hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.28)_inset,0_12px_26px_-10px_rgba(47,95,214,0.85)] " +
        "active:translate-y-0"
      : "v-edge text-[var(--v-ink)]/85 transition-colors duration-200 hover:text-[var(--v-ink)]";

  const inner = (
    <>
      {tone === "quiet" && <EdgeLight />}
      <span className="relative inline-flex items-center gap-2.5">
        {children}
        <ArrowRight
          size={17}
          strokeWidth={2.2}
          aria-hidden="true"
          className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
        />
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} ${skin} ${className}`}
      >
        {inner}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${skin} ${className}`}>
      {inner}
    </Link>
  );
}
