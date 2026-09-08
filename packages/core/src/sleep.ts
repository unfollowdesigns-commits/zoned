/**
 * Sleep detection and stage estimation.
 *
 * Be clear-eyed about what this can do. Wake-versus-sleep from wrist motion is
 * a solved, validated problem — the Cole-Kripke algorithm below is the standard
 * and agrees with lab polysomnography around 90% of the time. Splitting sleep
 * into light, deep and REM without EEG is *not* solved. The staging here reads
 * heart rate and stillness, which genuinely covary with the stages, and it will
 * get the shape of your night roughly right, but treat individual epochs as
 * indicative rather than measured.
 */

import type {
  HeartRateSample,
  MotionSample,
  SleepEpoch,
  SleepStage,
  SleepSummary,
} from './types';
import { mean } from './hrv';

const EPOCH_MS = 60_000;

export interface SleepOptions {
  /**
   * Scales raw accelerometer magnitude into the "activity counts" Cole-Kripke
   * expects. Device-specific — see docs/HARDWARE.md for how to calibrate it.
   */
  countScale?: number;
  /** Minutes of continuous sleep required before the night is considered begun. */
  onsetMinutes?: number;
}

/** One minute of aligned heart rate and motion. */
interface Epoch {
  t: number;
  meanHr: number;
  hrSamples: number;
  activity: number;
}

function buildEpochs(
  hr: readonly HeartRateSample[],
  motion: readonly MotionSample[],
  countScale: number,
): Epoch[] {
  if (hr.length === 0) return [];

  const start = Math.floor((hr[0] as HeartRateSample).t / EPOCH_MS) * EPOCH_MS;
  const end = (hr[hr.length - 1] as HeartRateSample).t;
  const count = Math.max(1, Math.ceil((end - start) / EPOCH_MS));

  const buckets: Epoch[] = [];
  for (let i = 0; i < count; i++) {
    buckets.push({ t: start + i * EPOCH_MS, meanHr: 0, hrSamples: 0, activity: 0 });
  }

  for (const s of hr) {
    const idx = Math.floor((s.t - start) / EPOCH_MS);
    const bucket = buckets[idx];
    if (!bucket) continue;
    bucket.meanHr += s.bpm;
    bucket.hrSamples += 1;
  }

  for (const m of motion) {
    const idx = Math.floor((m.t - start) / EPOCH_MS);
    const bucket = buckets[idx];
    if (!bucket) continue;
    // Activity counts accumulate movement above a small noise floor.
    bucket.activity += Math.max(0, m.magnitudeG - 0.02) * countScale;
  }

  for (const bucket of buckets) {
    bucket.meanHr = bucket.hrSamples > 0 ? bucket.meanHr / bucket.hrSamples : 0;
  }

  return buckets.filter((b) => b.hrSamples > 0);
}

/**
 * Cole-Kripke sleep/wake scoring.
 *
 * A weighted sum of the current minute's activity and the four before and two
 * after it; below 1.0 scores as sleep. Weights are from Cole et al. (1992).
 */
export function coleKripke(activity: readonly number[]): boolean[] {
  const weights = [106, 54, 58, 76, 230, 74, 67];
  const offsets = [-4, -3, -2, -1, 0, 1, 2];

  return activity.map((_, i) => {
    let d = 0;
    for (let k = 0; k < offsets.length; k++) {
      const idx = i + (offsets[k] as number);
      const value = idx >= 0 && idx < activity.length ? (activity[idx] as number) : 0;
      d += (weights[k] as number) * value;
    }
    return d * 0.001 < 1;
  });
}

/**
 * Score a night.
 *
 * Pass heart rate throughout the night and, if the device has an accelerometer,
 * motion. Without motion the scoring falls back to heart rate alone, which is
 * noticeably worse at catching brief awakenings — a reason to want your own
 * band eventually.
 */
export function analyzeSleep(
  hr: readonly HeartRateSample[],
  motion: readonly MotionSample[] = [],
  options: SleepOptions = {},
): SleepSummary | null {
  const countScale = options.countScale ?? 100;
  const onsetMinutes = options.onsetMinutes ?? 5;

  const epochs = buildEpochs(hr, motion, countScale);
  if (epochs.length < 30) return null;

  const hasMotion = motion.length > 0;
  const asleepFlags = hasMotion
    ? coleKripke(epochs.map((e) => e.activity))
    : heartRateOnlySleep(epochs);

  // Trim to the first and last sustained run of sleep.
  const firstSleep = findRun(asleepFlags, true, onsetMinutes);
  if (firstSleep < 0) return null;
  let lastSleep = asleepFlags.length - 1;
  while (lastSleep > firstSleep && !asleepFlags[lastSleep]) lastSleep--;

  const night = epochs.slice(firstSleep, lastSleep + 1);
  const nightFlags = asleepFlags.slice(firstSleep, lastSleep + 1);

  const sleepHrs = night.filter((_, i) => nightFlags[i]).map((e) => e.meanHr);
  const staged = stageNight(night, nightFlags, sleepHrs);

  const stageMinutes: Record<SleepStage, number> = {
    awake: 0,
    light: 0,
    deep: 0,
    rem: 0,
  };
  for (const epoch of staged) stageMinutes[epoch.stage] += 1;

  let disturbances = 0;
  for (let i = 1; i < staged.length; i++) {
    if (
      (staged[i] as SleepEpoch).stage === 'awake' &&
      (staged[i - 1] as SleepEpoch).stage !== 'awake'
    ) {
      disturbances++;
    }
  }

  const inBedMin = staged.length;
  const asleepMin = inBedMin - stageMinutes.awake;

  return {
    startedAt: (night[0] as Epoch).t,
    endedAt: (night[night.length - 1] as Epoch).t + EPOCH_MS,
    asleepMin,
    inBedMin,
    efficiency: inBedMin > 0 ? asleepMin / inBedMin : 0,
    stageMinutes,
    disturbances,
    epochs: staged,
  };
}

/**
 * Assign a stage to each minute.
 *
 * Deep sleep runs at the night's lowest heart rate with almost no movement;
 * REM shows an elevated, more variable heart rate alongside muscle atonia, so
 * stillness plus a *raised* rate is the tell. Everything else is light sleep.
 */
function stageNight(
  night: readonly Epoch[],
  flags: readonly boolean[],
  sleepHrs: readonly number[],
): SleepEpoch[] {
  const sorted = [...sleepHrs].sort((a, b) => a - b);
  const pct = (p: number) =>
    sorted.length > 0
      ? (sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] as number)
      : 0;

  const deepThreshold = pct(0.25);
  const remThreshold = pct(0.7);
  const meanActivity = mean(night.map((e) => e.activity));
  const stillness = meanActivity * 0.5;

  return night.map((epoch, i) => {
    let stage: SleepStage;
    if (!flags[i]) {
      stage = 'awake';
    } else if (epoch.meanHr <= deepThreshold && epoch.activity <= stillness) {
      stage = 'deep';
    } else if (epoch.meanHr >= remThreshold && epoch.activity <= stillness) {
      stage = 'rem';
    } else {
      stage = 'light';
    }
    return { t: epoch.t, stage, meanHr: epoch.meanHr, motion: epoch.activity };
  });
}

/** Fallback when the sensor has no accelerometer: sleep is a sustained low HR. */
function heartRateOnlySleep(epochs: readonly Epoch[]): boolean[] {
  const hrs = epochs.map((e) => e.meanHr).filter((v) => v > 0);
  const sorted = [...hrs].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.1)] ?? 0;
  const threshold = low * 1.15;
  return epochs.map((e) => e.meanHr > 0 && e.meanHr <= threshold);
}

function findRun(flags: readonly boolean[], value: boolean, length: number): number {
  let run = 0;
  for (let i = 0; i < flags.length; i++) {
    run = flags[i] === value ? run + 1 : 0;
    if (run >= length) return i - length + 1;
  }
  return -1;
}

/** Hours slept over hours needed, capped at 1. */
export function sleepPerformance(summary: SleepSummary, needHours = 8): number {
  return Math.min(1, summary.asleepMin / 60 / needHours);
}
