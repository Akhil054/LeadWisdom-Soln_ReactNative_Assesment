import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  options: ChipOption<T>[];
  selected: T;
  onChange: (value: T) => void;
  /** Wrap onto multiple lines instead of scrolling horizontally. */
  wrap?: boolean;
}

/** Single-select chip row — used for catalog filters, durations and issue types. */
export function FilterChips<T extends string>({ options, selected, onChange, wrap }: FilterChipsProps<T>) {
  const chips = options.map((opt) => {
    const active = opt.value === selected;
    return (
      <Pressable
        key={opt.value}
        onPress={() => onChange(opt.value)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={[styles.chip, active && styles.chipActive]}
      >
        <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
      </Pressable>
    );
  });

  if (wrap) return <View style={styles.wrap}>{chips}</View>;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  labelActive: { color: colors.white },
});
