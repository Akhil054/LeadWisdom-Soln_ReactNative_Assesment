import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, ScreenContainer, StatTile } from '../components';
import { RootStackScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency, formatDuration, formatTime } from '../utils/format';

export const TripSummaryScreen = ({ route, navigation }: RootStackScreenProps<'TripSummary'>) => {
  const { rental } = route.params;
  const durationMs = Date.parse(rental.endedAt ?? rental.endTime) - Date.parse(rental.startTime);

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={40} color={colors.white} />
        </View>
        <Text style={typography.h1}>Trip completed</Text>
        <Text style={styles.sub}>Thanks for riding {rental.asset.name}!</Text>
        <Text style={styles.total}>{formatCurrency(rental.totalCost ?? 0)}</Text>
        <Text style={typography.caption}>Total charged</Text>
      </View>

      <View style={styles.grid}>
        <StatTile icon="stopwatch-outline" label="Ride time" value={formatDuration(durationMs)} />
        <StatTile icon="cash-outline" label="Rate" value={`${formatCurrency(rental.hourlyRate)}/hr`} />
        <StatTile icon="play-outline" label="Started" value={formatTime(rental.startTime)} />
        <StatTile icon="stop-outline" label="Ended" value={rental.endedAt ? formatTime(rental.endedAt) : '—'} />
      </View>

      {rental.issues.length > 0 && (
        <View style={styles.issues}>
          <Text style={typography.h3}>Reported issues</Text>
          {rental.issues.map((issue) => (
            <Text key={issue.id} style={styles.issue}>
              • {issue.category.toUpperCase()}: {issue.description}
            </Text>
          ))}
          <Text style={typography.caption}>The vehicle has been flagged for maintenance.</Text>
        </View>
      )}

      <AppButton
        title="Back to Fleet"
        icon="grid-outline"
        onPress={() => navigation.popTo('MainTabs', { screen: 'Catalog' })}
        style={styles.button}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  sub: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  total: { fontSize: 40, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  issues: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  issue: { ...typography.body },
  button: { marginTop: spacing.xl },
});
