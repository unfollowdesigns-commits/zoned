import { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, RefreshControl } from 'react-native';
import { describeRecovery, type UserProfile } from '@zoned/core';
import { Card, Stat } from '../components/Card';
import { Ring } from '../components/Ring';
import { recoveryColor, spacing, theme } from '../lib/theme';
import {
  loadProfile,
  loadSessions,
  summarizeDays,
  type DayMetrics,
} from '../lib/store';

export function TodayScreen() {
  const [days, setDays] = useState<DayMetrics[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [sessions, storedProfile] = await Promise.all([loadSessions(), loadProfile()]);
    setProfile(storedProfile);
    setDays(summarizeDays(sessions, storedProfile));
  };

  useEffect(() => {
    void load();
  }, []);

  const today = days[days.length - 1] ?? null;
  const recovery = today?.recovery ?? null;
  const color = recovery ? recoveryColor(recovery.band) : theme.textMuted;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={theme.textMuted}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <Text style={styles.heading}>Today</Text>

      <View style={styles.ringWrap}>
        <Ring
          value={recovery?.score ?? 0}
          color={color}
          label={recovery ? `${recovery.score}` : '—'}
          sublabel={recovery ? `${recovery.band} recovery` : 'no night recorded'}
        />
      </View>

      <Text style={styles.readout}>
        {recovery
          ? describeRecovery(recovery)
          : 'Wear the sensor overnight and record a sleep session to get a recovery score.'}
      </Text>

      <Card title="Overnight">
        <View style={styles.row}>
          <Stat
            label="HRV (RMSSD)"
            value={today?.rmssd ? today.rmssd.toFixed(0) : '—'}
            unit="ms"
          />
          <Stat
            label="Resting HR"
            value={today?.restingHr ? today.restingHr.toFixed(0) : '—'}
            unit="bpm"
          />
          <Stat
            label="Breathing"
            value={today?.respiratoryRate ? today.respiratoryRate.toFixed(1) : '—'}
            unit="br/min"
          />
        </View>
      </Card>

      <Card title="Sleep">
        <View style={styles.row}>
          <Stat
            label="Asleep"
            value={
              today?.sleepMinutes
                ? `${Math.floor(today.sleepMinutes / 60)}h ${today.sleepMinutes % 60}m`
                : '—'
            }
          />
          <Stat
            label="Efficiency"
            value={
              today?.sleepEfficiency ? `${Math.round(today.sleepEfficiency * 100)}%` : '—'
            }
          />
          <Stat
            label="Need"
            value={`${profile?.sleepNeedHours ?? 8}h`}
          />
        </View>
      </Card>

      <Card title="Strain today">
        <View style={styles.row}>
          <Stat
            label="Strain"
            value={today?.strain ? today.strain.strain.toFixed(1) : '0.0'}
            unit="/ 21"
          />
          <Stat
            label="Avg HR"
            value={today?.strain ? today.strain.averageHr.toFixed(0) : '—'}
            unit="bpm"
          />
          <Stat
            label="Active"
            value={today?.strain ? `${Math.round(today.strain.durationMin)}` : '0'}
            unit="min"
          />
        </View>
      </Card>

      {days.length > 1 ? (
        <Card title={`Last ${Math.min(days.length, 14)} days`}>
          <History days={days.slice(-14)} />
        </Card>
      ) : (
        <Card title="Getting started">
          <Text style={styles.help}>
            Your recovery score compares each morning against your own normal, so it needs
            about a week of nights before it means much. Until then it shows greyed out.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

function History({ days }: { days: DayMetrics[] }) {
  return (
    <View style={styles.history}>
      {days.map((day) => {
        const score = day.recovery?.score ?? 0;
        const color = day.recovery ? recoveryColor(day.recovery.band) : theme.surfaceAlt;
        return (
          <View key={day.day} style={styles.historyCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { height: `${Math.max(4, score)}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{day.day.slice(8)}</Text>
          </View>
        );
      })}
    </View>
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
  ringWrap: { alignItems: 'center', marginBottom: spacing(2) },
  readout: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing(3),
    paddingHorizontal: spacing(1),
  },
  row: { flexDirection: 'row', gap: spacing(1.5) },
  help: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
  history: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 120 },
  historyCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '100%',
    height: 96,
    justifyContent: 'flex-end',
    backgroundColor: theme.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { color: theme.textMuted, fontSize: 10, marginTop: 4 },
});
