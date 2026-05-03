// context/AuthContext.tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserState } from '../types';
import { register401Handler } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || '';

interface AuthContextType {
  user: UserState;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const EMPTY: UserState = { username: null, avatarUrl: null, role: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  const clearUser = useCallback(() => {
    console.log('[AuthContext] clearUser called — clearing user state');
    setUser(EMPTY);
  }, []);

  // Register the 401 handler so api.ts can trigger logout
  useEffect(() => {
    register401Handler(() => {
      console.log('[AuthContext] 401 handler fired — clearing user');
      clearUser();
    });
  }, [clearUser]);

  const refreshUser = useCallback(async () => {
    console.log('[AuthContext] refreshUser called');
    console.log('[AuthContext] API_URL:', API_URL || '(empty - using relative URLs via Vercel proxy)');
    console.log('[AuthContext] Fetching:', `${API_URL}/auth/me`);

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        headers: { 'X-API-Version': '1' },
      });

      console.log('[AuthContext] /auth/me response status:', res.status);
      console.log('[AuthContext] /auth/me response ok:', res.ok);

      if (res.ok) {
        const data = await res.json();
        console.log('[AuthContext] User data received:', data);
        setUser({
          username: data.username,
          avatarUrl: data.avatarUrl,
          role: data.role?.[0] ?? null,
        });
        console.log('[AuthContext] User state set — isAuthenticated will be:', !!data.username);
      } else if (res.status === 401) {
        // Access token expired on mount — try refresh before giving up
        console.warn('[AuthContext] /auth/me returned 401 — attempting refresh on mount');
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'X-API-Version': '1' },
        });
        console.log('[AuthContext] Refresh response status:', refreshRes.status);
        if (refreshRes.ok) {
          // Retry /auth/me with new access token
          const retryRes = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
            headers: { 'X-API-Version': '1' },
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            console.log('[AuthContext] User data after refresh:', data);
            setUser({
              username: data.username,
              avatarUrl: data.avatarUrl,
              role: data.role?.[0] ?? null,
            });
          } else {
            console.warn('[AuthContext] /auth/me failed even after refresh');
            setUser(EMPTY);
          }
        } else {
          console.warn('[AuthContext] Refresh failed on mount — user not authenticated');
          setUser(EMPTY);
        }
      } else {
        const text = await res.text();
        console.warn('[AuthContext] /auth/me failed — response body:', text);
        setUser(EMPTY);
      }
    } catch (err) {
      console.error('[AuthContext] /auth/me threw an error:', err);
      setUser(EMPTY);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] isLoading set to false');
    }
  }, []);

  useEffect(() => {
    console.log('[AuthContext] AuthProvider mounted — calling refreshUser');
    refreshUser();
  }, [refreshUser]);

  console.log('[AuthContext] Rendering — user:', user, '| isLoading:', isLoading, '| isAuthenticated:', !!user.username);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user.username,
      refreshUser,
      clearUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
