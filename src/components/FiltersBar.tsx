// components/FiltersBar.tsx
import { useState, useRef, useEffect } from 'react';
import { Filter, X, Download } from 'lucide-react';
import type { FilterParams } from '../types';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface FiltersBarProps {
  filters: FilterParams;
  onApply: (f: FilterParams) => void;
  isAdmin?: boolean;
}

const GENDERS = ['', 'male', 'female'];
const AGE_GROUPS = ['', 'child', 'adult', 'senior'];
const SORT_BY_OPTIONS = ['', 'name', 'age', 'createdAt', 'genderProbability', 'countryProbability'];
const ORDERS = ['asc', 'desc'];

export default function FiltersBar({ filters, onApply, isAdmin = false }: FiltersBarProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<FilterParams>(filters);
  const [exporting, setExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FilterParams>(k: K, v: FilterParams[K]) =>
    setLocal((prev) => ({ ...prev, [k]: v }));

  const hasActive = !!(filters.gender || filters.age_group || filters.country_id || filters.min_age || filters.max_age);

  const handleApply = () => { onApply({ ...local, page: 1 }); setOpen(false); };
  const handleReset = () => {
    const clean: FilterParams = { page: 1, limit: filters.limit };
    setLocal(clean); onApply(clean); setOpen(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.exportCSV(filters.gender, filters.country_id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Flip dropdown to the right if it would overflow left, or pin to right edge
  useEffect(() => {
    if (!open || !dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      dropdownRef.current.style.left = 'auto';
      dropdownRef.current.style.right = '0';
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            open || hasActive
              ? 'border-acid/40 bg-acid/10 text-acid'
              : 'border-white/[0.08] bg-ink-900 text-mist-dim hover:text-mist hover:bg-ink-800'
          }`}
        >
          <Filter size={13} />
          Filters
          {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-acid inline-block" />}
        </button>

        {isAdmin && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-ink-900 text-mist-dim hover:text-mist hover:bg-ink-800 disabled:opacity-50 text-xs font-medium transition-all"
          >
            <Download size={13} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        )}

        {hasActive && (
          <button onClick={handleReset} className="flex items-center gap-1 text-xs text-mist-dim hover:text-red-400 transition-colors">
            <X size={11} />Clear
          </button>
        )}
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 z-40 w-80 bg-ink-900 border border-white/[0.09] rounded-2xl p-5 shadow-2xl animate-fade-up"
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          <h3 className="font-display font-semibold text-mist text-sm mb-4">Filter Profiles</h3>
          <div className="space-y-4">
            <Field label="Gender">
              <select value={local.gender || ''} onChange={(e) => set('gender', e.target.value || undefined)} className="input-select">
                {GENDERS.map((g) => <option key={g} value={g}>{g || 'Any'}</option>)}
              </select>
            </Field>
            <Field label="Age Group">
              <select value={local.age_group || ''} onChange={(e) => set('age_group', e.target.value || undefined)} className="input-select">
                {AGE_GROUPS.map((g) => <option key={g} value={g}>{g || 'Any'}</option>)}
              </select>
            </Field>
            <Field label="Country Code">
              <input type="text" maxLength={2} placeholder="e.g. NG, US, GB"
                value={local.country_id || ''} onChange={(e) => set('country_id', e.target.value.toUpperCase() || undefined)}
                className="input-text" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min Age">
                <input type="number" min={0} max={120} placeholder="0"
                  value={local.min_age ?? ''} onChange={(e) => set('min_age', e.target.value ? +e.target.value : undefined)}
                  className="input-text" />
              </Field>
              <Field label="Max Age">
                <input type="number" min={0} max={120} placeholder="120"
                  value={local.max_age ?? ''} onChange={(e) => set('max_age', e.target.value ? +e.target.value : undefined)}
                  className="input-text" />
              </Field>
            </div>
            <Field label="Sort By">
              <div className="flex gap-2">
                <select value={local.sort_by || ''} onChange={(e) => set('sort_by', e.target.value || undefined)} className="input-select flex-1">
                  {SORT_BY_OPTIONS.map((s) => <option key={s} value={s}>{s || 'Default'}</option>)}
                </select>
                <select value={local.order || 'asc'} onChange={(e) => set('order', e.target.value)} className="input-select w-20">
                  {ORDERS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </Field>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
            <button onClick={handleReset} className="flex-1 py-2 rounded-xl text-xs text-mist-dim hover:text-mist border border-white/[0.08] hover:bg-ink-800 transition-all">Reset</button>
            <button onClick={handleApply} className="flex-1 py-2 rounded-xl bg-acid hover:bg-acid-dim text-ink-950 text-xs font-display font-semibold transition-all">Apply</button>
          </div>
        </div>
      )}

      <style>{`
        .input-select, .input-text {
          width: 100%; background: rgb(28,28,40); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 6px 10px; font-size: 12px; color: #e8e8f0;
          outline: none; transition: border-color 0.2s;
        }
        .input-select:focus, .input-text:focus { border-color: rgba(184,255,87,0.4); }
        .input-select option { background: rgb(17,17,24); }
        .input-text::placeholder { color: rgba(153,153,179,0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-mist-dim font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}
