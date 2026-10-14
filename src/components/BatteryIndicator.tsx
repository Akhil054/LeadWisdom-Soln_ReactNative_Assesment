import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

interface BatteryIndicatorProps {
  level: number;
  /** Show a larger bar (used on detail / active trip screens). */
  large?: boolean;
}

export const batteryColor = (level: number) =>
  level >= 50 ? colors.success : level >= 20 ? colors.warning : colors.danger;

/** Horizontal battery gauge + percentage. */
export const BatteryIndicator = ({ level, large = false }: BatteryIndicatorProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  const color = batteryColor(clamped);

  return (
    <View style={styles.row} accessibilityLabel={`Battery ${clamped} percent`}>
      <View style={[styles.shell, large && styles.shellLarge]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
      <View style={[styles.cap, large && styles.capLarge]} />
      <Text style={[styles.text, large && styles.textLarge, { color }]}>{clamped}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  shell: {
    width: 44,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 1.5,
    overflow: 'hidden',
  },
  shellLarge: { width: 80, height: 22, borderRadius: radius.sm - 2 },
  fill: { height: '100%', borderRadius: 2 },
  cap: { width: 3, height: 6, backgroundColor: colors.border, borderRadius: 1, marginLeft: 1 },
  capLarge: { width: 4, height: 10 },
  text: { marginLeft: 6, fontSize: 13, fontWeight: '700' },
  textLarge: { fontSize: 18 },
});
