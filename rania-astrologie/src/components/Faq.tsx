/** Native <details> accordion: works without JS and keeps every answer in the HTML for crawlers. */
export function Faq({ items, className = "", level = 3 }: { items: { q: string; a: string }[]; className?: string; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className={`border-t border-line ${className}`}>
      {items.map((it, i) => (
        <details key={i} className="group border-b border-line" data-reveal style={{ ["--d" as string]: `${i * 50}ms` }}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <H className="font-display text-xl leading-snug text-ivory md:text-2xl">{it.q}</H>
            <span aria-hidden="true" className="relative mt-2 h-4 w-4 shrink-0">
              <span className="absolute left-0 top-1/2 h-px w-4 bg-gold" />
              <span className="absolute left-1/2 top-0 h-4 w-px bg-gold transition-transform duration-500 group-open:scale-y-0" />
            </span>
          </summary>
          <p className="max-w-3xl pb-7 text-ivory/75">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
