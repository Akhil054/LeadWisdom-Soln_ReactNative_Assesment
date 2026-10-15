import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, ScreenContainer } from '../components';
import { useAuth } from '../context/AuthContext';
import { USE_MOCK_API } from '../services/config';
import { mockSettings } from '../services/mock/mockServer';
import { colors, radius, spacing, typography } from '../theme';
import { confirm } from '../utils/confirm';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [simulateErrors, setSimulateErrors] = useState(mockSettings.simulateErrors);

  const toggleErrors = (value: boolean) => {
    mockSettings.simulateErrors = value;
    setSimulateErrors(value);
  };

  const handleLogout = async () => {
    if (await confirm('Log out?', 'You will need to log in again to rent assets.', 'Log Out')) {
      mockSettings.simulateErrors = false;
      await signOut();
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={typography.h3}>{user?.name}</Text>
          <Text style={typography.caption}>{user?.identifier}</Text>
        </View>
      </View>

      {USE_MOCK_API && (
        <View style={styles.card}>
          <Ionicons name="bug-outline" size={22} color={colors.warning} />
          <View style={[styles.flex, styles.devText]}>
            <Text style={typography.h3}>Simulate network errors</Text>
            <Text style={typography.caption}>
              Developer toggle: makes the mock API return 503 so you can review error & retry states.
            </Text>
          </View>
          <Switch
            value={simulateErrors}
            onValueChange={toggleErrors}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
      )}

      <AppButton title="Log Out" variant="secondary" icon="log-out-outline" onPress={handleLogout} style={styles.logout} />
      <Text style={styles.version}>Leadwisdom Rentals · v1.0.0</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  devText: { marginHorizontal: spacing.md },
  logout: { marginTop: spacing.xl },
  version: { ...typography.caption, textAlign: 'center', marginTop: spacing.lg },
});
