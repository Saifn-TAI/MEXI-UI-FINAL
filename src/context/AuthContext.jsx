import React, { createContext, useContext, useCallback, useMemo } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const login = useCallback(async (creds) => authService.login(creds), []);
  const signup = useCallback(async (payload) => authService.signup(payload), []);
  const verifySession = useCallback(async () => authService.verify(), []);
  const refreshSession = useCallback(async () => authService.refresh(), []);
  const fetchSignalKey = useCallback(async () => authService.signalKey(), []);

  const value = useMemo(
    () => ({
      login,
      signup,
      logout,
      verifySession,
      refreshSession,
      fetchSignalKey,
      getAccessToken: authService.getStoredAccessToken,
    }),
    [login, signup, logout, verifySession, refreshSession, fetchSignalKey]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
