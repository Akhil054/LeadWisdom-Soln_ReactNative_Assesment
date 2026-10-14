import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | React.ReactNode;
  tint?: string;
}

/** Small metric tile used on detail, active session and summary screens. */
export const StatTile = ({ icon, label, value, tint = colors.primary }: StatTileProps) => (
  <View style={styles.tile} accessibilityLabel={typeof value === 'string' ? `${label}: ${value}` : label}>
    <Ionicons name={icon} size={18} color={tint} />
    <Text style={styles.label}>{label}</Text>
    {typeof value === 'string' ? <Text style={styles.value}>{value}</Text> : value}
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  label: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  value: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
});
