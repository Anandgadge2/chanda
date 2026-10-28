'use client';

import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { useTranslation } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function AccessibilityBar() {
  const { t, locale } = useTranslation();
  const [fontSize, setFontSize] = useState('md');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Read saved preferences
    try {
      const savedContrast = localStorage.getItem('chanda_contrast');
      if (savedContrast === 'high') {
        setHighContrast(true);
        document.body.classList.add('high-contrast');
      }

      const savedSize = localStorage.getItem('chanda_fontsize');
      if (savedSize) {
        setFontSize(savedSize);
        document.documentElement.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
        document.documentElement.classList.add(`font-${savedSize}`);
      }
    } catch {}
  }, []);

  const handleFontSize = (size) => {
    setFontSize(size);
    document.documentElement.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
    document.documentElement.classList.add(`font-${size}`);
    try {
      localStorage.setItem('chanda_fontsize', size);
    } catch {}
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    try {
      if (next) {
        document.body.classList.add('high-contrast');
        localStorage.setItem('chanda_contrast', 'high');
      } else {
        document.body.classList.remove('high-contrast');
        localStorage.setItem('chanda_contrast', 'normal');
      }
    } catch {}
  };

  return (
    <div className="bg-[#0B1E36] text-slate-200 text-[11px] border-b border-blue-950 select-none">
      <div className="w-full px-3 sm:px-5 lg:px-6 py-1 flex items-center justify-between gap-2">
        {/* Left: Skip link and Government attribution */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-3 focus:py-1 focus:bg-amber-400 focus:text-blue-950 focus:font-bold focus:rounded focus:outline-none"
          >
            {t('portal.skipToContent')}
          </a>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-amber-300 font-semibold tracking-wide truncate">
            <span className="hidden sm:inline">{t('portal.govtOfIndia')}</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span>{t('portal.govtOfMaharashtra')}</span>
          </div>
        </div>

        {/* Right: Accessibility Controls & Language Toggle (GIGW 3.0 Standard) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher variant="compact" />

          {/* Font Size Adjusters */}
          <div className="flex items-center gap-1 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/60">
            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">
              {t('accessibility.size')}
            </span>
            <button
              type="button"
              onClick={() => handleFontSize('sm')}
              className={`px-1 rounded hover:text-white transition cursor-pointer ${
                fontSize === 'sm' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
              }`}
              title={t('accessibility.decreaseFont')}
              aria-label={t('accessibility.decreaseFont')}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontSize('md')}
              className={`px-1 rounded hover:text-white transition cursor-pointer ${
                fontSize === 'md' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
              }`}
              title={t('accessibility.normalFont')}
              aria-label={t('accessibility.normalFont')}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontSize('lg')}
              className={`px-1 rounded hover:text-white transition cursor-pointer ${
                fontSize === 'lg' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
              }`}
              title={t('accessibility.increaseFont')}
              aria-label={t('accessibility.increaseFont')}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleContrast}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] sm:text-[11px] font-medium transition cursor-pointer ${
              highContrast
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:text-white'
            }`}
            title={t('accessibility.highContrast')}
            aria-label={t('accessibility.highContrast')}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">{t('accessibility.contrast')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
