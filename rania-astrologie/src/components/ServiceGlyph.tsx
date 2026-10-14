import type { ServiceKey } from "@/content/services";

/** Hand-drawn line glyphs for each approach — consistent stroke, no font dependency. */
export function ServiceGlyph({ k, className = "" }: { k: ServiceKey; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 17 : 18.5;
    return `M${24 + Math.cos(a) * r0} ${24 + Math.sin(a) * r0}L${24 + Math.cos(a) * 20.5} ${24 + Math.sin(a) * 20.5}`;
  }).join("");
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {k === "natal" && (
        <g {...common}>
          <circle cx="24" cy="24" r="20.5" />
          <circle cx="24" cy="24" r="13" />
          <circle cx="24" cy="24" r="2.2" fill="currentColor" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <path key={i} d={`M${24 + Math.cos(a) * 13} ${24 + Math.sin(a) * 13}L${24 + Math.cos(a) * 20.5} ${24 + Math.sin(a) * 20.5}`} />;
          })}
        </g>
      )}
      {k === "psychological" && (
        <g {...common}>
          <path d="M30 8.5a16 16 0 1 0 0 31 13 13 0 0 1 0-31Z" />
          <circle cx="33" cy="24" r="1.6" fill="currentColor" />
          <path d="M37 14.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="currentColor" stroke="none" />
        </g>
      )}
      {k === "relational" && (
        <g {...common}>
          <circle cx="18" cy="24" r="12" />
          <circle cx="30" cy="24" r="12" />
          <path d="M24 13.6v20.8" strokeDasharray="1.5 2.5" />
        </g>
      )}
      {k === "karmic" && (
        <g {...common}>
          <path d="M15 32c-4-3-5-8.5-2.3-13A11 11 0 0 1 24 13a11 11 0 0 1 11.3 6c2.7 4.5 1.7 10-2.3 13" />
          <circle cx="13.5" cy="34.5" r="3" />
          <circle cx="34.5" cy="34.5" r="3" />
          <path d="M24 4v4M24 40v4" />
        </g>
      )}
      {k === "progressed" && (
        <g {...common}>
          <path d="M24 24c0-1.5 1.8-2 3-1 2 1.7 1 5-1.6 5.6-3.8.9-6.6-2.8-5.6-6.4 1.4-4.9 7.6-6.4 11.3-3.2 4.6 4 3.3 11.4-2 13.6-6.4 2.7-13.5-1.8-14-8.7C14.6 15.6 21 9.6 28.4 10.4c8.6.9 13.6 10 10.6 17.9" />
          <circle cx="39" cy="28.3" r="1.8" fill="currentColor" />
        </g>
      )}
      {k === "degrees" && (
        <g {...common}>
          <path d={ticks} strokeWidth=".9" />
          <circle cx="24" cy="24" r="12" />
          <path d="M24 24 33 15" />
          <circle cx="24" cy="24" r="1.6" fill="currentColor" />
        </g>
      )}
      {k === "healing" && (
        <g {...common}>
          <circle cx="24" cy="24" r="4" />
          <circle cx="24" cy="24" r="10" strokeDasharray="2 3" />
          <circle cx="24" cy="24" r="17" strokeOpacity=".6" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <path key={i} d={`M${24 + Math.cos(a) * 5.5} ${24 + Math.sin(a) * 5.5}L${24 + Math.cos(a) * 8} ${24 + Math.sin(a) * 8}`} />;
          })}
        </g>
      )}
    </svg>
  );
}
