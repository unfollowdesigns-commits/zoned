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
import { computeEdaMetrics } from './eda';
import { computeStress } from './stress';
import { analyzeCortisolDay } from './cortisol';
import { dayKey } from './time';
import type {
  CortisolProfile,
  CortisolReading,
  EdaMetrics,
  EdaSample,
  HeartRateSample,
  MotionSample,
  RecoveryScore,
  SessionKind,
  StrainScore,
  StressScore,
  TemperatureSample,
  UserProfile,
} from './types';

export interface RecordedSession {
  id: string;
  kind: SessionKind;
  startedAt: number;
  endedAt: number;
  samples: HeartRateSample[];
  motion?: MotionSample[];
  /** Skin conductance. Present only from a band with EDA electrodes. */
  eda?: EdaSample[];
  /** Skin temperature. */
  temperature?: TemperatureSample[];
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
  /** Continuous stress across the waking day. Null with no usable channel. */
  stress: StressScore | null;
  /** Electrodermal activity across the waking day. Null without EDA hardware. */
  eda: EdaMetrics | null;
  /** Mean skin temperature across the day, °C. */
  skinTemperature: number | null;
  /** Lab cortisol for the day, if any was entered. */
  cortisol: CortisolProfile | null;
}

export { dayKey } from './time';

export function summarizeDays(
  sessions: readonly RecordedSession[],
  profile: UserProfile,
  /**
   * Cortisol comes from a lab, not a sensor, so it arrives separately from the
   * recorded sessions rather than inside one.
   */
  cortisolReadings: readonly CortisolReading[] = [],
): DayMetrics[] {
  const byDay = new Map<string, RecordedSession[]>();
  for (const session of sessions) {
    // A night starting at 23:00 is scored against the morning it ends on.
    const key = dayKey(session.kind === 'sleep' ? session.endedAt : session.startedAt);
    const list = byDay.get(key) ?? [];
    list.push(session);
    byDay.set(key, list);
  }

  const cortisolByDay = new Map<string, CortisolReading[]>();
  for (const reading of cortisolReadings) {
    const key = dayKey(reading.wakeTime ?? reading.t);
    const list = cortisolByDay.get(key) ?? [];
    list.push(reading);
    cortisolByDay.set(key, list);
  }

  const days = [...new Set([...byDay.keys(), ...cortisolByDay.keys()])].sort();
  // Baselines are built only from days *before* the one being scored, so a bad
  // night can never drag its own score back toward normal.
  const hrvHistory: number[] = [];
  const rhrHistory: number[] = [];
  const rrHistory: number[] = [];
  const scrHistory: number[] = [];
  const skinTempHistory: number[] = [];
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

    // Stress is a waking-day measure: including sleep would drag every day
    // toward calm and hide the hours that actually cost you something.
    const wakingEda = activeSessions
      .flatMap((s) => s.eda ?? [])
      .sort((a, b) => a.t - b.t);
    const wakingTemps = activeSessions
      .flatMap((s) => s.temperature ?? [])
      .sort((a, b) => a.t - b.t);

    const edaMetrics = wakingEda.length > 0 ? computeEdaMetrics(wakingEda) : null;
    const skinTemperature =
      wakingTemps.length > 0
        ? wakingTemps.reduce((acc, t) => acc + t.celsius, 0) / wakingTemps.length
        : null;

    const wakingHrv =
      activeSamples.length > 0
        ? computeHrv(collectRrIntervals(activeSamples), { minBeats: 120 })
        : null;

    const stressBaselines = {
      ...(scrHistory.length > 0
        ? { scrPerMin: buildBaseline('scrPerMin', scrHistory) }
        : {}),
      lnRmssd: buildBaseline('lnRmssd', hrvHistory),
      restingHr: buildBaseline('restingHr', rhrHistory),
      ...(skinTempHistory.length > 0
        ? { skinTemperature: buildBaseline('skinTemperature', skinTempHistory) }
        : {}),
    };

    const hasStressChannel =
      edaMetrics !== null || wakingHrv !== null || skinTemperature !== null;

    const stress = hasStressChannel
      ? computeStress({
          eda: edaMetrics,
          hrv: wakingHrv,
          ...(activeSamples.length > 0
            ? {
                meanHr:
                  activeSamples.reduce((acc, s) => acc + s.bpm, 0) /
                  activeSamples.length,
              }
            : {}),
          ...(skinTemperature !== null ? { skinTemperature } : {}),
          profile,
          baselines: stressBaselines,
        })
      : null;

    const dayCortisol = cortisolByDay.get(day);
    const cortisol =
      dayCortisol && dayCortisol.length > 0 ? analyzeCortisolDay(dayCortisol) : null;

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
      stress,
      eda: edaMetrics,
      skinTemperature,
      cortisol,
    });

    if (lnRmssd !== null) hrvHistory.push(lnRmssd);
    if (rhr !== null) rhrHistory.push(rhr);
    if (respiratoryRate !== null) rrHistory.push(respiratoryRate);
    if (edaMetrics !== null) scrHistory.push(edaMetrics.scrPerMin);
    if (skinTemperature !== null) skinTempHistory.push(skinTemperature);
  }

  return out;
}
