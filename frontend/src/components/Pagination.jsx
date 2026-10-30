'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { useTranslation } from './LanguageContext';

export default function Pagination({
  currentPage = 1,
  totalPages,
  totalCount = 0,
  limit = 25,
  pageSize,
  onPageChange = () => {},
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 'all'],
  embedded = false,
  className = '',
}) {
  const { isMarathi } = useTranslation();

  const isAll = pageSize === 'all' || limit === 'all';
  const effectiveLimit = isAll
    ? (totalCount || 1)
    : (Number(pageSize || limit) || 25);

  const computedTotalPages = isAll
    ? 1
    : Math.max(1, Math.ceil(totalCount / effectiveLimit));

  const finalTotalPages = isAll
    ? 1
    : (totalPages !== undefined && totalPages !== null && totalPages >= 1
      ? totalPages
      : computedTotalPages);

  const options = useMemo(() => {
    const list = [...pageSizeOptions];
    const currentVal = isAll ? 'all' : Number(pageSize || limit);
    if (currentVal && !list.includes(currentVal) && !list.includes(String(currentVal))) {
      list.unshift(currentVal);
    }
    return list;
  }, [pageSizeOptions, isAll, pageSize, limit]);

  if (finalTotalPages <= 1 && totalCount <= effectiveLimit && !onPageSizeChange) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (finalTotalPages <= maxVisible) {
      for (let i = 1; i <= finalTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(finalTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < finalTotalPages - 2) pages.push('...');
      if (!pages.includes(finalTotalPages)) pages.push(finalTotalPages);
    }
    return pages;
  };

  const startRecord = totalCount > 0 ? (currentPage - 1) * effectiveLimit + 1 : 0;
  const endRecord = isAll ? totalCount : Math.min(currentPage * effectiveLimit, totalCount);

  const containerClasses = embedded
    ? `flex flex-col md:flex-row items-center justify-between gap-3 w-full text-center sm:text-left ${className}`
    : `flex flex-col md:flex-row items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl shadow-2xs mt-3 sm:mt-4 text-center sm:text-left ${className}`;

  return (
    <div className={containerClasses}>
      {/* Records Count & Optional Rows Per Page */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
        <div className="text-xs text-slate-600 font-medium">
          {isMarathi ? (
            <>
              एकूण <span className="font-bold text-slate-900">{totalCount}</span> पैकी{' '}
              <span className="font-bold text-slate-900">{totalCount > 0 ? startRecord : 0}</span> ते{' '}
              <span className="font-bold text-slate-900">{endRecord}</span> नोंदी दाखवत आहे (पृष्ठ{' '}
              <span className="font-bold text-blue-900">{currentPage}</span> / {finalTotalPages})
            </>
          ) : (
            <>
              Showing{' '}
              <span className="font-bold text-slate-900">{totalCount > 0 ? startRecord : 0}</span> to{' '}
              <span className="font-bold text-slate-900">{endRecord}</span> of{' '}
              <span className="font-bold text-slate-900">{totalCount}</span> records (Page{' '}
              <span className="font-bold text-blue-900">{currentPage}</span> of {finalTotalPages})
            </>
          )}
        </div>

        {/* Rows Per Page Dropdown */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium sm:border-l sm:border-slate-200 sm:pl-3">
            <span className="whitespace-nowrap">{isMarathi ? 'प्रति पृष्ठ:' : 'Per page:'}</span>
            <div className="relative inline-flex items-center">
              <select
                value={isAll ? 'all' : (pageSize || limit)}
                onChange={(e) => onPageSizeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                aria-label={isMarathi ? 'प्रति पृष्ठ नोंदी निवडा' : 'Select rows per page'}
                className="appearance-none pl-2.5 pr-7 py-1 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer shadow-2xs transition"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt} className="font-semibold text-slate-800">
                    {opt === 'all' ? (isMarathi ? 'सर्व (All)' : 'All') : opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 flex items-center text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isAll}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition active:scale-95 cursor-pointer"
          title={isMarathi ? 'पहिले पृष्ठ' : 'First page'}
          aria-label={isMarathi ? 'पहिले पृष्ठ' : 'First page'}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isAll}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition active:scale-95 cursor-pointer"
          aria-label={isMarathi ? 'मागील पृष्ठ' : 'Previous page'}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{isMarathi ? 'मागील' : 'Previous'}</span>
        </button>

        {/* Number Pills - Desktop/Tablet */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400 font-bold">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={isAll}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
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

        {/* Compact Mobile Page Indicator */}
        <div className="sm:hidden px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 font-mono">
          {currentPage} / {finalTotalPages}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= finalTotalPages || isAll}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition active:scale-95 cursor-pointer"
          aria-label={isMarathi ? 'पुढील पृष्ठ' : 'Next page'}
        >
          <span className="hidden sm:inline">{isMarathi ? 'पुढील' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(finalTotalPages)}
          disabled={currentPage >= finalTotalPages || isAll}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition active:scale-95 cursor-pointer"
          title={isMarathi ? 'शेवटचे पृष्ठ' : 'Last page'}
          aria-label={isMarathi ? 'शेवटचे पृष्ठ' : 'Last page'}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
