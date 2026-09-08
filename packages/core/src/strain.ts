/**
 * Cardiovascular load for a day or a workout.
 *
 * Built on Banister's TRIMP, which weights time spent at a heart rate by how
 * hard that heart rate is *for you* — so an easy hour and a brutal twenty
 * minutes can score the same, which is the whole point.
 *
 * The 0–21 presentation is a deliberate echo of the scale everyone recognises,
 * mapped logarithmically so the top end stays genuinely hard to reach. The
 * curve is this project's own; it is not Whoop's formula, which is proprietary.
 */

import type { HeartRateSample, StrainScore, UserProfile } from './types.js';
import { clamp } from './baseline.js';

/** Tanaka et al. (2001) — more accurate across ages than 220 − age. */
export function estimateMaxHr(age: number): number {
  return 208 - 0.7 * age;
}

export function maxHrFor(profile: UserProfile): number {
  return profile.maxHr ?? estimateMaxHr(profile.age);
}

/** Fraction of heart rate reserve used, 0..1 (Karvonen). */
export function heartRateReserve(bpm: number, profile: UserProfile): number {
  const max = maxHrFor(profile);
  const rest = profile.restingHr;
  if (max <= rest) return 0;
  return clamp((bpm - rest) / (max - rest), 0, 1);
}

/** Zone 1..5 by percentage of max HR; 0 means below zone 1. */
export function heartRateZone(bpm: number, profile: UserProfile): 0 | 1 | 2 | 3 | 4 | 5 {
  const pct = bpm / maxHrFor(profile);
  if (pct < 0.5) return 0;
  if (pct < 0.6) return 1;
  if (pct < 0.7) return 2;
  if (pct < 0.8) return 3;
  if (pct < 0.9) return 4;
  return 5;
}

const TRIMP_SHAPE = { male: { a: 0.64, b: 1.92 }, female: { a: 0.86, b: 1.67 } };

// Tuned so a moderate hour lands near 10 and a very hard day near 19.
const STRAIN_A = 5.477;
const STRAIN_B = 9.6;

export function trimpToStrain(trimp: number): number {
  if (trimp <= 0) return 0;
  return clamp(STRAIN_A * Math.log(1 + trimp / STRAIN_B), 0, 21);
}

/**
 * Score a run of heart-rate samples.
 *
 * Each sample contributes the time until the next sample, capped at `maxGapSec`
 * so a dropped Bluetooth connection cannot silently invent an hour of load.
 */
export function computeStrain(
  samples: readonly HeartRateSample[],
  profile: UserProfile,
  options: { maxGapSec?: number } = {},
): StrainScore {
  const maxGapSec = options.maxGapSec ?? 10;
  const shape = TRIMP_SHAPE[profile.sex === 'female' ? 'female' : 'male'];

  const zoneMinutes: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let trimp = 0;
  let weightedHr = 0;
  let totalMin = 0;
  let maxHr = 0;

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i] as HeartRateSample;
    const next = samples[i + 1];
    const gapSec = next
      ? Math.min(Math.max((next.t - sample.t) / 1000, 0), maxGapSec)
      : 1;
    const minutes = gapSec / 60;
    if (minutes <= 0) continue;

    const reserve = heartRateReserve(sample.bpm, profile);
    trimp += minutes * reserve * shape.a * Math.exp(shape.b * reserve);

    const zone = heartRateZone(sample.bpm, profile);
    if (zone > 0) {
      const idx = zone - 1;
      zoneMinutes[idx] = (zoneMinutes[idx] as number) + minutes;
    }

    weightedHr += sample.bpm * minutes;
    totalMin += minutes;
    maxHr = Math.max(maxHr, sample.bpm);
  }

  return {
    strain: trimpToStrain(trimp),
    trimp,
    zoneMinutes,
    averageHr: totalMin > 0 ? weightedHr / totalMin : 0,
    maxHr,
    durationMin: totalMin,
  };
}

/**
 * Combine several sessions into one day's strain.
 *
 * Loads add in TRIMP space, not strain space — two strain-10 workouts make a
 * day of about 14, not 20, which matches how the scale is meant to behave.
 */
export function combineStrain(scores: readonly StrainScore[]): number {
  let trimp = 0;
  for (const s of scores) trimp += s.trimp;
  return trimpToStrain(trimp);
}
