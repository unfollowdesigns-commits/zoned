"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { whenReached } from "@/lib/in-view";
import { useReducedMotion } from "@/lib/motion";

/**
 * Which engagement you need, plotted.
 *
 * WHY THIS SECTION EXISTS, AND WHY IT IS NOT IN THE SUPPLIED DESIGN. The mock
 * for this page is seven stacked bands, each one text on a side and a box on
 * the other, and rebuilding it faithfully would have produced the shape this
 * project keeps deleting. The page's actual argument is not "here are three
 * services" but "there are three ways to engage us and which one you need
 * depends on your situation", and a list cannot make that argument: a list
 * says the three are alternatives of the same kind. A map says they occupy
 * different ground, which is the true and more useful thing.
 *
 * IT PLOTS NO NUMBERS, ON PURPOSE. Both axes are qualitative, and that is a
 * correctness constraint rather than a stylistic one: placing "38 days" on a
 * chart would be inventing a performance claim for a real firm. The only
 * timing on it is "days", which is District Partners' own wording for interim
 * deployment. The chart's content is POSITION, which is a design judgement the
 * firm can correct in one line, not a statistic presented as measured.
 *
 * THE COLOURS ARE THE LINK. Each service carries the same hue here as its card
 * above, so the eye connects the two without a connector line that would break
 * the moment the grid reflows. Same trick as the blog archive, where hue
 * carries the category.
 *
 * Interaction is a real crosshair, because that is what a plotted point
 * affords: hovering one drops rules to both axes and dims the others, so the
 * figure answers "where does this sit" rather than merely lighting up.
 */

type Spot = {
  label: string;
  href: string;
  colour: string;
  /** Plot coordinates, in the viewBox below. */
  x: number;
  y: number;
  /** The half-axes of its zone. A service covers ground, not a pinpoint. */
  rx: number;
  ry: number;
  note: string;
  /** The same reading the plot gives, in words. See the note on the legend. */
  where: string;
};

/* MEASURED, NOT GUESSED. The left margin was 96, which is narrower than the
   words that have to sit in it: "A permanent seat" is about 105 units at this
   size, so right-anchored at the axis it ran off the left edge of the viewBox
   and the rotated axis name landed on top of "A bridge". A y-axis margin is
   sized by its longest tick label plus room for the axis name beside it. */
const PLOT = { left: 178, right: 762, top: 44, bottom: 330 };

const SPOTS: Spot[] = [
  {
    label: "Interim Solutions",
    href: "/what-we-do/interim-solutions",
    colour: "#35b0d8",
    x: 288,
    y: 268,
    rx: 84,
    ry: 62,
    note: "Someone in the building now, until the permanent hire is in place.",
    where: "Days · a bridge",
  },
  {
    label: "Professional Search",
    href: "/what-we-do/professional-search",
    colour: "#5b93ff",
    x: 502,
    y: 158,
    rx: 92,
    ry: 68,
    note: "The management teams and individual contributors who execute the vision.",
    where: "Weeks · a permanent seat",
  },
  {
    label: "Executive Search",
    href: "/what-we-do/executive-search",
    colour: "#9b7bf0",
    x: 676,
    y: 106,
    rx: 76,
    ry: 52,
    note: "Board and C-suite appointments, retained.",
    where: "A considered process · a permanent seat",
  },
];

export default function EngagementMap() {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);

  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (reduced) {
      setReady(true);
      return;
    }
    /* The shared level-triggered checker, not an IntersectionObserver: an
       observer attached after hydration never fires for anything already
       scrolled past, which here would leave the figure permanently undrawn
       rather than merely un-animated. See lib/in-view.ts. */
    return whenReached(host, () => setReady(true));
  }, [reduced]);

  return (
    <div ref={ref} data-ready={ready || undefined} className="dp-map">
      {/* THE PLOT IS A WIDE-SCREEN INSTRUMENT AND IT SAYS SO. Its viewBox is
          800 units across, so on a 390px phone every label renders at about
          forty percent of its intended size: measured, the tick labels came
          out near six pixels and the whole figure was illegible. Scaling the
          type up inside the same box only trades illegible for collided,
          because the labels would then overlap the zones they annotate.

          So below `sm` the figure is not shown and the legend carries its
          reading in words instead. That is not a degradation: "Days, a bridge"
          IS what the plot says about interim work, and a sentence is a better
          instrument than a chart nobody can read. */}
      <svg
        viewBox="0 0 800 392"
        className="hidden w-full sm:block"
        role="img"
        aria-label="A map of the three engagement types, plotted by how quickly the seat is filled against whether the need is a bridge or a permanent appointment."
      >
        {/* ---- The frame ------------------------------------------------- */}
        {/* Gridlines first and faintest: a plot needs ground to be read
            against, and the ground must never compete with the points. */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={`v${f}`}
            className="dp-map-grid"
            x1={PLOT.left + (PLOT.right - PLOT.left) * f}
            x2={PLOT.left + (PLOT.right - PLOT.left) * f}
            y1={PLOT.top}
            y2={PLOT.bottom}
          />
        ))}
        {[0.33, 0.66].map((f) => (
          <line
            key={`h${f}`}
            className="dp-map-grid"
            x1={PLOT.left}
            x2={PLOT.right}
            y1={PLOT.top + (PLOT.bottom - PLOT.top) * f}
            y2={PLOT.top + (PLOT.bottom - PLOT.top) * f}
          />
        ))}

        {/* The two axes, drawn on: the figure builds itself when it arrives. */}
        <line
          className="dp-map-axis"
          x1={PLOT.left}
          y1={PLOT.bottom}
          x2={PLOT.right}
          y2={PLOT.bottom}
          pathLength={100}
        />
        <line
          className="dp-map-axis"
          x1={PLOT.left}
          y1={PLOT.bottom}
          x2={PLOT.left}
          y2={PLOT.top}
          pathLength={100}
        />

        {/* ---- Axis labels ------------------------------------------------ */}
        <text className="dp-map-axis-name" x={PLOT.left} y={PLOT.bottom + 34}>
          TIME TO PLACEMENT
        </text>
        <text className="dp-map-tick" x={PLOT.left} y={PLOT.bottom + 58}>
          Days
        </text>
        <text className="dp-map-tick" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 58} textAnchor="middle">
          Weeks
        </text>
        <text className="dp-map-tick" x={PLOT.right} y={PLOT.bottom + 58} textAnchor="end">
          A considered process
        </text>

        {/* Rotated about its own centre and set at the far left, clear of the
            tick labels: running it up the axis is the y-axis convention, and
            centring the rotation is what keeps it centred on the axis. */}
        <text
          className="dp-map-axis-name"
          x={26}
          y={(PLOT.top + PLOT.bottom) / 2}
          textAnchor="middle"
          transform={`rotate(-90 26 ${(PLOT.top + PLOT.bottom) / 2})`}
        >
          THE NEED
        </text>
        <text className="dp-map-tick" x={PLOT.left - 14} y={PLOT.bottom - 2} textAnchor="end">
          A bridge
        </text>
        <text className="dp-map-tick" x={PLOT.left - 14} y={PLOT.top + 10} textAnchor="end">
          A permanent seat
        </text>

        {/* ---- The three zones and their points --------------------------- */}
        {SPOTS.map((s, i) => {
          const dim = active !== null && active !== i;
          return (
            <g
              key={s.label}
              className="dp-map-spot"
              data-dim={dim || undefined}
              data-on={active === i || undefined}
              style={{ ["--c" as string]: s.colour, ["--i" as string]: i }}
            >
              {/* The ground the service covers. A point alone would say the
                  engagement is a single case; a zone says it is a range, which
                  is the honest shape of a service. */}
              <ellipse className="dp-map-zone" cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} />

              {/* The crosshair. Drawn only for the active spot, and it is what
                  makes this a plot rather than three labelled blobs: it answers
                  "where exactly does this sit on both axes". */}
              <line className="dp-map-cross" x1={s.x} y1={s.y} x2={s.x} y2={PLOT.bottom} />
              <line className="dp-map-cross" x1={s.x} y1={s.y} x2={PLOT.left} y2={s.y} />

              {/* The seat, in the house grammar: a filled node is a seat that
                  is placed. See ui/Mark.tsx. */}
              <rect className="dp-map-node" x={s.x - 6} y={s.y - 6} width={12} height={12} rx={2.5} />

              <text className="dp-map-label" x={s.x} y={s.y - 20} textAnchor="middle">
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* THE CONTROLS ARE REAL LINKS, NOT SVG HANDLERS. Hover on a plotted
          point is a nice affordance and a terrible only-affordance: it is
          unreachable by keyboard and by touch. The legend below is the actual
          interface, focusable and tappable, and it doubles as the key that
          ties each hue to its service. */}
      <ul className="mt-8 grid gap-2 sm:grid-cols-3 sm:gap-4">
        {SPOTS.map((s, i) => (
          <li key={s.label}>
            <Link
              href={s.href}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group flex gap-3 rounded-[12px] p-3 transition-colors duration-200 hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
            >
              <span
                aria-hidden="true"
                className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-[3px] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125"
                style={{ background: s.colour }}
              />
              <span className="min-w-0">
                <span className="block text-[length:var(--t-small)] font-semibold text-[var(--v-ink)]">
                  {s.label}
                </span>
                {/* The plot's reading, for the viewports that cannot show
                    the plot. Hidden where the figure itself is visible, so
                    nothing is stated twice. */}
                <span className="mt-1 block text-[length:var(--t-small)] font-medium text-[var(--c-where,var(--v-primary))] sm:hidden">
                  {s.where}
                </span>
                <span className="mt-1 block text-[length:var(--t-small)] leading-[1.55] text-[var(--v-muted)]">
                  {s.note}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
