import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Card } from '../components/Card';
import { spacing, theme } from '../lib/theme';
import type { useHeartRate } from '../ble/useHeartRate';
import { isCloudEnabled } from '../lib/supabase';
import { syncPending } from '../lib/store';

type HeartRate = ReturnType<typeof useHeartRate>;

const CONNECTION_COPY: Record<string, string> = {
  idle: 'Not connected',
  scanning: 'Scanning for sensors…',
  connecting: 'Connecting…',
  connected: 'Connected',
  unauthorized: 'Bluetooth permission denied',
  'bluetooth-off': 'Bluetooth is off',
  error: 'Something went wrong',
};

export function SensorScreen({ hr }: { hr: HeartRate }) {
  const { state } = hr;
  const [battery, setBattery] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  useEffect(() => {
    if (state.connection !== 'connected') {
      setBattery(null);
      return;
    }
    void hr.batteryLevel().then(setBattery);
  }, [state.connection]);

  const busy = state.connection === 'scanning' || state.connection === 'connecting';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Sensor</Text>

      <Card title="Status">
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  state.connection === 'connected'
                    ? theme.green
                    : state.connection === 'error' || state.connection === 'unauthorized'
                      ? theme.red
                      : theme.textMuted,
              },
            ]}
          />
          <Text style={styles.status}>
            {CONNECTION_COPY[state.connection] ?? state.connection}
          </Text>
          {busy ? <ActivityIndicator size="small" color={theme.textMuted} /> : null}
        </View>
        {state.detail ? <Text style={styles.detail}>{state.detail}</Text> : null}
        {battery !== null ? (
          <Text style={styles.detail}>Sensor battery {battery}%</Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            disabled={busy}
            onPress={() => void hr.scan()}
          >
            <Text style={styles.buttonText}>Scan</Text>
          </Pressable>
          {state.connection === 'connected' ? (
            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => void hr.disconnect()}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Disconnect
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Card>

      <Card title="Nearby sensors">
        {state.devices.length === 0 ? (
          <Text style={styles.empty}>
            {state.connection === 'scanning'
              ? 'Looking for anything broadcasting the standard Heart Rate Service…'
              : 'No sensors found yet. Wet the strap electrodes — a dry strap will not advertise.'}
          </Text>
        ) : (
          state.devices.map((device) => (
            <Pressable
              key={device.id}
              style={styles.device}
              onPress={() => void hr.connect(device.id)}
            >
              <View style={styles.deviceMain}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceId}>{device.id}</Text>
              </View>
              {device.rssi !== null ? (
                <Text style={styles.rssi}>{device.rssi} dBm</Text>
              ) : null}
            </Pressable>
          ))
        )}
      </Card>

      <Card title="Cloud sync">
        {isCloudEnabled ? (
          <>
            <Text style={styles.empty}>
              Recordings are saved on this phone first and uploaded when you sync.
            </Text>
            <Pressable
              style={[styles.button, styles.syncButton, syncing && styles.buttonDisabled]}
              disabled={syncing}
              onPress={async () => {
                setSyncing(true);
                setSyncNote(null);
                try {
                  const result = await syncPending();
                  setSyncNote(
                    `${result.uploaded} uploaded` +
                      (result.failed ? `, ${result.failed} failed` : ''),
                  );
                } catch (error) {
                  setSyncNote(error instanceof Error ? error.message : 'Sync failed');
                } finally {
                  setSyncing(false);
                }
              }}
            >
              <Text style={styles.buttonText}>{syncing ? 'Syncing…' : 'Sync now'}</Text>
            </Pressable>
            {syncNote ? <Text style={styles.detail}>{syncNote}</Text> : null}
          </>
        ) : (
          <Text style={styles.empty}>
            Not configured. The app works entirely offline until you add Supabase keys to
            .env — see docs/SETUP.md.
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  content: { padding: spacing(2), paddingBottom: spacing(6) },
  heading: {
    color: theme.text,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing(2),
    letterSpacing: -0.5,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1) },
  dot: { width: 10, height: 10, borderRadius: 5 },
  status: { color: theme.text, fontSize: 16, fontWeight: '600', flex: 1 },
  detail: { color: theme.textMuted, fontSize: 13, marginTop: spacing(1), lineHeight: 18 },
  actions: { flexDirection: 'row', gap: spacing(1), marginTop: spacing(2) },
  button: {
    flex: 1,
    paddingVertical: spacing(1.5),
    borderRadius: 10,
    backgroundColor: theme.accent,
    alignItems: 'center',
  },
  syncButton: { marginTop: spacing(2) },
  buttonSecondary: { backgroundColor: theme.surfaceAlt },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: theme.bg, fontWeight: '700', fontSize: 15 },
  buttonTextSecondary: { color: theme.text },
  empty: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
  device: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(1.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  deviceMain: { flex: 1 },
  deviceName: { color: theme.text, fontSize: 15, fontWeight: '600' },
  deviceId: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
  rssi: { color: theme.textMuted, fontSize: 12 },
});
