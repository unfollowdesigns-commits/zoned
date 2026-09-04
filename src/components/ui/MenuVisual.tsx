import { MARKS } from "@/components/ui/Mark";
import { STATS } from "@/lib/site";
import type { NavItem } from "@/lib/site";

/**
 * The plate in a nav panel.
 *
 * WHAT THIS REPLACED, AND WHY ALL OF IT WENT. There were twenty seven scenes
 * here: an org chart whose charge cascaded, a tier narrowing to one, a cover
 * that arrived and left, a market field lighting a region, sheets, boards,
 * rings. Each one was argued for and several of them were good. They still all
 * shared one composition, which was a small diagram centred in a four by three
 * box, and twenty seven variations on a centred diagram is one idea, not twenty
 * seven. Worse, a lit diagram in a frame is the house style of developer tools
 * and monitoring dashboards, which is the wrong register for a firm that sells
 * judgement about senior people.
 *
 * SO THE PANEL IS TYPESET, NOT DIAGRAMMED. What a search firm's own material
 * looks like is a page: an index, a claim at size, a rule, and a figure. That
 * is what this is now. The composition is asymmetric and bled rather than
 * centred and framed, the type is the subject rather than a caption under a
 * picture, and the mark is a watermark at four times the size it was, cropped
 * by two edges, doing the job a printer's device does rather than the job an
 * icon does.
 *
 * EVERY WORD IN IT IS ALREADY ON THE SITE. The claim is the service's own note,
 * the one the navigation has always rendered under its label. The figure is the
 * item's own house mark, from ui/Mark. The line at the foot is one of the four
 * numbers in lib/site STATS. Nothing here is copy written to fill a shape, and
 * nothing is a fact the firm has not published.
 *
 * THE MOTION IS THE ONE MOVE A PAGE MAKES. Lines rise into place behind their
 * own edge, in order, and the rule draws under them. No perpetual loop: a panel
 * is open for two seconds and a figure that is mid-story when it opens is a
 * figure nobody sees the point of. It plays once, on arrival, and holds.
 */

type Kind = "services" | "markets" | "resources" | "about";

/**
 * The line at the foot of each panel.
 *
 * One of the firm's own four numbers per section, chosen for what the section
 * is about: the retainer figure under the services, the volume figure under the
 * markets, the referral figure under the resources, and the repeat-client figure
 * under the company. They are indexes into STATS rather than copies of it, so a
 * number that changes there changes here.
 */
const PROOF: Record<Kind, number> = {
  services: 3,
  markets: 0,
  resources: 2,
  about: 1,
};

const SECTION: Record<Kind, string> = {
  services: "What We Do",
  markets: "Who We Serve",
  resources: "Resources",
  about: "About",
};

function proofLine(kind: Kind): string {
  const s = STATS[PROOF[kind]];
  if (!s) return "";
  return `${s.prefix ?? ""}${s.value.toLocaleString()}${s.unit ?? ""} ${s.label.toLowerCase()}`;
}

export default function MenuVisual({ kind, item }: { kind: Kind; item?: NavItem }) {
  /* Only a row with a mark of its own gets a device. The grammar's atom, which
     is what a markless row carries in its lead column, is one square on one
     rule; blown up to half a plate and dropped to nine percent it stops reading
     as a figure and starts reading as two pieces of grey debris. A plate with
     no watermark is a plate; a plate with an unreadable one is a mistake. */
  const Figure = item?.icon ? MARKS[item.icon] : undefined;
  /* The service's own note where there is one, its name where there is not.
     Neither is invented and neither is written for this slot. */
  const claim = item?.note ?? item?.label ?? SECTION[kind];
  /* Keyed on the row so the plate replays from its first line when the pointer
     moves. A cross-fade would show two claims at once; a remount sets one. */
  const key = item?.href ?? kind;

  return (
    <div className="dp-plate" aria-hidden="true">
      {/* The device. Four times the size of a mark and cropped by two edges, so
          it reads as a printer's device on a page rather than as an icon in a
          box. It does not animate: a watermark that moves is a logo animation,
          and the page is what is arriving here. */}
      {Figure && (
        <span className="dp-plate-device">
          <Figure />
        </span>
      )}

      <div className="dp-plate-body" key={key}>
        <p className="dp-plate-index">
          <span>{SECTION[kind]}</span>
        </p>

        {/* Set at display size and left to break where it breaks. A claim that
            is forced onto one line is a caption; a claim that runs three or four
            lines deep is the thing on the page. */}
        <p className="dp-plate-claim">
          <span>{claim}</span>
        </p>

        <span className="dp-plate-rule" />

        <p className="dp-plate-proof">
          <span>{proofLine(kind)}</span>
        </p>
      </div>
    </div>
  );
}
