'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, X, ArrowRight } from 'lucide-react';

/**
 * Cookie & Privacy Consent Banner
 * Compliant with Digital Personal Data Protection Act, 2023 (DPDPA) & WCAG 2.1 AA
 */
export default function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('chanda_cookie_consent');
      if (!consent) {
        setShow(true);
      }
    } catch {
      // localStorage may be restricted in private browsing
    }
  }, []);

  const handleAccept = (type = 'all') => {
    try {
      localStorage.setItem(
        'chanda_cookie_consent',
        JSON.stringify({
          status: 'accepted',
          type,
          timestamp: new Date().toISOString(),
          version: '1.0',
        })
      );
    } catch {
      // ignore storage write errors
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      role="region"
      aria-label="कुकी आणि डेटा गोपनीयता संमती सूचना (Cookie & Data Privacy Notice)"
      className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-6 max-w-5xl mx-auto z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)] rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Subtle Government Tricolor / Brand Top Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-600" />

        <div className="relative p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          {/* Dismiss Icon */}
          <button
            type="button"
            onClick={() => handleAccept('essential')}
            className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="संमती सूचना बंद करा (Close notice)"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Main Info */}
          <div className="flex items-start gap-3.5 sm:gap-4 flex-1 pr-6 sm:pr-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md shadow-blue-900/20 flex items-center justify-center shrink-0 ring-4 ring-blue-50 mt-0.5">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  डेटा गोपनीयता व कुकीज संमती (DPDPA 2023)
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  शासकीय पोर्टल
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                चंद्रपूर जिल्हा महसूल पोर्टल सुरक्षित लॉगिन आणि सत्र व्यवस्थापनासाठी केवळ आवश्यक कुकीज वापरते. 
                डिजिटल व्यक्तिगत डेटा संरक्षण कायदा (DPDPA २०२३) व GIGW ३.० मानकांनुसार आपला वैयक्तिक डेटा पूर्णतः सुरक्षित राखला जातो.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  href="/privacy-policy"
                  className="text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1 hover:gap-1.5 transition-all underline decoration-blue-300 hover:decoration-blue-700 underline-offset-2"
                >
                  <span>गोपनीयता धोरण वाचा (Privacy Policy)</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <span className="text-slate-300" aria-hidden="true">•</span>
                <Link
                  href="/accessibility-statement"
                  className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>सुलभता विधान (Accessibility)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              type="button"
              onClick={() => handleAccept('essential')}
              className="flex-1 md:flex-initial px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 border border-slate-200/90 rounded-xl transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              केवळ आवश्यक (Essential)
            </button>
            <button
              type="button"
              onClick={() => handleAccept('all')}
              className="flex-1 md:flex-initial px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 active:scale-[0.98] rounded-xl shadow-md shadow-blue-900/25 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              स्वीकारा व पुढे चला (Accept)
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
