import { describe, expect, it } from 'vitest';
import { computeEdaMetrics, decomposeEda, detectScrs } from '../eda';
import type { EdaSample } from '../types';

/** Build an EDA trace at 4 Hz with SCR bursts at the given times. */
function trace({
  minutes = 5,
  baseline = 5,
  drift = 0,
  bursts = [] as Array<{ atSec: number; amplitude: number }>,
  noise = 0,
  startedAt = 0,
}): EdaSample[] {
  const fs = 4;
  const samples: EdaSample[] = [];
  const total = minutes * 60 * fs;

  for (let i = 0; i < total; i++) {
    const seconds = i / fs;
    let value = baseline + drift * seconds;

    for (const burst of bursts) {
      const dt = seconds - burst.atSec;
      if (dt >= 0 && dt < 12) {
        // Sweat gland response: fast rise, slow exponential recovery.
        const rise = 1 - Math.exp(-dt / 0.9);
        const decay = Math.exp(-dt / 4);
        value += burst.amplitude * rise * decay * 1.9;
      }
    }

    if (noise > 0) value += Math.sin(i * 12.9898) * noise;
    samples.push({ t: startedAt + i * 250, microSiemens: value });
  }
  return samples;
}

describe('decomposeEda', () => {
  it('puts a flat signal entirely in the tonic component', () => {
    const result = decomposeEda(trace({ minutes: 3, baseline: 6 }));
    expect(result.tonic.every((v) => Math.abs(v - 6) < 0.01)).toBe(true);
    expect(result.phasic.every((v) => Math.abs(v) < 0.01)).toBe(true);
  });

  it('tracks slow drift in the tonic component, not the phasic one', () => {
    const result = decomposeEda(trace({ minutes: 6, baseline: 4, drift: 0.005 }));
    const firstTonic = result.tonic[10] as number;
    const lastTonic = result.tonic[result.tonic.length - 10] as number;
    expect(lastTonic).toBeGreaterThan(firstTonic + 0.5);
    // Drift must not leak into the phasic signal and be counted as arousal.
    expect(Math.max(...result.phasic.map(Math.abs))).toBeLessThan(0.3);
  });

  it('drops disconnected electrodes and shorts', () => {
    const samples = trace({ minutes: 3 });
    samples[10] = { t: samples[10]!.t, microSiemens: 0 };
    samples[20] = { t: samples[20]!.t, microSiemens: 5000 };
    const result = decomposeEda(samples);
    expect(result.rejected).toBe(2);
  });

  it('returns empty rather than throwing on an all-bad trace', () => {
    const result = decomposeEda([
      { t: 0, microSiemens: 0 },
      { t: 250, microSiemens: 0 },
    ]);
    expect(result.kept).toHaveLength(0);
    expect(result.tonic).toHaveLength(0);
  });
});

describe('detectScrs', () => {
  it('finds nothing in a calm trace', () => {
    expect(detectScrs(decomposeEda(trace({ minutes: 5 })))).toHaveLength(0);
  });

  it('finds the bursts that were put there', () => {
    const samples = trace({
      minutes: 5,
      bursts: [
        { atSec: 30, amplitude: 0.5 },
        { atSec: 90, amplitude: 0.6 },
        { atSec: 180, amplitude: 0.4 },
      ],
    });
    const scrs = detectScrs(decomposeEda(samples));
    expect(scrs.length).toBeGreaterThanOrEqual(3);
    expect(scrs.length).toBeLessThanOrEqual(4);
    for (const scr of scrs) {
      expect(scr.amplitude).toBeGreaterThan(0.05);
      expect(scr.peak).toBeGreaterThanOrEqual(scr.onset);
    }
  });

  it('ignores bursts below the amplitude threshold', () => {
    const samples = trace({ minutes: 5, bursts: [{ atSec: 60, amplitude: 0.01 }] });
    expect(detectScrs(decomposeEda(samples), { scrThreshold: 0.05 })).toHaveLength(0);
  });

  it('finds more responses in an aroused trace than a calm one', () => {
    const calm = trace({ minutes: 5, bursts: [{ atSec: 60, amplitude: 0.4 }] });
    const aroused = trace({
      minutes: 5,
      bursts: Array.from({ length: 12 }, (_, i) => ({
        atSec: 15 + i * 20,
        amplitude: 0.5,
      })),
    });
    expect(detectScrs(decomposeEda(aroused)).length).toBeGreaterThan(
      detectScrs(decomposeEda(calm)).length,
    );
  });
});

describe('computeEdaMetrics', () => {
  it('declines to report a rate from too short a window', () => {
    expect(computeEdaMetrics(trace({ minutes: 1 }))).toBeNull();
  });

  it('reports responses per minute over the real duration', () => {
    const samples = trace({
      minutes: 10,
      bursts: Array.from({ length: 10 }, (_, i) => ({
        atSec: 30 + i * 55,
        amplitude: 0.5,
      })),
    });
    const metrics = computeEdaMetrics(samples);
    expect(metrics).not.toBeNull();
    expect(metrics!.durationMin).toBeGreaterThan(9);
    expect(metrics!.scrPerMin).toBeGreaterThan(0.5);
    expect(metrics!.scrPerMin).toBeLessThan(2);
  });

  it('reports the tonic level near the true baseline', () => {
    const metrics = computeEdaMetrics(trace({ minutes: 5, baseline: 8 }));
    expect(metrics!.meanScl).toBeGreaterThan(7.5);
    expect(metrics!.meanScl).toBeLessThan(8.5);
  });

  it('surfaces the artifact rate so bad electrode contact is visible', () => {
    const samples = trace({ minutes: 5 });
    for (let i = 0; i < 40; i++) {
      samples[i * 10] = { t: samples[i * 10]!.t, microSiemens: 0 };
    }
    const metrics = computeEdaMetrics(samples);
    expect(metrics!.artifactRate).toBeGreaterThan(0.02);
  });
});
