// pages/CallbackPage.tsx
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types';

interface CallbackPageProps {
  onSuccess: () => void;
}

export default function CallbackPage({ onSuccess }: CallbackPageProps) {
  const { setUser } = useAuth();

  useEffect(() => {
    // Backend may pass user info as query params after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    const avatarUrl = params.get('avatar_url');
    const refreshToken = params.get('refresh_token');

    if (username && avatarUrl) {
      setUser({ username, avatarUrl, refreshToken });
      window.history.replaceState({}, '', '/');
      onSuccess();
    } else {
      // Fallback: fetch /api/me — cookie is set by backend after redirect
      fetch('/api/me', {
        credentials: 'include',
        headers: { 'X-API-Version': '1' },
      })
        .then((r) => r.json())
        .then((data: AuthResponse) => {
          if (data.username) {
            setUser({
              username: data.username,
              avatarUrl: data.avatarUrl,
              refreshToken: data.refreshToken ?? null,
            });
            onSuccess();
          }
        })
        .catch(() => {
          window.location.href = '/';
        });
    }
  }, [setUser, onSuccess]);

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="text-center animate-fade-up">
        <div className="w-10 h-10 border-2 border-acid border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-mist-dim text-sm font-body">Signing you in...</p>
      </div>
    </div>
  );
}
