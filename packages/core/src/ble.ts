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

import type { HeartRateSample } from './types';

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
