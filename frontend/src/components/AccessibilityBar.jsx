'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Type, Shield } from 'lucide-react';

export default function AccessibilityBar() {
  const [fontSize, setFontSize] = useState('md');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Read saved preferences
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
  }, []);

  const handleFontSize = (size) => {
    setFontSize(size);
    document.documentElement.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
    document.documentElement.classList.add(`font-${size}`);
    localStorage.setItem('chanda_fontsize', size);
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('chanda_contrast', 'high');
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('chanda_contrast', 'normal');
    }
  };

  return (
    <div className="bg-[#0B1E36] text-slate-200 text-[11px] border-b border-blue-950 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 flex items-center justify-between gap-2">
        {/* Left: Skip link and Government attribution */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-3 focus:py-1 focus:bg-amber-400 focus:text-blue-950 focus:font-bold focus:rounded focus:outline-none"
          >
            मुख्य सामग्रीकडे जा (Skip to Main Content)
          </a>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-amber-300 font-semibold tracking-wide truncate">
            <span className="hidden sm:inline">भारत सरकार / Government of India</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span>महाराष्ट्र शासन / Government of Maharashtra</span>
          </div>
        </div>

        {/* Right: Accessibility Controls (GIGW 3.0 Standard) */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Font Size Adjusters */}
          <div className="flex items-center gap-1 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/60">
            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">आकार:</span>
            <button
              type="button"
              onClick={() => handleFontSize('sm')}
              className={`px-1 rounded hover:text-white transition ${
                fontSize === 'sm' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
              }`}
              title="लहान मजकूर (Decrease font size)"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontSize('md')}
              className={`px-1 rounded hover:text-white transition ${
                fontSize === 'md' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
              }`}
              title="सामान्य मजकूर (Reset font size)"
              aria-label="Reset font size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontSize('lg')}
              className={`px-1 rounded hover:text-white transition ${
                fontSize === 'lg' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
              }`}
              title="मोठा मजकूर (Increase font size)"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleContrast}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] sm:text-[11px] font-medium transition ${
              highContrast
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:text-white'
            }`}
            title="प्रखर रंगछटा (Toggle High Contrast)"
            aria-label="Toggle High Contrast"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">प्रखर कॉन्ट्रास्ट</span>
          </button>
        </div>
      </div>
    </div>
  );
}
