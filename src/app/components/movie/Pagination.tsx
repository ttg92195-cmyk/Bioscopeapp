'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-4">
      <button
        className="h-8 w-8 flex items-center justify-center rounded-md border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, i) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-white/40 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            className="h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:cursor-default"
            style={
              page === currentPage
                ? { backgroundColor: 'var(--dynamic-primary, #E53935)', color: 'white' }
                : { border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
            }
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="h-8 w-8 flex items-center justify-center rounded-md border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
