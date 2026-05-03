// components/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, total_pages, total, limit, onChange }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const hasPrev = page > 1;
  const hasNext = page < total_pages;

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <p className="text-xs text-mist-dim font-mono">
        {from}–{to} of {total.toLocaleString()} profiles
      </p>

      <div className="flex items-center gap-1">
        {hasPrev && (
          <button
            onClick={() => onChange(page - 1)}
            className="p-1.5 rounded-lg text-mist-dim hover:text-mist hover:bg-ink-800 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        {hasPrev && (
          <button
            onClick={() => onChange(page - 1)}
            className="min-w-[28px] h-7 rounded-lg text-xs font-mono font-medium text-mist-dim hover:text-mist hover:bg-ink-800 transition-all"
          >
            {page - 1}
          </button>
        )}

        <button className="min-w-[28px] h-7 rounded-lg text-xs font-mono font-bold bg-acid text-ink-950 transition-all">
          {page}
        </button>

        {hasNext && (
          <button
            onClick={() => onChange(page + 1)}
            className="min-w-[28px] h-7 rounded-lg text-xs font-mono font-medium text-mist-dim hover:text-mist hover:bg-ink-800 transition-all"
          >
            {page + 1}
          </button>
        )}

        {hasNext && (
          <button
            onClick={() => onChange(page + 1)}
            className="p-1.5 rounded-lg text-mist-dim hover:text-mist hover:bg-ink-800 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
