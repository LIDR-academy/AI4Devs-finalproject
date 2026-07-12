import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Numbered editorial pagination with prev/next arrows. Renders null for <= 1 page. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  // Only window when there are enough pages that ellipsis would actually appear
  const WINDOW_THRESHOLD = 7;
  if (totalPages <= WINDOW_THRESHOLD) {
    for (let p = 1; p <= totalPages; p++) pages.push(p);
  } else {
    const window = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    let last = 0;
    for (let p = 1; p <= totalPages; p++) {
      if (window.has(p) && p >= 1 && p <= totalPages) {
        if (last && p - last > 1) pages.push('ellipsis');
        pages.push(p);
        last = p;
      }
    }
  }

  const arrow =
    'flex h-10 w-10 items-center justify-center rounded-pill border border-border text-taupe transition-colors hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 py-4">
      <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)} className={arrow}>
        <ChevronLeft size={16} aria-hidden />
      </button>
      {pages.map((p, index) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} aria-hidden className="px-1 text-taupe">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={`h-10 w-10 rounded-pill font-sans text-sm transition-colors ${
              p === page ? 'bg-terracotta text-white' : 'text-taupe hover:bg-terracotta-tint'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className={arrow}>
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}
