import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * A third-party tool, framed as part of the site.
 *
 * WHAT THIS IS FOR. District Partners runs its interactive tools on a separate
 * host. Linking out to them loses the visitor to a page with no navigation and
 * no way back; pasting a bare iframe in drops an unstyled rectangle into a
 * designed page. This frames the tool the way the rest of the site frames its
 * own content, so the tool reads as part of the product rather than as a
 * detour.
 *
 * IT ALWAYS SHIPS ITS OWN ESCAPE HATCH. A cross-origin frame can fail in ways
 * this page cannot detect: the host can send X-Frame-Options or a frame
 * ancestors policy, a corporate proxy can block it, and a browser in strict
 * tracking-prevention mode can refuse third-party storage the tool needs to
 * work. In every one of those the frame renders empty and no error reaches the
 * parent. So the direct link sits under it always, not as a fallback that has
 * to be triggered: a visitor looking at a blank frame has somewhere to go
 * without needing anyone to have anticipated why.
 *
 * `loading="lazy"` because the tool is heavier than the page around it and
 * nobody scrolling past should pay for it, and the frame is given a real
 * height rather than being auto-sized: cross-origin frames cannot report their
 * content height, so a resize handshake is impossible without cooperation from
 * the other end.
 */
export default function ToolEmbed({
  src,
  title,
  minHeight = 760,
}: {
  /** The tool's URL. */
  src: string;
  /** Names the frame for assistive technology. Required, not decorative. */
  title: string;
  /** Floor for short viewports; the frame is otherwise viewport-relative. */
  minHeight?: number;
}) {
  return (
    <div>
      <div
        className="relative overflow-hidden rounded-[20px] bg-white shadow-[0_30px_70px_-45px_rgba(16,23,40,0.6)] ring-1 ring-inset ring-[var(--v-ink)]/[0.08]"
        style={{ height: "78vh", minHeight }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          className="h-full w-full border-0"
          /* No allow-same-origin: the tool is a separate origin and nothing
             here needs to reach into it. Forms and scripts are what it is for;
             popups let it open its own results. */
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <p className="mt-4 text-[length:var(--t-small)] text-[var(--v-muted)]">
        Not loading, or want it in its own tab?{" "}
        <Link
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 font-medium text-[var(--v-primary-deep)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
        >
          Open the tool directly
          <ArrowUpRight
            size={13}
            strokeWidth={2.2}
            aria-hidden="true"
            className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </p>
    </div>
  );
}
