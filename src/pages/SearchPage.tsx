// pages/SearchPage.tsx
import { useState, useRef } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { PaginatedResponse, Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

const EXAMPLES = [
  'young females from Nigeria',
  'senior males from United States',
  'adults with high confidence scores',
  'children from European countries',
];

interface SearchPageProps {
  onViewProfile?: (id: string) => void;
}

export default function SearchPage({ onViewProfile }: SearchPageProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ROLE_ADMIN';

  const [query, setQuery] = useState('');
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async (q: string, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await api.searchProfiles(q, p);
      setData(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    try {
      await api.deleteProfile(id);
      toast.success('Profile deleted');
      if (data) setData({ ...data, data: data.data.filter((p: Profile) => p.id !== id) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-acid" />
          <span className="text-xs text-acid font-medium uppercase tracking-wider">Natural Language Search</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-mist mb-1">Search Profiles</h1>
        <p className="text-mist-dim text-sm">Describe what you're looking for in plain English.</p>
      </div>

      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-dim">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search(query)}
          placeholder="e.g. young males from Nigeria..."
          className="w-full bg-ink-900 border border-white/[0.08] focus:border-acid/40 rounded-2xl pl-11 pr-28 py-4 text-mist text-sm placeholder:text-mist-dim/50 outline-none transition-all"
        />
        <button
          onClick={() => search(query)}
          disabled={loading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-acid hover:bg-acid-dim disabled:opacity-40 disabled:cursor-not-allowed text-ink-950 rounded-xl text-xs font-display font-semibold transition-all"
        >
          Search
        </button>
      </div>

      {!data && (
        <div className="mb-8">
          <p className="text-xs text-mist-dim uppercase tracking-wider mb-3">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => { setQuery(ex); search(ex); }}
                className="px-3 py-1.5 bg-ink-900 border border-white/[0.07] hover:border-acid/30 hover:bg-acid/5 text-mist-dim hover:text-acid rounded-xl text-xs transition-all">
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-ink-900 border border-white/[0.06] rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && data && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-mist-dim">
              Found <span className="text-acid font-mono font-medium">{data.total.toLocaleString()}</span> results
              {query && <> for "<span className="text-mist italic">{query}</span>"</>}
            </p>
          </div>

          {data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.data.map((profile: Profile, idx: number) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onDelete={isAdmin ? handleDelete : () => {}}
                    onView={onViewProfile}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  />
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                limit={data.limit}
                onChange={(p) => search(query, p)}
              />
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-mist-dim text-sm">No profiles match your query. Try different terms.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
