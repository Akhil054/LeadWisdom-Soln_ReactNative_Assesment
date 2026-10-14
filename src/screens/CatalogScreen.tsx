import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssetCard, EmptyView, ErrorView, FilterChips, LoadingView } from '../components';
import type { ChipOption } from '../components';
import { useAssets } from '../hooks/useAssets';
import { useActiveRental } from '../hooks/useActiveRental';
import { useResponsive } from '../hooks/useResponsive';
import { MainTabScreenProps } from '../navigation/types';
import { Asset, AssetStatus, AssetType } from '../types';
import { colors, radius, spacing } from '../theme';
import { formatTime } from '../utils/format';

type StatusFilter = 'all' | AssetStatus;
type TypeFilter = 'all' | AssetType;

const STATUS_OPTIONS: ChipOption<StatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'charging', label: 'Charging' },
  { value: 'in_use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' },
];

const TYPE_OPTIONS: ChipOption<TypeFilter>[] = [
  { value: 'all', label: 'All types' },
  { value: 'scooter', label: 'E-Scooters' },
  { value: 'bike', label: 'E-Bikes' },
  { value: 'moped', label: 'E-Mopeds' },
];

export const CatalogScreen = ({ navigation }: MainTabScreenProps<'Catalog'>) => {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const { gridColumns, horizontalPadding } = useResponsive();

  const { data, loading, refreshing, error, refetch, refresh } = useAssets({
    status: status === 'all' ? undefined : status,
    type: type === 'all' ? undefined : type,
  });
  const { data: activeRental } = useActiveRental();

  const lastUpdated = useMemo(() => {
    if (!data?.length) return null;
    return data.reduce((latest, a) => (a.lastUpdated > latest ? a.lastUpdated : latest), data[0].lastUpdated);
  }, [data]);

  const availableCount = data?.filter((a) => a.status === 'available').length ?? 0;

  const openAsset = useCallback(
    (asset: Asset) => navigation.navigate('AssetDetail', { assetId: asset.id }),
    [navigation],
  );

  const header = (
    <View style={styles.header}>
      {activeRental && (
        <Pressable
          style={styles.activeBanner}
          onPress={() => navigation.navigate('ActiveTrip')}
          accessibilityRole="button"
          accessibilityLabel="You have an active trip. Open it."
        >
          <Ionicons name="timer" size={20} color={colors.white} />
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>Trip in progress</Text>
            <Text style={styles.bannerText}>{activeRental.asset.name} · tap to view</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </Pressable>
      )}

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryTitle}>Operational Fleet</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              Live{lastUpdated ? ` · updated ${formatTime(lastUpdated)}` : ''}
            </Text>
            {loading && data && <ActivityIndicator size="small" color={colors.primary} style={styles.inlineSpinner} />}
          </View>
        </View>
        {data && (
          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{availableCount}</Text>
            <Text style={styles.countLabel}>available</Text>
          </View>
        )}
      </View>

      <FilterChips options={STATUS_OPTIONS} selected={status} onChange={setStatus} />
      <View style={{ height: spacing.sm }} />
      <FilterChips options={TYPE_OPTIONS} selected={type} onChange={setType} />
    </View>
  );

  if (loading && !data) return <LoadingView message="Fetching available assets…" />;
  if (error && !data) return <ErrorView message={error.message} onRetry={refetch} />;

  return (
    <FlatList
      key={`grid-${gridColumns}`} // numColumns can't change on the fly; remount instead
      data={data ?? []}
      keyExtractor={(item) => item.id}
      numColumns={gridColumns}
      renderItem={({ item }) => (
        <View style={[styles.cell, { maxWidth: `${100 / gridColumns}%` }]}>
          <AssetCard asset={item} onPress={openAsset} />
        </View>
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyView
          icon="search-outline"
          title="No assets match these filters"
          message="Try a different status or vehicle type."
          actionLabel="Clear filters"
          onAction={() => {
            setStatus('all');
            setType('all');
          }}
        />
      }
      contentContainerStyle={[styles.list, { paddingHorizontal: horizontalPadding - spacing.sm / 2 }]}
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      initialNumToRender={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1, marginHorizontal: spacing.md },
  list: { paddingBottom: spacing.xxl, flexGrow: 1 },
  header: { paddingHorizontal: spacing.sm / 2, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  cell: { flex: 1, padding: spacing.sm / 2, paddingVertical: spacing.sm / 2 + 2 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerTitle: { color: colors.white, fontWeight: '700', fontSize: 15 },
  bannerText: { color: colors.primaryLight, fontSize: 12, marginTop: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  summaryTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 6 },
  liveText: { fontSize: 12, color: colors.textMuted },
  inlineSpinner: { marginLeft: spacing.sm },
  countBadge: {
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  countNumber: { fontSize: 20, fontWeight: '800', color: colors.success },
  countLabel: { fontSize: 11, color: colors.success, fontWeight: '600' },
});
