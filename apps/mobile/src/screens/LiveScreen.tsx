import { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { SessionKind } from '@zoned/core';
import { Card, Stat } from '../components/Card';
import { spacing, theme } from '../lib/theme';
import type { useHeartRate } from '../ble/useHeartRate';
import { saveSession } from '../lib/store';

type HeartRate = ReturnType<typeof useHeartRate>;

const KINDS: Array<{ kind: SessionKind; label: string }> = [
  { kind: 'workout', label: 'Workout' },
  { kind: 'sleep', label: 'Sleep' },
  { kind: 'rest', label: 'Rest reading' },
];

export function LiveScreen({ hr }: { hr: HeartRate }) {
  const { state } = hr;
  const [kind, setKind] = useState<SessionKind>('workout');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const connected = state.connection === 'connected';
  const bpm = state.latest?.bpm ?? null;
  const hrv = state.liveHrv;

  const start = () => {
    setStartedAt(Date.now());
    hr.startRecording();
  };

  const stop = async () => {
    const samples = hr.stopRecording();
    const began = startedAt ?? Date.now();
    setStartedAt(null);

    if (samples.length < 10) {
      Alert.alert('Too short', 'That recording had almost no data, so it was discarded.');
      return;
    }

    setSaving(true);
    try {
      await saveSession({
        kind,
        startedAt: began,
        endedAt: Date.now(),
        samples,
        motion: [],
      });
      Alert.alert(
        'Saved',
        `${samples.length} readings stored. Pull to refresh on Today to see it scored.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Live</Text>

      {!connected ? (
        <Card>
          <Text style={styles.notice}>
            No sensor connected. Open the Sensor tab, wet the strap electrodes, and connect.
          </Text>
        </Card>
      ) : null}

      <View style={styles.bpmWrap}>
        <Text style={styles.bpm}>{bpm ?? '—'}</Text>
        <Text style={styles.bpmUnit}>bpm</Text>
      </View>

      <Trace samples={state.recent} />

      <Card title="Live variability">
        <View style={styles.row}>
          <Stat label="RMSSD" value={hrv ? hrv.rmssd.toFixed(0) : '—'} unit="ms" />
          <Stat label="SDNN" value={hrv ? hrv.sdnn.toFixed(0) : '—'} unit="ms" />
          <Stat
            label="Artifacts"
            value={hrv ? `${(hrv.artifactRate * 100).toFixed(0)}%` : '—'}
          />
        </View>
        <Text style={styles.hint}>
          {hrv && hrv.artifactRate > 0.05
            ? 'High artifact rate — the strap is losing contact. Wet the electrodes.'
            : 'For a clean resting reading, sit still and breathe normally for three minutes.'}
        </Text>
      </Card>

      <Card title="Record a session">
        <View style={styles.kinds}>
          {KINDS.map((option) => (
            <Pressable
              key={option.kind}
              onPress={() => setKind(option.kind)}
              disabled={state.isRecording}
              style={[
                styles.kind,
                kind === option.kind && styles.kindActive,
                state.isRecording && styles.kindDisabled,
              ]}
            >
              <Text
                style={[styles.kindText, kind === option.kind && styles.kindTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {state.isRecording ? (
          <Text style={styles.recording}>
            Recording {state.recording.length} readings
            {startedAt ? ` · ${formatElapsed(Date.now() - startedAt)}` : ''}
          </Text>
        ) : null}

        <Pressable
          onPress={state.isRecording ? stop : start}
          disabled={!connected || saving}
          style={[
            styles.button,
            state.isRecording ? styles.buttonStop : styles.buttonStart,
            (!connected || saving) && styles.buttonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color={theme.bg} />
          ) : (
            <Text style={styles.buttonText}>
              {state.isRecording ? 'Stop and save' : 'Start recording'}
            </Text>
          )}
        </Pressable>
      </Card>
    </ScrollView>
  );
}

/** A bare sparkline of the last few minutes, drawn with plain views. */
function Trace({ samples }: { samples: readonly { bpm: number }[] }) {
  if (samples.length < 2) return null;
  const values = samples.slice(-90).map((s) => s.bpm);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  return (
    <View style={styles.trace}>
      {values.map((value, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: `${20 + ((value - min) / range) * 80}%`,
            backgroundColor: theme.accent,
            opacity: 0.35 + (i / values.length) * 0.65,
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
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
  notice: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
  bpmWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: spacing(2),
  },
  bpm: { color: theme.text, fontSize: 76, fontWeight: '200', letterSpacing: -2 },
  bpmUnit: { color: theme.textMuted, fontSize: 18, marginLeft: spacing(1) },
  trace: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
    height: 72,
    marginBottom: spacing(2),
  },
  row: { flexDirection: 'row', gap: spacing(1.5) },
  hint: { color: theme.textMuted, fontSize: 12, marginTop: spacing(1.5), lineHeight: 17 },
  kinds: { flexDirection: 'row', gap: spacing(1), marginBottom: spacing(2) },
  kind: {
    flex: 1,
    paddingVertical: spacing(1.25),
    borderRadius: 10,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center',
  },
  kindActive: { backgroundColor: theme.accent },
  kindDisabled: { opacity: 0.4 },
  kindText: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },
  kindTextActive: { color: theme.bg },
  recording: { color: theme.accent, fontSize: 13, marginBottom: spacing(1.5) },
  button: { paddingVertical: spacing(2), borderRadius: 12, alignItems: 'center' },
  buttonStart: { backgroundColor: theme.green },
  buttonStop: { backgroundColor: theme.red },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: theme.bg, fontSize: 16, fontWeight: '700' },
});
