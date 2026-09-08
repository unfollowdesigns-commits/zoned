import { describe, expect, it } from 'vitest';
import { computeRecovery, describeRecovery } from '../recovery.js';
import { buildBaseline } from '../baseline.js';
import type { RecoveryInput } from '../types.js';

function baselines() {
  return {
    lnRmssd: buildBaseline('lnRmssd', [4.0, 4.1, 3.9, 4.05, 3.95, 4.0, 4.1, 3.98, 4.02, 4.0]),
    restingHr: buildBaseline('restingHr', [52, 53, 51, 52, 54, 52, 51, 53, 52, 52]),
    respiratoryRate: buildBaseline('respiratoryRate', [14, 14.5, 13.8, 14.2, 14, 14.1, 13.9, 14, 14.2, 14]),
  };
}

function input(overrides: Partial<RecoveryInput> = {}): RecoveryInput {
  return {
    lnRmssd: 4.0,
    restingHr: 52,
    respiratoryRate: 14,
    sleepPerformance: 0.9,
    baselines: baselines(),
    ...overrides,
  };
}

describe('computeRecovery', () => {
  it('puts an ordinary day in the middle of the scale', () => {
    const recovery = computeRecovery(input());
    expect(recovery.score).toBeGreaterThan(45);
    expect(recovery.score).toBeLessThan(80);
  });

  it('scores high when HRV is up and resting heart rate is down', () => {
    const recovery = computeRecovery(
      input({ lnRmssd: 4.5, restingHr: 48, sleepPerformance: 1 }),
    );
    expect(recovery.band).toBe('green');
    expect(recovery.score).toBeGreaterThan(75);
  });

  it('scores low when HRV is suppressed and resting heart rate is elevated', () => {
    const recovery = computeRecovery(
      input({ lnRmssd: 3.3, restingHr: 60, respiratoryRate: 16, sleepPerformance: 0.6 }),
    );
    expect(recovery.band).toBe('red');
    expect(recovery.score).toBeLessThan(34);
  });

  it('inverts resting heart rate so a higher one hurts the score', () => {
    const low = computeRecovery(input({ restingHr: 48 })).score;
    const high = computeRecovery(input({ restingHr: 58 })).score;
    expect(low).toBeGreaterThan(high);
    expect(computeRecovery(input({ restingHr: 58 })).contributions.restingHr).toBeLessThan(0);
  });

  it('weights HRV more heavily than sleep', () => {
    const hrvHit = computeRecovery(input({ lnRmssd: 3.5 })).score;
    const sleepHit = computeRecovery(input({ sleepPerformance: 0.5 })).score;
    expect(hrvHit).toBeLessThan(sleepHit);
  });

  it('works with only HRV and resting heart rate available', () => {
    const partial = computeRecovery({
      lnRmssd: 4.0,
      restingHr: 52,
      baselines: baselines(),
    });
    expect(partial.score).toBeGreaterThan(0);
    expect(partial.contributions.sleep).toBeUndefined();
    expect(partial.contributions.respiratoryRate).toBeUndefined();
  });

  it('stays inside 1..100 under absurd input', () => {
    const extreme = computeRecovery(input({ lnRmssd: 99, restingHr: -50 }));
    expect(extreme.score).toBeLessThanOrEqual(100);
    expect(computeRecovery(input({ lnRmssd: -99, restingHr: 500 })).score).toBeGreaterThanOrEqual(1);
  });

  it('flags itself as unconfident until baselines have filled', () => {
    const fresh = computeRecovery({
      lnRmssd: 4.0,
      restingHr: 52,
      baselines: {
        lnRmssd: buildBaseline('lnRmssd', [4.0, 4.1]),
        restingHr: buildBaseline('restingHr', [52, 53]),
      },
    });
    expect(fresh.confident).toBe(false);
    expect(describeRecovery(fresh)).toContain('baseline');
  });

  it('names the reason a score is low', () => {
    const recovery = computeRecovery(input({ lnRmssd: 3.2 }));
    expect(describeRecovery(recovery)).toContain('HRV');
  });
});
