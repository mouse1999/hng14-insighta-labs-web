// components/CreateProfileModal.tsx — admin only
import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface CreateProfileModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const NAME_REGEX = /^[A-Za-z\s]+$/;

export default function CreateProfileModal({ onClose, onCreated }: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const validate = (val: string) => {
    if (!val.trim()) return 'Name is required';
    if (!NAME_REGEX.test(val)) return 'Only letters A–Z allowed';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate(name);
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      await api.createProfile({ name: name.trim() });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-ink-900 border border-white/[0.09] rounded-2xl p-6 w-full max-w-md animate-fade-up shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-mist text-lg">New Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-mist-dim hover:text-mist hover:bg-ink-800 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-mist-dim uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Harriet Tubman"
              autoFocus
              className="w-full bg-ink-800 border border-white/[0.08] focus:border-acid/50 rounded-xl px-4 py-3 text-mist text-sm placeholder:text-mist-dim/50 outline-none transition-all"
            />
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs">
                <AlertCircle size={12} />{error}
              </div>
            )}
            <p className="mt-2 text-[11px] text-mist-dim">
              Only letters (A–Z). API predicts gender, age and nationality automatically.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-mist-dim hover:text-mist hover:bg-ink-800 text-sm font-medium transition-all">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-acid hover:bg-acid-dim disabled:opacity-50 disabled:cursor-not-allowed text-ink-950 text-sm font-display font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-ink-950 border-t-transparent rounded-full animate-spin" />
                : <><Plus size={14} />Create</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
