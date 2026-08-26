/**
 * A designed stand-in for photography that has not been supplied yet.
 *
 * THE RULE IT SERVES: real pictures only, and until they exist the slot has to
 * look intentional rather than broken. Stock is banned outright, and a grey
 * void reads as a bug. So the slot is drawn in the house grammar: a quiet
 * surface with a fine lattice (the same dot-field material as the hero), one
 * rule, and one OUTLINED node. An outlined node everywhere else on this site
 * means a seat not yet filled; here it means a frame not yet filled, which is
 * the same statement made honestly.
 *
 * Swapping in the real photograph is one edit where this is used: replace the
 * slot with an <Image>. `data-media-slot` exists so every pending frame on
 * the site can be found with one grep.
 */
export default function MediaSlot({
  ratio = "4 / 3",
  tone = "light",
  className = "",
}: {
  /** CSS aspect-ratio value, e.g. "4 / 3", "1 / 1", "3 / 4". */
  ratio?: string;
  /** Matches the band it sits on, so the slot recedes instead of glowing. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      data-media-slot
      role="img"
      aria-label="Photography pending"
      className={`relative overflow-hidden rounded-[18px] ${
        dark
          ? "bg-[linear-gradient(150deg,#111a33_0%,#0a1023_58%,#070b19_100%)] ring-1 ring-inset ring-white/[0.08]"
          : "bg-[linear-gradient(150deg,#f2f4fa_0%,#e9edf6_60%,#e2e7f2_100%)] ring-1 ring-inset ring-[var(--v-ink)]/[0.06]"
      } ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* The lattice: the same material the site's fields are made of, at rest. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${
            dark ? "rgba(143,180,255,0.16)" : "rgba(31,45,90,0.10)"
          } 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          maskImage: "linear-gradient(135deg, #000 30%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(135deg, #000 30%, transparent 85%)",
        }}
      />
      {/* One rule, one vacant seat: the grammar's way of saying "held open". */}
      <div aria-hidden="true" className="absolute bottom-6 left-6 flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-[3px] border ${
            dark ? "border-[rgba(143,180,255,0.55)]" : "border-[rgba(31,45,90,0.4)]"
          }`}
        />
        <span
          className={`h-px w-12 ${dark ? "bg-[rgba(143,180,255,0.35)]" : "bg-[rgba(31,45,90,0.25)]"}`}
        />
      </div>
    </div>
  );
}
