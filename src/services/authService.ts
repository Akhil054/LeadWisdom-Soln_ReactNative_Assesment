import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthResponse } from '../types';
import { apiClient } from './apiClient';

// SecureStore keys may only contain alphanumerics, '.', '-' and '_'.
const SESSION_KEY = 'leadwisdom.session';
/** Where older builds kept the session in plain AsyncStorage. */
const LEGACY_SESSION_KEY = '@leadwisdom/session';

/**
 * Session storage: Keychain (iOS) / Keystore-encrypted prefs (Android) via
 * SecureStore. SecureStore has no web implementation, so web falls back to
 * AsyncStorage (localStorage).
 */
const sessionStore = {
  get: (key: string) => (Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key)),
  set: (key: string, value: string) =>
    Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  remove: (key: string) =>
    Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};

/** Moves a session saved by an older build out of plain AsyncStorage. */
const migrateLegacySession = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  const legacy = await AsyncStorage.getItem(LEGACY_SESSION_KEY);
  if (!legacy) return null;
  await sessionStore.set(SESSION_KEY, legacy);
  await AsyncStorage.removeItem(LEGACY_SESSION_KEY);
  return legacy;
};

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      identifier: identifier.trim(),
      password,
    });
    return data;
  },

  async saveSession(session: AuthResponse) {
    await sessionStore.set(SESSION_KEY, JSON.stringify(session));
  },

  async loadSession(): Promise<AuthResponse | null> {
    try {
      const raw = (await sessionStore.get(SESSION_KEY)) ?? (await migrateLegacySession());
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  },

  async clearSession() {
    await sessionStore.remove(SESSION_KEY);
  },
};
