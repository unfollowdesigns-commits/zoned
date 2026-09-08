'use client';

import { useRef, useState } from 'react';
import type { DayMetrics } from '@zoned/core';
import { linearScale, shortDay } from '../lib/scales';
import { Tooltip, useTooltip } from './Tooltip';

const W = 720;
const H = 250;
const M = { top: 12, right: 16, bottom: 26, left: 40 };
/** Surface-coloured gap between stacked segments, per the mark spec. */
const GAP = 2;

const STAGES = [
  { key: 'deep', label: 'Deep', color: 'var(--series-1)' },
  { key: 'rem', label: 'REM', color: 'var(--series-2)' },
  { key: 'light', label: 'Light', color: 'var(--series-3)' },
  { key: 'awake', label: 'Awake', color: 'var(--series-4)' },
] as const;

type StageKey = (typeof STAGES)[number]['key'];

/**
 * Stacked sleep stages per night.
 *
 * Four categorical slots in their fixed palette order. Three of those slots sit
 * below 3:1 against the light surface, so the relief rule applies: the legend
 * is always present and a table view is one click away.
 */
export function SleepStages({ days }: { days: DayMetrics[] }) {
  const { tooltip, setTooltip } = useTooltip();
  const svgRef = useRef<SVGSVGElement>(null);
  const [showTable, setShowTable] = useState(false);

  const nights = days.filter((d) => d.sleepStages !== null);
  const maxMinutes = Math.max(
    ...nights.map((d) => totalMinutes(d)),
    480,
  );

  const x = linearScale([0, Math.max(1, nights.length)], [M.left, W - M.right]);
  const y = linearScale([0, maxMinutes], [H - M.bottom, M.top]);
  const bandWidth = ((W - M.left - M.right) / Math.max(1, nights.length)) * 0.78;

  return (
    <>
      <header>
        <h2>Sleep stages</h2>
        <button
          className="toggle"
          onClick={() => setShowTable((v) => !v)}
          aria-pressed={showTable}
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </header>
      <p className="caption">
        Staging without EEG is an estimate from heart rate and stillness — read the
        shape of the night, not the individual minutes.
      </p>

      {showTable ? (
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>Night</th>
                {STAGES.map((stage) => (
                  <th key={stage.key}>{stage.label}</th>
                ))}
                <th>Asleep</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {[...nights].reverse().map((day) => (
                <tr key={day.day}>
                  <td>{day.day}</td>
                  {STAGES.map((stage) => (
                    <td key={stage.key}>{day.sleepStages?.[stage.key] ?? 0}m</td>
                  ))}
                  <td>{formatDuration(day.sleepMinutes ?? 0)}</td>
                  <td>
                    {day.sleepEfficiency
                      ? `${Math.round(day.sleepEfficiency * 100)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart-wrap">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Sleep stages for the last ${nights.length} nights`}
          >
            {[0, maxMinutes / 2, maxMinutes].map((value) => (
              <g key={value}>
                <line
                  x1={M.left}
                  x2={W - M.right}
                  y1={y(value)}
                  y2={y(value)}
                  stroke="var(--grid)"
                  strokeWidth={1}
                />
                <text
                  className="axis-label"
                  x={M.left - 8}
                  y={y(value) + 3}
                  textAnchor="end"
                >
                  {Math.round(value / 60)}h
                </text>
              </g>
            ))}

            {nights.map((day, i) => {
              const left = x(i) + ((W - M.left - M.right) / nights.length - bandWidth) / 2;
              let cursor = 0;
              return (
                <g
                  key={day.day}
                  onMouseEnter={(event) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setTooltip({
                      x: left + bandWidth / 2,
                      y: (y(totalMinutes(day)) / H) * rect.height,
                      content: (
                        <>
                          <div className="t-title">{day.day}</div>
                          {STAGES.map((stage) => (
                            <div className="t-row" key={stage.key}>
                              <span
                                className="swatch"
                                style={{ background: stage.color }}
                              />
                              <span style={{ minWidth: 44 }}>{stage.label}</span>
                              <strong>
                                {formatDuration(day.sleepStages?.[stage.key] ?? 0)}
                              </strong>
                            </div>
                          ))}
                        </>
                      ),
                    });
                    void event;
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Invisible full-height target: a hit area bigger than the mark. */}
                  <rect
                    x={left}
                    y={M.top}
                    width={bandWidth}
                    height={H - M.top - M.bottom}
                    fill="transparent"
                  />
                  {STAGES.map((stage) => {
                    const minutes = day.sleepStages?.[stage.key] ?? 0;
                    if (minutes <= 0) return null;
                    const top = y(cursor + minutes);
                    const bottom = y(cursor);
                    cursor += minutes;
                    const height = Math.max(1, bottom - top - GAP);
                    return (
                      <rect
                        key={stage.key}
                        x={left}
                        y={top}
                        width={bandWidth}
                        height={height}
                        fill={stage.color}
                        rx={2}
                      />
                    );
                  })}
                </g>
              );
            })}

            {nights.map((day, i) =>
              i % Math.ceil(nights.length / 7) === 0 ? (
                <text
                  key={day.day}
                  className="axis-label"
                  x={x(i) + (W - M.left - M.right) / nights.length / 2}
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
      )}

      <div className="legend">
        {STAGES.map((stage) => (
          <span className="legend-item" key={stage.key}>
            <span className="swatch" style={{ background: stage.color }} />
            {stage.label}
          </span>
        ))}
      </div>
    </>
  );
}

function totalMinutes(day: DayMetrics): number {
  const stages = day.sleepStages;
  if (!stages) return 0;
  return (Object.keys(stages) as StageKey[]).reduce((acc, key) => acc + stages[key], 0);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
