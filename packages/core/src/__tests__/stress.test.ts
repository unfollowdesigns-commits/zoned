import { describe, expect, it } from 'vitest';
import { computeStress, describeStress } from '../stress';
import { buildBaseline, emptyBaseline } from '../baseline';
import type { StressInput } from '../stress';
import type { EdaMetrics, HrvMetrics, UserProfile } from '../types';

const profile: UserProfile = { age: 32, restingHr: 55, maxHr: 188, sex: 'male' };

function eda(scrPerMin: number): EdaMetrics {
  return {
    meanScl: 6,
    scrPerMin,
    meanScrAmplitude: 0.4,
    scrCount: Math.round(scrPerMin * 10),
    artifactRate: 0,
    durationMin: 10,
  };
}

function hrv(rmssd: number): HrvMetrics {
  return {
    rmssd,
    lnRmssd: Math.log(rmssd),
    sdnn: rmssd * 1.2,
    pnn50: 0.2,
    meanHr: 60,
    beatsUsed: 600,
    artifactRate: 0,
  };
}

function baselines() {
  return {
    scrPerMin: buildBaseline('scrPerMin', [2, 2.4, 1.8, 2.1, 2.3, 2, 1.9, 2.2, 2, 2.1]),
    lnRmssd: buildBaseline('lnRmssd', [4, 4.1, 3.9, 4.05, 3.95, 4, 4.1, 3.98, 4.02, 4]),
    restingHr: buildBaseline('restingHr', [54, 55, 53, 55, 56, 54, 55, 54, 55, 55]),
    skinTemperature: buildBaseline(
      'skinTemperature',
      [33.2, 33.4, 33.1, 33.3, 33.2, 33.5, 33.0, 33.3, 33.2, 33.3],
    ),
  };
}

function input(overrides: Partial<StressInput> = {}): StressInput {
  return {
    eda: eda(2),
    hrv: hrv(55),
    meanHr: 58,
    skinTemperature: 33.2,
    profile,
    baselines: baselines(),
    ...overrides,
  };
}

describe('computeStress', () => {
  it('reads a normal moment as calm, not mid-scale', () => {
    const stress = computeStress(input());
    expect(stress.score).toBeLessThan(50);
    expect(['calm', 'moderate']).toContain(stress.band);
  });

  it('rises when skin conductance responses climb above your normal', () => {
    const calm = computeStress(input({ eda: eda(1.5) })).score;
    const aroused = computeStress(input({ eda: eda(8) })).score;
    expect(aroused).toBeGreaterThan(calm + 15);
  });

  it('rises when HRV is suppressed', () => {
    const relaxed = computeStress(input({ hrv: hrv(70) })).score;
    const suppressed = computeStress(input({ hrv: hrv(20) })).score;
    expect(suppressed).toBeGreaterThan(relaxed);
    expect(computeStress(input({ hrv: hrv(20) })).contributions.hrv!).toBeGreaterThan(0);
  });

  it('rises when the skin cools, the vasoconstriction signature', () => {
    const warm = computeStress(input({ skinTemperature: 33.6 })).score;
    const cold = computeStress(input({ skinTemperature: 32.4 })).score;
    expect(cold).toBeGreaterThan(warm);
  });

  it('scores a full stress response high across every channel', () => {
    const stress = computeStress(
      input({ eda: eda(9), hrv: hrv(18), meanHr: 95, skinTemperature: 32.2 }),
    );
    expect(stress.band).toBe('high');
    expect(stress.score).toBeGreaterThan(75);
  });

  it('weights skin conductance above heart rate', () => {
    const edaHit = computeStress(input({ eda: eda(6) })).score;
    const hrHit = computeStress(input({ meanHr: 85 })).score;
    expect(edaHit).toBeGreaterThan(hrHit);
  });

  it('works from heart rate alone and says so', () => {
    const stress = computeStress({
      hrv: hrv(40),
      meanHr: 70,
      profile,
      baselines: { lnRmssd: baselines().lnRmssd, restingHr: baselines().restingHr },
    });
    expect(stress.channels).toEqual(['hrv', 'heartRate']);
    expect(stress.contributions.eda).toBeUndefined();
    expect(describeStress(stress)).toContain('no skin conductance sensor');
  });

  it('renormalises weights so a missing channel does not suppress the score', () => {
    const full = computeStress(input({ eda: eda(9), hrv: hrv(18) }));
    const edaOnly = computeStress({
      eda: eda(9),
      profile,
      baselines: { scrPerMin: baselines().scrPerMin },
    });
    expect(edaOnly.score).toBeGreaterThan(60);
    expect(full.score).toBeGreaterThan(60);
  });

  it('returns a calm zero with no channels at all rather than throwing', () => {
    const stress = computeStress({ profile, baselines: {} });
    expect(stress.score).toBe(0);
    expect(stress.channels).toEqual([]);
    expect(stress.confident).toBe(false);
    expect(describeStress(stress)).toContain('No stress channels');
  });

  it('is unconfident while baselines are still filling', () => {
    const stress = computeStress(
      input({
        baselines: {
          scrPerMin: emptyBaseline('scrPerMin'),
          lnRmssd: emptyBaseline('lnRmssd'),
          restingHr: emptyBaseline('restingHr'),
          skinTemperature: emptyBaseline('skinTemperature'),
        },
      }),
    );
    expect(stress.confident).toBe(false);
  });

  it('stays inside 0..100 under absurd input', () => {
    expect(
      computeStress(input({ eda: eda(500), hrv: hrv(0.1), meanHr: 400 })).score,
    ).toBeLessThanOrEqual(100);
    expect(
      computeStress(input({ eda: eda(0), hrv: hrv(500), meanHr: 20 })).score,
    ).toBeGreaterThanOrEqual(0);
  });
});
