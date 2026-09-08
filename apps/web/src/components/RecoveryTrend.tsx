'use client';

import { useRef, useState } from 'react';
import type { DayMetrics } from '@zoned/core';
import { linePath, linearScale, shortDay } from '../lib/scales';
import { Tooltip, useTooltip } from './Tooltip';

const W = 720;
const H = 240;
const M = { top: 12, right: 16, bottom: 26, left: 34 };

/**
 * Recovery over time.
 *
 * One series, so no legend — the card title names it. The red/yellow/green
 * bands are drawn as recessive background zones rather than by colouring each
 * point, which keeps the line readable and stops the status palette from
 * pretending to be a categorical encoding.
 */
export function RecoveryTrend({ days }: { days: DayMetrics[] }) {
  const { tooltip, setTooltip } = useTooltip();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const x = linearScale([0, Math.max(1, days.length - 1)], [M.left, W - M.right]);
  const y = linearScale([0, 100], [H - M.bottom, M.top]);

  const points = days.map((day, i) => ({
    x: x(i),
    y: day.recovery ? y(day.recovery.score) : null,
  }));

  const bands = [
    { from: 0, to: 34, color: 'var(--status-critical)', label: 'Rest' },
    { from: 34, to: 67, color: 'var(--status-warning)', label: 'Maintain' },
    { from: 67, to: 100, color: 'var(--status-good)', label: 'Ready' },
  ];

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const index = Math.round(
      ((px - M.left) / (W - M.left - M.right)) * Math.max(1, days.length - 1),
    );
    const clamped = Math.max(0, Math.min(days.length - 1, index));
    const day = days[clamped];
    if (!day) return;

    setHover(clamped);
    setTooltip({
      x: x(clamped),
      y: ((day.recovery ? y(day.recovery.score) : H / 2) / H) * rect.height,
      content: (
        <>
          <div className="t-title">{day.day}</div>
          {day.recovery ? (
            <>
              <div className="t-row">
                <span
                  className="status-dot"
                  style={{ background: bandColor(day.recovery.band) }}
                />
                <strong>{day.recovery.score}</strong>
                <span>{day.recovery.band}</span>
              </div>
              <div className="t-row" style={{ color: 'var(--text-muted)' }}>
                HRV {day.rmssd?.toFixed(0) ?? '—'} ms · RHR{' '}
                {day.restingHr?.toFixed(0) ?? '—'} bpm
              </div>
            </>
          ) : (
            <div className="t-row">No night recorded</div>
          )}
        </>
      ),
    });
  };

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        onMouseMove={handleMove}
        onMouseLeave={() => {
          setTooltip(null);
          setHover(null);
        }}
        role="img"
        aria-label={`Recovery score over the last ${days.length} days`}
      >
        {bands.map((band) => (
          <g key={band.label}>
            <rect
              x={M.left}
              y={y(band.to)}
              width={W - M.left - M.right}
              height={y(band.from) - y(band.to)}
              fill={band.color}
              opacity={0.06}
            />
            <text
              className="axis-label"
              x={W - M.right - 4}
              y={y(band.to) + 12}
              textAnchor="end"
            >
              {band.label}
            </text>
          </g>
        ))}

        {[0, 34, 67, 100].map((value) => (
          <line
            key={value}
            x1={M.left}
            x2={W - M.right}
            y1={y(value)}
            y2={y(value)}
            stroke="var(--grid)"
            strokeWidth={1}
          />
        ))}

        {[0, 50, 100].map((value) => (
          <text
            key={value}
            className="axis-label"
            x={M.left - 8}
            y={y(value) + 3}
            textAnchor="end"
          >
            {value}
          </text>
        ))}

        <path
          d={linePath(points)}
          fill="none"
          stroke="var(--series-1)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover !== null && points[hover]?.y !== null && points[hover] ? (
          <>
            <line
              x1={points[hover]!.x}
              x2={points[hover]!.x}
              y1={M.top}
              y2={H - M.bottom}
              stroke="var(--axis)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={points[hover]!.x}
              cy={points[hover]!.y!}
              r={5}
              fill="var(--series-1)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          </>
        ) : null}

        {days.map((day, i) =>
          i % Math.ceil(days.length / 7) === 0 ? (
            <text
              key={day.day}
              className="axis-label"
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
            >
              {shortDay(day.day)}
            </text>
          ) : null,
        )}
      </svg>
      <Tooltip tooltip={tooltip} width={W} />
    </div>
  );
}

export function bandColor(band: 'red' | 'yellow' | 'green'): string {
  return band === 'green'
    ? 'var(--status-good)'
    : band === 'yellow'
      ? 'var(--status-warning)'
      : 'var(--status-critical)';
}
