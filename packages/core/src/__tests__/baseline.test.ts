import { describe, expect, it } from 'vitest';
import { buildBaseline, emptyBaseline, updateBaseline, zScore } from '../baseline';

describe('baselines', () => {
  it('is not ready until enough days have accumulated', () => {
    let baseline = emptyBaseline('lnRmssd');
    for (let i = 0; i < 5; i++) baseline = updateBaseline(baseline, 4.0);
    expect(baseline.ready).toBe(false);
    for (let i = 0; i < 5; i++) baseline = updateBaseline(baseline, 4.0);
    expect(baseline.ready).toBe(true);
  });

  it('settles on the mean of a steady history', () => {
    const baseline = buildBaseline('rhr', Array(60).fill(52));
    expect(baseline.mean).toBeCloseTo(52, 4);
    expect(baseline.sd).toBeLessThan(0.5);
  });

  it('follows a genuine shift without chasing a single day', () => {
    let baseline = buildBaseline('rhr', Array(40).fill(50));
    const afterOneOddDay = updateBaseline(baseline, 60);
    expect(afterOneOddDay.mean).toBeLessThan(51);

    for (let i = 0; i < 40; i++) baseline = updateBaseline(baseline, 60);
    expect(baseline.mean).toBeGreaterThan(58);
  });

  it('ignores values that are not real numbers', () => {
    const baseline = buildBaseline('rhr', Array(20).fill(50));
    expect(updateBaseline(baseline, Number.NaN)).toEqual(baseline);
  });

  it('does not explode when the spread is nearly zero', () => {
    const baseline = buildBaseline('rhr', Array(30).fill(50));
    expect(Math.abs(zScore(51, baseline))).toBeLessThanOrEqual(4);
    expect(Number.isFinite(zScore(51, baseline))).toBe(true);
  });

  it('signs deviations the way you would read them', () => {
    const baseline = buildBaseline('lnRmssd', [3.9, 4.0, 4.1, 4.0, 3.95, 4.05, 4.0, 3.98]);
    expect(zScore(4.4, baseline)).toBeGreaterThan(0);
    expect(zScore(3.5, baseline)).toBeLessThan(0);
  });
});
