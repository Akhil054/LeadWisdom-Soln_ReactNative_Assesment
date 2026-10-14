import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import { authService } from '../services/authService';
import { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  /** True while the stored session is being restored on app start. */
  bootstrapping: boolean;
  signIn: (session: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await authService.clearSession();
  }, []);

  const signIn = useCallback(async (session: AuthResponse) => {
    setAuthToken(session.token);
    await authService.saveSession(session);
    setUser(session.user);
  }, []);

  // Restore persisted session on launch.
  useEffect(() => {
    (async () => {
      const session = await authService.loadSession();
      if (session) {
        setAuthToken(session.token);
        setUser(session.user);
      }
      setBootstrapping(false);
    })();
  }, []);

  // Any 401 from the API logs the user out.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo(
    () => ({ user, bootstrapping, signIn, signOut }),
    [user, bootstrapping, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
