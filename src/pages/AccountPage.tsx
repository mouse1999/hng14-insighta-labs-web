// pages/AccountPage.tsx
import { useState } from 'react';
import { LogOut, Shield, Eye, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function AccountPage() {
  const { user, clearUser, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const isAdmin = user.role === 'ROLE_ADMIN';

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch {
      // clear locally regardless
    } finally {
      clearUser();
      setLoading(false);
    }
  };

  const roleDisplay = typeof user.role === 'string'
    ? user.role.replace('ROLE_', '').toLowerCase()
    : 'user';

  if (isLoading || !user.username) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="h-64 bg-ink-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-mist mb-8">Account</h1>

      <div className="bg-ink-900 border border-white/[0.07] rounded-2xl p-6 space-y-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-16 h-16 rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-ink-700 rounded-2xl flex items-center justify-center">
              <User size={24} className="text-mist-dim" />
            </div>
          )}
          <div>
            <p className="font-display font-semibold text-mist text-lg">{user.username}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {isAdmin
                ? <Shield size={12} className="text-acid" />
                : <Eye size={12} className="text-mist-dim" />
              }
              <span className={`text-xs font-medium ${isAdmin ? 'text-acid' : 'text-mist-dim'}`}>
                {roleDisplay}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* Role info */}
        <div>
          <p className="text-xs text-mist-dim uppercase tracking-wider mb-2">Access Level</p>
          <p className="text-sm text-mist">
            {isAdmin
              ? 'Full access — create, delete, export profiles'
              : 'Read-only — browse and search profiles'}
          </p>
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-400/10 disabled:opacity-50 text-sm font-medium transition-all"
        >
          <LogOut size={14} />
          {loading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
