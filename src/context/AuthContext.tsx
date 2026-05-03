// context/AuthContext.tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserState } from '../types';

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

  const refreshUser = useCallback(async () => {
    console.log('[AuthContext] refreshUser called');
    console.log('[AuthContext] API_URL:', API_URL || '(empty - using relative URLs via Vercel proxy)');
    console.log('[AuthContext] Fetching:', `${API_URL}/auth/me`);

    try {
      const res = await fetch(`${API_URL}/auth/me`, {npm
        credentials: 'include',
        headers: { 'X-API-Version': '1' },
      });

      console.log('[AuthContext] /auth/me response status:', res.status);
      console.log('[AuthContext] /auth/me response ok:', res.ok);
      console.log('[AuthContext] /auth/me response headers:', Object.fromEntries(res.headers.entries()));

      if (res.ok) {
        const data = await res.json();
        console.log('[AuthContext] User data received:', data);
        setUser({
  username: data.username,
  avatarUrl: data.avatarUrl,
  role: data.role?.[0] ?? null,  // extract first item from the set
});
        console.log('[AuthContext] User state set — isAuthenticated will be:', !!data.username);
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

  const clearUser = useCallback(() => {
    console.log('[AuthContext] clearUser called — clearing user state');
    setUser(EMPTY);
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
