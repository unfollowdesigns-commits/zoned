'use client';

import {
  describeCortisol,
  expectedSalivaryCortisol,
  type CortisolProfile,
  type DayMetrics,
} from '@zoned/core';
import { linePath, linearScale } from '../lib/scales';

const W = 420;
const H = 200;
const M = { top: 14, right: 16, bottom: 28, left: 40 };

/**
 * Cortisol against the reference diurnal curve.
 *
 * The point of the chart is the comparison: a bare concentration says nothing,
 * because the same number is unremarkable at 7am and alarming at 11pm. The grey
 * curve is what is typical for the time since you woke; your samples sit on top
 * of it.
 */
export function CortisolPanel({ days }: { days: DayMetrics[] }) {
  const withCortisol = days.filter((d) => d.cortisol !== null);
  const latest = withCortisol[withCortisol.length - 1]?.cortisol ?? null;

  if (!latest) {
    return (
      <>
        <header>
          <h2>Cortisol</h2>
        </header>
        <p className="caption">
          No lab samples yet. There is no wrist sensor on sale that measures cortisol —
          the readings here come from a saliva kit. See <code>docs/HARDWARE.md</code>.
        </p>
      </>
    );
  }

  return (
    <>
      <header>
        <h2>Cortisol</h2>
        <span className="status-chip">{latest.day}</span>
      </header>
      <p className="caption">
        Saliva samples against the typical curve for hours since waking. Not from a
        wearable — no such sensor is on sale yet.
      </p>

      <DiurnalChart profile={latest} />

      <div className="legend">
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--series-1)' }} />
          Your samples
        </span>
        <span className="legend-item">
          <span
            className="swatch"
            style={{ background: 'var(--axis)', borderRadius: 1, height: 3 }}
          />
          Typical for time since waking
        </span>
      </div>

      <div className="tiles" style={{ marginTop: 16, marginBottom: 0 }}>
        <div className="tile">
          <div className="label">Awakening rise</div>
          <div className="value">
            {latest.car !== null ? `${Math.round(latest.car * 100)}` : '—'}
            <span className="unit">%</span>
          </div>
          <div className="note">Typical is roughly 50–100%</div>
        </div>
        <div className="tile">
          <div className="label">Diurnal slope</div>
          <div className="value">
            {latest.diurnalSlope !== null ? latest.diurnalSlope.toFixed(3) : '—'}
          </div>
          <div className="note">Healthy is about −0.10 to −0.16 per hour</div>
        </div>
      </div>

      <p className="caption" style={{ marginTop: 14, marginBottom: 0 }}>
        {describeCortisol(latest)}
      </p>
    </>
  );
}

function DiurnalChart({ profile }: { profile: CortisolProfile }) {
  const observed = profile.deviations.map((d) => ({
    hours: d.hoursSinceWake,
    value: expectedSalivaryCortisol(d.hoursSinceWake) * Math.exp(d.lnRatio),
  }));

  const maxValue = Math.max(
    ...observed.map((o) => o.value),
    expectedSalivaryCortisol(0.5),
  );
  const x = linearScale([0, 16], [M.left, W - M.right]);
  const y = linearScale([0, Math.ceil(maxValue / 5) * 5], [H - M.bottom, M.top]);

  const reference = Array.from({ length: 65 }, (_, i) => {
    const hours = (i / 64) * 16;
    return { x: x(hours), y: y(expectedSalivaryCortisol(hours)) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cortisol against the reference curve">
      {[0, y.domain[1] / 2, y.domain[1]].map((value) => (
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
            {Math.round(value)}
          </text>
        </g>
      ))}

      <path
        d={linePath(reference)}
        fill="none"
        stroke="var(--axis)"
        strokeWidth={2}
        strokeDasharray="5 4"
        vectorEffect="non-scaling-stroke"
      />

      <path
        d={linePath(observed.map((o) => ({ x: x(o.hours), y: y(o.value) })))}
        fill="none"
        stroke="var(--series-1)"
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {observed.map((o) => (
        <circle
          key={o.hours}
          cx={x(o.hours)}
          cy={y(o.value)}
          r={4.5}
          fill="var(--series-1)"
          stroke="var(--surface)"
          strokeWidth={2}
        />
      ))}

      {[0, 4, 8, 12, 16].map((hours) => (
        <text
          key={hours}
          className="axis-label"
          x={x(hours)}
          y={H - 10}
          textAnchor="middle"
        >
          +{hours}h
        </text>
      ))}

      <text className="axis-label" x={M.left} y={H - 10} textAnchor="start" opacity={0}>
        wake
      </text>
    </svg>
  );
}
