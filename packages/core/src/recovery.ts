/**
 * The morning recovery score.
 *
 * Four inputs, each expressed as a deviation from your own rolling baseline:
 * HRV (up is good), resting heart rate (down is good), respiratory rate (down
 * is good) and how much of your sleep need you actually met. They are weighted,
 * summed, and squashed through a logistic curve into 0–100.
 *
 * The weights below are a defensible starting point drawn from what each signal
 * is known to track, not a reverse-engineering of anyone's product. They are
 * meant to be tuned against your own logbook — see docs/ROADMAP.md.
 */

import type { RecoveryScore, RecoveryInput } from './types';
import { clamp, zScore } from './baseline';

const WEIGHTS = {
  hrv: 0.5,
  restingHr: 0.25,
  sleep: 0.15,
  respiratoryRate: 0.1,
};

export function computeRecovery(input: RecoveryInput): RecoveryScore {
  const { baselines } = input;

  const hrvZ = zScore(input.lnRmssd, baselines.lnRmssd);
  // Inverted: a resting heart rate above your normal is a bad sign.
  const rhrZ = -zScore(input.restingHr, baselines.restingHr);

  const parts: Array<{ weight: number; z: number }> = [
    { weight: WEIGHTS.hrv, z: hrvZ },
    { weight: WEIGHTS.restingHr, z: rhrZ },
  ];

  const contributions: RecoveryScore['contributions'] = {
    hrv: hrvZ,
    restingHr: rhrZ,
  };

  if (input.respiratoryRate !== undefined && baselines.respiratoryRate) {
    const rrZ = -zScore(input.respiratoryRate, baselines.respiratoryRate);
    parts.push({ weight: WEIGHTS.respiratoryRate, z: rrZ });
    contributions.respiratoryRate = rrZ;
  }

  if (input.sleepPerformance !== undefined) {
    // 85% of your sleep need is treated as par; each 10 points is one SD.
    const sleepZ = clamp((input.sleepPerformance - 0.85) / 0.1, -3, 2);
    parts.push({ weight: WEIGHTS.sleep, z: sleepZ });
    contributions.sleep = sleepZ;
  }

  const totalWeight = parts.reduce((acc, p) => acc + p.weight, 0);
  const combined = parts.reduce((acc, p) => acc + p.weight * p.z, 0) / totalWeight;

  // Centred slightly above the midpoint so an ordinary day reads as ~59, and
  // scaled so ±1 SD moves you a full band.
  const score = Math.round(100 * logistic(0.9 * combined + 0.35));

  const confident = baselines.lnRmssd.ready && baselines.restingHr.ready;

  return {
    score: clamp(score, 1, 100),
    band: score >= 67 ? 'green' : score >= 34 ? 'yellow' : 'red',
    contributions,
    confident,
  };
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * A plain-language reading of the score, for the top of the app's home screen.
 */
export function describeRecovery(recovery: RecoveryScore): string {
  if (!recovery.confident) {
    return 'Still learning your baseline — this score will mean more after a week of nights.';
  }
  const driver = dominantDriver(recovery);
  switch (recovery.band) {
    case 'green':
      return `Recovered and ready to take on strain. ${driver}`;
    case 'yellow':
      return `Maintain — moderate effort is well judged today. ${driver}`;
    case 'red':
      return `Your body is asking for rest. ${driver}`;
  }
}

function dominantDriver(recovery: RecoveryScore): string {
  const entries = Object.entries(recovery.contributions) as Array<[string, number]>;
  let worst: [string, number] | null = null;
  for (const entry of entries) {
    if (!worst || entry[1] < worst[1]) worst = entry;
  }
  if (!worst || worst[1] > -0.5) return 'Nothing is far from your normal.';

  const labels: Record<string, string> = {
    hrv: 'HRV is below your baseline',
    restingHr: 'resting heart rate is elevated',
    respiratoryRate: 'breathing rate is up overnight',
    sleep: 'you slept short of what you need',
  };
  return `Mostly because ${labels[worst[0]] ?? worst[0]}.`;
}
