'use client';

import { describeRecovery, type DayMetrics } from '@zoned/core';
import { RecoveryTrend, bandColor } from './RecoveryTrend';
import { MetricTrend } from './MetricTrend';
import { SleepStages } from './SleepStages';

export function Dashboard({ days, demo }: { days: DayMetrics[]; demo: boolean }) {
  const today = days[days.length - 1];
  const recovery = today?.recovery ?? null;

  const recent = days.slice(-28);
  const hrvPoints = recent.map((d) => ({ day: d.day, value: d.rmssd }));
  const rhrPoints = recent.map((d) => ({ day: d.day, value: d.restingHr }));

  return (
    <div className="shell">
      <div className="masthead">
        <div>
          <h1>Zoned</h1>
          <p>Recovery, strain and sleep from your own sensor.</p>
        </div>
        {recovery ? (
          <span className="status-chip">
            <span
              className="status-dot"
              style={{ background: bandColor(recovery.band) }}
            />
            {recovery.band === 'green'
              ? 'Ready'
              : recovery.band === 'yellow'
                ? 'Maintain'
                : 'Rest'}
          </span>
        ) : null}
      </div>

      {demo ? (
        <p className="banner">
          <strong>Demo data.</strong> Six weeks of simulated nights and workouts, generated
          by <code>@zoned/core</code>. Add your Supabase keys to <code>.env.local</code> and
          this switches to your own recordings.
        </p>
      ) : null}

      <div className="tiles">
        <Tile
          label="Recovery"
          value={recovery ? String(recovery.score) : '—'}
          color={recovery ? bandColor(recovery.band) : undefined}
          note={recovery ? describeRecovery(recovery) : 'No night recorded yet.'}
        />
        <Tile
          label="Day strain"
          value={today?.strain ? today.strain.strain.toFixed(1) : '0.0'}
          unit="/ 21"
          note={
            today?.strain
              ? `${Math.round(today.strain.durationMin)} min above resting`
              : 'No activity recorded.'
          }
        />
        <Tile
          label="HRV"
          value={today?.rmssd ? today.rmssd.toFixed(0) : '—'}
          unit="ms"
          note="RMSSD, from the last hour of sleep"
        />
        <Tile
          label="Resting HR"
          value={today?.restingHr ? today.restingHr.toFixed(0) : '—'}
          unit="bpm"
          note="Lowest sustained rate overnight"
        />
      </div>

      <section className="card">
        <header>
          <h2>Recovery</h2>
        </header>
        <p className="caption">
          Each morning scored against your own rolling baseline, not against anyone else.
        </p>
        <RecoveryTrend days={recent} />
      </section>

      <div className="pair">
        <section className="card">
          <header>
            <h2>Heart rate variability</h2>
          </header>
          <p className="caption">
            RMSSD in milliseconds. Higher is better recovered. The dashed line is your
            28-day average.
          </p>
          <MetricTrend
            points={hrvPoints}
            unit="ms"
            label="HRV"
            baseline={average(hrvPoints.map((p) => p.value))}
          />
        </section>

        <section className="card">
          <header>
            <h2>Resting heart rate</h2>
          </header>
          <p className="caption">
            Beats per minute. Lower is better recovered — the opposite direction to HRV,
            which is why these are two charts and not one. Dashed line is your 28-day
            average.
          </p>
          <MetricTrend
            points={rhrPoints}
            unit="bpm"
            label="Resting heart rate"
            color="var(--series-2)"
            baseline={average(rhrPoints.map((p) => p.value))}
          />
        </section>
      </div>

      <section className="card">
        <SleepStages days={recent} />
      </section>

      <footer>
        Scores are computed by <code>@zoned/core</code> from raw beat-to-beat intervals.
        The formulas are this project&rsquo;s own and are meant to be tuned against your
        logbook — see <code>docs/ROADMAP.md</code>.
      </footer>
    </div>
  );
}

function Tile({
  label,
  value,
  unit,
  note,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  color?: string;
}) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className="value" style={color ? { color } : undefined}>
        {value}
        {unit ? <span className="unit">{unit}</span> : null}
      </div>
      {note ? <div className="note">{note}</div> : null}
    </div>
  );
}

function average(values: Array<number | null>): number | null {
  const finite = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (finite.length === 0) return null;
  return finite.reduce((a, b) => a + b, 0) / finite.length;
}
