/**
 * Synthetic sensor data.
 *
 * Lets the app, the dashboard and the tests be developed and demoed before the
 * strap arrives in the post — and gives every test a deterministic recording
 * with a known answer, which real data can never provide.
 */

import type { RecordedSession } from './daily';
import type { HeartRateSample, MotionSample } from './types';

/** Small deterministic PRNG so runs are reproducible. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

export interface SyntheticOptions {
  meanHr?: number;
  /** Target RMSSD in ms — the variability the generator aims to produce. */
  rmssd?: number;
  /** Breaths per minute driving respiratory sinus arrhythmia. */
  breathingRate?: number;
  seed?: number;
}

/**
 * Generate a run of RR intervals with a known mean rate and roughly the
 * requested RMSSD, modulated by a breathing oscillation.
 */
export function syntheticRrIntervals(
  beats: number,
  options: SyntheticOptions = {},
): number[] {
  const meanHr = options.meanHr ?? 60;
  const targetRmssd = options.rmssd ?? 50;
  const breathingRate = options.breathingRate ?? 14;
  const random = seededRandom(options.seed ?? 42);

  const meanRr = 60000 / meanHr;
  // Successive differences of white noise with SD s have RMSSD ≈ s * sqrt(2).
  const noiseSd = targetRmssd / Math.SQRT2;

  const out: number[] = [];
  let clockSec = 0;
  for (let i = 0; i < beats; i++) {
    const rsa = Math.sin(2 * Math.PI * (breathingRate / 60) * clockSec) * meanRr * 0.03;
    const noise = gaussian(random) * noiseSd;
    const rr = Math.max(300, meanRr + rsa + noise);
    out.push(rr);
    clockSec += rr / 1000;
  }
  return out;
}

/** Turn RR intervals into the per-second samples a real sensor would emit. */
export function rrToSamples(rr: readonly number[], startedAt: number): HeartRateSample[] {
  const samples: HeartRateSample[] = [];
  let t = startedAt;
  let pending: number[] = [];
  let lastEmit = startedAt;

  for (const interval of rr) {
    t += interval;
    pending.push(interval);
    if (t - lastEmit >= 1000) {
      samples.push({
        t: Math.round(t),
        bpm: Math.round(60000 / (pending.reduce((a, b) => a + b, 0) / pending.length)),
        rrIntervals: pending,
        contact: true,
      });
      pending = [];
      lastEmit = t;
    }
  }
  return samples;
}

/** A night of sleep: HR dipping through the small hours, motion near zero. */
export function syntheticNight(
  startedAt: number,
  hours = 8,
  options: { seed?: number; restingHr?: number } = {},
): { hr: HeartRateSample[]; motion: MotionSample[] } {
  const random = seededRandom(options.seed ?? 7);
  const restingHr = options.restingHr ?? 52;
  const minutes = Math.round(hours * 60);

  const hr: HeartRateSample[] = [];
  const motion: MotionSample[] = [];

  for (let m = 0; m < minutes; m++) {
    const t = startedAt + m * 60_000;
    const progress = m / minutes;
    // Deepest in the first third, drifting up toward morning.
    const dip = -6 * Math.exp(-((progress - 0.25) ** 2) / 0.02);
    // ~90 minute sleep cycles.
    const cycle = 3 * Math.sin(2 * Math.PI * (m / 90));
    const awake = m < 4 || (m > minutes * 0.55 && m < minutes * 0.55 + 3);
    const bpm = Math.round(
      restingHr + dip + cycle + (awake ? 14 : 0) + (random() - 0.5) * 3,
    );

    const rrMs = 60000 / bpm;
    hr.push({ t, bpm, rrIntervals: [rrMs, rrMs + (random() - 0.5) * 40], contact: true });

    for (let s = 0; s < 4; s++) {
      motion.push({
        t: t + s * 15_000,
        magnitudeG: awake ? 0.1 + random() * 0.3 : random() * 0.03,
      });
    }
  }

  return { hr, motion };
}

/** A workout: warm-up, intervals, cool-down. */
export function syntheticWorkout(
  startedAt: number,
  durationMin = 45,
  options: { seed?: number; peakHr?: number } = {},
): HeartRateSample[] {
  const random = seededRandom(options.seed ?? 11);
  const peakHr = options.peakHr ?? 175;
  const samples: HeartRateSample[] = [];

  for (let s = 0; s < durationMin * 60; s++) {
    const progress = s / (durationMin * 60);
    let target: number;
    if (progress < 0.15) target = 100 + progress * 300;
    else if (progress > 0.85) target = peakHr - (progress - 0.85) * 400;
    else target = peakHr - 25 + 25 * Math.sin(2 * Math.PI * progress * 6);

    const bpm = Math.round(Math.max(60, target + (random() - 0.5) * 4));
    samples.push({
      t: startedAt + s * 1000,
      bpm,
      rrIntervals: [60000 / bpm],
      contact: true,
    });
  }
  return samples;
}

function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-9);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * A plausible multi-week history: a night of sleep every day, workouts on some
 * of them, and a slow drift in fitness so the baselines have something to track.
 *
 * Used by the dashboard's demo mode and by the daily-rollup tests, both of which
 * need many days of data that no one wants to wait a month to collect.
 */
export function syntheticHistory(
  days: number,
  options: { endingAt?: number; seed?: number } = {},
): RecordedSession[] {
  const endingAt = options.endingAt ?? Date.now();
  const random = seededRandom(options.seed ?? 99);
  const sessions: RecordedSession[] = [];

  for (let d = days - 1; d >= 0; d--) {
    const dayStart = new Date(endingAt - d * 86_400_000);
    dayStart.setHours(0, 0, 0, 0);

    // Fitness improves slowly; hard days depress the following morning's HRV.
    const trend = (days - d) / days;
    const hardDay = random() < 0.45;
    const restingHr = Math.round(56 - trend * 4 + (hardDay ? 2 : 0) + random() * 2);

    const bedtime = dayStart.getTime() - 60 * 60_000 + Math.round(random() * 90 * 60_000);
    const hours = 6 + random() * 2.5;
    const night = syntheticNight(bedtime, hours, { seed: 1000 + d, restingHr });

    sessions.push({
      id: `sleep-${d}`,
      kind: 'sleep',
      startedAt: bedtime,
      endedAt: bedtime + hours * 3_600_000,
      samples: night.hr,
      motion: night.motion,
    });

    if (hardDay) {
      const start = dayStart.getTime() + (17 + random()) * 3_600_000;
      const duration = 30 + Math.round(random() * 50);
      sessions.push({
        id: `workout-${d}`,
        kind: 'workout',
        startedAt: start,
        endedAt: start + duration * 60_000,
        samples: syntheticWorkout(start, duration, {
          seed: 2000 + d,
          peakHr: 150 + Math.round(random() * 30),
        }),
        motion: [],
      });
    }
  }

  return sessions.sort((a, b) => a.startedAt - b.startedAt);
}
