'use client';

import { useRef, useState } from 'react';
import { linePath, linearScale, niceScale, shortDay } from '../lib/scales';
import { Tooltip, useTooltip } from './Tooltip';

const W = 420;
const H = 190;
const M = { top: 12, right: 14, bottom: 24, left: 40 };

export interface TrendPoint {
  day: string;
  value: number | null;
}

/**
 * A single-measure trend line, used as a small multiple.
 *
 * HRV and resting heart rate are shown as two of these side by side rather
 * than on one chart with two y-axes. A dual-axis chart lets you slide the two
 * scales until they tell whatever story you want; two charts cannot lie that
 * way.
 */
export function MetricTrend({
  points,
  color = 'var(--series-1)',
  unit,
  decimals = 0,
  baseline,
  label,
}: {
  points: TrendPoint[];
  color?: string;
  unit: string;
  decimals?: number;
  /** Drawn as a dashed reference line — your personal normal. */
  baseline?: number | null;
  label: string;
}) {
  const { tooltip, setTooltip } = useTooltip();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const values = points
    .map((p) => p.value)
    .filter((v): v is number => v !== null && Number.isFinite(v));
  const { domain, ticks } = niceScale(baseline != null ? [...values, baseline] : values);

  const x = linearScale([0, Math.max(1, points.length - 1)], [M.left, W - M.right]);
  const y = linearScale(domain, [H - M.bottom, M.top]);

  const coords = points.map((p, i) => ({ x: x(i), y: p.value === null ? null : y(p.value) }));

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const index = Math.round(
      ((px - M.left) / (W - M.left - M.right)) * Math.max(1, points.length - 1),
    );
    const clamped = Math.max(0, Math.min(points.length - 1, index));
    const point = points[clamped];
    if (!point) return;

    setHover(clamped);
    setTooltip({
      x: x(clamped),
      y: ((point.value === null ? H / 2 : y(point.value)) / H) * rect.height,
      content: (
        <>
          <div className="t-title">{point.day}</div>
          <div className="t-row">
            <span className="swatch" style={{ background: color }} />
            <strong>
              {point.value === null ? '—' : point.value.toFixed(decimals)}
            </strong>
            <span>{unit}</span>
          </div>
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
        aria-label={`${label} over the last ${points.length} days`}
      >
        {ticks.map((value) => (
          <g key={value}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--grid)"
              strokeWidth={1}
            />
            <text className="axis-label" x={M.left - 8} y={y(value) + 3} textAnchor="end">
              {value}
            </text>
          </g>
        ))}

        {baseline != null ? (
          <line
            x1={M.left}
            x2={W - M.right}
            y1={y(baseline)}
            y2={y(baseline)}
            stroke="var(--axis)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ) : null}

        <path
          d={linePath(coords)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover !== null && coords[hover]?.y != null ? (
          <>
            <line
              x1={coords[hover]!.x}
              x2={coords[hover]!.x}
              y1={M.top}
              y2={H - M.bottom}
              stroke="var(--axis)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={coords[hover]!.x}
              cy={coords[hover]!.y!}
              r={4.5}
              fill={color}
              stroke="var(--surface)"
              strokeWidth={2}
            />
          </>
        ) : null}

        {points.map((point, i) =>
          i % Math.ceil(points.length / 5) === 0 ? (
            <text
              key={point.day}
              className="axis-label"
              x={x(i)}
              y={H - 7}
              textAnchor="middle"
            >
              {shortDay(point.day)}
            </text>
          ) : null,
        )}
      </svg>
      <Tooltip tooltip={tooltip} width={W} />
    </div>
  );
}
