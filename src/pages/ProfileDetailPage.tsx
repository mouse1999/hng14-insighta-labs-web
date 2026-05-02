// pages/ProfileDetailPage.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, User, Globe, Hash, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import type { Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProfileDetailPageProps {
  profileId: string;
  onBack: () => void;
}

function pct(n: number | null) {
  return n != null ? `${Math.round(n * 100)}%` : null;
}

export default function ProfileDetailPage({ profileId, onBack }: ProfileDetailPageProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ROLE_ADMIN';
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfile(profileId)
      .then(setProfile)
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleDelete = async () => {
    if (!confirm('Delete this profile?')) return;
    try {
      await api.deleteProfile(profileId);
      toast.success('Profile deleted');
      onBack();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="h-64 bg-ink-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <p className="text-mist-dim">Profile not found.</p>
        <button onClick={onBack} className="mt-4 text-acid text-sm hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-mist-dim hover:text-mist text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="bg-ink-900 border border-white/[0.07] rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-ink-700 rounded-2xl flex items-center justify-center">
            <User size={24} className="text-mist-dim" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-mist">{profile.name}</h1>
            <p className="text-mist-dim text-xs font-mono mt-0.5">{profile.id}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <Row icon={<User size={13} />} label="Gender"
            value={profile.gender
              ? `${profile.gender}${pct(profile.genderProbability) ? ` (${pct(profile.genderProbability)})` : ''}`
              : 'N/A'} />
          <Row icon={<Hash size={13} />} label="Age"
            value={profile.age != null
              ? `${profile.age}${profile.ageGroup ? ` (${profile.ageGroup})` : ''}`
              : 'N/A'} />
          <Row icon={<Globe size={13} />} label="Country"
            value={profile.countryName
              ? `${profile.countryName}${profile.countryId ? ` (${profile.countryId}` : ''}${pct(profile.countryProbability) ? `, ${pct(profile.countryProbability)})` : profile.countryId ? ')' : ''}`
              : 'N/A'} />
          <Row icon={<Calendar size={13} />} label="Created"
            value={new Date(profile.createdAt).toLocaleString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })} />
        </div>

        {/* Admin-only delete */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="mt-6 w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-400/10 text-sm font-medium transition-all"
          >
            Delete Profile
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-ink-800/50 rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 text-mist-dim w-20 flex-shrink-0">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-mono text-sm text-mist">{value}</span>
    </div>
  );
}
