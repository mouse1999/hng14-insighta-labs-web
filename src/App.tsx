// App.tsx
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import ProfilesPage from './pages/ProfilesPage';
import SearchPage from './pages/SearchPage';
import Navbar from './components/Navbar';
import { api, register401Handler } from './lib/api';

function Router() {
  const { isAuthenticated, setUser, clearUser, user } = useAuth();
  const [page, setPage] = useState('profiles');
  const [checking, setChecking] = useState(true);

  const isCallback = window.location.pathname === '/auth/callback' ||
    window.location.search.includes('username=');

  // Register global 401 handler — clears session → LoginPage renders
  useEffect(() => {
    register401Handler(() => {
      clearUser();
    });
  }, [clearUser]);

  // Restore session on mount via /api/me cookie
  useEffect(() => {
    if (isCallback) { setChecking(false); return; }
    fetch('/api/me', {
      credentials: 'include',
      headers: { 'X-API-Version': '1' },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.username) {
          setUser({
            username: data.username,
            avatarUrl: data.avatarUrl,
            refreshToken: data.refreshToken ?? null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [setUser, isCallback]);

  const handleLogout = async () => {
    try {
      await api.logout(user.refreshToken ?? '');
    } catch {
      // ignore — clear session regardless
    }
    clearUser();
  };

  if (checking && !isCallback) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isCallback) {
    return <CallbackPage onSuccess={() => { setPage('profiles'); }} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar activePage={page} onNavigate={setPage} onLogout={handleLogout} />
      <main>
        {page === 'profiles' && <ProfilesPage />}
        {page === 'search' && <SearchPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1c1c28',
            color: '#e8e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '13px',
            fontFamily: '"DM Sans", sans-serif',
          },
          success: {
            iconTheme: { primary: '#b8ff57', secondary: '#0a0a0f' },
          },
        }}
      />
    </AuthProvider>
  );
}
