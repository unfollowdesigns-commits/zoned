import { describe, expect, it } from 'vitest';
import {
  HeartRateParseError,
  collectRrIntervals,
  parseHeartRateMeasurement,
} from '../ble.js';

/** Build a Heart Rate Measurement packet the way a real sensor would. */
function packet(opts: {
  bpm: number;
  hr16?: boolean;
  contact?: boolean;
  energyKj?: number;
  rrMs?: number[];
}): Uint8Array {
  const bytes: number[] = [];
  let flags = 0;
  if (opts.hr16) flags |= 0x01;
  if (opts.contact !== undefined) {
    flags |= 0x04;
    if (opts.contact) flags |= 0x02;
  }
  if (opts.energyKj !== undefined) flags |= 0x08;
  if (opts.rrMs?.length) flags |= 0x10;
  bytes.push(flags);

  if (opts.hr16) bytes.push(opts.bpm & 0xff, (opts.bpm >> 8) & 0xff);
  else bytes.push(opts.bpm);

  if (opts.energyKj !== undefined) {
    bytes.push(opts.energyKj & 0xff, (opts.energyKj >> 8) & 0xff);
  }
  for (const rr of opts.rrMs ?? []) {
    const ticks = Math.round((rr / 1000) * 1024);
    bytes.push(ticks & 0xff, (ticks >> 8) & 0xff);
  }
  return new Uint8Array(bytes);
}

describe('parseHeartRateMeasurement', () => {
  it('reads an 8-bit heart rate', () => {
    const sample = parseHeartRateMeasurement(packet({ bpm: 64 }), 1000);
    expect(sample.bpm).toBe(64);
    expect(sample.rrIntervals).toEqual([]);
    expect(sample.t).toBe(1000);
  });

  it('reads a 16-bit heart rate above 255', () => {
    const sample = parseHeartRateMeasurement(packet({ bpm: 300, hr16: true }));
    expect(sample.bpm).toBe(300);
  });

  it('converts RR intervals from 1/1024 s ticks to milliseconds', () => {
    const sample = parseHeartRateMeasurement(packet({ bpm: 60, rrMs: [1000, 875] }));
    expect(sample.rrIntervals).toHaveLength(2);
    expect(sample.rrIntervals[0]).toBeCloseTo(1000, 0);
    expect(sample.rrIntervals[1]).toBeCloseTo(875, 0);
  });

  it('skips past the energy field to find the RR intervals', () => {
    const sample = parseHeartRateMeasurement(
      packet({ bpm: 120, energyKj: 500, rrMs: [500] }),
    );
    expect(sample.energyKj).toBe(500);
    expect(sample.rrIntervals[0]).toBeCloseTo(500, 0);
  });

  it('reports sensor contact only when the sensor supports it', () => {
    expect(parseHeartRateMeasurement(packet({ bpm: 60 })).contact).toBeUndefined();
    expect(parseHeartRateMeasurement(packet({ bpm: 60, contact: true })).contact).toBe(true);
    expect(parseHeartRateMeasurement(packet({ bpm: 60, contact: false })).contact).toBe(false);
  });

  it('rejects a truncated packet rather than inventing a reading', () => {
    expect(() => parseHeartRateMeasurement(new Uint8Array([0x00]))).toThrow(
      HeartRateParseError,
    );
  });

  it('collects RR intervals across samples in order', () => {
    const rr = collectRrIntervals([
      { t: 0, bpm: 60, rrIntervals: [1000, 1010] },
      { t: 1000, bpm: 60, rrIntervals: [990] },
    ]);
    expect(rr).toEqual([1000, 1010, 990]);
  });
});
