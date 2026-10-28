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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-2xs">
      {/* Main Brand & Officer Actions Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Official Emblem & Collectorate Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <ChandrapurDistrictLogo className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-xs transition-transform group-hover:scale-105 flex-shrink-0" />

            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-black text-slate-900 leading-tight group-hover:text-blue-950 transition tracking-tight truncate">
                {t('portal.title')}
              </h1>
              <p className="text-[10px] text-amber-800 font-semibold leading-tight hidden md:block truncate">
                {t('portal.subTitle')}
              </p>
            </div>
          </Link>

          {/* Action CTAs: Language Switcher, Register, Login, Dashboard */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {/* Header Language Switcher */}
            <LanguageSwitcher variant="pill" />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-xs hover:shadow-md transition group"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-6 transition-transform" />
                  <span>{t('nav.dashboard')}</span>
                </Link>

                {/* Officer Mini Badge & Instant Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-900 to-indigo-900 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {officerInitial}
                  </div>
                  <div className="text-left max-w-[150px]">
                    <span className="text-xs font-bold text-slate-900 leading-snug block truncate">
                      {officerDisplayName}
                    </span>
                    <span className="text-[10px] text-blue-900 font-semibold leading-tight block truncate">
                      {displayOfficerDesignation()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95 cursor-pointer"
                    title={t('nav.logout')}
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/60 shadow-xs hover:shadow-md transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-950" />
                  <span>{t('nav.officerLogin')}</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Actions & Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-1.5 flex-shrink-0">
            <LanguageSwitcher variant="compact" />

            {user ? (
              <Link
                href="/dashboard"
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-900 active:scale-95 transition"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-950 bg-amber-400 active:scale-95 transition cursor-pointer"
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
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <div className="pb-2 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">{t('accessibility.language')}:</span>
            <LanguageSwitcher variant="pill" />
          </div>

          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-800">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.home')}
            </a>
            <a
              href="#search-section"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.parcels')}
            </a>
            <a
              href="#talukas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.talukas')}
            </a>
            <a
              href="#provenance"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.provenance')}
            </a>
            <a
              href="#mlrc"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.acts')}
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.workflow')}
            </a>
            <Link
              href="/cases"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.cases')}
            </Link>
            <Link
              href="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              {t('nav.reports')}
            </Link>
            <Link
              href="/glossary"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-blue-950 font-bold"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>{t('nav.glossary')}</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-900 to-indigo-900 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {officerInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {officerDisplayName}
                    </span>
                    <span className="text-[10px] text-blue-900 font-semibold block truncate">
                      {displayOfficerDesignation()}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center font-bold text-white bg-blue-900 text-xs"
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
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 rounded-xl text-center font-bold text-blue-950 bg-amber-400 text-xs shadow-xs cursor-pointer"
                >
                  {t('nav.officerLogin')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
