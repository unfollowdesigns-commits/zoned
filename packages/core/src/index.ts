/**
 * @zoned/core — the physiology engine.
 *
 * Deliberately free of any device, network or UI dependency: everything here
 * is pure functions over plain data, so it runs identically in the phone app,
 * in the web dashboard, and in tests on a laptop with no hardware attached.
 */

export * from './types.js';
export * from './ble.js';
export * from './hrv.js';
export * from './baseline.js';
export * from './strain.js';
export * from './sleep.js';
export * from './recovery.js';
export * from './synthetic.js';
