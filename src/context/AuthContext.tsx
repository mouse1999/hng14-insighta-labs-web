// context/AuthContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserState } from '../types';

interface AuthContextType {
  user: UserState;
  setUser: (u: UserState) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const EMPTY: UserState = { username: null, avatarUrl: null, refreshToken: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>(EMPTY);

  const setUser = useCallback((u: UserState) => setUserState(u), []);
  const clearUser = useCallback(() => setUserState(EMPTY), []);

  return (
    <AuthContext.Provider value={{ user, setUser, clearUser, isAuthenticated: !!user.username }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
