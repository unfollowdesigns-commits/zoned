"use client";

import * as React from "react";
import { whenReached } from "@/lib/in-view";
import { useReducedMotion } from "@/lib/motion";
import { ICONS } from "@/components/icons";

/**
 * A line icon that draws itself, and redraws on hover.
 *
 * WHY THIS WRAPS THE ICONS ALREADY HERE RATHER THAN ADDING A LIBRARY. The
 * animated icon sets this is modelled on ship Lottie, which means lottie-web,
 * which is a quarter of a megabyte of JavaScript to decorate a marketing page.
 * These are stroked line icons: the animation they actually perform is the
 * stroke being drawn, and SVG has done that natively since forever. So the
 * icons stay the ones already in the bundle and gain the behaviour for a few
 * lines of CSS.
 *
 * HOW THE DASH TRICK WORKS, AND WHY pathLength IS THE WHOLE THING. Drawing a
 * stroke on means setting `stroke-dasharray` to the path's length and animating
 * `stroke-dashoffset` from that length to zero. The length is different for
 * every shape in every icon, which is normally why this needs a
 * `getTotalLength()` pass per element. Setting the `pathLength` attribute to 1
 * tells the renderer to treat that shape as being one unit long whatever its
 * real geometry, so a single rule of `stroke-dasharray: 1` fits every shape in
 * every icon, and each one takes the same time to draw regardless of size.
 *
 * IT FAILS OPEN, WHICH IS NOT OPTIONAL HERE. The dash rules are scoped to
 * `[data-ready]`, an attribute only this effect sets. If the JavaScript never
 * runs, the CSS never matches and the icons render as ordinary icons. Scoping
 * it the other way round would mean a hydration failure renders every icon on
 * the site invisible, which is a far worse outcome than a missing flourish and
 * would not show up in any screenshot taken with JavaScript working.
 *
 * The redraw is triggered from `data-draw-group` on an ancestor rather than
 * from the icon itself. A 19px target inside a 400px card is not the thing
 * anyone is pointing at, so the card is what arms it, and a keyboard focus on
 * the card does the same as a pointer.
 */

/** Every SVG shape lucide draws with. */
const GEOM = "path, circle, ellipse, line, polyline, polygon, rect";

export default function DrawIcon({
  name,
  size = 19,
  strokeWidth = 1.75,
  className = "",
  delay = 0,
}: {
  /** A key in components/icons.ts. A string, not a component: see that file. */
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** Seconds. Staggers a row or grid so they do not all draw at once. */
  delay?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const Icon = ICONS[name];

  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const svg = host.querySelector("svg");
    if (!svg) return;

    const parts = svg.querySelectorAll<SVGElement>(GEOM);
    if (parts.length === 0) return;
    parts.forEach((p, i) => {
      p.setAttribute("pathLength", "1");
      /* Index within the icon, so the shapes draw in sequence rather than all
         at once. An icon whose parts arrive together is a fade; one whose parts
         arrive in order reads as being drawn. */
      p.style.setProperty("--i", String(i));
    });
    host.dataset.ready = "true";

    if (reduced) {
      host.dataset.drawn = "true";
      return;
    }

    /* The shared level-triggered checker, not an IntersectionObserver. See
       lib/in-view.ts: an observer attached after hydration never fires for
       anything already scrolled past, which here would mean an icon that is
       permanently invisible rather than merely un-animated. */
    const stop = whenReached(host, () => {
      host.dataset.drawn = "true";
    });

    /* Redraw on the card, not on the icon. Removing the attribute and forcing a
       reflow before restoring it is what restarts a CSS transition; without the
       reflow the browser coalesces both writes and nothing happens. */
    const group = host.closest<HTMLElement>("[data-draw-group]");
    const replay = () => {
      if (!host.dataset.drawn) return;
      delete host.dataset.drawn;
      void host.offsetWidth;
      host.dataset.drawn = "true";
    };
    group?.addEventListener("pointerenter", replay);
    group?.addEventListener("focusin", replay);

    return () => {
      stop();
      group?.removeEventListener("pointerenter", replay);
      group?.removeEventListener("focusin", replay);
    };
  }, [reduced]);

  /* An unknown key renders nothing rather than crashing the page it is on. */
  if (!Icon) return null;

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`dp-draw ${className}`}
      style={{ ["--draw-delay" as string]: `${delay}s` }}
    >
      <Icon size={size} strokeWidth={strokeWidth} />
    </span>
  );
}
