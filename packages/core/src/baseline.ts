/**
 * Rolling personal baselines.
 *
 * Absolute HRV numbers say almost nothing — 40 ms is poor for one person and
 * excellent for another. Every score in this project is expressed as a
 * deviation from *your* normal, which is what this file maintains.
 *
 * Uses an exponentially weighted mean and variance so recent days matter more
 * than a month ago, and so the whole history never needs to be re-read.
 */

import type { Baseline } from './types';

export interface BaselineOptions {
  /**
   * Days after which a day's influence has halved. 14 tracks genuine fitness
   * changes without letting one bad night move your normal.
   */
  halfLifeDays?: number;
  /** Days required before the baseline is treated as meaningful. */
  minSamples?: number;
}

export function emptyBaseline(metric: string): Baseline {
  return { metric, mean: 0, sd: 0, samples: 0, ready: false };
}

/**
 * Fold one new daily value into a baseline. Pure — returns a new object.
 */
export function updateBaseline(
  baseline: Baseline,
  value: number,
  options: BaselineOptions = {},
): Baseline {
  const halfLife = options.halfLifeDays ?? 14;
  const minSamples = options.minSamples ?? 7;

  if (!Number.isFinite(value)) return baseline;

  if (baseline.samples === 0) {
    return { metric: baseline.metric, mean: value, sd: 0, samples: 1, ready: false };
  }

  const alpha = 1 - Math.pow(0.5, 1 / halfLife);
  const delta = value - baseline.mean;
  const mean = baseline.mean + alpha * delta;
  const variance = (1 - alpha) * (baseline.sd ** 2 + alpha * delta ** 2);
  const samples = baseline.samples + 1;

  return {
    metric: baseline.metric,
    mean,
    sd: Math.sqrt(variance),
    samples,
    ready: samples >= minSamples,
  };
}

/** Build a baseline from a history of daily values, oldest first. */
export function buildBaseline(
  metric: string,
  values: readonly number[],
  options: BaselineOptions = {},
): Baseline {
  let baseline = emptyBaseline(metric);
  for (const v of values) baseline = updateBaseline(baseline, v, options);
  return baseline;
}

/**
 * How unusual today is, in standard deviations.
 *
 * Guards against a degenerate spread: with only a few near-identical days the
 * SD collapses toward zero and every z-score would explode.
 */
export function zScore(value: number, baseline: Baseline): number {
  if (baseline.samples === 0) return 0;
  const floor = Math.max(Math.abs(baseline.mean) * 0.02, 1e-6);
  const sd = Math.max(baseline.sd, floor);
  return clamp((value - baseline.mean) / sd, -4, 4);
}

export function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}
