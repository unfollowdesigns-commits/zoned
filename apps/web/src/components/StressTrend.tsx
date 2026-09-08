'use client';

import { useRef, useState } from 'react';
import type { DayMetrics } from '@zoned/core';
import { linearScale, shortDay } from '../lib/scales';
import { Tooltip, useTooltip } from './Tooltip';

const W = 720;
const H = 220;
const M = { top: 12, right: 16, bottom: 26, left: 34 };
const GAP = 2;

/**
 * Daily stress as bars rather than a line.
 *
 * Stress is a magnitude read one day at a time — how loaded was Tuesday — not a
 * continuous quantity flowing between days, and bars say that where a line
 * would imply an interpolation that does not exist.
 */
export function StressTrend({ days }: { days: DayMetrics[] }) {
  const { tooltip, setTooltip } = useTooltip();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const scored = days.filter((d) => d.stress !== null);
  const x = linearScale([0, Math.max(1, scored.length)], [M.left, W - M.right]);
  const y = linearScale([0, 100], [H - M.bottom, M.top]);
  const slot = (W - M.left - M.right) / Math.max(1, scored.length);
  const barWidth = slot * 0.72;

  const hasEda = scored.some((d) => d.stress?.channels.includes('eda'));

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Daily stress over the last ${scored.length} days`}
        onMouseLeave={() => {
          setTooltip(null);
          setHover(null);
        }}
      >
        {[0, 25, 50, 75, 100].map((value) => (
          <g key={value}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--grid)"
              strokeWidth={1}
            />
            {value % 50 === 0 ? (
              <text
                className="axis-label"
                x={M.left - 8}
                y={y(value) + 3}
                textAnchor="end"
              >
                {value}
              </text>
            ) : null}
          </g>
        ))}

        {scored.map((day, i) => {
          const stress = day.stress!;
          const left = x(i) + (slot - barWidth) / 2;
          const top = y(stress.score);
          const height = Math.max(2, y(0) - top - GAP);
          return (
            <g
              key={day.day}
              onMouseEnter={() => {
                const rect = svgRef.current?.getBoundingClientRect();
                if (!rect) return;
                setHover(i);
                setTooltip({
                  x: left + barWidth / 2,
                  y: (top / H) * rect.height,
                  content: (
                    <>
                      <div className="t-title">{day.day}</div>
                      <div className="t-row">
                        <span
                          className="swatch"
                          style={{ background: stressColor(stress.band) }}
                        />
                        <strong>{stress.score}</strong>
                        <span>{stress.band}</span>
                      </div>
                      <div className="t-row" style={{ color: 'var(--text-muted)' }}>
                        {day.eda
                          ? `${day.eda.scrPerMin.toFixed(1)} responses/min`
                          : 'heart rate only'}
                      </div>
                    </>
                  ),
                });
              }}
            >
              <rect
                x={left}
                y={M.top}
                width={barWidth}
                height={H - M.top - M.bottom}
                fill="transparent"
              />
              <rect
                x={left}
                y={top}
                width={barWidth}
                height={height}
                rx={2}
                fill={stressColor(stress.band)}
                opacity={hover === null || hover === i ? 1 : 0.55}
              />
            </g>
          );
        })}

        {scored.map((day, i) =>
          i % Math.ceil(scored.length / 7) === 0 ? (
            <text
              key={day.day}
              className="axis-label"
              x={x(i) + slot / 2}
              y={H - 8}
              textAnchor="middle"
            >
              {shortDay(day.day)}
            </text>
          ) : null,
        )}
      </svg>
      <Tooltip tooltip={tooltip} width={W} />

      <div className="legend">
        {(['calm', 'moderate', 'elevated', 'high'] as const).map((band) => (
          <span className="legend-item" key={band}>
            <span className="swatch" style={{ background: stressColor(band) }} />
            {band}
          </span>
        ))}
        {!hasEda ? (
          <span className="legend-item" style={{ marginLeft: 'auto' }}>
            No EDA sensor — heart rate only
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Status colours, not categorical ones: these are four states of one thing, and
 * each is paired with its label in the legend and the tooltip so hue never
 * carries the meaning alone.
 */
export function stressColor(band: 'calm' | 'moderate' | 'elevated' | 'high'): string {
  switch (band) {
    case 'calm':
      return 'var(--status-good)';
    case 'moderate':
      return 'var(--status-warning)';
    case 'elevated':
      return 'var(--status-serious)';
    case 'high':
      return 'var(--status-critical)';
  }
}
