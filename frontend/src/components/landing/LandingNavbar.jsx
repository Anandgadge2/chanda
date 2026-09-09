'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  UserPlus,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Building,
  FileSpreadsheet,
} from 'lucide-react';
import { AshokStambhEmblem, MaharashtraSeal } from './GovEmblem';

export default function LandingNavbar({ onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Official Government of India Tricolor Band */}
      <div className="gov-tricolor-bar" />

      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Emblem & District Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="flex items-center gap-2">
              <AshokStambhEmblem className="w-11 h-11 drop-shadow-xs transition-transform group-hover:scale-105" />
              <div className="h-10 w-px bg-slate-200 hidden sm:block" />
              <MaharashtraSeal className="w-11 h-11 hidden sm:block transition-transform group-hover:scale-105" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/80">
                  महाराष्ट्र शासन
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:inline-block">
                  Govt. of Maharashtra
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight group-hover:text-blue-950 transition">
                जिल्हाधिकारी कार्यालय, चंद्रपूर
              </h1>
              <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
                जमीन अभिलेख, १९५० मूळ शीर्षक साखळी व महसूल संनियंत्रण प्रणाली
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <a href="#features" className="hover:text-blue-900 transition py-1">
              वैशिष्ट्ये (Features)
            </a>
            <a href="#provenance" className="hover:text-blue-900 transition py-1">
              १९५० साखळी (1950 Trace)
            </a>
            <a href="#talukas" className="hover:text-blue-900 transition py-1">
              १५ तालुके (Talukas)
            </a>
            <a href="#mlrc" className="hover:text-blue-900 transition py-1">
              MLRC १९६६ कायदे
            </a>
            <a href="#workflow" className="hover:text-blue-900 transition py-1">
              कार्यप्रणाली
            </a>
          </nav>

          {/* Action Buttons: Register, Login, Dashboard */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-950 hover:bg-slate-100 border border-slate-300/80 transition shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-900" />
              <span>नागरिक नोंदणी</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/50 shadow-xs hover:shadow-md transition"
            >
              <Lock className="w-3.5 h-3.5 text-blue-950" />
              <span>अधिकारी लॉगिन</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-800 shadow-sm hover:shadow-md transition group"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-6 transition-transform" />
              <span>महसूल डॅशबोर्ड</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300"
            >
              लॉगिन
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1 text-sm font-semibold text-slate-700">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              वैशिष्ट्ये (Features)
            </a>
            <a
              href="#provenance"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              १९५० साखळी (1950 Trace)
            </a>
            <a
              href="#talukas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              १५ तालुके (Talukas)
            </a>
            <a
              href="#mlrc"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              MLRC १९६६ कायदे (Legal Mandate)
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              कार्यप्रणाली (Workflow)
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('register');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 text-center"
            >
              नागरिक नोंदणी
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('login');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-blue-950 text-xs font-black text-center"
            >
              अधिकारी लॉगिन
            </button>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3 rounded-xl bg-blue-950 text-white text-xs font-bold flex items-center justify-center gap-2 text-center"
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>महसूल डॅशबोर्ड उघडा</span>
          </Link>
        </div>
      )}
    </header>
  );
}
