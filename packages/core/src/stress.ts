/**
 * Continuous stress.
 *
 * This is the number that stands in for cortisol until a cortisol sensor you
 * can actually buy exists. It is not a hormone measurement and does not pretend
 * to be one; it is the sympathetic nervous system's output, measured four ways:
 *
 *   EDA          skin conductance responses per minute. Sympathetic-only, so
 *                the most direct channel. Weighted highest when present.
 *   HRV          suppressed variability means vagal withdrawal. Inverted here:
 *                low HRV pushes stress up.
 *   heart rate   elevation above your resting rate, independent of movement.
 *   skin temp    stress constricts peripheral vessels, so fingers and wrists
 *                cool. Inverted: cooler than your normal pushes stress up.
 *
 * Each channel is expressed against your own baseline, so the score means
 * "unusual for you" rather than "unusual for a person". Channels that are
 * missing are dropped and the remaining weights renormalised, which is what
 * lets the same function serve a chest strap today and a full bracelet later.
 *
 * A note on honesty: with a chest strap only, this is HRV and heart rate
 * wearing a different name. EDA is what makes it a genuine stress measure, and
 * EDA needs hardware you have to build. docs/HARDWARE.md says how.
 */

import type {
  Baseline,
  EdaMetrics,
  HrvMetrics,
  StressScore,
  UserProfile,
} from './types';
import { clamp, zScore } from './baseline';

const WEIGHTS = {
  eda: 0.45,
  hrv: 0.3,
  heartRate: 0.15,
  skinTemperature: 0.1,
};

export interface StressInput {
  /** Electrodermal activity over the window. The strongest channel. */
  eda?: EdaMetrics | null;
  /** HRV over the same window. */
  hrv?: HrvMetrics | null;
  /** Mean heart rate over the window, bpm. */
  meanHr?: number;
  /** Mean skin temperature over the window, °C. */
  skinTemperature?: number;
  profile: UserProfile;
  baselines: {
    scrPerMin?: Baseline;
    lnRmssd?: Baseline;
    restingHr?: Baseline;
    skinTemperature?: Baseline;
  };
}

export function computeStress(input: StressInput): StressScore {
  const { baselines } = input;
  const parts: Array<{ weight: number; z: number }> = [];
  const contributions: StressScore['contributions'] = {};
  const channels: string[] = [];

  // More skin conductance responses than your normal means more arousal.
  if (input.eda && baselines.scrPerMin) {
    const z = zScore(input.eda.scrPerMin, baselines.scrPerMin);
    parts.push({ weight: WEIGHTS.eda, z });
    contributions.eda = z;
    channels.push('eda');
  }

  // Inverted: suppressed variability is the stressed direction.
  if (input.hrv && baselines.lnRmssd) {
    const z = -zScore(input.hrv.lnRmssd, baselines.lnRmssd);
    parts.push({ weight: WEIGHTS.hrv, z });
    contributions.hrv = z;
    channels.push('hrv');
  }

  // Heart rate elevation above resting, scaled by heart rate reserve so the
  // same absolute rise means more for someone with a low resting rate.
  if (input.meanHr !== undefined) {
    const resting = baselines.restingHr?.ready
      ? baselines.restingHr.mean
      : input.profile.restingHr;
    const reserve = Math.max(20, (input.profile.maxHr ?? 190) - resting);
    const z = clamp(((input.meanHr - resting) / reserve) * 6, -4, 4);
    parts.push({ weight: WEIGHTS.heartRate, z });
    contributions.heartRate = z;
    channels.push('heartRate');
  }

  // Inverted: peripheral vasoconstriction cools the skin under stress.
  if (input.skinTemperature !== undefined && baselines.skinTemperature) {
    const z = -zScore(input.skinTemperature, baselines.skinTemperature);
    parts.push({ weight: WEIGHTS.skinTemperature, z });
    contributions.skinTemperature = z;
    channels.push('skinTemperature');
  }

  if (parts.length === 0) {
    return {
      score: 0,
      band: 'calm',
      contributions,
      channels,
      confident: false,
    };
  }

  const totalWeight = parts.reduce((acc, p) => acc + p.weight, 0);
  const combined = parts.reduce((acc, p) => acc + p.weight * p.z, 0) / totalWeight;

  // Centred so an ordinary moment reads low rather than mid-scale: stress
  // should be the exception, and a tracker that calls every hour "moderate"
  // teaches you to ignore it.
  const score = Math.round(100 * logistic(1.1 * combined - 0.6));

  return {
    score: clamp(score, 0, 100),
    band: score >= 75 ? 'high' : score >= 50 ? 'elevated' : score >= 25 ? 'moderate' : 'calm',
    contributions,
    channels,
    confident: readyChannels(input) >= 1 && parts.length >= 2,
  };
}

function readyChannels(input: StressInput): number {
  let ready = 0;
  if (input.eda && input.baselines.scrPerMin?.ready) ready++;
  if (input.hrv && input.baselines.lnRmssd?.ready) ready++;
  if (input.skinTemperature !== undefined && input.baselines.skinTemperature?.ready) {
    ready++;
  }
  return ready;
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * What the score is actually built from, so the number is never mistaken for
 * something it is not.
 */
export function describeStress(stress: StressScore): string {
  if (stress.channels.length === 0) {
    return 'No stress channels available. Connect a sensor.';
  }

  if (!stress.channels.includes('eda')) {
    const base =
      'Estimated from heart rate only — no skin conductance sensor is connected, so this tracks cardiac load rather than stress directly.';
    return stress.confident ? base : `${base} Still learning your baseline.`;
  }

  switch (stress.band) {
    case 'high':
      return 'Sustained sympathetic activation well above your normal.';
    case 'elevated':
      return 'Arousal above your normal — fine in bursts, worth noticing if it lasts.';
    case 'moderate':
      return 'Mild activation, within your usual range.';
    case 'calm':
      return 'Sympathetic activity at or below your normal.';
  }
}
