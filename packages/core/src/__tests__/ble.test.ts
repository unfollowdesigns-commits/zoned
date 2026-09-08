import { describe, expect, it } from 'vitest';
import {
  EdaParseError,
  HeartRateParseError,
  ZONED_EDA,
  ZONED_HAPTIC,
  ZONED_LOG_CONTROL,
  ZONED_LOG_DATA,
  ZONED_SERVICE,
  collectRrIntervals,
  encodeEdaPacket,
  encodeHapticCommand,
  parseEdaPacket,
  parseHapticCommand,
  parseHeartRateMeasurement,
} from '../ble';

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

describe('the Zoned custom service', () => {
  it('round-trips skin conductance through a packet', () => {
    const values = [4.512, 5.003, 5.874, 12.25];
    const samples = parseEdaPacket(encodeEdaPacket(1_000, 250, values), 1_700_000_000_000);

    expect(samples).toHaveLength(4);
    for (let i = 0; i < values.length; i++) {
      expect(samples[i]!.microSiemens).toBeCloseTo(values[i]!, 3);
    }
  });

  it('spaces samples by the interval rather than sending a timestamp each', () => {
    const samples = parseEdaPacket(encodeEdaPacket(2_000, 250, [5, 5, 5]), 0);
    expect(samples.map((s) => s.t)).toEqual([2000, 2250, 2500]);
  });

  it('offsets the band clock by the epoch the phone supplies', () => {
    const epoch = Date.parse('2026-05-01T00:00:00Z');
    const samples = parseEdaPacket(encodeEdaPacket(60_000, 250, [5]), epoch);
    expect(samples[0]!.t).toBe(epoch + 60_000);
  });

  it('resolves far finer than the smallest response worth detecting', () => {
    // The SCR threshold is 0.05 µS; quantisation must be well under it.
    const samples = parseEdaPacket(encodeEdaPacket(0, 250, [5.0, 5.002]), 0);
    expect(samples[1]!.microSiemens - samples[0]!.microSiemens).toBeCloseTo(0.002, 4);
  });

  it('clamps rather than wrapping when conductance exceeds the range', () => {
    const samples = parseEdaPacket(encodeEdaPacket(0, 250, [-5, 900]), 0);
    expect(samples[0]!.microSiemens).toBe(0);
    expect(samples[1]!.microSiemens).toBeCloseTo(65.535, 3);
  });

  it('carries an empty packet without inventing samples', () => {
    expect(parseEdaPacket(encodeEdaPacket(0, 250, []), 0)).toEqual([]);
  });

  it('rejects a truncated or misaligned packet', () => {
    expect(() => parseEdaPacket(new Uint8Array([1, 2, 3]))).toThrow(EdaParseError);
    expect(() => parseEdaPacket(new Uint8Array([0, 0, 0, 0, 0, 0, 7]))).toThrow(
      EdaParseError,
    );
  });

  it('round-trips a haptic command', () => {
    const command = parseHapticCommand(
      encodeHapticCommand('morning', { intensity: 80, repeats: 2 }),
    );
    expect(command).toEqual({ effect: 'morning', intensity: 80, repeats: 2 });
  });

  it('clamps haptic intensity and repeats into range', () => {
    const loud = parseHapticCommand(
      encodeHapticCommand('alert', { intensity: 500, repeats: 99 }),
    );
    expect(loud.intensity).toBe(100);
    expect(loud.repeats).toBe(10);
  });

  it('gives every effect a distinct id so patterns stay distinguishable', () => {
    const effects = ['stop', 'confirm', 'alert', 'morning', 'contact-lost'] as const;
    const ids = effects.map((effect) => encodeHapticCommand(effect)[0]);
    expect(new Set(ids).size).toBe(effects.length);
  });

  it('rejects an unknown haptic effect id', () => {
    expect(() => parseHapticCommand(new Uint8Array([200, 50, 0]))).toThrow(EdaParseError);
  });

  it('keeps the custom service off the numbers the SIG has assigned', () => {
    for (const uuid of [ZONED_SERVICE, ZONED_EDA, ZONED_HAPTIC, ZONED_LOG_DATA]) {
      expect(uuid).not.toContain('0000-1000-8000-00805f9b34fb');
    }
    expect(new Set([ZONED_EDA, ZONED_LOG_CONTROL, ZONED_LOG_DATA, ZONED_HAPTIC]).size).toBe(4);
  });
});
