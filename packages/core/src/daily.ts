/**
 * Rolling up recordings into one row per day.
 *
 * Lives in core rather than in either app because the phone and the dashboard
 * must agree to the decimal: two implementations of "what was my recovery on
 * Tuesday" is two answers, and the user will find both.
 *
 * Everything is recomputed from raw beat intervals rather than cached, so
 * improving a formula improves your whole history retroactively. That is the
 * entire reason the raw data is kept.
 */

import { collectRrIntervals } from './ble';
import {
  computeHrv,
  estimateRespiratoryRate,
  restingHeartRate,
} from './hrv';
import { analyzeSleep, sleepPerformance } from './sleep';
import { computeStrain } from './strain';
import { computeRecovery } from './recovery';
import { buildBaseline } from './baseline';
import type {
  HeartRateSample,
  MotionSample,
  RecoveryScore,
  SessionKind,
  StrainScore,
  UserProfile,
} from './types';

export interface RecordedSession {
  id: string;
  kind: SessionKind;
  startedAt: number;
  endedAt: number;
  samples: HeartRateSample[];
  motion?: MotionSample[];
}

export interface DayMetrics {
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
  recovery: RecoveryScore | null;
  strain: StrainScore | null;
  rmssd: number | null;
  restingHr: number | null;
  respiratoryRate: number | null;
  sleepMinutes: number | null;
  sleepEfficiency: number | null;
  sleepStages: Record<'awake' | 'light' | 'deep' | 'rem', number> | null;
}

/**
 * Local, not UTC. A night belongs to the calendar day you wake up on, and that
 * is a local-time question — scoring it in UTC would move some people's nights
 * onto the wrong day.
 */
export function dayKey(t: number): string {
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function summarizeDays(
  sessions: readonly RecordedSession[],
  profile: UserProfile,
): DayMetrics[] {
  const byDay = new Map<string, RecordedSession[]>();
  for (const session of sessions) {
    // A night starting at 23:00 is scored against the morning it ends on.
    const key = dayKey(session.kind === 'sleep' ? session.endedAt : session.startedAt);
    const list = byDay.get(key) ?? [];
    list.push(session);
    byDay.set(key, list);
  }

  const days = [...byDay.keys()].sort();
  // Baselines are built only from days *before* the one being scored, so a bad
  // night can never drag its own score back toward normal.
  const hrvHistory: number[] = [];
  const rhrHistory: number[] = [];
  const rrHistory: number[] = [];
  const out: DayMetrics[] = [];

  for (const day of days) {
    const daySessions = byDay.get(day) ?? [];
    const sleepSessions = daySessions.filter((s) => s.kind === 'sleep');
    const activeSessions = daySessions.filter((s) => s.kind !== 'sleep');

    let rmssd: number | null = null;
    let lnRmssd: number | null = null;
    let rhr: number | null = null;
    let respiratoryRate: number | null = null;
    let sleepMinutes: number | null = null;
    let sleepEfficiency: number | null = null;
    let sleepStages: DayMetrics['sleepStages'] = null;
    let performance: number | undefined;

    if (sleepSessions.length > 0) {
      const hr = sleepSessions.flatMap((s) => s.samples).sort((a, b) => a.t - b.t);
      const motion = sleepSessions
        .flatMap((s) => s.motion ?? [])
        .sort((a, b) => a.t - b.t);

      if (hr.length > 0) {
        // HRV is read from the last hour of sleep — the closest a wearable gets
        // to a standardised measurement taken at the same state every day.
        const last = hr[hr.length - 1] as HeartRateSample;
        const finalHour = hr.filter((s) => s.t >= last.t - 3_600_000);

        const hrv = computeHrv(collectRrIntervals(finalHour), { minBeats: 120 });
        if (hrv) {
          rmssd = hrv.rmssd;
          lnRmssd = hrv.lnRmssd;
        }
        rhr = restingHeartRate(collectRrIntervals(hr));
        respiratoryRate = estimateRespiratoryRate(collectRrIntervals(finalHour));

        const sleep = analyzeSleep(hr, motion);
        if (sleep) {
          sleepMinutes = sleep.asleepMin;
          sleepEfficiency = sleep.efficiency;
          sleepStages = sleep.stageMinutes;
          performance = sleepPerformance(sleep, profile.sleepNeedHours ?? 8);
        }
      }
    }

    const recovery =
      lnRmssd !== null && rhr !== null
        ? computeRecovery({
            lnRmssd,
            restingHr: rhr,
            ...(respiratoryRate !== null ? { respiratoryRate } : {}),
            ...(performance !== undefined ? { sleepPerformance: performance } : {}),
            baselines: {
              lnRmssd: buildBaseline('lnRmssd', hrvHistory),
              restingHr: buildBaseline('restingHr', rhrHistory),
              ...(rrHistory.length > 0
                ? { respiratoryRate: buildBaseline('respiratoryRate', rrHistory) }
                : {}),
            },
          })
        : null;

    const activeSamples = activeSessions
      .flatMap((s) => s.samples)
      .sort((a, b) => a.t - b.t);
    const strain = activeSamples.length > 0 ? computeStrain(activeSamples, profile) : null;

    out.push({
      day,
      recovery,
      strain,
      rmssd,
      restingHr: rhr,
      respiratoryRate,
      sleepMinutes,
      sleepEfficiency,
      sleepStages,
    });

    if (lnRmssd !== null) hrvHistory.push(lnRmssd);
    if (rhr !== null) rhrHistory.push(rhr);
    if (respiratoryRate !== null) rrHistory.push(respiratoryRate);
  }

  return out;
}
