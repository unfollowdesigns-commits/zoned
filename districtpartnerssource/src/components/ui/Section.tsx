import Reveal from "@/components/Reveal";

/** Page section at the house rhythm: 96 to 140px of vertical space. */
export default function Section({
  eyebrow,
  title,
  note,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-[1280px] px-6 py-20 sm:py-24 ${className}`}>
      {(eyebrow || title || note) && (
        <Reveal className="mb-10">
          <div>
            {eyebrow && <p className="v-eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 className="v-display max-w-[24ch] text-[clamp(1.6rem,3.6vw,1.95rem)] leading-[1.1]">
                {title}
              </h2>
            )}
            {note && (
              <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[var(--v-muted)]">
                {note}
              </p>
            )}
          </div>
        </Reveal>
      )}
      {children}
    </section>
  );
}
