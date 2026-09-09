'use client';

import Link from 'next/link';
import { ShieldAlert, Database, Cloud, FileSpreadsheet, Landmark, ExternalLink } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="gov-tricolor-bar" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 to-indigo-950 flex items-center justify-center text-white shadow-md">
              <Landmark className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  जिल्हाधिकारी कार्यालय, चंद्रपूर
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                  MLRC 1966
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Land Intelligence & Governance Portal (जमीन महसूल अभिलेख व शर्तभंग प्रणाली)
              </p>
            </div>
          </div>

          {/* System Status Badges */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Neon PostgreSQL Connected</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              <span>Cloudinary DMS Live</span>
            </div>

            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
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
