import React from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppButton,
  BatteryIndicator,
  EmptyView,
  ErrorBanner,
  ErrorView,
  LoadingView,
  ScreenContainer,
  StatTile,
  TYPE_ICON,
} from '../components';
import { useActiveRental } from '../hooks/useActiveRental';
import { useCountdown } from '../hooks/useCountdown';
import { useMutation } from '../hooks/useMutation';
import { useResponsive } from '../hooks/useResponsive';
import { MainTabScreenProps } from '../navigation/types';
import { rentalService } from '../services/rentalService';
import { colors, radius, spacing, typography } from '../theme';
import { confirm } from '../utils/confirm';
import { formatCurrency, formatDuration, formatMinutes, formatTime, TYPE_LABEL } from '../utils/format';
import { batteryColor } from '../components/BatteryIndicator';

export const ActiveSessionScreen = ({ navigation }: MainTabScreenProps<'ActiveTrip'>) => {
  const { data: rental, loading, refreshing, error, refetch, refresh } = useActiveRental();
  const { remainingMs, isOverdue, progress } = useCountdown(rental?.startTime, rental?.endTime);
  const endTrip = useMutation(rentalService.endRental);
  const { isTablet } = useResponsive();

  if (loading && rental === null && !error) return <LoadingView message="Checking for active trip…" />;
  if (error && !rental) return <ErrorView message={error.message} onRetry={refetch} />;

  if (!rental) {
    return (
      <EmptyView
        icon="timer-outline"
        title="No active trip"
        message="Pick an available asset from the fleet to start a rental."
        actionLabel="Browse fleet"
        onAction={() => navigation.navigate('Catalog')}
      />
    );
  }

  const elapsedMs = Math.max(0, Date.now() - Date.parse(rental.startTime));
  const fareSoFar = (Math.max(1, Math.ceil(elapsedMs / 60_000)) / 60) * rental.hourlyRate;
  const lowBattery = rental.asset.batteryLevel < 20;
  const accent = isOverdue ? colors.danger : colors.primary;

  const handleEnd = async () => {
    const ok = await confirm(
      'End this trip?',
      `Park ${rental.asset.name} safely before ending. Current fare: ${formatCurrency(fareSoFar)}.`,
      'End Trip',
    );
    if (!ok) return;
    const completed = await endTrip.mutate(rental.id);
    if (completed) navigation.navigate('TripSummary', { rental: completed });
  };

  return (
    <ScreenContainer
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      {/* Status indicators */}
      <View style={styles.statusRow}>
        <View style={[styles.pill, { backgroundColor: isOverdue ? colors.dangerLight : colors.successLight }]}>
          <View style={[styles.pulse, { backgroundColor: isOverdue ? colors.danger : colors.success }]} />
          <Text style={[styles.pillText, { color: isOverdue ? colors.danger : colors.success }]}>
            {isOverdue ? 'Overtime' : 'Trip active'}
          </Text>
        </View>
        {lowBattery && (
          <View style={[styles.pill, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="battery-dead-outline" size={14} color={colors.warning} />
            <Text style={[styles.pillText, { color: colors.warning }]}> Low battery</Text>
          </View>
        )}
        {rental.issues.length > 0 && (
          <View style={[styles.pill, { backgroundColor: colors.infoLight }]}>
            <Ionicons name="construct-outline" size={14} color={colors.info} />
            <Text style={[styles.pillText, { color: colors.info }]}> {rental.issues.length} issue reported</Text>
          </View>
        )}
      </View>

      {/* Countdown */}
      <View style={[styles.timerCard, { borderColor: accent }]}>
        <Text style={styles.timerLabel}>{isOverdue ? 'Over booked time by' : 'Time remaining'}</Text>
        <Text
          style={[styles.timer, { color: accent, fontSize: isTablet ? 64 : 52 }]}
          accessibilityRole="timer"
          accessibilityLabel={`${isOverdue ? 'Overtime' : 'Time remaining'} ${formatDuration(remainingMs)}`}
        >
          {formatDuration(remainingMs)}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>Started {formatTime(rental.startTime)}</Text>
          <Text style={styles.timeText}>
            {formatMinutes(rental.durationMinutes)} · ends {formatTime(rental.endTime)}
          </Text>
        </View>
        {isOverdue && (
          <Text style={styles.overdueNote}>You're past your booked slot — fare keeps running until you end the trip.</Text>
        )}
      </View>

      {/* Vehicle */}
      <View style={styles.vehicle}>
        <View style={styles.vehicleIcon}>
          <Ionicons name={TYPE_ICON[rental.asset.type]} size={22} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={typography.h3}>{rental.asset.name}</Text>
          <Text style={typography.caption}>
            {TYPE_LABEL[rental.asset.type]} · Trip {rental.id}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <StatTile icon="stopwatch-outline" label="Elapsed" value={formatDuration(elapsedMs)} />
        <StatTile icon="cash-outline" label="Fare so far" value={formatCurrency(fareSoFar)} />
        <StatTile
          icon="battery-half"
          tint={batteryColor(rental.asset.batteryLevel)}
          label="Battery"
          value={<BatteryIndicator level={rental.asset.batteryLevel} />}
        />
        <StatTile icon="navigate-outline" label="Range left" value={`~${rental.asset.rangeKm} km`} />
      </View>

      {endTrip.error && <View style={styles.spacer}><ErrorBanner message={endTrip.error.message} /></View>}

      {/* Trip actions */}
      <View style={styles.actions}>
        <AppButton
          title="Report Issue"
          variant="secondary"
          icon="alert-circle-outline"
          onPress={() => navigation.navigate('ReportIssue', { rentalId: rental.id, assetName: rental.asset.name })}
          style={styles.action}
          disabled={endTrip.loading}
          testID="report-issue"
        />
        <AppButton
          title="End Trip"
          variant="danger"
          icon="stop-circle-outline"
          onPress={handleEnd}
          loading={endTrip.loading}
          style={styles.action}
          testID="end-trip"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pulse: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  pillText: { fontSize: 12, fontWeight: '700' },
  timerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    alignItems: 'center',
  },
  timerLabel: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  timer: { fontWeight: '800', fontVariant: ['tabular-nums'], marginVertical: spacing.sm },
  progressTrack: { width: '100%', height: 8, backgroundColor: colors.neutralLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: spacing.sm },
  timeText: { ...typography.caption },
  overdueNote: { color: colors.danger, fontSize: 12, textAlign: 'center', marginTop: spacing.md },
  vehicle: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  spacer: { marginTop: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  action: { flex: 1 },
});
