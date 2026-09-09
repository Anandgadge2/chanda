'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  UserPlus,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  Search,
  Building,
  FileSpreadsheet,
  Layers,
  Scale,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';

export default function LandingNavbar({ onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Main Brand & Officer Actions Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Official Emblem & Collectorate Title */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0">
            <ChandrapurDistrictLogo className="w-10 h-10 sm:w-14 sm:h-14 drop-shadow-xs transition-transform group-hover:scale-105 flex-shrink-0" />

            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-black text-slate-900 leading-tight group-hover:text-blue-950 transition tracking-tight truncate">
                जिल्हाधिकारी कार्यालय, चंद्रपूर
              </h1>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                DISTRICT COLLECTORATE, CHANDRAPUR
              </p>
              <p className="text-[11px] text-amber-800 font-semibold hidden md:block truncate">
                जमीन महसूल, भूमी अभिलेख व १९५० मूळ शीर्षक साखळी संनियंत्रण प्रणाली
              </p>
            </div>
          </Link>

          {/* Action CTAs: Register, Login, Dashboard */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-950 hover:bg-slate-100 border border-slate-300 transition shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-900" />
              <span>नागरिक नोंदणी</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/60 shadow-xs hover:shadow-md transition"
            >
              <Lock className="w-3.5 h-3.5 text-blue-950" />
              <span>अधिकारी लॉगिन</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-xs hover:shadow-md transition group"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-6 transition-transform" />
              <span>महसूल डॅशबोर्ड</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-950 bg-amber-400 active:scale-95 transition"
            >
              लॉगिन
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Official Navy Navigation Ribbon (Gov Strip) */}
      <div className="bg-[#0B1E36] text-white border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-9 sm:h-10">
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-200">
            <a href="/" className="hover:text-amber-400 transition py-1 text-white font-bold">
              मुख्य पृष्ठ
            </a>
            <a href="#search-section" className="hover:text-amber-400 transition py-1">
              ७/१२ भूखंड शोध
            </a>
            <a href="#talukas" className="hover:text-amber-400 transition py-1">
              १५ तालुके
            </a>
            <a href="#provenance" className="hover:text-amber-400 transition py-1">
              १९५० मूळ शीर्षक साखळी
            </a>
            <a href="#mlrc" className="hover:text-amber-400 transition py-1">
              MLRC १९६६ कायदे
            </a>
            <a href="#workflow" className="hover:text-amber-400 transition py-1">
              कार्यप्रणाली
            </a>
            <Link href="/cases" className="hover:text-amber-400 transition py-1">
              SDO सुनावणी खटले
            </Link>
            <Link href="/reports" className="hover:text-amber-400 transition py-1">
              प्रपत्र-३ अहवाल
            </Link>
          </nav>

          <div className="flex items-center justify-between w-full lg:w-auto text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>महसूल प्रणाली सक्रीय</span>
            </div>
            <span className="text-slate-400 text-[10px] hidden sm:inline ml-4">
              MLRC १९६६ अधिकृत संनियंत्रण
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-800">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              मुख्य पृष्ठ (Home)
            </a>
            <a
              href="#search-section"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              ७/१२ भूखंड शोध (Search)
            </a>
            <a
              href="#talukas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              १५ तालुके (Talukas)
            </a>
            <a
              href="#provenance"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              १९५० मूळ शीर्षक साखळी (1950 Trace)
            </a>
            <a
              href="#mlrc"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              MLRC १९६६ कायदे (Acts)
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              कार्यप्रणाली (Workflow)
            </a>
            <Link
              href="/cases"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              SDO सुनावणी खटले (Cases)
            </Link>
            <Link
              href="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              प्रपत्र-३ अहवाल (Reports)
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('register');
              }}
              className="w-full py-2.5 rounded-xl text-center font-semibold text-slate-700 bg-slate-100 border border-slate-300 text-xs"
            >
              नागरिक नोंदणी
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('login');
              }}
              className="w-full py-2.5 rounded-xl text-center font-bold text-blue-950 bg-amber-400 text-xs"
            >
              अधिकारी लॉगिन
            </button>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center font-bold text-white bg-blue-900 text-xs"
            >
              महसूल डॅशबोर्ड
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
