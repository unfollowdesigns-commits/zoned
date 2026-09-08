import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  collectRrIntervals,
  computeHrv,
  type HeartRateSample,
  type HrvMetrics,
} from '@zoned/core';
import {
  HeartRateClient,
  type ConnectionState,
  type DiscoveredDevice,
} from './manager';

/** Samples kept in memory for the live readout — roughly four minutes. */
const LIVE_WINDOW = 240;
/** Recompute HRV every N packets. Faster than this is wasted on a human eye. */
const HRV_EVERY = 10;

export interface HeartRateState {
  connection: ConnectionState;
  detail: string | null;
  devices: DiscoveredDevice[];
  /** The most recent reading, or null before the first packet arrives. */
  latest: HeartRateSample | null;
  /** Rolling window, for the live trace. */
  recent: readonly HeartRateSample[];
  liveHrv: HrvMetrics | null;
  /** Every sample since recording started. */
  recording: readonly HeartRateSample[];
  isRecording: boolean;
}

export function useHeartRate() {
  const [connection, setConnection] = useState<ConnectionState>('idle');
  const [detail, setDetail] = useState<string | null>(null);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [latest, setLatest] = useState<HeartRateSample | null>(null);
  const [liveHrv, setLiveHrv] = useState<HrvMetrics | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Sample buffers live in refs: they change once a second and copying them
  // into React state on every packet would re-render the whole tree for nothing.
  // `packets` is the single piece of state that drives the re-render.
  const recentRef = useRef<HeartRateSample[]>([]);
  const recordingRef = useRef<HeartRateSample[]>([]);
  const isRecordingRef = useRef(false);
  const [packets, setPackets] = useState(0);

  const client = useMemo(
    () =>
      new HeartRateClient({
        onState: (state, message) => {
          setConnection(state);
          setDetail(message ?? null);
        },
        onDiscover: setDevices,
        onSample: (sample) => {
          recentRef.current.push(sample);
          if (recentRef.current.length > LIVE_WINDOW) recentRef.current.shift();
          if (isRecordingRef.current) recordingRef.current.push(sample);
          setLatest(sample);
          setPackets((n) => n + 1);
        },
      }),
    [],
  );

  useEffect(() => () => client.destroy(), [client]);

  // Throttled by bucketing the packet count, so this effect fires once every
  // HRV_EVERY packets rather than on each one.
  const hrvBucket = Math.floor(packets / HRV_EVERY);
  useEffect(() => {
    const window = recentRef.current;
    if (window.length < 30) {
      setLiveHrv(null);
      return;
    }
    setLiveHrv(computeHrv(collectRrIntervals(window), { minBeats: 30 }));
  }, [hrvBucket]);

  const startRecording = useCallback(() => {
    recordingRef.current = [];
    isRecordingRef.current = true;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback((): HeartRateSample[] => {
    isRecordingRef.current = false;
    setIsRecording(false);
    return [...recordingRef.current];
  }, []);

  const state: HeartRateState = {
    connection,
    detail,
    devices,
    latest,
    recent: recentRef.current,
    liveHrv,
    recording: recordingRef.current,
    isRecording,
  };

  return {
    state,
    packets,
    scan: useCallback(() => client.scan(), [client]),
    stopScan: useCallback(() => client.stopScan(), [client]),
    connect: useCallback((id: string) => client.connect(id), [client]),
    disconnect: useCallback(() => client.disconnect(), [client]),
    batteryLevel: useCallback(() => client.batteryLevel(), [client]),
    startRecording,
    stopRecording,
  };
}
