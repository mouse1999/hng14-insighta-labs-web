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

  // Fetch user from /api/me — cookie is sent automatically (HTTP-only)
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/me`, {
        credentials: 'include',
        headers: { 'X-API-Version': '1' },
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          username: data.username,
          avatarUrl: data.avatarUrl,
          role: data.role,
        });
      } else {
        setUser(EMPTY);
      }
    } catch {
      setUser(EMPTY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(EMPTY);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
