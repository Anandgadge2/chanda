'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  limit = 20,
  onPageChange = () => {},
}) {
  if (totalPages <= 1 && totalCount <= limit) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-2xs mt-4">
      {/* Records Count */}
      <div className="text-xs text-slate-600 font-medium">
        एकूण <span className="font-bold text-slate-900">{totalCount}</span> पैकी{' '}
        <span className="font-bold text-slate-900">{totalCount > 0 ? startRecord : 0}</span> ते{' '}
        <span className="font-bold text-slate-900">{endRecord}</span> नोंदी दाखवत आहे (पृष्ठ{' '}
        <span className="font-bold text-blue-900">{currentPage}</span> / {totalPages})
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition active:scale-95"
          aria-label="मागील पृष्ठ (Previous page)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">मागील</span>
        </button>

        {/* Number Pills */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                  currentPage === p
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition active:scale-95"
          aria-label="पुढील पृष्ठ (Next page)"
        >
          <span className="hidden sm:inline">पुढील</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
