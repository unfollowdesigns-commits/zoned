/**
 * Bluetooth plumbing.
 *
 * Everything here is about *transport* — scanning, permissions, reconnecting.
 * The moment bytes arrive they are handed to @zoned/core's parser, which knows
 * nothing about Bluetooth and can be tested on a laptop. Keeping that line
 * clean is what will let a custom band replace the chest strap later without
 * touching a single line of the physiology code.
 */

import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, type Device, type Subscription } from 'react-native-ble-plx';
import {
  BATTERY_LEVEL,
  BATTERY_SERVICE,
  HEART_RATE_MEASUREMENT,
  HEART_RATE_SERVICE,
  base64ToBytes,
  parseHeartRateBase64,
  type HeartRateSample,
} from '@zoned/core';

export type ConnectionState =
  | 'idle'
  | 'unauthorized'
  | 'bluetooth-off'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'error';

export interface DiscoveredDevice {
  id: string;
  name: string;
  rssi: number | null;
}

/**
 * Android needs runtime permission before it will return any scan results.
 * Silence here is the single most common reason a first BLE app "does nothing".
 */
export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  // Android 12 (API 31) split Bluetooth out of the location permissions.
  const permissions =
    Platform.Version >= 31
      ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  const result = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every(
    (p) => result[p] === PermissionsAndroid.RESULTS.GRANTED,
  );
}

export interface HeartRateClientEvents {
  onState?: (state: ConnectionState, detail?: string) => void;
  onDiscover?: (devices: DiscoveredDevice[]) => void;
  onSample?: (sample: HeartRateSample) => void;
}

/**
 * A thin wrapper over BleManager that speaks in HeartRateSamples.
 *
 * One instance per app. Call `destroy()` when the app unmounts — an orphaned
 * BleManager keeps the radio awake and drains the phone battery.
 */
export class HeartRateClient {
  private manager = new BleManager();
  private device: Device | null = null;
  private monitor: Subscription | null = null;
  private disconnectWatcher: Subscription | null = null;
  private discovered = new Map<string, DiscoveredDevice>();
  private events: HeartRateClientEvents;
  /** Set while a deliberate disconnect is in flight, to suppress auto-reconnect. */
  private closing = false;

  constructor(events: HeartRateClientEvents = {}) {
    this.events = events;
  }

  private setState(state: ConnectionState, detail?: string) {
    this.events.onState?.(state, detail);
  }

  /**
   * Scan for anything advertising the standard Heart Rate Service.
   *
   * Filtering by service UUID rather than by name is deliberate: it finds any
   * compliant sensor, including firmware you write yourself.
   */
  async scan(durationMs = 10_000): Promise<void> {
    const granted = await requestBluetoothPermissions();
    if (!granted) {
      this.setState('unauthorized', 'Bluetooth permission was declined.');
      return;
    }

    const state = await this.manager.state();
    if (state !== 'PoweredOn') {
      this.setState('bluetooth-off', `Bluetooth is ${state.toLowerCase()}.`);
      return;
    }

    this.discovered.clear();
    this.events.onDiscover?.([]);
    this.setState('scanning');

    this.manager.startDeviceScan([HEART_RATE_SERVICE], null, (error, device) => {
      if (error) {
        this.setState('error', error.message);
        this.manager.stopDeviceScan();
        return;
      }
      if (!device) return;

      this.discovered.set(device.id, {
        id: device.id,
        name: device.name ?? device.localName ?? 'Unknown sensor',
        rssi: device.rssi,
      });
      this.events.onDiscover?.([...this.discovered.values()]);
    });

    setTimeout(() => this.stopScan(), durationMs);
  }

  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<void> {
    this.stopScan();
    this.closing = false;
    this.setState('connecting');

    try {
      const device = await this.manager.connectToDevice(deviceId, {
        requestMTU: 64,
      });
      await device.discoverAllServicesAndCharacteristics();
      this.device = device;

      this.monitor = device.monitorCharacteristicForService(
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT,
        (error, characteristic) => {
          if (error) {
            // A disconnect surfaces here too; the watcher below handles it.
            return;
          }
          const value = characteristic?.value;
          if (!value) return;
          try {
            this.events.onSample?.(parseHeartRateBase64(value));
          } catch {
            // A single malformed packet is not worth tearing the session down.
          }
        },
      );

      this.disconnectWatcher = device.onDisconnected(() => {
        this.monitor?.remove();
        this.monitor = null;
        this.device = null;
        if (this.closing) {
          this.setState('idle');
        } else {
          // Straps drop out when they lose skin contact. Say so, don't crash.
          this.setState('error', 'Sensor disconnected. Re-wet the strap and reconnect.');
        }
      });

      this.setState('connected', device.name ?? deviceId);
    } catch (error) {
      this.setState('error', error instanceof Error ? error.message : String(error));
    }
  }

  async disconnect(): Promise<void> {
    this.closing = true;
    this.monitor?.remove();
    this.monitor = null;
    this.disconnectWatcher?.remove();
    this.disconnectWatcher = null;
    if (this.device) {
      await this.manager.cancelDeviceConnection(this.device.id).catch(() => {});
      this.device = null;
    }
    this.setState('idle');
  }

  async batteryLevel(): Promise<number | null> {
    if (!this.device) return null;
    try {
      const characteristic = await this.device.readCharacteristicForService(
        BATTERY_SERVICE,
        BATTERY_LEVEL,
      );
      const value = characteristic.value;
      if (!value) return null;
      return base64ToBytes(value)[0] ?? null;
    } catch {
      return null;
    }
  }

  destroy(): void {
    this.stopScan();
    this.monitor?.remove();
    this.disconnectWatcher?.remove();
    this.manager.destroy();
  }
}
