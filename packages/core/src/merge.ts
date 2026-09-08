/**
 * Merging backfilled recordings.
 *
 * A screenless band has no reason to keep your phone nearby — there is nothing
 * to glance at — so it records to its own flash and hands the backlog over
 * whenever the phone next appears. That creates a problem a tethered device
 * never has: the same minutes can arrive twice, once streamed live and once
 * replayed from flash, with timestamps that do not match to the millisecond
 * because the band's clock drifts between syncs.
 *
 * Merged naively, a night counts twice: doubled beats halve the apparent RR
 * intervals, strain sums twice over, and the day's scores are quietly wrong
 * with nothing on screen to reveal it. Everything here exists to make the
 * backfill idempotent — sync the same log ten times and the result is identical
 * to syncing it once.
 */

import type { RecordedSession } from './daily';

export interface MergeOptions {
  /**
   * Two samples this close together are treated as the same sample.
   *
   * Sized to the gap between samples, not to clock accuracy: heart rate arrives
   * about once a second, so 250 ms is comfortably tighter than a real interval
   * and comfortably looser than the drift between a band's clock and a phone's.
   */
  toleranceMs?: number;
}

/**
 * Union two time series, dropping samples that duplicate one already kept.
 *
 * Where both sides have a sample at the same moment, the one already held wins.
 * That is deliberate: live-streamed data was timestamped by the phone against a
 * real clock, while replayed data carries the band's drifted one.
 */
export function mergeTimeSeries<T extends { t: number }>(
  existing: readonly T[],
  incoming: readonly T[],
  options: MergeOptions = {},
): T[] {
  const toleranceMs = options.toleranceMs ?? 250;

  if (existing.length === 0 && incoming.length === 0) return [];
  if (incoming.length === 0) return sortByTime(existing);
  if (existing.length === 0) return sortByTime(incoming);

  const kept = sortByTime(existing);
  const candidates = sortByTime(incoming);
  const out: T[] = [];

  let i = 0;
  let j = 0;

  while (i < kept.length || j < candidates.length) {
    const a = kept[i];
    const b = candidates[j];

    if (a !== undefined && (b === undefined || a.t <= b.t)) {
      out.push(a);
      i++;
      // Any candidate within tolerance of what was just kept is the same sample.
      while (j < candidates.length && (candidates[j] as T).t - a.t <= toleranceMs) {
        j++;
      }
      continue;
    }

    if (b === undefined) break;

    const last = out[out.length - 1];
    if (last === undefined || b.t - last.t > toleranceMs) out.push(b);
    j++;
  }

  return out;
}

/**
 * Fold a backlog into what is already stored.
 *
 * Sessions pair up by id when the band and the phone agree on one. When they do
 * not — the band names its own recordings, the phone names the ones it started
 * — sessions of the same kind whose windows overlap are treated as the same
 * recording seen twice.
 */
export function mergeSessions(
  existing: readonly RecordedSession[],
  incoming: readonly RecordedSession[],
  options: MergeOptions = {},
): RecordedSession[] {
  const out: RecordedSession[] = existing.map(cloneSession);

  for (const candidate of incoming) {
    const matchIndex = out.findIndex(
      (session) =>
        session.id === candidate.id || sameRecording(session, candidate),
    );

    if (matchIndex === -1) {
      out.push(cloneSession(candidate));
      continue;
    }

    out[matchIndex] = mergeSession(out[matchIndex] as RecordedSession, candidate, options);
  }

  return out.sort((a, b) => a.startedAt - b.startedAt);
}

/** Combine two views of one recording. */
export function mergeSession(
  existing: RecordedSession,
  incoming: RecordedSession,
  options: MergeOptions = {},
): RecordedSession {
  const samples = mergeTimeSeries(existing.samples, incoming.samples, options);
  const motion = mergeTimeSeries(existing.motion ?? [], incoming.motion ?? [], options);
  // EDA runs at several samples a second, so it needs a tighter tolerance than
  // the once-a-second default or genuine neighbours would collapse into one.
  const eda = mergeTimeSeries(existing.eda ?? [], incoming.eda ?? [], {
    toleranceMs: options.toleranceMs !== undefined ? options.toleranceMs / 4 : 60,
  });
  const temperature = mergeTimeSeries(
    existing.temperature ?? [],
    incoming.temperature ?? [],
    { toleranceMs: 5_000 },
  );

  return {
    id: existing.id,
    kind: existing.kind,
    // The merged recording spans both views of it.
    startedAt: Math.min(existing.startedAt, incoming.startedAt),
    endedAt: Math.max(existing.endedAt, incoming.endedAt),
    samples,
    ...(motion.length > 0 ? { motion } : {}),
    ...(eda.length > 0 ? { eda } : {}),
    ...(temperature.length > 0 ? { temperature } : {}),
  };
}

/**
 * Whether two differently-named sessions are the same stretch of time.
 *
 * Requires a substantial overlap rather than any overlap at all: a workout that
 * happens to start as a daily recording ends is two recordings, not one.
 */
function sameRecording(a: RecordedSession, b: RecordedSession): boolean {
  if (a.kind !== b.kind) return false;

  const overlap =
    Math.min(a.endedAt, b.endedAt) - Math.max(a.startedAt, b.startedAt);
  if (overlap <= 0) return false;

  const shorter = Math.min(a.endedAt - a.startedAt, b.endedAt - b.startedAt);
  if (shorter <= 0) return false;

  return overlap / shorter >= 0.5;
}

function cloneSession(session: RecordedSession): RecordedSession {
  return {
    ...session,
    samples: [...session.samples],
    ...(session.motion ? { motion: [...session.motion] } : {}),
    ...(session.eda ? { eda: [...session.eda] } : {}),
    ...(session.temperature ? { temperature: [...session.temperature] } : {}),
  };
}

function sortByTime<T extends { t: number }>(values: readonly T[]): T[] {
  return [...values].sort((a, b) => a.t - b.t);
}
