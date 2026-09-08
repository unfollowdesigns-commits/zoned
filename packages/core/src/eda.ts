/**
 * Electrodermal activity — the sympathetic nervous system, read directly.
 *
 * Sweat glands take orders from the sympathetic branch only. There is no
 * parasympathetic innervation to muddy the signal, which makes skin conductance
 * the most direct non-invasive measure of arousal available. It is what
 * research-grade stress wearables are built around, and it is the single
 * biggest reason to build your own band rather than buy a chest strap.
 *
 * The signal splits into two parts:
 *
 *   tonic  — skin conductance level (SCL), a slow drift over minutes. Depends
 *            heavily on hydration, temperature and where the electrodes sit, so
 *            it is only meaningful compared against your own baseline.
 *   phasic — skin conductance responses (SCRs), bursts lasting a few seconds.
 *            Counting these per minute is the arousal measure that matters.
 */

import type { EdaMetrics, EdaSample } from './types';
import { mean } from './hrv';

/** Below this, the electrodes are not making contact. */
const MIN_PLAUSIBLE_US = 0.05;
/** Above this, something is wrong — a short, or sweat bridging the electrodes. */
const MAX_PLAUSIBLE_US = 100;

export interface EdaOptions {
  /**
   * Window in seconds used to estimate the tonic level. Must be long relative
   * to an SCR (1-5 s) and short relative to genuine drift. 30 s is standard.
   */
  tonicWindowSec?: number;
  /**
   * Minimum rise, in µS, to count as a response. 0.05 is a widely used floor;
   * 0.01 catches more but also catches noise.
   */
  scrThreshold?: number;
  /** Responses closer together than this are one response. */
  minScrSeparationSec?: number;
}

export interface Scr {
  /** When the rise began. */
  onset: number;
  /** When it peaked. */
  peak: number;
  /** Height above the tonic level, µS. */
  amplitude: number;
}

export interface EdaDecomposition {
  t: number[];
  /** Slow baseline. */
  tonic: number[];
  /** Fast component: the raw signal minus the tonic level. */
  phasic: number[];
  /** Samples kept after dropping implausible values. */
  kept: EdaSample[];
  rejected: number;
}

/**
 * Split conductance into its tonic and phasic parts.
 *
 * A centred moving median estimates the tonic level: median rather than mean so
 * that a large SCR does not drag the baseline up underneath itself, which would
 * shrink the very response being measured.
 */
export function decomposeEda(
  samples: readonly EdaSample[],
  options: EdaOptions = {},
): EdaDecomposition {
  const tonicWindowSec = options.tonicWindowSec ?? 30;

  const kept = samples.filter(
    (s) =>
      Number.isFinite(s.microSiemens) &&
      s.microSiemens >= MIN_PLAUSIBLE_US &&
      s.microSiemens <= MAX_PLAUSIBLE_US,
  );
  const rejected = samples.length - kept.length;

  if (kept.length === 0) {
    return { t: [], tonic: [], phasic: [], kept, rejected };
  }

  const sampleRate = estimateSampleRate(kept);
  const half = Math.max(1, Math.round((tonicWindowSec * sampleRate) / 2));

  const values = new Float64Array(kept.length);
  for (let i = 0; i < kept.length; i++) {
    values[i] = (kept[i] as EdaSample).microSiemens;
  }

  const t: number[] = new Array(kept.length);
  const tonic: number[] = new Array(kept.length);
  const phasic: number[] = new Array(kept.length);

  // One reusable buffer and an in-place selection, rather than allocating and
  // fully sorting a fresh window for every sample. Same result, and it keeps a
  // six-week rollup inside a page render.
  const buffer = new Float64Array(2 * half + 1);

  for (let i = 0; i < kept.length; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(kept.length, i + half + 1);
    const width = hi - lo;
    for (let j = 0; j < width; j++) buffer[j] = values[lo + j] as number;

    const level = medianInPlace(buffer, width);
    t[i] = (kept[i] as EdaSample).t;
    tonic[i] = level;
    phasic[i] = (values[i] as number) - level;
  }

  return { t, tonic, phasic, kept, rejected };
}

/**
 * Find skin conductance responses in the phasic signal.
 *
 * A response is a rise crossing the threshold, followed by a fall. Responses
 * within `minScrSeparationSec` of each other are merged, because the sweat
 * gland response is slow enough that two peaks that close are one event.
 */
export function detectScrs(
  decomposition: EdaDecomposition,
  options: EdaOptions = {},
): Scr[] {
  const threshold = options.scrThreshold ?? 0.05;
  const minSeparationMs = (options.minScrSeparationSec ?? 1) * 1000;

  const { t, phasic } = decomposition;
  const scrs: Scr[] = [];

  let onsetIndex: number | null = null;
  let peakIndex: number | null = null;

  for (let i = 1; i < phasic.length; i++) {
    const value = phasic[i] as number;
    const previous = phasic[i - 1] as number;

    if (onsetIndex === null) {
      // A rise starting from at or below zero opens a candidate response.
      if (value > previous && previous <= threshold / 2) onsetIndex = i - 1;
      continue;
    }

    if (peakIndex === null || value > (phasic[peakIndex] as number)) peakIndex = i;

    // The response closes when the signal turns back down toward baseline.
    const falling = value < (phasic[peakIndex] as number) * 0.5;
    const atEnd = i === phasic.length - 1;
    if (!falling && !atEnd) continue;

    const amplitude = (phasic[peakIndex] as number) - (phasic[onsetIndex] as number);
    if (amplitude >= threshold) {
      const onset = t[onsetIndex] as number;
      const peak = t[peakIndex] as number;
      const last = scrs[scrs.length - 1];
      if (last && onset - last.peak < minSeparationMs) {
        // Same event: keep whichever rise was larger.
        if (amplitude > last.amplitude) {
          last.peak = peak;
          last.amplitude = amplitude;
        }
      } else {
        scrs.push({ onset, peak, amplitude });
      }
    }

    onsetIndex = null;
    peakIndex = null;
  }

  return scrs;
}

/**
 * Summarise a stretch of EDA.
 *
 * Returns null below two minutes: SCR rate is a frequency, and a frequency
 * measured over twenty seconds is noise wearing a number's clothes.
 */
export function computeEdaMetrics(
  samples: readonly EdaSample[],
  options: EdaOptions & { minDurationMin?: number } = {},
): EdaMetrics | null {
  const minDurationMin = options.minDurationMin ?? 2;

  const decomposition = decomposeEda(samples, options);
  if (decomposition.kept.length < 10) return null;

  const first = decomposition.kept[0] as EdaSample;
  const last = decomposition.kept[decomposition.kept.length - 1] as EdaSample;
  const durationMin = (last.t - first.t) / 60_000;
  if (durationMin < minDurationMin) return null;

  const scrs = detectScrs(decomposition, options);

  return {
    meanScl: mean(decomposition.tonic),
    scrPerMin: scrs.length / durationMin,
    meanScrAmplitude: scrs.length > 0 ? mean(scrs.map((s) => s.amplitude)) : 0,
    scrCount: scrs.length,
    artifactRate:
      samples.length > 0 ? decomposition.rejected / samples.length : 0,
    durationMin,
  };
}

function estimateSampleRate(samples: readonly EdaSample[]): number {
  if (samples.length < 2) return 4;
  const first = samples[0] as EdaSample;
  const last = samples[samples.length - 1] as EdaSample;
  const seconds = (last.t - first.t) / 1000;
  if (seconds <= 0) return 4;
  return (samples.length - 1) / seconds;
}

/**
 * Median of the first `length` entries, reordering the buffer in place.
 *
 * Quickselect rather than a sort: the median only needs one order statistic,
 * which is linear on average instead of n log n.
 */
function medianInPlace(buffer: Float64Array, length: number): number {
  if (length === 0) return 0;
  const mid = length >> 1;
  const upper = select(buffer, 0, length - 1, mid);
  if (length % 2 !== 0) return upper;

  // Even count: the lower of the two middles is the largest value below `mid`,
  // which quickselect has already partitioned to the left.
  let lower = buffer[0] as number;
  for (let i = 1; i < mid; i++) {
    const value = buffer[i] as number;
    if (value > lower) lower = value;
  }
  return (lower + upper) / 2;
}

function select(buffer: Float64Array, left: number, right: number, k: number): number {
  let lo = left;
  let hi = right;

  while (lo < hi) {
    // Median-of-three pivot, so an already-sorted window does not degrade.
    const mid = (lo + hi) >> 1;
    const pivot = medianOfThree(
      buffer[lo] as number,
      buffer[mid] as number,
      buffer[hi] as number,
    );

    let i = lo;
    let j = hi;
    while (i <= j) {
      while ((buffer[i] as number) < pivot) i++;
      while ((buffer[j] as number) > pivot) j--;
      if (i <= j) {
        const tmp = buffer[i] as number;
        buffer[i] = buffer[j] as number;
        buffer[j] = tmp;
        i++;
        j--;
      }
    }

    if (k <= j) hi = j;
    else if (k >= i) lo = i;
    else break;
  }

  return buffer[k] as number;
}

function medianOfThree(a: number, b: number, c: number): number {
  if (a > b) [a, b] = [b, a];
  if (b > c) b = a > c ? a : c;
  return b;
}
