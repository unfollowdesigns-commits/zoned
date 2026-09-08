/**
 * Time-domain heart rate variability.
 *
 * The maths here is simple. The part that decides whether your numbers are
 * trustworthy is `filterRrIntervals` — a single missed or doubled beat can
 * inflate RMSSD by tens of milliseconds, which is larger than the day-to-day
 * signal you are trying to read.
 */

import type { HrvMetrics } from './types';

/** Beats outside this range are impossible (30–200 bpm) and always dropped. */
const MIN_RR_MS = 300;
const MAX_RR_MS = 2000;

export interface FilterOptions {
  /**
   * Reject a beat when it deviates from the local median by more than this
   * fraction. 0.2 is the widely used default; tighten to 0.15 for resting
   * recordings, loosen to 0.25 during exercise where real variation is larger.
   */
  threshold?: number;
  /** Beats either side used for the local median. */
  window?: number;
}

export interface FilterResult {
  /** Artifact-corrected NN intervals, ms. */
  nn: number[];
  /** How many raw beats were discarded. */
  rejected: number;
}

/**
 * Drop ectopic and misdetected beats.
 *
 * Each interval is compared against the median of its neighbours rather than
 * the whole recording, so a genuine drift in heart rate is preserved while a
 * lone spike is removed.
 */
export function filterRrIntervals(
  rr: readonly number[],
  options: FilterOptions = {},
): FilterResult {
  const threshold = options.threshold ?? 0.2;
  const window = options.window ?? 2;

  const plausible = rr.filter(
    (v) => Number.isFinite(v) && v >= MIN_RR_MS && v <= MAX_RR_MS,
  );
  if (plausible.length === 0) return { nn: [], rejected: rr.length };

  const nn: number[] = [];
  for (let i = 0; i < plausible.length; i++) {
    const lo = Math.max(0, i - window);
    const hi = Math.min(plausible.length, i + window + 1);
    const neighbours: number[] = [];
    for (let j = lo; j < hi; j++) {
      if (j !== i) neighbours.push(plausible[j] as number);
    }
    const local = neighbours.length > 0 ? median(neighbours) : (plausible[i] as number);
    const value = plausible[i] as number;
    if (Math.abs(value - local) <= threshold * local) nn.push(value);
  }

  return { nn, rejected: rr.length - nn.length };
}

/**
 * Compute HRV over a run of RR intervals.
 *
 * Returns null when there is not enough clean data — better a blank card in the
 * UI than a confident wrong number. Aim for at least two minutes of stillness;
 * `minBeats` defaults to roughly 30 seconds' worth.
 */
export function computeHrv(
  rr: readonly number[],
  options: FilterOptions & { minBeats?: number } = {},
): HrvMetrics | null {
  const minBeats = options.minBeats ?? 30;
  const { nn, rejected } = filterRrIntervals(rr, options);
  if (nn.length < minBeats) return null;

  const diffs: number[] = [];
  for (let i = 1; i < nn.length; i++) {
    diffs.push((nn[i] as number) - (nn[i - 1] as number));
  }

  const rmssd = Math.sqrt(mean(diffs.map((d) => d * d)));
  const nn50 = diffs.filter((d) => Math.abs(d) > 50).length;
  const meanNn = mean(nn);

  return {
    rmssd,
    lnRmssd: Math.log(Math.max(rmssd, 1e-6)),
    sdnn: standardDeviation(nn),
    pnn50: diffs.length > 0 ? nn50 / diffs.length : 0,
    meanHr: 60000 / meanNn,
    beatsUsed: nn.length,
    artifactRate: rr.length > 0 ? rejected / rr.length : 0,
  };
}

/**
 * Estimate respiratory rate from respiratory sinus arrhythmia — your heart
 * speeds up as you breathe in and slows as you breathe out, so the breathing
 * rhythm is already hiding in the RR series.
 *
 * Counts zero crossings of the detrended tachogram inside the physiological
 * band (6–30 breaths/min). Returns null when the recording is too short or too
 * noisy to say anything.
 */
export function estimateRespiratoryRate(rr: readonly number[]): number | null {
  const { nn } = filterRrIntervals(rr);
  if (nn.length < 60) return null;

  // Resample the unevenly spaced beats onto a 4 Hz grid.
  const fs = 4;
  const times: number[] = [];
  let clock = 0;
  for (const interval of nn) {
    clock += interval / 1000;
    times.push(clock);
  }
  const duration = clock;
  if (duration < 30) return null;

  const n = Math.floor(duration * fs);
  const series = new Array<number>(n);
  let cursor = 0;
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    while (cursor < times.length - 1 && (times[cursor + 1] as number) < t) cursor++;
    series[i] = nn[cursor] as number;
  }

  // Remove the slow drift so only the breathing oscillation is left.
  const detrended = movingAverageDetrend(series, Math.round(fs * 8));

  let crossings = 0;
  for (let i = 1; i < detrended.length; i++) {
    const prev = detrended[i - 1] as number;
    const curr = detrended[i] as number;
    if ((prev <= 0 && curr > 0) || (prev >= 0 && curr < 0)) crossings++;
  }

  // Two crossings per breath.
  const breathsPerMin = (crossings / 2) * (60 / duration);
  if (breathsPerMin < 6 || breathsPerMin > 30) return null;
  return breathsPerMin;
}

/**
 * Resting heart rate: the lowest sustained heart rate of the night, not the
 * single lowest beat. Uses the 5th percentile of a rolling five-minute mean.
 */
export function restingHeartRate(rr: readonly number[]): number | null {
  const { nn } = filterRrIntervals(rr);
  if (nn.length < 120) return null;

  const windowBeats = 300;
  const means: number[] = [];
  for (let i = 0; i + windowBeats <= nn.length; i += 30) {
    means.push(mean(nn.slice(i, i + windowBeats)));
  }
  if (means.length === 0) means.push(mean(nn));

  const sorted = [...means].sort((a, b) => b - a);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.05));
  return 60000 / (sorted[idx] as number);
}

export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

export function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let acc = 0;
  for (const v of values) acc += (v - m) ** 2;
  return Math.sqrt(acc / (values.length - 1));
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2
    : (sorted[mid] as number);
}

function movingAverageDetrend(series: readonly number[], window: number): number[] {
  const out = new Array<number>(series.length);
  for (let i = 0; i < series.length; i++) {
    const lo = Math.max(0, i - window);
    const hi = Math.min(series.length, i + window + 1);
    out[i] = (series[i] as number) - mean(series.slice(lo, hi));
  }
  return out;
}
