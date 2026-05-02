// components/FiltersBar.tsx
import { useState } from 'react';
import { Filter, X, Download, SlidersHorizontal } from 'lucide-react';
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

  return (
    <>
      {/* Trigger buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
            hasActive
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
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-mist-dim hover:text-red-400 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Bottom sheet overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-ink-900 rounded-t-3xl border-t border-white/[0.09] p-6 pb-10 w-full max-h-[85vh] overflow-y-auto z-10">
            {/* Handle bar */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-acid" />
                <h3 className="font-display font-semibold text-mist text-base">Filter Profiles</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-ink-800 text-mist-dim hover:text-mist transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <Field label="Gender">
                <select
                  value={local.gender || ''}
                  onChange={(e) => set('gender', e.target.value || undefined)}
                  className="input-select"
                >
                  {GENDERS.map((g) => <option key={g} value={g}>{g || 'Any'}</option>)}
                </select>
              </Field>

              <Field label="Age Group">
                <select
                  value={local.age_group || ''}
                  onChange={(e) => set('age_group', e.target.value || undefined)}
                  className="input-select"
                >
                  {AGE_GROUPS.map((g) => <option key={g} value={g}>{g || 'Any'}</option>)}
                </select>
              </Field>

              <Field label="Country Code">
                <input
                  type="text"
                  maxLength={2}
                  placeholder="e.g. NG, US, GB"
                  value={local.country_id || ''}
                  onChange={(e) => set('country_id', e.target.value.toUpperCase() || undefined)}
                  className="input-text"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Min Age">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    placeholder="0"
                    value={local.min_age ?? ''}
                    onChange={(e) => set('min_age', e.target.value ? +e.target.value : undefined)}
                    className="input-text"
                  />
                </Field>
                <Field label="Max Age">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    placeholder="120"
                    value={local.max_age ?? ''}
                    onChange={(e) => set('max_age', e.target.value ? +e.target.value : undefined)}
                    className="input-text"
                  />
                </Field>
              </div>

              <Field label="Sort By">
                <div className="flex gap-2">
                  <select
                    value={local.sort_by || ''}
                    onChange={(e) => set('sort_by', e.target.value || undefined)}
                    className="input-select flex-1"
                  >
                    {SORT_BY_OPTIONS.map((s) => <option key={s} value={s}>{s || 'Default'}</option>)}
                  </select>
                  <select
                    value={local.order || 'asc'}
                    onChange={(e) => set('order', e.target.value)}
                    className="input-select w-20"
                  >
                    {ORDERS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </Field>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-5 border-t border-white/[0.06]">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl text-sm text-mist-dim hover:text-mist border border-white/[0.08] hover:bg-ink-800 transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 rounded-xl bg-acid hover:bg-acid-dim text-ink-950 text-sm font-display font-semibold transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-select, .input-text {
          width: 100%; background: rgb(28,28,40); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 8px 12px; font-size: 14px; color: #e8e8f0;
          outline: none; transition: border-color 0.2s;
        }
        .input-select:focus, .input-text:focus { border-color: rgba(184,255,87,0.4); }
        .input-select option { background: rgb(17,17,24); }
        .input-text::placeholder { color: rgba(153,153,179,0.5); }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-mist-dim font-medium mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
