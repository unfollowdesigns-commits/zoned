'use client';

import { useState, type ReactNode } from 'react';

export interface TooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

/**
 * Tooltip positioning shared by every chart.
 *
 * The tooltip is HTML rather than SVG so it can never be clipped by the plot
 * area, and it flips to the left of the cursor near the right edge so it is
 * never cut off by the card.
 */
export function useTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  return { tooltip, setTooltip };
}

export function Tooltip({
  tooltip,
  width,
}: {
  tooltip: TooltipState | null;
  width: number;
}) {
  if (!tooltip) return null;
  const flip = tooltip.x > width * 0.6;
  return (
    <div
      className="tooltip"
      style={{
        left: `${(tooltip.x / width) * 100}%`,
        top: tooltip.y,
        transform: flip ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)',
      }}
      role="status"
    >
      {tooltip.content}
    </div>
  );
}
