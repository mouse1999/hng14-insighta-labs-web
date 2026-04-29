// components/Navbar.tsx
import { LogOut, Search, Users, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const { user, clearUser } = useAuth();

  const handleLogout = async () => {
    try {
      await api.logout(); // backend clears HTTP-only cookie
    } catch {
      // clear locally regardless
    }
    clearUser();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profiles', label: 'Profiles', icon: Users },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 bg-acid rounded-sm flex items-center justify-center">
            <span className="text-ink-950 font-display font-bold text-xs">P</span>
          </div>
          <span className="font-display font-semibold text-base text-mist tracking-tight hidden sm:block">
            ProfileDB
          </span>
        </button>

        {/* Nav tabs */}
        <div className="flex items-center gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                activePage === id
                  ? 'bg-acid/15 text-acid'
                  : 'text-mist-dim hover:text-mist hover:bg-ink-800'
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user.avatarUrl && (
            <img src={user.avatarUrl} alt={user.username || ''} className="w-7 h-7 rounded-full border border-white/10" />
          )}
          <span className="text-xs text-mist-dim hidden sm:block font-mono">{user.username}</span>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-mist-dim hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
