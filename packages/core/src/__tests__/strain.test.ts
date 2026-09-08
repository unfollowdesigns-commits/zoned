import { describe, expect, it } from 'vitest';
import {
  combineStrain,
  computeStrain,
  estimateMaxHr,
  heartRateZone,
  trimpToStrain,
} from '../strain.js';
import { syntheticWorkout } from '../synthetic.js';
import type { HeartRateSample, UserProfile } from '../types.js';

const profile: UserProfile = { age: 30, restingHr: 55, sex: 'male' };

describe('zones and max heart rate', () => {
  it('uses the Tanaka formula', () => {
    expect(estimateMaxHr(30)).toBeCloseTo(187, 0);
  });

  it('places heart rates in the expected zone', () => {
    // Max HR for a 30-year-old is 187.
    expect(heartRateZone(80, profile)).toBe(0);
    expect(heartRateZone(100, profile)).toBe(1);
    expect(heartRateZone(120, profile)).toBe(2);
    expect(heartRateZone(140, profile)).toBe(3);
    expect(heartRateZone(160, profile)).toBe(4);
    expect(heartRateZone(180, profile)).toBe(5);
  });
});

describe('trimpToStrain', () => {
  it('is zero for no load and rises monotonically', () => {
    expect(trimpToStrain(0)).toBe(0);
    expect(trimpToStrain(10)).toBeLessThan(trimpToStrain(50));
    expect(trimpToStrain(50)).toBeLessThan(trimpToStrain(200));
  });

  it('puts a moderate hour near 10 and a brutal day near 19', () => {
    expect(trimpToStrain(50)).toBeGreaterThan(9);
    expect(trimpToStrain(50)).toBeLessThan(11);
    expect(trimpToStrain(300)).toBeGreaterThan(18);
  });

  it('never exceeds the top of the scale', () => {
    expect(trimpToStrain(100000)).toBe(21);
  });
});

describe('computeStrain', () => {
  it('scores a hard workout above an easy one', () => {
    const easy = computeStrain(syntheticWorkout(0, 45, { peakHr: 130 }), profile);
    const hard = computeStrain(syntheticWorkout(0, 45, { peakHr: 180 }), profile);
    expect(hard.strain).toBeGreaterThan(easy.strain);
    expect(hard.averageHr).toBeGreaterThan(easy.averageHr);
  });

  it('measures duration in minutes from the sample timestamps', () => {
    const score = computeStrain(syntheticWorkout(0, 30), profile);
    expect(score.durationMin).toBeGreaterThan(29);
    expect(score.durationMin).toBeLessThan(31);
  });

  it('does not invent load across a dropped connection', () => {
    const samples: HeartRateSample[] = [
      { t: 0, bpm: 170, rrIntervals: [] },
      // An hour-long Bluetooth dropout.
      { t: 3_600_000, bpm: 170, rrIntervals: [] },
      { t: 3_601_000, bpm: 170, rrIntervals: [] },
    ];
    const score = computeStrain(samples, profile);
    expect(score.durationMin).toBeLessThan(1);
  });

  it('sits at zero when the heart never leaves rest', () => {
    const samples: HeartRateSample[] = Array.from({ length: 600 }, (_, i) => ({
      t: i * 1000,
      bpm: 55,
      rrIntervals: [],
    }));
    expect(computeStrain(samples, profile).strain).toBeCloseTo(0, 3);
  });

  it('adds two workouts as load, not as scores', () => {
    const one = computeStrain(syntheticWorkout(0, 45, { peakHr: 170 }), profile);
    const day = combineStrain([one, one]);
    expect(day).toBeGreaterThan(one.strain);
    expect(day).toBeLessThan(one.strain * 2);
  });
});
