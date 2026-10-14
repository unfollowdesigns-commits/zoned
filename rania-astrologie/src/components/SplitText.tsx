import type { ElementType, ReactNode } from "react";

/**
 * Splits text into masked words that rise into place when the parent gets `.is-in`
 * (applied by the global reveal observer). Server-rendered, no client JS.
 */
export function SplitText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  startIndex = 0,
  wordClassName = "",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  startIndex?: number;
  wordClassName?: string;
}): ReactNode {
  const words = text.split(" ");
  return (
    <Tag className={className} data-reveal="split" style={{ ["--d" as string]: `${delay}ms` }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} className="split-line inline-block align-bottom">
            <span className={`split-word ${wordClassName}`} style={{ ["--i" as string]: i + startIndex }}>
              {w}
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}
