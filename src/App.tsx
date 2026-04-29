// App.tsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { register401Handler } from './lib/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilesPage from './pages/ProfilesPage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import SearchPage from './pages/SearchPage';
import AccountPage from './pages/AccountPage';
import Navbar from './components/Navbar';

// Register 401 handler at module level — clearUser injected by Router on mount
let _clearUser: (() => void) | null = null;
register401Handler(() => _clearUser?.());

function Router() {
  const { isAuthenticated, isLoading, clearUser } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [profileDetailId, setProfileDetailId] = useState<string | null>(null);

  // Wire up the 401 handler to this context's clearUser
  _clearUser = clearUser;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — show login
  // Backend handles OAuth redirect back to /dashboard, cookie is set automatically
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Profile detail view
  if (profileDetailId) {
    return (
      <div className="min-h-screen bg-ink-950">
        <Navbar activePage={page} onNavigate={(p) => { setPage(p); setProfileDetailId(null); }} />
        <main>
          <ProfileDetailPage
            profileId={profileDetailId}
            onBack={() => setProfileDetailId(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar activePage={page} onNavigate={setPage} />
      <main>
        {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
        {page === 'profiles' && <ProfilesPage onViewProfile={(id) => { setProfileDetailId(id); }} />}
        {page === 'search'   && <SearchPage onViewProfile={(id) => { setProfileDetailId(id); }} />}
        {page === 'account'  && <AccountPage />}
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
          success: { iconTheme: { primary: '#b8ff57', secondary: '#0a0a0f' } },
        }}
      />
    </AuthProvider>
  );
}
