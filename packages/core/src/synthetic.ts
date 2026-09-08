/**
 * Synthetic sensor data.
 *
 * Lets the app, the dashboard and the tests be developed and demoed before the
 * strap arrives in the post — and gives every test a deterministic recording
 * with a known answer, which real data can never provide.
 */

import { dayKey } from './time';
import type { RecordedSession } from './daily';
import type {
  CortisolReading,
  EdaSample,
  HeartRateSample,
  MotionSample,
  TemperatureSample,
} from './types';

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

/**
 * A block of waking-day recording from a band with EDA electrodes: skin
 * conductance with realistic sweat-gland response shapes, skin temperature, and
 * heart rate.
 *
 * Sampled at 2 Hz rather than the 4 Hz a real device would use, because the
 * demo generates six weeks of these and the shape of the responses — not the
 * sample rate — is what the analysis actually depends on.
 */
export function syntheticStressBlock(
  startedAt: number,
  minutes: number,
  options: {
    /** Skin conductance responses per minute. ~2 is calm, ~8 is stressed. */
    scrPerMin?: number;
    baselineScl?: number;
    skinTemp?: number;
    restingHr?: number;
    seed?: number;
  } = {},
): { eda: EdaSample[]; temperature: TemperatureSample[]; hr: HeartRateSample[] } {
  const scrPerMin = options.scrPerMin ?? 2;
  const baselineScl = options.baselineScl ?? 5;
  const skinTemp = options.skinTemp ?? 33.2;
  const restingHr = options.restingHr ?? 60;
  const random = seededRandom(options.seed ?? 31);

  const fs = 2;
  const totalSamples = Math.round(minutes * 60 * fs);

  // Place response onsets randomly through the block.
  const onsets: number[] = [];
  const expected = Math.round(scrPerMin * minutes);
  for (let i = 0; i < expected; i++) onsets.push(random() * minutes * 60);
  onsets.sort((a, b) => a - b);

  const eda: EdaSample[] = [];
  const temperature: TemperatureSample[] = [];
  const hr: HeartRateSample[] = [];

  for (let i = 0; i < totalSamples; i++) {
    const seconds = i / fs;
    const t = startedAt + i * (1000 / fs);

    // Slow tonic drift, plus each response as a fast rise and slow recovery.
    let conductance =
      baselineScl + Math.sin(seconds / 400) * 0.4 + (random() - 0.5) * 0.02;
    for (const onset of onsets) {
      const dt = seconds - onset;
      if (dt < 0 || dt > 14) continue;
      const amplitude = 0.25 + random() * 0.5;
      conductance += amplitude * (1 - Math.exp(-dt / 0.9)) * Math.exp(-dt / 4) * 1.9;
    }
    eda.push({ t, microSiemens: conductance });

    if (i % (fs * 30) === 0) {
      // Stress constricts peripheral vessels, so busier days run cooler.
      const cooling = (scrPerMin - 2) * 0.06;
      temperature.push({
        t,
        celsius: skinTemp - cooling + Math.sin(seconds / 900) * 0.15 + (random() - 0.5) * 0.05,
      });
    }

    if (i % fs === 0) {
      const arousal = (scrPerMin - 2) * 1.5;
      const bpm = Math.round(restingHr + 8 + arousal + (random() - 0.5) * 6);
      hr.push({ t, bpm, rrIntervals: [60000 / bpm], contact: true });
    }
  }

  return { eda, temperature, hr };
}

/**
 * Attach waking-day stress recording to a history, as a band with EDA
 * electrodes would produce. Sessions are added in place of nothing — the
 * history's sleep and workouts are left untouched.
 */
export function withStressChannels(
  sessions: readonly RecordedSession[],
  options: { seed?: number } = {},
): RecordedSession[] {
  const random = seededRandom(options.seed ?? 77);
  const out = [...sessions];

  const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
  let index = 0;

  for (const day of [...days].sort()) {
    const anchor = sessions.find((s) => dayKey(s.startedAt) === day);
    if (!anchor) continue;

    const dayStart = new Date(anchor.startedAt);
    dayStart.setHours(14, 0, 0, 0);

    // A handful of genuinely stressful days, the rest ordinary.
    const stressed = random() < 0.25;
    const block = syntheticStressBlock(dayStart.getTime(), 30, {
      scrPerMin: stressed ? 6 + random() * 3 : 1.5 + random() * 1.5,
      baselineScl: 4.5 + random(),
      restingHr: 56 + Math.round(random() * 4),
      seed: 3000 + index,
    });

    out.push({
      id: `daily-${day}`,
      kind: 'daily',
      startedAt: dayStart.getTime(),
      endedAt: dayStart.getTime() + 30 * 60_000,
      samples: block.hr,
      motion: [],
      eda: block.eda,
      temperature: block.temperature,
    });
    index++;
  }

  return out.sort((a, b) => a.startedAt - b.startedAt);
}

/**
 * A month of saliva cortisol, four samples a day on the standard protocol.
 * Stressful days get a flatter curve, which is the pattern the analysis looks
 * for.
 */
export function syntheticCortisol(
  days: number,
  options: { endingAt?: number; seed?: number } = {},
): CortisolReading[] {
  const endingAt = options.endingAt ?? Date.now();
  const random = seededRandom(options.seed ?? 55);
  const readings: CortisolReading[] = [];

  for (let d = days - 1; d >= 0; d--) {
    // Saliva kits are posted off, so only some days have samples.
    if (random() > 0.35) continue;

    const wake = new Date(endingAt - d * 86_400_000);
    wake.setHours(7, 0, 0, 0);
    const wakeTime = wake.getTime();
    const flattened = random() < 0.3;

    const schedule: Array<[hours: number, nmolPerL: number]> = flattened
      ? [
          [0, 9 + random()],
          [0.5, 10 + random()],
          [6, 7 + random()],
          [14, 5 + random()],
        ]
      : [
          [0, 11 + random() * 2],
          [0.5, 19 + random() * 3],
          [6, 6 + random()],
          [14, 2.2 + random() * 0.6],
        ];

    for (const [hours, nmolPerL] of schedule) {
      readings.push({
        t: wakeTime + hours * 3_600_000,
        nmolPerL,
        source: 'saliva',
        wakeTime,
      });
    }
  }

  return readings.sort((a, b) => a.t - b.t);
}
