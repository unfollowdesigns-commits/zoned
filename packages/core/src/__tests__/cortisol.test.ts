import { describe, expect, it } from 'vitest';
import {
  analyzeCortisolDay,
  cortisolDeviation,
  describeCortisol,
  expectedSalivaryCortisol,
  toSalivaryEquivalent,
} from '../cortisol';
import type { CortisolReading } from '../types';

const WAKE = new Date(2026, 5, 1, 7, 0).getTime();
const hoursAfterWake = (h: number) => WAKE + h * 3_600_000;

function saliva(h: number, nmolPerL: number): CortisolReading {
  return { t: hoursAfterWake(h), nmolPerL, source: 'saliva', wakeTime: WAKE };
}

describe('expectedSalivaryCortisol', () => {
  it('peaks around 30 minutes after waking', () => {
    const wake = expectedSalivaryCortisol(0);
    const peak = expectedSalivaryCortisol(0.5);
    expect(peak).toBeGreaterThan(wake);
    expect(peak).toBeGreaterThan(expectedSalivaryCortisol(1));
  });

  it('declines monotonically after the peak', () => {
    let previous = expectedSalivaryCortisol(1);
    for (const h of [2, 3, 6, 10, 14, 16]) {
      const value = expectedSalivaryCortisol(h);
      expect(value).toBeLessThan(previous);
      previous = value;
    }
  });

  it('clamps outside the modelled day rather than extrapolating to nonsense', () => {
    expect(expectedSalivaryCortisol(-5)).toBe(expectedSalivaryCortisol(0));
    expect(expectedSalivaryCortisol(40)).toBe(expectedSalivaryCortisol(16));
    expect(expectedSalivaryCortisol(40)).toBeGreaterThan(0);
  });
});

describe('toSalivaryEquivalent', () => {
  it('passes saliva through unchanged', () => {
    expect(toSalivaryEquivalent(saliva(0, 12))).toBe(12);
  });

  it('scales serum down to the free fraction', () => {
    const serum: CortisolReading = { t: WAKE, nmolPerL: 400, source: 'serum' };
    expect(toSalivaryEquivalent(serum)).toBeCloseTo(20, 5);
  });

  it('refuses to convert hair, which measures weeks not moments', () => {
    const hair: CortisolReading = { t: WAKE, nmolPerL: 5, source: 'hair' };
    expect(toSalivaryEquivalent(hair)).toBeNull();
  });
});

describe('cortisolDeviation', () => {
  it('is zero for a reading exactly on the reference curve', () => {
    const onCurve = saliva(3, expectedSalivaryCortisol(3));
    expect(cortisolDeviation(onCurve, WAKE)!).toBeCloseTo(0, 6);
  });

  it('reads the same concentration differently morning versus night', () => {
    const morning = cortisolDeviation(saliva(0, 12), WAKE)!;
    const evening = cortisolDeviation(saliva(14, 12), WAKE)!;
    expect(morning).toBeLessThan(evening);
    expect(evening).toBeGreaterThan(1);
  });

  it('rejects a reading from outside the day', () => {
    expect(cortisolDeviation(saliva(30, 10), WAKE)).toBeNull();
  });
});

describe('analyzeCortisolDay', () => {
  // A textbook four-sample protocol with a healthy awakening rise.
  const healthy = [saliva(0, 12), saliva(0.5, 21), saliva(6, 6), saliva(14, 2.4)];

  it('returns null with no readings', () => {
    expect(analyzeCortisolDay([])).toBeNull();
  });

  it('computes the awakening response as a fraction of the waking value', () => {
    const profile = analyzeCortisolDay(healthy, WAKE)!;
    expect(profile.car).toBeCloseTo((21 - 12) / 12, 5);
  });

  it('reports a steeply negative diurnal slope for a healthy day', () => {
    const profile = analyzeCortisolDay(healthy, WAKE)!;
    expect(profile.diurnalSlope).not.toBeNull();
    expect(profile.diurnalSlope!).toBeLessThan(-0.06);
  });

  it('detects a flattened slope, the chronic stress pattern', () => {
    const flat = [saliva(0, 9), saliva(0.5, 10), saliva(6, 8), saliva(14, 7)];
    const profile = analyzeCortisolDay(flat, WAKE)!;
    expect(profile.diurnalSlope!).toBeGreaterThan(-0.06);
    expect(describeCortisol(profile)).toContain('flattened');
  });

  it('detects a blunted awakening response', () => {
    const blunted = [saliva(0, 10), saliva(0.5, 10.5), saliva(6, 5), saliva(14, 2)];
    const profile = analyzeCortisolDay(blunted, WAKE)!;
    expect(profile.car!).toBeLessThan(0.2);
    expect(describeCortisol(profile)).toContain('chronic stress');
  });

  it('needs both early samples for a CAR', () => {
    const noCar = analyzeCortisolDay([saliva(0, 12), saliva(6, 6)], WAKE)!;
    expect(noCar.car).toBeNull();
    // Two points either side of the awakening peak still give a wake-to-day slope.
    expect(noCar.diurnalSlope).not.toBeNull();
  });

  it('reports nothing usable from a single sample', () => {
    const lone = analyzeCortisolDay([saliva(3, 9)], WAKE)!;
    expect(lone.car).toBeNull();
    expect(lone.diurnalSlope).toBeNull();
    expect(describeCortisol(lone)).toContain('Not enough samples');
  });

  it('excludes the awakening peak from the slope', () => {
    // The +0.5h peak, if included, would flatten or invert the fitted slope.
    const profile = analyzeCortisolDay(healthy, WAKE)!;
    const withoutPeak = analyzeCortisolDay(
      healthy.filter((r) => r.t !== hoursAfterWake(0.5)),
      WAKE,
    )!;
    expect(profile.diurnalSlope).toBeCloseTo(withoutPeak.diurnalSlope!, 6);
  });

  it('computes exposure across the day and keeps every reading', () => {
    const profile = analyzeCortisolDay(healthy, WAKE)!;
    expect(profile.auc!).toBeGreaterThan(0);
    expect(profile.readings).toHaveLength(4);
    expect(profile.deviations).toHaveLength(4);
  });

  it('never presents a pattern as a diagnosis', () => {
    const profile = analyzeCortisolDay(healthy, WAKE)!;
    expect(describeCortisol(profile)).toContain('not diagnoses');
  });
});
