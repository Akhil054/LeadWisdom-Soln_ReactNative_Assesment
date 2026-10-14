import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppButton,
  BatteryIndicator,
  ErrorBanner,
  ErrorView,
  FilterChips,
  LoadingView,
  ScreenContainer,
  StatTile,
  StatusTag,
  TYPE_ICON,
} from '../components';
import type { ChipOption } from '../components';
import { useAsset } from '../hooks/useAssets';
import { useActiveRental } from '../hooks/useActiveRental';
import { useMutation } from '../hooks/useMutation';
import { RootStackScreenProps } from '../navigation/types';
import { rentalService } from '../services/rentalService';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency, formatTime, TYPE_LABEL } from '../utils/format';

type Duration = '15' | '30' | '60' | '120';
const DURATIONS: ChipOption<Duration>[] = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hr' },
  { value: '120', label: '2 hr' },
];

export const AssetDetailScreen = ({ route, navigation }: RootStackScreenProps<'AssetDetail'>) => {
  const { assetId } = route.params;
  const { data: asset, loading, error, refetch } = useAsset(assetId);
  const { data: activeRental } = useActiveRental();
  const [duration, setDuration] = useState<Duration>('30');
  const start = useMutation(rentalService.startRental);

  if (loading && !asset) return <LoadingView message="Loading asset…" />;
  if (error || !asset) return <ErrorView message={error?.message ?? 'Asset not found.'} onRetry={refetch} />;

  const minutes = Number(duration);
  const estimate = (asset.hourlyRate * minutes) / 60;
  const isAvailable = asset.status === 'available';
  const lowBattery = asset.batteryLevel < 20;

  const handleStart = async () => {
    const rental = await start.mutate(asset.id, minutes);
    if (rental) {
      navigation.popTo('MainTabs', { screen: 'ActiveTrip' });
    } else {
      refetch(); // status may have changed (e.g. someone else rented it)
    }
  };

  let blockedReason: string | null = null;
  if (activeRental) blockedReason = 'You already have an active trip. End it before renting another asset.';
  else if (!isAvailable) blockedReason = 'This asset is not available for rent right now.';

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <View style={styles.iconBadge}>
          <Ionicons name={TYPE_ICON[asset.type]} size={36} color={colors.primary} />
        </View>
        <Text style={styles.name}>{asset.name}</Text>
        <Text style={styles.meta}>
          {TYPE_LABEL[asset.type]} · {asset.id}
        </Text>
        <View style={styles.tagRow}>
          <StatusTag status={asset.status} />
        </View>
      </View>

      <View style={styles.grid}>
        <StatTile icon="battery-half" label="Battery" value={<BatteryIndicator level={asset.batteryLevel} />} />
        <StatTile icon="navigate-outline" label="Est. range" value={`~${asset.rangeKm} km`} />
        <StatTile icon="cash-outline" label="Hourly rate" value={formatCurrency(asset.hourlyRate)} />
        <StatTile icon="location-outline" label="Location" value={asset.location} />
      </View>
      <Text style={styles.updated}>Status updated at {formatTime(asset.lastUpdated)}</Text>

      {isAvailable && lowBattery && (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={18} color={colors.warning} />
          <Text style={styles.warningText}>Low battery — suitable for short trips only.</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose rental duration</Text>
        <FilterChips options={DURATIONS} selected={duration} onChange={setDuration} wrap />
        <View style={styles.estimateRow}>
          <Text style={styles.estimateLabel}>Estimated cost</Text>
          <Text style={styles.estimateValue}>{formatCurrency(estimate)}</Text>
        </View>
        <Text style={styles.note}>Billed per minute of actual use. You can end early.</Text>
      </View>

      {start.error && <ErrorBanner message={start.error.message} />}
      {blockedReason && !start.error && (
        <Text style={styles.blocked}>{blockedReason}</Text>
      )}

      <AppButton
        title={`Start Rental · ${formatCurrency(estimate)}`}
        icon="play"
        onPress={handleStart}
        loading={start.loading}
        disabled={!!blockedReason}
        testID="start-rental"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { ...typography.h1, textAlign: 'center' },
  meta: { ...typography.caption, marginTop: 4 },
  tagRow: { marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  updated: { ...typography.caption, marginTop: spacing.sm, textAlign: 'right' },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  warningText: { color: colors.warning, marginLeft: spacing.sm, fontWeight: '600', flex: 1 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginVertical: spacing.xl,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  estimateLabel: { ...typography.body, color: colors.textMuted },
  estimateValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  note: { ...typography.caption, marginTop: spacing.xs },
  blocked: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, fontSize: 13 },
});
