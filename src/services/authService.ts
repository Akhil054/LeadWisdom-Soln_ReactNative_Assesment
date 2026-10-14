import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../types';
import { apiClient } from './apiClient';

const SESSION_KEY = '@leadwisdom/session';

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      identifier: identifier.trim(),
      password,
    });
    return data;
  },

  async saveSession(session: AuthResponse) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  async loadSession(): Promise<AuthResponse | null> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  },

  async clearSession() {
    await AsyncStorage.removeItem(SESSION_KEY);
  },
};
