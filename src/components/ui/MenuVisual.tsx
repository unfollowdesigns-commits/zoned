/**
 * The picture in a nav panel. One per section, and each one means something.
 *
 * THE FIRST VERSION WAS MATERIAL WITHOUT MEANING. It was a cluster of glass
 * planes drifting in perspective: nice to look at, and it said nothing. Worse,
 * the same nothing would have been said in all four menus, so the only thing a
 * visitor could learn from it is that the site likes glass.
 *
 * THEY ARE BUILT FROM THE SAME TWO PARTS AS THE MARKS. See ui/Mark.tsx: RULES
 * are the structure of an organisation, NODES are seats in it, and a filled node
 * is the seat this firm is hired to fill. Reusing that grammar here is what
 * makes the icon set and the menu art one system rather than two decorations
 * that happen to share a palette. Nothing new is introduced.
 *
 * WHAT EACH ONE SAYS:
 *
 *   services  A structure with one seat empty, and a seat arriving to fill it.
 *             That is the whole of what the firm sells, in one loop.
 *   markets   A field of candidates, with a few resolving out of it. Mapping a
 *             market and finding the short list inside it.
 *   resources A record being read: sheets of ruled lines, the top one lifting
 *             away to the next.
 *   about     One centre connected outward, pulsing from the middle. Partner
 *             led: every engagement runs through the same people.
 *
 * ALL FOUR ARE CSS AND SVG, NO IMAGE AND NO JAVASCRIPT. A nav panel has to open
 * on the first frame; an asset fetched on first hover means the panel opens
 * empty and fills in a moment later, which is worse than having no picture.
 * Animation is declarative so nothing has to be started, stopped or cleaned up
 * when a menu opens and closes forty times in a session.
 */

type Kind = "services" | "markets" | "resources" | "about";

const VIEW = "0 0 200 150";

/** Shared glass and light definitions. Declared once per instance. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-pane`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#dceaff" stopOpacity="0.22" />
        <stop offset="55%" stopColor="#8fb4ff" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#5a82dc" stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e6efff" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#78c8ff" stopOpacity="0.35" />
      </linearGradient>
      <radialGradient id={`${id}-lamp`}>
        <stop offset="0%" stopColor="#6094ff" stopOpacity="0.34" />
        <stop offset="100%" stopColor="#6094ff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* ---- services: the seat arrives ------------------------------------------
   Three rules narrowing upward, the same figure as the Executive Search mark.
   Every seat is filled except the one at the top, and a seat descends into it,
   settles, and the loop restarts. */
function Services({ id }: { id: string }) {
  return (
    <svg viewBox={VIEW} className="dp-mv" aria-hidden="true">
      <Defs id={id} />
      <ellipse cx="100" cy="66" rx="78" ry="52" fill={`url(#${id}-lamp)`} />
      {/* The structure. */}
      <g className="dp-mv-rules">
        <path d="M74 46h52M52 78h96M32 110h136" />
      </g>
      {/* Seats already filled. */}
      <g className="dp-mv-seats">
        <rect x="74" y="74" width="8" height="8" rx="1.6" />
        <rect x="96" y="74" width="8" height="8" rx="1.6" />
        <rect x="118" y="74" width="8" height="8" rx="1.6" />
        <rect x="52" y="106" width="8" height="8" rx="1.6" />
        <rect x="80" y="106" width="8" height="8" rx="1.6" />
        <rect x="108" y="106" width="8" height="8" rx="1.6" />
        <rect x="136" y="106" width="8" height="8" rx="1.6" />
      </g>
      {/* The vacancy, and the seat that comes to fill it. */}
      <rect
        className="dp-mv-vacancy"
        x="93"
        y="39"
        width="14"
        height="14"
        rx="2.4"
      />
      <rect
        className="dp-mv-arriving"
        x="93"
        y="39"
        width="14"
        height="14"
        rx="2.4"
        fill={`url(#${id}-pane)`}
        stroke={`url(#${id}-edge)`}
      />
    </svg>
  );
}

/* ---- markets: the short list resolves -------------------------------------
   A field of candidates. Most stay quiet; a few resolve, hold, and fade back,
   on staggered clocks so the field is never still and never marching. */
function Markets({ id }: { id: string }) {
  const cols = 9;
  const rows = 6;
  /* Which cells resolve. Fixed, not random: a background that reshuffles on
     every render flickers through hydration and cannot be art-directed. */
  const picked = new Set([13, 22, 31, 25, 40]);
  return (
    <svg viewBox={VIEW} className="dp-mv" aria-hidden="true">
      <Defs id={id} />
      <ellipse cx="100" cy="75" rx="82" ry="54" fill={`url(#${id}-lamp)`} />
      <g className="dp-mv-field">
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const on = picked.has(i);
          return (
            <rect
              key={i}
              className={on ? "is-on" : undefined}
              x={26 + c * 18.5}
              y={30 + r * 17}
              width={on ? 8 : 5}
              height={on ? 8 : 5}
              rx={1.4}
              style={on ? { animationDelay: `${(i % 5) * 0.9}s` } : undefined}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ---- resources: the record ------------------------------------------------
   Sheets of ruled lines. The top one lifts away and the stack steps up, which
   is reading rather than decoration. */
function Resources({ id }: { id: string }) {
  return (
    <svg viewBox={VIEW} className="dp-mv" aria-hidden="true">
      <Defs id={id} />
      <ellipse cx="100" cy="72" rx="74" ry="50" fill={`url(#${id}-lamp)`} />
      <g className="dp-mv-sheets">
        {[0, 1, 2].map((i) => (
          <g key={i} className="dp-mv-sheet" style={{ animationDelay: `${i * -2.6}s` }}>
            <rect
              x="52"
              y="34"
              width="96"
              height="82"
              rx="7"
              fill={`url(#${id}-pane)`}
              stroke={`url(#${id}-edge)`}
            />
            <path
              className="dp-mv-lines"
              d="M66 56h68M66 70h68M66 84h44M66 98h56"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---- about: partner led ---------------------------------------------------
   One centre, connected outward, with the signal travelling from the middle.
   Every engagement runs through the same people. */
function About({ id }: { id: string }) {
  const outer = [
    [46, 44],
    [154, 44],
    [30, 100],
    [170, 100],
    [100, 126],
  ];
  return (
    <svg viewBox={VIEW} className="dp-mv" aria-hidden="true">
      <Defs id={id} />
      <ellipse cx="100" cy="80" rx="76" ry="52" fill={`url(#${id}-lamp)`} />
      <g className="dp-mv-spokes">
        {outer.map(([x, y], i) => (
          <path
            key={i}
            d={`M100 80 L${x} ${y}`}
            style={{ animationDelay: `${i * 0.42}s` }}
          />
        ))}
      </g>
      <g className="dp-mv-seats">
        {outer.map(([x, y], i) => (
          <rect key={i} x={x - 4} y={y - 4} width="8" height="8" rx="1.6" />
        ))}
      </g>
      <rect className="dp-mv-core" x="91" y="71" width="18" height="18" rx="3" />
    </svg>
  );
}

const BY_KIND: Record<Kind, (p: { id: string }) => React.ReactElement> = {
  services: Services,
  markets: Markets,
  resources: Resources,
  about: About,
};

export default function MenuVisual({
  kind,
  className = "",
}: {
  kind: Kind;
  className?: string;
}) {
  const Art = BY_KIND[kind];
  /* Gradient ids must be unique per instance or two panels on the page share
     one definition and the second silently renders unpainted. */
  const id = `mv-${kind}`;
  return (
    <div
      aria-hidden="true"
      /* `self-start` and a fixed ratio, both load bearing. A grid item stretches
         to its row by default, and the About panel's row is 775px tall because
         of the blog list beside it: the frame became a tall black column with
         the art squashed into a sliver in the middle of it. The picture has one
         correct shape and must keep it whatever it is put next to. */
      className={`dp-mv-frame relative aspect-[4/3] w-full self-start overflow-hidden rounded-[14px] bg-[#05070f] ${className}`}
    >
      <Art id={id} />
    </div>
  );
}
