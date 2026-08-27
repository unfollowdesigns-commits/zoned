/**
 * The house marks.
 *
 * WHY NOT A STOCK ICON SET. The site was using lucide, mapped as literally as
 * possible: a calculator for Finance, a laptop for Technology, binoculars for
 * Risk, a stopwatch for Interim. Two things are wrong with that and neither is
 * fixable by swapping which stock glyph is used.
 *
 * First, the mapping carries no information. A reader who sees a calculator
 * beside the word "Finance" has learned nothing; the word already said it. An
 * icon earns its place by making a set SCANNABLE, and a set is only scannable
 * if the marks differ in shape rather than in subject.
 *
 * Second, and this is the part that reads as generic: a stock set is drawn for
 * everyone, so its members are not drawn for each other. A calculator, a laptop
 * and a pair of binoculars come from three different pictorial worlds, and no
 * amount of consistent stroke weight makes them a family. The eye reads
 * "assorted clip art" instantly and correctly.
 *
 * THE GRAMMAR. Every mark below is built from exactly two elements: RULES,
 * which are the structure of an organisation, and NODES, which are seats in it.
 * Exactly one node in each mark is filled, and that is the seat this firm is
 * being hired to fill. Nothing else is allowed in. That constraint is what
 * makes nine marks read as one set: they are not nine pictures of nine things,
 * they are nine arrangements of the same two parts.
 *
 * It also means the marks say something true. The pyramid with the top node
 * filled IS executive search. The same pyramid with the middle node filled IS
 * professional search. A reader who never consciously decodes it still sees
 * that those two are related and that one sits above the other.
 *
 * CONSTRUCTION IS FIXED so the set stays a set: a 24 unit box, 1.5 stroke,
 * round caps and joins, nodes are 3 unit squares, and rules stop at 5 and 19 so
 * every mark has the same optical margin. A new mark that breaks any of these
 * will look wrong beside the others, which is the point of writing them down.
 */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** A seat. Filled means "this is the one being placed". */
function Node({ x, y, on = false }: { x: number; y: number; on?: boolean }) {
  return (
    <rect
      /* Classed so a mark can animate its seats separately from its structure
         without anything having to know which mark it is. See .dp-mm in
         globals.css: the rules widen into place and then the seat lands, which
         is the same order of events every figure on this site uses. */
      className="m-node"
      x={x - 1.5}
      y={y - 1.5}
      width={3}
      height={3}
      rx={0.6}
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
    />
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      {children}
    </svg>
  );
}

/* ---- Services ------------------------------------------------------------ */

/** A narrowing structure with the TOP seat filled. */
function ExecutiveSearch() {
  return (
    <Box>
      <path d="M9.5 6.5h5M7 12h10M5 17.5h14" {...S} />
      <Node x={12} y={6.5} on />
    </Box>
  );
}

/** The same structure, the seat one level down. */
function ProfessionalSearch() {
  return (
    <Box>
      <path d="M9.5 6.5h5M7 12h10M5 17.5h14" {...S} />
      <Node x={12} y={12} on />
    </Box>
  );
}

/** A seat held under a broken arc: covered, and not permanently. */
function Interim() {
  return (
    <Box>
      <path d="M5 18h14" {...S} />
      <path d="M6 11a6 6 0 0 1 12 0" {...S} strokeDasharray="2.6 2.4" />
      <Node x={12} y={11} on />
    </Box>
  );
}

/** A seat filled in part. The node is half solid, which is the whole idea. */
function Fractional() {
  return (
    <Box>
      <path d="M5 18h14" {...S} />
      <rect x={10} y={9} width={4} height={4} rx={0.8} {...S} />
      <path d="M10 9h2v4h-2z" fill="currentColor" stroke="none" />
      <path d="M12 4v3" {...S} />
    </Box>
  );
}

/** A bounded scope with a filled seat inside it. */
function ProjectSupport() {
  return (
    <Box>
      <rect x={4.5} y={5.5} width={15} height={13} rx={2} {...S} />
      <path d="M8 12h8" {...S} />
      <Node x={8} y={12} />
      <Node x={12} y={12} on />
      <Node x={16} y={12} />
    </Box>
  );
}

/* ---- Functions ----------------------------------------------------------- */

/** Columns on a baseline. A ledger, and the tallest column is the seat. */
function FinanceAccounting() {
  return (
    <Box>
      <path d="M5 18.5h14M8 18.5v-4M12 18.5v-7M16 18.5v-2.5" {...S} />
      <Node x={12} y={9} on />
    </Box>
  );
}

/** One seat branching to two. A structure that divides. */
function Technology() {
  return (
    <Box>
      <path d="M12 8v3M12 11H7.5v3.5M12 11h4.5v3.5" {...S} />
      <Node x={12} y={6.5} on />
      <Node x={7.5} y={16} />
      <Node x={16.5} y={16} />
    </Box>
  );
}

/** A seat inside a boundary. Brackets are control. */
function RiskCompliance() {
  return (
    <Box>
      <path d="M8.5 5.5H5.5v13h3M15.5 5.5h3v13h-3" {...S} />
      <Node x={12} y={12} on />
    </Box>
  );
}

/** A rising line that arrives at a seat. */
function Revenue() {
  return (
    <Box>
      <path d="M5 17.5h4.5V12H14V7h3.5" {...S} />
      <Node x={19} y={7} on />
    </Box>
  );
}

/**
 * Keyed by the same strings lib/site.ts already uses, so the data does not move.
 *
 * A key with no mark renders nothing rather than falling back to a stock glyph.
 * That is deliberate: the eight industry tiles carry no mark, because eight more
 * arrangements of two parts would stop being distinguishable and the set would
 * lose the thing that makes it a set. Their names do that work on their own.
 */
export const MARKS: Record<string, () => React.ReactElement> = {
  search: ExecutiveSearch,
  briefcase: ProfessionalSearch,
  timer: Interim,
  brackets: Fractional,
  presentation: ProjectSupport,
  calculator: FinanceAccounting,
  laptop: Technology,
  binoculars: RiskCompliance,
  trending: Revenue,
};

export function hasMark(name?: string): boolean {
  return Boolean(name && MARKS[name]);
}

/**
 * The fallback, for a row whose entry has no mark of its own.
 *
 * NOT A TENTH MARK. The set is deliberately closed: the industries, the
 * resources and the company pages carry no mark because nine more arrangements
 * of two parts would stop being distinguishable and the set would lose the
 * thing that makes it a set. But a menu row needs SOMETHING in its lead column
 * or the column is a ragged gap, and it needs something that can animate or
 * half the panel is dead on hover.
 *
 * So this is the grammar's atom on its own: one seat, on one rule. It says
 * nothing specific, which is correct, because the entries it stands in for are
 * not distinguished by anything a two-part figure could draw. It animates
 * exactly like the real marks, so every row in every panel answers the pointer.
 */
export function PlainMark() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path d="M6 17.5h12" {...S} />
      <Node x={12} y={9} on />
    </svg>
  );
}
