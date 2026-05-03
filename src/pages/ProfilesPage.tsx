// pages/ProfilesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import type { Profile, PaginatedResponse, FilterParams } from '../types';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import Pagination from '../components/Pagination';
import CreateProfileModal from '../components/CreateProfileModal';
import FiltersBar from '../components/FiltersBar';
import toast from 'react-hot-toast';

const LIMIT = 12;

interface ProfilesPageProps {
  onViewProfile?: (id: string) => void;
}

export default function ProfilesPage({ onViewProfile }: ProfilesPageProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ROLE_ADMIN';

  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterParams>({ page: 1, limit: LIMIT });
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (f: FilterParams) => {
    setLoading(true);
    try {
      const res = await api.getProfiles(f);
      setData(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filters); }, [filters, load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    setDeletingId(id);
    try {
      await api.deleteProfile(id);
      toast.success('Profile deleted');
      load(filters);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-mist">Profiles</h1>
          {data && (
            <p className="text-mist-dim text-sm mt-1">
              <span className="text-acid font-mono font-medium">{data.total.toLocaleString()}</span> total records
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <FiltersBar filters={filters} onApply={setFilters} />
          {/* Create button — admin only */}
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-acid hover:bg-acid-dim text-ink-950 rounded-xl text-xs font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={13} />
              Add Profile
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="bg-ink-900 border border-white/[0.06] rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.data.map((profile: Profile, idx: number) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onDelete={handleDelete}
                onView={onViewProfile}
                style={{ animationDelay: `${idx * 40}ms`, opacity: deletingId === profile.id ? 0.4 : 1 }}
              />
            ))}
          </div>
          <Pagination
            page={data.page}
            total_pages={data.total_pages}
            total={data.total}
            limit={data.limit}
            onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-ink-900 rounded-2xl flex items-center justify-center mb-4">
            <RefreshCw size={24} className="text-mist-dim" />
          </div>
          <h3 className="font-display font-semibold text-mist mb-2">No profiles found</h3>
          <p className="text-mist-dim text-sm mb-6">Try adjusting your filters{isAdmin ? ' or add a new profile' : ''}.</p>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-acid hover:bg-acid-dim text-ink-950 rounded-xl text-sm font-display font-semibold transition-all"
            >
              Add First Profile
            </button>
          )}
        </div>
      )}

      {isAdmin && showCreate && (
        <CreateProfileModal
          onClose={() => setShowCreate(false)}
          onCreated={() => load(filters)}
        />
      )}
    </div>
  );
}
