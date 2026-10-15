import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { AppButton } from './AppButton';

export const LoadingView = ({ message = 'Loading…' }: { message?: string }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

export const ErrorView = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <View style={styles.center}>
    <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <AppButton title="Retry" icon="refresh" onPress={onRetry} style={styles.button} />
    )}
  </View>
);

interface EmptyViewProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyView = ({ icon = 'file-tray-outline', title, message, actionLabel, onAction }: EmptyViewProps) => (
  <View style={styles.center}>
    <Ionicons name={icon} size={48} color={colors.textMuted} />
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {actionLabel && onAction && (
      <AppButton title={actionLabel} onPress={onAction} style={styles.button} />
    )}
  </View>
);

/** Inline error banner for failed mutations (doesn't replace the screen). */
export const ErrorBanner = ({ message }: { message: string }) => (
  <View style={styles.banner}>
    <Ionicons name="alert-circle" size={18} color={colors.danger} />
    <Text style={styles.bannerText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.md, textAlign: 'center' },
  message: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  button: { marginTop: spacing.xl, minWidth: 160 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { color: colors.danger, marginLeft: spacing.sm, flex: 1, fontSize: 13, fontWeight: '500' },
});
