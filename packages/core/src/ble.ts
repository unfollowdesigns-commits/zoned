/**
 * Decoding for the Bluetooth SIG standard Heart Rate Service (0x180D).
 *
 * This is the reason a Polar H10 is a sane place to start: the format below is
 * a public standard, so any compliant strap — and later, your own firmware —
 * produces bytes this function already understands.
 *
 * Kept pure and free of React Native imports so it can be unit-tested on a
 * laptop with no hardware present.
 */

import type { EdaSample, HeartRateSample } from './types';

/** Heart Rate Service. */
export const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
/** Heart Rate Measurement characteristic — notifies roughly once per second. */
export const HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';
/** Body Sensor Location characteristic. */
export const BODY_SENSOR_LOCATION = '00002a38-0000-1000-8000-00805f9b34fb';
/** Battery Service / Battery Level. */
export const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
export const BATTERY_LEVEL = '00002a19-0000-1000-8000-00805f9b34fb';

/** RR intervals arrive as counts of 1/1024 second. */
const RR_TICKS_PER_SECOND = 1024;

export class HeartRateParseError extends Error {}

/**
 * Decode one Heart Rate Measurement notification.
 *
 * Layout (Bluetooth SIG):
 *   byte 0        flags
 *     bit 0       0 = 8-bit bpm, 1 = 16-bit bpm
 *     bits 1-2    sensor contact: bit 2 = supported, bit 1 = contact detected
 *     bit 3       energy expended field present
 *     bit 4       RR interval field(s) present
 *   bytes 1..     bpm, then optional energy (uint16), then RR intervals (uint16 each)
 *
 * @param data  Raw characteristic value.
 * @param t     Timestamp to stamp the sample with; defaults to now.
 */
export function parseHeartRateMeasurement(
  data: Uint8Array,
  t: number = Date.now(),
): HeartRateSample {
  if (data.length < 2) {
    throw new HeartRateParseError(
      `heart rate packet too short: ${data.length} bytes`,
    );
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const flags = view.getUint8(0);

  const hr16 = (flags & 0x01) !== 0;
  const contactSupported = (flags & 0x04) !== 0;
  const contactDetected = (flags & 0x02) !== 0;
  const hasEnergy = (flags & 0x08) !== 0;
  const hasRr = (flags & 0x10) !== 0;

  let offset = 1;

  const bpm = hr16 ? view.getUint16(offset, true) : view.getUint8(offset);
  offset += hr16 ? 2 : 1;

  let energyKj: number | undefined;
  if (hasEnergy) {
    if (offset + 2 > data.length) {
      throw new HeartRateParseError('packet claims energy field but is truncated');
    }
    energyKj = view.getUint16(offset, true);
    offset += 2;
  }

  const rrIntervals: number[] = [];
  if (hasRr) {
    // A single notification can carry several beats if the sensor batched them.
    while (offset + 2 <= data.length) {
      const ticks = view.getUint16(offset, true);
      rrIntervals.push((ticks / RR_TICKS_PER_SECOND) * 1000);
      offset += 2;
    }
  }

  return {
    t,
    bpm,
    rrIntervals,
    ...(contactSupported ? { contact: contactDetected } : {}),
    ...(energyKj !== undefined ? { energyKj } : {}),
  };
}

/** Convenience for platforms that hand you base64 (react-native-ble-plx does). */
export function parseHeartRateBase64(
  base64: string,
  t: number = Date.now(),
): HeartRateSample {
  return parseHeartRateMeasurement(base64ToBytes(base64), t);
}

export function base64ToBytes(base64: string): Uint8Array {
  // Buffer where it exists (Node, React Native), atob in the browser.
  const g = globalThis as {
    Buffer?: { from(s: string, enc: string): { length: number; [i: number]: number } };
    atob?: (s: string) => string;
  };
  if (g.Buffer) {
    const buf = g.Buffer.from(base64, 'base64');
    const out = new Uint8Array(buf.length);
    for (let i = 0; i < buf.length; i++) out[i] = buf[i] as number;
    return out;
  }
  if (g.atob) {
    const bin = g.atob(base64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  throw new HeartRateParseError('no base64 decoder available on this platform');
}

/** Pull every RR interval out of a run of samples, in order. */
export function collectRrIntervals(samples: readonly HeartRateSample[]): number[] {
  const out: number[] = [];
  for (const s of samples) out.push(...s.rrIntervals);
  return out;
}

// ---------------------------------------------------------------------------
// The Zoned custom service
//
// A screenless band has no way to show you anything and no buttons to press, so
// two things become load-bearing that a watch does not need:
//
//   haptics   the only channel the device has to reach you. A watch shows a
//             number; a band buzzes and you look at your phone.
//   logging   with no screen there is no reason to carry your phone, so the
//             band must record standalone and hand over the backlog later.
//
// Skin conductance also has no standard SIG service — the Bluetooth spec never
// imagined a consumer device measuring it — so it lives here too.
// ---------------------------------------------------------------------------

/** Zoned custom service. Heart rate stays on the standard 0x180D service. */
export const ZONED_SERVICE = '7a1f0000-4b2c-4d5e-8f9a-1c2d3e4f5a6b';
/** Notify: batched skin conductance samples. */
export const ZONED_EDA = '7a1f0001-4b2c-4d5e-8f9a-1c2d3e4f5a6b';
/** Write: ask the band about, or start, a backlog transfer. */
export const ZONED_LOG_CONTROL = '7a1f0002-4b2c-4d5e-8f9a-1c2d3e4f5a6b';
/** Notify: the backlog itself, streamed out. */
export const ZONED_LOG_DATA = '7a1f0003-4b2c-4d5e-8f9a-1c2d3e4f5a6b';
/** Write: buzz the band. The whole user interface of a screenless device. */
export const ZONED_HAPTIC = '7a1f0004-4b2c-4d5e-8f9a-1c2d3e4f5a6b';

/**
 * Conductance is sent as unsigned 16-bit counts of 0.001 µS, giving a 0–65 µS
 * range at a resolution 50x finer than the smallest response worth detecting.
 * Real skin sits between 1 and 20 µS; anything above the range would be
 * rejected as an artifact regardless.
 */
const EDA_MICROSIEMENS_PER_COUNT = 0.001;
const EDA_MAX_COUNT = 0xffff;

/**
 * One EDA notification: a base timestamp then a run of evenly spaced samples.
 *
 * Sending the interval once instead of a timestamp per sample roughly halves
 * the packet, which matters when the radio is the largest power draw on a
 * device that has to last days.
 *
 *   bytes 0-3   uint32  milliseconds since the device epoch
 *   bytes 4-5   uint16  interval between samples, milliseconds
 *   bytes 6..   uint16  conductance, counts of 0.001 µS
 */
export function encodeEdaPacket(
  baseTimestampMs: number,
  intervalMs: number,
  microSiemens: readonly number[],
): Uint8Array {
  const bytes = new Uint8Array(6 + microSiemens.length * 2);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, baseTimestampMs >>> 0, true);
  view.setUint16(4, Math.max(0, Math.min(0xffff, Math.round(intervalMs))), true);

  for (let i = 0; i < microSiemens.length; i++) {
    const raw = (microSiemens[i] as number) / EDA_MICROSIEMENS_PER_COUNT;
    const counts = Math.max(0, Math.min(EDA_MAX_COUNT, Math.round(raw)));
    view.setUint16(6 + i * 2, counts, true);
  }

  return bytes;
}

export class EdaParseError extends Error {}

/**
 * Decode an EDA notification.
 *
 * @param data     Raw characteristic value.
 * @param epochMs  Wall-clock time of the device's zero. The band has no clock
 *                 of its own worth trusting, so the phone supplies the epoch.
 */
export function parseEdaPacket(
  data: Uint8Array,
  epochMs = 0,
): EdaSample[] {
  if (data.length < 6) {
    throw new EdaParseError(`eda packet too short: ${data.length} bytes`);
  }
  if ((data.length - 6) % 2 !== 0) {
    throw new EdaParseError('eda packet has a trailing half sample');
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const base = view.getUint32(0, true);
  const interval = view.getUint16(4, true);

  const samples: EdaSample[] = [];
  const count = (data.length - 6) / 2;
  for (let i = 0; i < count; i++) {
    samples.push({
      t: epochMs + base + i * interval,
      microSiemens: view.getUint16(6 + i * 2, true) * EDA_MICROSIEMENS_PER_COUNT,
    });
  }

  return samples;
}

/**
 * What the band can say without a screen.
 *
 * Deliberately few. A device that buzzes at you all day gets taken off, and a
 * band you are not wearing measures nothing — so the vocabulary is kept small
 * enough that every pattern stays distinguishable by feel alone.
 */
export type HapticEffect =
  /** Two short pulses: paired, or a recording started. */
  | 'confirm'
  /** One long pulse: something needs the phone. */
  | 'alert'
  /** Three rising pulses: your morning scores are ready. */
  | 'morning'
  /** One short pulse, repeated: electrode contact lost mid-recording. */
  | 'contact-lost'
  /** Silence — cancels anything playing. */
  | 'stop';

const HAPTIC_IDS: Record<HapticEffect, number> = {
  stop: 0,
  confirm: 1,
  alert: 2,
  morning: 3,
  'contact-lost': 4,
};

const HAPTIC_BY_ID: HapticEffect[] = ['stop', 'confirm', 'alert', 'morning', 'contact-lost'];

/**
 * Encode a haptic command.
 *
 *   byte 0  effect id
 *   byte 1  intensity, 0-100
 *   byte 2  repeats, 0-10
 */
export function encodeHapticCommand(
  effect: HapticEffect,
  { intensity = 70, repeats = 0 }: { intensity?: number; repeats?: number } = {},
): Uint8Array {
  return new Uint8Array([
    HAPTIC_IDS[effect],
    Math.max(0, Math.min(100, Math.round(intensity))),
    Math.max(0, Math.min(10, Math.round(repeats))),
  ]);
}

export function parseHapticCommand(data: Uint8Array): {
  effect: HapticEffect;
  intensity: number;
  repeats: number;
} {
  if (data.length < 3) throw new EdaParseError('haptic command too short');
  const effect = HAPTIC_BY_ID[data[0] as number];
  if (!effect) throw new EdaParseError(`unknown haptic effect id ${data[0]}`);
  return { effect, intensity: data[1] as number, repeats: data[2] as number };
}
