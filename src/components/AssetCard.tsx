import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset, AssetType } from '../types';
import { colors, radius, shadow, spacing } from '../theme';
import { formatCurrency, TYPE_LABEL } from '../utils/format';
import { StatusTag } from './StatusTag';
import { BatteryIndicator } from './BatteryIndicator';

export const TYPE_ICON: Record<AssetType, keyof typeof Ionicons.glyphMap> = {
  scooter: 'flash',
  bike: 'bicycle',
  moped: 'speedometer',
};

interface AssetCardProps {
  asset: Asset;
  onPress: (asset: Asset) => void;
}

/** Catalog tile: type, name, live status, battery, range and hourly rate. */
const AssetCardBase = ({ asset, onPress }: AssetCardProps) => {
  const rentable = asset.status === 'available';

  return (
    <Pressable
      onPress={() => onPress(asset)}
      accessibilityRole="button"
      accessibilityLabel={`${asset.name}, ${asset.status}, battery ${asset.batteryLevel} percent, ${asset.hourlyRate} rupees per hour`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, !rentable && styles.muted]}
    >
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name={TYPE_ICON[asset.type]} size={20} color={colors.primary} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {TYPE_LABEL[asset.type]} · {asset.id}
          </Text>
        </View>
        <StatusTag status={asset.status} />
      </View>

      <View style={styles.location}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={styles.meta} numberOfLines={1}>
          {' '}
          {asset.location}
        </Text>
      </View>

      <View style={styles.footer}>
        <View>
          <BatteryIndicator level={asset.batteryLevel} />
          <Text style={styles.range}>~{asset.rangeKm} km range</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{formatCurrency(asset.hourlyRate)}</Text>
          <Text style={styles.meta}>per hour</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const AssetCard = memo(AssetCardBase);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  pressed: { opacity: 0.9 },
  muted: { opacity: 0.75 },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  titleBlock: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  location: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  range: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: '800', color: colors.text },
});
