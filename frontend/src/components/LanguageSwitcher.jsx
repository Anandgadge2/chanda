'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from './LanguageContext';

export default function LanguageSwitcher({ variant = 'pill', className = '' }) {
  const { locale, setLocale } = useTranslation();

  // 1. Accessibility Bar Compact Variant (For top dark bar)
  if (variant === 'compact') {
    return (
      <div
        role="group"
        aria-label="भाषा निवडा / Select Language"
        className={`inline-flex items-center bg-slate-900/70 p-0.5 rounded border border-slate-700/60 select-none ${className}`}
      >
        <button
          type="button"
          onClick={() => setLocale('mr')}
          aria-pressed={locale === 'mr'}
          title="मराठी भाषा निवडा"
          className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold transition cursor-pointer ${
            locale === 'mr'
              ? 'bg-amber-400 text-slate-950 shadow-2xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          मराठी
        </button>
        <span className="text-slate-600 text-[10px] px-0.5">|</span>
        <button
          type="button"
          onClick={() => setLocale('en')}
          aria-pressed={locale === 'en'}
          title="Switch to English language"
          className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold transition cursor-pointer ${
            locale === 'en'
              ? 'bg-amber-400 text-slate-950 shadow-2xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          English
        </button>
      </div>
    );
  }

  // 2. Standard Header / Navbar Pill Variant (Clean, modern segmented control)
  return (
    <div
      role="group"
      aria-label="भाषा निवडा / Select Language"
      className={`inline-flex items-center bg-slate-100/90 p-0.5 sm:p-1 rounded-xl border border-slate-200/90 shadow-2xs select-none ${className}`}
    >
      <div className="pl-1.5 pr-1 hidden sm:flex items-center text-slate-500">
        <Languages className="w-3.5 h-3.5" aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={() => setLocale('mr')}
        aria-pressed={locale === 'mr'}
        title="मराठी भाषा"
        className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          locale === 'mr'
            ? 'bg-white text-blue-950 shadow-xs ring-1 ring-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        मराठी
      </button>

      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        title="English Language"
        className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          locale === 'en'
            ? 'bg-white text-blue-950 shadow-xs ring-1 ring-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        English
      </button>
    </div>
  );
}
