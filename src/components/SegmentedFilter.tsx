import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Small colour dot shown before the label (e.g. status colour). */
  dotColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SegmentedFilterProps<T extends string> {
  options: SegmentOption<T>[];
  selected: T;
  onChange: (value: T) => void;
}

/** iOS-style segmented track; the active segment lifts out as a white pill. Scrolls if it overflows. */
export function SegmentedFilter<T extends string>({ options, selected, onChange }: SegmentedFilterProps<T>) {
  return (
    <View style={styles.track}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [styles.segment, active && styles.segmentActive, pressed && !active && styles.pressed]}
            >
              {opt.icon ? (
                <Ionicons name={opt.icon} size={14} color={active ? colors.primary : colors.textMuted} />
              ) : opt.dotColor ? (
                <View style={[styles.dot, { backgroundColor: opt.dotColor }, !active && styles.dotIdle]} />
              ) : null}
              <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#E8EDF2',
    borderRadius: radius.lg,
    padding: 4,
  },
  row: { gap: 2 },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.md,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotIdle: { opacity: 0.55 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  labelActive: { color: colors.text, fontWeight: '700' },
});
