/**
 * Cortisol.
 *
 * Read this before trusting any number in this file.
 *
 * There is no wrist sensor you can buy that measures cortisol. The research
 * exists — aptamer and molecularly-imprinted electrochemical sensors reading
 * sweat or interstitial fluid — but nothing is on sale. So the readings here
 * come from a lab: a saliva kit posted off, a blood draw, or a hair segment.
 * The `sweat` source exists so a future strip needs no schema change, and the
 * recommended build carries an electrochemical front end that can drive one.
 *
 * The single most important fact about cortisol is that a lone measurement is
 * almost meaningless. It follows a steep daily rhythm: a sharp rise in the
 * half hour after waking, then a long decline to a midnight trough. A reading
 * of 12 nmol/L is unremarkable at 7am and alarming at 11pm. Everything below
 * therefore works in terms of *time since waking*.
 *
 * Two derived measures carry nearly all the signal:
 *
 *   CAR    the cortisol awakening response — how much you rise in the first
 *          30 minutes. Blunted responses are associated with chronic stress,
 *          burnout and exhaustion; exaggerated ones with acute stress.
 *   slope  how steeply cortisol falls across the day. Flattening is the more
 *          robust of the two markers in the literature.
 *
 * Reference values are typical adult salivary concentrations. Assay methods
 * differ substantially — always prefer the range your own lab prints on the
 * result sheet over the defaults here.
 */

import type { CortisolProfile, CortisolReading, EpochMs } from './types';
import { dayKey } from './time';

/**
 * Typical salivary cortisol against hours since waking, nmol/L.
 * Interpolated logarithmically, because the decline is roughly exponential.
 */
const REFERENCE_CURVE: Array<[hours: number, nmolPerL: number]> = [
  [0, 12],
  [0.5, 18],
  [1, 15],
  [2, 11],
  [3, 9],
  [6, 6],
  [10, 4],
  [14, 2.5],
  [16, 2],
];

/** Saliva carries the free fraction; serum totals run roughly 20x higher. */
const SERUM_TO_SALIVA = 1 / 20;

/** Put a reading on the salivary scale so everything is comparable. */
export function toSalivaryEquivalent(reading: CortisolReading): number | null {
  switch (reading.source) {
    case 'saliva':
    case 'sweat':
      return reading.nmolPerL;
    case 'serum':
      return reading.nmolPerL * SERUM_TO_SALIVA;
    case 'hair':
      // Hair reports pg/mg over weeks. There is no defensible conversion to a
      // point-in-time concentration, so it is excluded from diurnal maths.
      return null;
  }
}

/** Expected salivary cortisol this many hours after waking, nmol/L. */
export function expectedSalivaryCortisol(hoursSinceWake: number): number {
  const h = Math.max(0, Math.min(16, hoursSinceWake));

  for (let i = 1; i < REFERENCE_CURVE.length; i++) {
    const [h0, v0] = REFERENCE_CURVE[i - 1] as [number, number];
    const [h1, v1] = REFERENCE_CURVE[i] as [number, number];
    if (h <= h1) {
      const span = h1 - h0 || 1;
      const fraction = (h - h0) / span;
      // Log interpolation: concentrations decay multiplicatively, not linearly.
      return Math.exp(Math.log(v0) + fraction * (Math.log(v1) - Math.log(v0)));
    }
  }
  return (REFERENCE_CURVE[REFERENCE_CURVE.length - 1] as [number, number])[1];
}

/**
 * How far a reading sits from the reference curve, as a natural log ratio.
 * 0 is typical, +0.7 is roughly double, −0.7 roughly half.
 */
export function cortisolDeviation(
  reading: CortisolReading,
  wakeTime: EpochMs,
): number | null {
  const salivary = toSalivaryEquivalent(reading);
  if (salivary === null || salivary <= 0) return null;

  const hoursSinceWake = (reading.t - wakeTime) / 3_600_000;
  if (hoursSinceWake < -0.5 || hoursSinceWake > 18) return null;

  return Math.log(salivary / expectedSalivaryCortisol(hoursSinceWake));
}

/**
 * Interpret one day's samples.
 *
 * A standard saliva protocol is four samples: on waking, +30 minutes, mid
 * afternoon, and bedtime. Fewer still yields something — CAR needs the first
 * two, the slope needs any three.
 */
export function analyzeCortisolDay(
  readings: readonly CortisolReading[],
  wakeTime?: EpochMs,
): CortisolProfile | null {
  if (readings.length === 0) return null;

  const sorted = [...readings].sort((a, b) => a.t - b.t);
  const first = sorted[0] as CortisolReading;
  const wake = wakeTime ?? first.wakeTime ?? first.t;

  const points = sorted
    .map((reading) => {
      const salivary = toSalivaryEquivalent(reading);
      if (salivary === null || salivary <= 0) return null;
      return {
        t: reading.t,
        hoursSinceWake: (reading.t - wake) / 3_600_000,
        value: salivary,
        lnRatio: Math.log(
          salivary / expectedSalivaryCortisol((reading.t - wake) / 3_600_000),
        ),
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    day: dayKey(wake),
    car: awakeningResponse(points),
    diurnalSlope: diurnalSlope(points),
    auc: areaUnderCurve(points),
    deviations: points.map((p) => ({
      t: p.t,
      hoursSinceWake: p.hoursSinceWake,
      lnRatio: p.lnRatio,
    })),
    readings: sorted,
  };
}

interface Point {
  hoursSinceWake: number;
  value: number;
}

/**
 * The rise from waking to the post-waking peak, as a fraction of the waking
 * value. 0.5 means cortisol rose 50%. A typical response is roughly 0.5-1.0.
 */
function awakeningResponse(points: readonly Point[]): number | null {
  const atWake = points.find((p) => p.hoursSinceWake <= 0.25);
  if (!atWake || atWake.value <= 0) return null;

  const window = points.filter(
    (p) => p.hoursSinceWake > 0.25 && p.hoursSinceWake <= 1,
  );
  if (window.length === 0) return null;

  const peak = Math.max(...window.map((p) => p.value));
  return (peak - atWake.value) / atWake.value;
}

/**
 * Least squares slope of ln(cortisol) against hours since waking.
 *
 * Only the awakening peak itself is excluded — the window from 15 to 60 minutes
 * after waking. The waking sample is kept, because the standard four-sample
 * protocol is wake, +30 min, afternoon, bedtime: drop the waking value too and
 * a normal day's collection has just two usable points either side of a gap.
 *
 * Healthy is roughly −0.10 to −0.16 per hour. Closer to zero is flatter, which
 * is the pattern associated with chronic stress.
 */
function diurnalSlope(points: readonly Point[]): number | null {
  const usable = points.filter(
    (p) =>
      p.value > 0 && (p.hoursSinceWake <= 0.25 || p.hoursSinceWake >= 1),
  );
  if (usable.length < 2) return null;

  const xs = usable.map((p) => p.hoursSinceWake);
  const ys = usable.map((p) => Math.log(p.value));
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = (xs[i] as number) - meanX;
    numerator += dx * ((ys[i] as number) - meanY);
    denominator += dx * dx;
  }
  if (denominator === 0) return null;
  return numerator / denominator;
}

/** Total daily exposure by the trapezoid rule, nmol/L·hour. */
function areaUnderCurve(points: readonly Point[]): number | null {
  if (points.length < 2) return null;
  let auc = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1] as Point;
    const b = points[i] as Point;
    auc += ((a.value + b.value) / 2) * (b.hoursSinceWake - a.hoursSinceWake);
  }
  return auc;
}

/** A plain-language reading of a day's profile. */
export function describeCortisol(profile: CortisolProfile): string {
  const notes: string[] = [];

  if (profile.car !== null) {
    if (profile.car < 0.2) {
      notes.push(
        'Your waking rise is small, a pattern associated with chronic stress and exhaustion.',
      );
    } else if (profile.car > 1.5) {
      notes.push('Your waking rise is large, which tends to follow acute stress.');
    } else {
      notes.push('Your waking rise looks typical.');
    }
  }

  if (profile.diurnalSlope !== null) {
    if (profile.diurnalSlope > -0.06) {
      notes.push(
        'Cortisol is falling slowly across the day — a flattened slope is the more reliable chronic stress marker.',
      );
    } else {
      notes.push('Cortisol falls steadily across the day, as it should.');
    }
  }

  if (notes.length === 0) {
    return 'Not enough samples. A waking and a +30 minute sample give you the awakening response; add afternoon and bedtime for the slope.';
  }

  return `${notes.join(' ')} These are patterns, not diagnoses — take them to a doctor, not to conclusions.`;
}
