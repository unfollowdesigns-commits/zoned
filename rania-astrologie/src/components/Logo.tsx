export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <circle cx="24" cy="24" r="21.5" stroke="currentColor" strokeOpacity=".35" strokeWidth=".8" />
      <ellipse cx="24" cy="24" rx="21.5" ry="8" transform="rotate(-28 24 24)" stroke="currentColor" strokeOpacity=".55" strokeWidth=".8" />
      <path d="M18.5 33V15h6.2c3.3 0 5.6 2 5.6 5s-2.3 5-5.6 5h-6.2m6.2 0 6 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40.2 12.6l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-3 text-gold-bright">
      <LogoMark className="h-9 w-9 shrink-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:rotate-[30deg]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.55rem] tracking-[0.02em] text-ivory">Rania</span>
        <span className="mt-1 text-[0.58rem] uppercase tracking-[0.38em] text-gold/80 [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:text-[0.7rem]">
          {label}
        </span>
      </span>
    </span>
  );
}
