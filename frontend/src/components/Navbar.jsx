'use client';

import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Database, FileSpreadsheet, Landmark, ExternalLink, CheckCircle } from 'lucide-react';
import ChandrapurDistrictLogo from './landing/ChandrapurDistrictLogo';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Emblem */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="transition-transform group-hover:scale-105">
              <ChandrapurDistrictLogo className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-blue-900 transition">
                  जिल्हाधिकारी कार्यालय, चंद्रपूर
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                  MLRC 1966
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                जमीन महसूल व भूमी अभिलेख संनियंत्रण प्रणाली (District Collectorate, Chandrapur)
              </p>
            </div>
          </Link>

          {/* System Status Badges & Quick Nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-900 hover:bg-slate-50 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>सार्वजनिक पोर्टल</span>
            </Link>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>महसूल सर्व्हर सक्रीय</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>अभिलेख दस्तऐवज सुरक्षित</span>
            </div>

            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>प्रपत्र-३ डाऊनलोड</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
