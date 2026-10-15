import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssetStatus } from '../types';
import { colors, radius, spacing } from '../theme';
import { STATUS_LABEL } from '../utils/format';

const PALETTE: Record<AssetStatus, { bg: string; fg: string }> = {
  available: { bg: colors.successLight, fg: colors.success },
  in_use: { bg: colors.infoLight, fg: colors.info },
  charging: { bg: colors.warningLight, fg: colors.warning },
  maintenance: { bg: colors.dangerLight, fg: colors.danger },
};

interface StatusTagProps {
  status: AssetStatus;
  /** Optional label override (e.g. "Trip active"). */
  label?: string;
}

/** Colour-coded status pill with a "live" dot. */
export const StatusTag = ({ status, label }: StatusTagProps) => {
  const p = PALETTE[status];
  const text = label ?? STATUS_LABEL[status];
  return (
    <View
      style={[styles.tag, { backgroundColor: p.bg }]}
    >
      <View style={[styles.dot, { backgroundColor: p.fg }]} />
      <Text style={[styles.text, { color: p.fg }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  text: { fontSize: 12, fontWeight: '700' },
});
