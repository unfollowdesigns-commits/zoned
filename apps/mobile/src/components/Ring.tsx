import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

/**
 * The recovery ring, drawn without an SVG dependency: a track, a rotated
 * segment overlay, and the number in the middle. Good enough at a glance and
 * one fewer native module to install on day one.
 */
export function Ring({
  value,
  max = 100,
  color,
  label,
  sublabel,
  size = 176,
}: {
  value: number;
  max?: number;
  color: string;
  label: string;
  sublabel?: string;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const stroke = 12;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          styles.track,
          { width: size, height: size, borderRadius: size / 2, borderWidth: stroke },
        ]}
      />
      <View
        style={[
          styles.fill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: color,
            // A full ring at 100%, otherwise show an arc proportional to value.
            borderRightColor: pct > 0.25 ? color : 'transparent',
            borderTopColor: pct > 0.5 ? color : 'transparent',
            borderLeftColor: pct > 0.75 ? color : 'transparent',
            transform: [{ rotate: `${-90 + pct * 360 * 0.02}deg` }],
            opacity: 0.95,
          },
        ]}
      />
      <View style={styles.center}>
        <Text style={[styles.value, { color }]}>{label}</Text>
        {sublabel ? <Text style={styles.sub}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { position: 'absolute', borderColor: theme.surfaceAlt },
  fill: { position: 'absolute', borderBottomColor: 'transparent' },
  center: { alignItems: 'center' },
  value: { fontSize: 46, fontWeight: '700', letterSpacing: -1 },
  sub: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
});
