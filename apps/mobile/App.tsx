import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useHeartRate } from './src/ble/useHeartRate';
import { TodayScreen } from './src/screens/TodayScreen';
import { LiveScreen } from './src/screens/LiveScreen';
import { SensorScreen } from './src/screens/SensorScreen';
import { spacing, theme } from './src/lib/theme';

type Tab = 'today' | 'live' | 'sensor';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'live', label: 'Live' },
  { id: 'sensor', label: 'Sensor' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  // One BLE connection for the whole app, owned here and passed down, so
  // switching tabs never drops the sensor mid-recording.
  const hr = useHeartRate();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.body}>
          {tab === 'today' ? <TodayScreen /> : null}
          {tab === 'live' ? <LiveScreen hr={hr} /> : null}
          {tab === 'sensor' ? <SensorScreen hr={hr} /> : null}
        </View>

        <View style={styles.tabs}>
          {TABS.map((item) => (
            <Pressable key={item.id} style={styles.tab} onPress={() => setTab(item.id)}>
              <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>
                {item.label}
              </Text>
              {item.id === 'live' && hr.state.isRecording ? (
                <View style={styles.recordingDot} />
              ) : null}
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  body: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing(1.75),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: theme.text },
  recordingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.red },
});
