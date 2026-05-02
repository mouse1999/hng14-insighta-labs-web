// components/ProfileCard.tsx
import { Trash2, Globe, User, Calendar, Hash, ChevronRight } from 'lucide-react';
import type { Profile } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProfileCardProps {
  profile: Profile;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  style?: React.CSSProperties;
}

function pct(n: number | null): string | null {
  if (n == null) return null;
  return `${Math.round(n * 100)}%`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtCountry(profile: Profile): string {
  if (!profile.countryName && !profile.countryId) return 'N/A';
  const name = profile.countryName || profile.countryId || '';
  const parts: string[] = [];
  if (profile.countryId) parts.push(profile.countryId);
  const prob = pct(profile.countryProbability);
  if (prob) parts.push(prob);
  return parts.length ? `${name} (${parts.join(', ')})` : name;
}

function fmtAge(profile: Profile): string {
  if (profile.age == null) return 'N/A';
  return profile.ageGroup ? `${profile.age} (${profile.ageGroup})` : String(profile.age);
}

function fmtGender(profile: Profile): string {
  if (!profile.gender) return 'N/A';
  const prob = pct(profile.genderProbability);
  return prob ? `${profile.gender} (${prob})` : profile.gender;
}

const genderColor: Record<string, string> = {
  male: 'text-sky-400 bg-sky-400/10',
  female: 'text-pink-400 bg-pink-400/10',
};

const ageGroupColor: Record<string, string> = {
  child: 'text-amber-400 bg-amber-400/10',
  adult: 'text-acid bg-acid/10',
  senior: 'text-violet-400 bg-violet-400/10',
};

export default function ProfileCard({ profile, onDelete, onView, style }: ProfileCardProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ROLE_ADMIN';

  return (
    <div
      style={style}
      className="group relative bg-ink-900 border border-white/[0.07] rounded-2xl p-5 hover:border-acid/25 hover:bg-ink-800/50 transition-all duration-300 animate-fade-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ink-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-acid/15 transition-colors">
            <User size={16} className="text-mist-dim group-hover:text-acid transition-colors" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-mist text-sm leading-tight">{profile.name}</h3>
            <p className="text-mist-dim text-xs font-mono mt-0.5 truncate max-w-[140px]">
              {profile.id.slice(0, 8)}…
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* View detail button */}
          {onView && (
            <button
              onClick={() => onView(profile.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-mist-dim hover:text-acid hover:bg-acid/10 transition-all duration-200"
              title="View profile"
            >
              <ChevronRight size={13} />
            </button>
          )}
          {/* Delete — admin only */}
          {isAdmin && (
            <button
              onClick={() => onDelete(profile.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-mist-dim hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
              title="Delete profile"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {profile.gender && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${genderColor[profile.gender] || 'text-mist-dim bg-ink-700'}`}>
            {profile.gender}
          </span>
        )}
        {profile.ageGroup && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${ageGroupColor[profile.ageGroup] || 'text-mist-dim bg-ink-700'}`}>
            {profile.ageGroup}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        <Stat icon={<User size={11} />} label="Gender" value={fmtGender(profile)} />
        <Stat icon={<Hash size={11} />} label="Age" value={fmtAge(profile)} />
        <Stat icon={<Globe size={11} />} label="Country" value={fmtCountry(profile)} />
        <Stat icon={<Calendar size={11} />} label="Created" value={fmtDate(profile.createdAt)} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-ink-800/50 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
      <div className="flex items-center gap-1 text-mist-dim w-16 flex-shrink-0">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-mono font-medium text-mist text-xs truncate">{value}</div>
    </div>
  );
}
