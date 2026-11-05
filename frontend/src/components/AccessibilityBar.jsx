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
    <div className="bg-slate-950/95 backdrop-blur-md text-slate-300 text-[11px] border-b border-slate-800/80 select-none">
      <div className="w-full px-3 sm:px-5 lg:px-6 py-1 flex items-center justify-between gap-2">
        {/* Left: Skip link and System attribution */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-3 focus:py-1 focus:bg-indigo-600 focus:text-white focus:font-semibold focus:rounded-md focus:outline-none shadow-md"
          >
            {t('portal.skipToContent')}
          </a>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-wide truncate">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline font-sans text-slate-300 font-medium">{t('portal.govtOfIndia')}</span>
            <span className="hidden sm:inline text-slate-600">/</span>
            <span className="font-sans text-slate-300 font-medium">{t('portal.govtOfMaharashtra')}</span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-cyan-400/90 font-mono hidden md:inline">SPATIAL INTELLIGENCE CORE</span>
          </div>
        </div>

        {/* Right: Accessibility Controls & Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher variant="compact" />

          {/* Font Size Adjusters */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline font-mono">
              {t('accessibility.size')}
            </span>
            <button
              type="button"
              onClick={() => handleFontSize('sm')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                fontSize === 'sm' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title={t('accessibility.decreaseFont')}
              aria-label={t('accessibility.decreaseFont')}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontSize('md')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                fontSize === 'md' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title={t('accessibility.normalFont')}
              aria-label={t('accessibility.normalFont')}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontSize('lg')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                fontSize === 'lg' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
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
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] sm:text-[11px] font-medium transition cursor-pointer ${
              highContrast
                ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
            title={t('accessibility.highContrast')}
            aria-label={t('accessibility.highContrast')}
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">{t('accessibility.contrast')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
