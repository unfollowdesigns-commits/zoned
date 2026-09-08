import { describe, expect, it } from 'vitest';
import {
  computeHrv,
  estimateRespiratoryRate,
  filterRrIntervals,
  restingHeartRate,
} from '../hrv';
import { syntheticRrIntervals } from '../synthetic';

describe('filterRrIntervals', () => {
  it('keeps a clean recording intact', () => {
    const rr = [1000, 1010, 995, 1005, 1002, 998, 1001];
    expect(filterRrIntervals(rr).rejected).toBe(0);
  });

  it('drops a missed beat that shows up as a doubled interval', () => {
    const rr = [1000, 1010, 995, 2000, 1005, 998, 1001, 1004];
    const { nn, rejected } = filterRrIntervals(rr);
    expect(rejected).toBe(1);
    expect(nn).not.toContain(2000);
  });

  it('drops physiologically impossible intervals outright', () => {
    const { nn } = filterRrIntervals([1000, 50, 1010, 5000, 990]);
    expect(nn.every((v) => v > 300 && v < 2000)).toBe(true);
  });

  it('preserves a genuine ramp in heart rate', () => {
    const rr = Array.from({ length: 40 }, (_, i) => 1000 - i * 10);
    expect(filterRrIntervals(rr).rejected).toBe(0);
  });
});

describe('computeHrv', () => {
  it('returns null rather than guessing from too few beats', () => {
    expect(computeHrv([1000, 1010, 990])).toBeNull();
  });

  it('reports zero variability for a metronomic heart', () => {
    const metrics = computeHrv(Array(100).fill(800));
    expect(metrics).not.toBeNull();
    expect(metrics!.rmssd).toBeCloseTo(0, 5);
    expect(metrics!.meanHr).toBeCloseTo(75, 5);
  });

  it('recovers the RMSSD it was given', () => {
    const rr = syntheticRrIntervals(600, { meanHr: 60, rmssd: 50, seed: 3 });
    const metrics = computeHrv(rr, { threshold: 0.35 });
    expect(metrics).not.toBeNull();
    expect(metrics!.rmssd).toBeGreaterThan(35);
    expect(metrics!.rmssd).toBeLessThan(65);
    expect(metrics!.lnRmssd).toBeCloseTo(Math.log(metrics!.rmssd), 6);
  });

  it('separates a rested morning from a strained one', () => {
    const rested = computeHrv(
      syntheticRrIntervals(600, { meanHr: 52, rmssd: 70, seed: 1 }),
      { threshold: 0.35 },
    );
    const strained = computeHrv(
      syntheticRrIntervals(600, { meanHr: 62, rmssd: 25, seed: 1 }),
      { threshold: 0.35 },
    );
    expect(rested!.rmssd).toBeGreaterThan(strained!.rmssd);
    expect(rested!.meanHr).toBeLessThan(strained!.meanHr);
  });

  it('reports the share of beats it threw away', () => {
    const rr = [...Array(100).fill(1000)];
    rr[50] = 1900;
    const metrics = computeHrv(rr);
    expect(metrics!.artifactRate).toBeGreaterThan(0);
    expect(metrics!.artifactRate).toBeLessThan(0.05);
  });
});

describe('estimateRespiratoryRate', () => {
  it('finds the breathing rhythm hidden in the beat timings', () => {
    const rr = syntheticRrIntervals(900, {
      meanHr: 60,
      rmssd: 20,
      breathingRate: 15,
      seed: 5,
    });
    const rate = estimateRespiratoryRate(rr);
    expect(rate).not.toBeNull();
    expect(rate!).toBeGreaterThan(9);
    expect(rate!).toBeLessThan(24);
  });

  it('declines to answer from a short recording', () => {
    expect(estimateRespiratoryRate([1000, 1010, 990])).toBeNull();
  });
});

describe('restingHeartRate', () => {
  it('finds the sustained low, not one stray slow beat', () => {
    const rr = Array.from({ length: 800 }, (_, i) => (i > 400 ? 1200 : 900));
    const rhr = restingHeartRate(rr);
    expect(rhr).not.toBeNull();
    expect(rhr!).toBeGreaterThan(48);
    expect(rhr!).toBeLessThan(54);
  });
});
