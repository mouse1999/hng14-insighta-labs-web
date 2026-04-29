// pages/DashboardPage.tsx
import { Users, Search, Download, Shield, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Welcome header */}
      <div className="flex items-center gap-4 mb-10">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.username || ''}
            className="w-14 h-14 rounded-2xl border border-white/10"
          />
        )}
        <div>
          <h1 className="font-display font-bold text-2xl text-mist">
            Welcome back, {user.username}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            {isAdmin
              ? <Shield size={12} className="text-acid" />
              : <Eye size={12} className="text-mist-dim" />
            }
            <span className={`text-xs font-medium ${isAdmin ? 'text-acid' : 'text-mist-dim'}`}>
              {isAdmin ? 'Administrator' : 'Analyst — read-only access'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickCard
          icon={<Users size={20} className="text-acid" />}
          title="Profiles"
          description={isAdmin
            ? 'Browse, filter, create and delete profiles'
            : 'Browse and filter profiles'}
          onClick={() => onNavigate('profiles')}
        />
        <QuickCard
          icon={<Search size={20} className="text-acid" />}
          title="Search"
          description="Natural language search across all profiles"
          onClick={() => onNavigate('search')}
        />
        {isAdmin && (
          <QuickCard
            icon={<Download size={20} className="text-acid" />}
            title="Export"
            description="Export filtered profiles as CSV"
            onClick={() => onNavigate('profiles')}
          />
        )}
      </div>

      {/* Role info */}
      {!isAdmin && (
        <div className="mt-8 p-4 bg-ink-900 border border-white/[0.07] rounded-2xl">
          <p className="text-xs text-mist-dim">
            You have <span className="text-mist font-medium">read-only</span> access.
            Create, delete and export actions are restricted to administrators.
          </p>
        </div>
      )}
    </div>
  );
}

function QuickCard({ icon, title, description, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-ink-900 border border-white/[0.07] hover:border-acid/25 hover:bg-ink-800/50 rounded-2xl p-5 transition-all duration-200 group"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-display font-semibold text-mist text-sm mb-1 group-hover:text-acid transition-colors">
        {title}
      </h3>
      <p className="text-mist-dim text-xs">{description}</p>
    </button>
  );
}
