import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../authService';

jest.mock('@react-native-async-storage/async-storage', () =>
  // jest.mock factories are hoisted above imports, so require() is the only option here.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    deleteItemAsync: jest.fn(async (k: string) => void store.delete(k)),
  };
});

const session = { token: 'abc', user: { id: 'U-1', name: 'demo', identifier: 'demo@leadwisdom.com' } };

beforeEach(async () => {
  await authService.clearSession();
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

it('saves the session to SecureStore, not AsyncStorage', async () => {
  await authService.saveSession(session);
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('leadwisdom.session', JSON.stringify(session));
  expect(await AsyncStorage.getAllKeys()).toHaveLength(0);
  expect(await authService.loadSession()).toEqual(session);
});

it('clears the session on logout', async () => {
  await authService.saveSession(session);
  await authService.clearSession();
  expect(await authService.loadSession()).toBeNull();
});

it('migrates a session left in AsyncStorage by an older build', async () => {
  await AsyncStorage.setItem('@leadwisdom/session', JSON.stringify(session));

  expect(await authService.loadSession()).toEqual(session);
  expect(await AsyncStorage.getItem('@leadwisdom/session')).toBeNull();
  expect(await SecureStore.getItemAsync('leadwisdom.session')).toBe(JSON.stringify(session));
});

it('returns null for a corrupted session instead of crashing', async () => {
  await SecureStore.setItemAsync('leadwisdom.session', '{not json');
  expect(await authService.loadSession()).toBeNull();
});
