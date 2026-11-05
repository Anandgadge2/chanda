'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  LayoutDashboard,
  Menu,
  X,
  BookOpen,
  LogOut,
  Sparkles,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';

export default function LandingNavbar({ onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, isMarathi } = useTranslation();

  const displayOfficerName = () => {
    if (!user) return '';
    if (!isMarathi) {
      if (user.role === 'COLLECTOR' || user.fullName?.includes('जिल्हाधिकारी')) {
        return 'District Collector, Chandrapur';
      }
      if (user.role === 'SDO' || user.fullName?.includes('उपविभागीय')) {
        return 'Sub-Divisional Officer (SDO)';
      }
      if (user.role === 'TAHSILDAR' || user.fullName?.includes('तहसीलदार')) {
        return 'Tahsildar';
      }
      return user.fullNameEn || user.fullName || 'Revenue Officer';
    }
    return user.fullName || 'जिल्हाधिकारी, चंद्रपूर';
  };

  const displayOfficerDesignation = () => {
    if (!user) return '';
    if (!isMarathi) {
      if (user.role === 'COLLECTOR' || user.designation?.includes('जिल्हाधिकारी')) {
        return 'District Collector';
      }
      if (user.role === 'SDO') return 'Sub-Divisional Officer';
      if (user.role === 'TAHSILDAR') return 'Tahsildar';
      return 'Revenue Officer';
    }
    return (user.designation || (user.role === 'COLLECTOR' ? t('roles.collector') : user.role))
      .replace(/\s*\([^)]*[a-zA-Z][^)]*\)/g, '')
      .trim();
  };

  const officerDisplayName = displayOfficerName();
  const officerInitial = isMarathi
    ? (user?.fullName ? user.fullName.charAt(0) : 'अ')
    : (user?.fullNameEn ? user.fullNameEn.charAt(0) : (officerDisplayName ? officerDisplayName.charAt(0) : 'D'));

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
      {/* Sleek Modern Gradient Top Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 shadow-xs" />

      {/* Main Brand & Actions Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Spatial Platform Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <ChandrapurDistrictLogo className="w-8 h-8 sm:w-9 sm:h-9" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-base font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition tracking-tight truncate">
                  {t('portal.title')}
                </h1>
               
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium leading-tight hidden md:block truncate">
                {t('portal.subTitle')}
              </p>
            </div>
          </Link>

          {/* Action CTAs: Language Switcher, Dashboard, Login */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
            {/* Header Language Switcher */}
            <LanguageSwitcher variant="pill" />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-500/20 transition group"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-white/90 group-hover:rotate-6 transition-transform" />
                  <span>{t('nav.dashboard')}</span>
                </Link>

                {/* Officer Mini Badge & Instant Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {officerInitial}
                  </div>
                  <div className="text-left max-w-[150px]">
                    <span className="text-xs font-bold text-slate-900 leading-snug block truncate">
                      {officerDisplayName}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold leading-tight block truncate">
                      {displayOfficerDesignation()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95 cursor-pointer"
                    title={t('nav.logout')}
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-sm shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-white/90" />
                <span>{t('nav.officerLogin')}</span>
              </button>
            )}
          </div>

          {/* Mobile Actions & Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-1.5 flex-shrink-0">
            <LanguageSwitcher variant="compact" />

            {user ? (
              <Link
                href="/dashboard"
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-white bg-indigo-600 active:scale-95 transition shadow-xs"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white bg-indigo-600 active:scale-95 transition shadow-xs cursor-pointer"
              >
                {t('nav.officerLogin')}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <div className="pb-2 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">{t('accessibility.language')}:</span>
            <LanguageSwitcher variant="pill" />
          </div>

          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-800">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              {t('nav.home')}
            </a>
            <a
              href="#search-section"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              {t('nav.parcels')}
            </a>
            <a
              href="#talukas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              {t('nav.talukas')}
            </a>
            <a
              href="#provenance"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              {t('nav.provenance')}
            </a>
            <Link
              href="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              {t('nav.reports')}
            </Link>
            <Link
              href="/glossary"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-indigo-600 font-bold"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>{t('nav.glossary')}</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {officerInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {officerDisplayName}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold block truncate">
                      {displayOfficerDesignation()}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center font-semibold text-white bg-indigo-600 text-xs shadow-xs"
                >
                  {t('nav.dashboard')}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 rounded-xl text-center font-bold text-rose-700 bg-rose-50 border border-rose-200 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 rounded-xl text-center font-semibold text-white bg-indigo-600 text-xs shadow-sm cursor-pointer"
              >
                {t('nav.officerLogin')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
