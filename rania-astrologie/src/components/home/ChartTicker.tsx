import { CHART_A, formatLon } from "@/components/cosmos/chart-data";

/** A slow ribbon of exact planetary positions — a quiet nod to degree-precise reading. */
export function ChartTicker() {
  const items = CHART_A.map((b) => `${b.glyph}︎ ${formatLon(b.lon)}`);
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line py-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-hidden="true">
      <div className="marquee gap-12 whitespace-nowrap font-display text-lg text-gold/80" dir="ltr">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t}
            <span className="h-px w-6 bg-gold/30" />
          </span>
        ))}
      </div>
    </div>
  );
}
