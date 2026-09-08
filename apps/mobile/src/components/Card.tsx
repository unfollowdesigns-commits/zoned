import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { theme, spacing } from '../lib/theme';

export function Card({
  title,
  children,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: spacing(1.5),
  },
  title: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing(1.5),
  },
  stat: { flex: 1, minWidth: 90 },
  statLabel: { color: theme.textMuted, fontSize: 12, marginBottom: 4 },
  statValue: { color: theme.text, fontSize: 22, fontWeight: '600' },
  statUnit: { color: theme.textMuted, fontSize: 13, fontWeight: '400' },
});
