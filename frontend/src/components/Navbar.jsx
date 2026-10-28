'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Menu,
  LogOut,
  ChevronDown,
  Lock,
  Settings,
} from 'lucide-react';
import ChandrapurDistrictLogo from './landing/ChandrapurDistrictLogo';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import DpdpaRightsModal from './DpdpaRightsModal';

export default function Navbar({
  sidebarCollapsed = false,
  onToggleSidebar = () => {},
  onToggleMobileSidebar = () => {},
  hideSidebarToggle = false,
}) {
  const { user, logout, openLoginModal } = useAuth();
  const { t, locale, isMarathi } = useTranslation();
  const [profileTrayOpen, setProfileTrayOpen] = useState(false);
  const [dpdpaModalOpen, setDpdpaModalOpen] = useState(false);
  const trayRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (trayRef.current && !trayRef.current.contains(event.target)) {
        setProfileTrayOpen(false);
      }
    }
    if (profileTrayOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileTrayOpen]);

  // Close dropdown on ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setProfileTrayOpen(false);
    }
    if (profileTrayOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileTrayOpen]);

  const cleanDesignation = (user?.designation || (user?.role === 'COLLECTOR' ? t('roles.collector') : user?.role) || t('roles.revenueOfficer'))
    .replace(/\s*\([^)]*[a-zA-Z][^)]*\)/g, '')
    .trim();

  const displayOfficerName = () => {
    if (!user) return '';
    if (locale === 'en') {
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

  const displayDesignation = () => {
    if (!user) return '';
    if (locale === 'en') {
      if (user.role === 'COLLECTOR' || user.designation?.includes('जिल्हाधिकारी')) {
        return 'District Collector';
      }
      if (user.role === 'SDO') return 'Sub-Divisional Officer';
      if (user.role === 'TAHSILDAR') return 'Tahsildar';
      return 'Revenue Officer';
    }
    return cleanDesignation;
  };

  const officerDisplayName = displayOfficerName();
  const officerInitial = isMarathi
    ? (user?.fullName ? user.fullName.charAt(0) : 'अ')
    : (user?.fullNameEn ? user.fullNameEn.charAt(0) : (officerDisplayName ? officerDisplayName.charAt(0) : 'D'));

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* National Tricolor Micro Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shadow-2xs" />

      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex justify-between h-13 sm:h-14 items-center gap-2 sm:gap-3">
          {/* Left: Brand Emblem & District Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!hideSidebarToggle && user && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="p-0.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                <ChandrapurDistrictLogo className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="font-extrabold text-slate-950 text-xs sm:text-sm lg:text-base tracking-tight group-hover:text-blue-900 transition truncate">
                    {t('portal.title')}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold bg-amber-100 text-amber-950 px-2 py-0.2 rounded-full border border-amber-300 flex-shrink-0 shadow-2xs">
                    {t('portal.mlrcBadge')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate leading-tight">
                  {t('portal.officialTagline')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Language Switcher, Public Portal Link & Executive Profile Tray */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Bilingual Switcher - Desktop / Tablet navbar (On mobile, housed in sidebar drawer footer) */}
            <div className="hidden sm:inline-flex items-center">
              <LanguageSwitcher variant="pill" />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200/90 text-slate-700 hover:text-blue-900 hover:bg-blue-50/60 transition shadow-2xs"
              title={t('nav.publicPortal')}
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">{t('nav.publicPortal')}</span>
            </Link>

            {user ? (
              /* Authenticated Officer Profile Trigger & Dropdown Tray */
              <div className="relative" ref={trayRef}>
                <button
                  type="button"
                  onClick={() => setProfileTrayOpen((prev) => !prev)}
                  className={`flex items-center gap-2 py-1 px-1.5 sm:px-2 rounded-xl transition border text-left cursor-pointer shadow-2xs ${
                    profileTrayOpen
                      ? 'bg-slate-100 border-slate-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300'
                  }`}
                  aria-expanded={profileTrayOpen}
                  aria-haspopup="true"
                  aria-label="Officer Profile and Settings"
                >
                  {/* Officer Avatar with Online Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                      {officerInitial}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full"
                      title={t('common.active')}
                    />
                  </div>

                  {/* Officer Name & Designation */}
                  <div className="text-left hidden sm:flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-xs font-bold text-slate-900 tracking-tight block max-w-[150px] lg:max-w-[190px] truncate">
                        {displayOfficerName()}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                          profileTrayOpen ? 'rotate-180 text-blue-950' : ''
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-blue-900 block leading-tight mt-0.5 truncate max-w-[150px] lg:max-w-[190px]">
                      {displayDesignation()}
                    </span>
                  </div>

                  {/* Mobile-only Chevron */}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 sm:hidden transition-transform duration-200 ${
                      profileTrayOpen ? 'rotate-180 text-blue-950' : ''
                    }`}
                  />
                </button>

                {/* Profile Tray Dropdown */}
                {profileTrayOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 space-y-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                    role="menu"
                  >
                    <div className="pb-2.5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-950 to-indigo-900 text-white font-black text-sm flex items-center justify-center shadow-2xs">
                        {officerInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-950 text-sm truncate">
                          {displayOfficerName()}
                        </p>
                        <p className="text-[11px] font-semibold text-blue-900 truncate">
                          {user.email || user.username}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/settings"
                        onClick={() => setProfileTrayOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold transition cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>{t('nav.settings')}</span>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileTrayOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold transition cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* DPDPA Rights Modal Dialog */}
                <DpdpaRightsModal
                  isOpen={dpdpaModalOpen}
                  onClose={() => setDpdpaModalOpen(false)}
                  user={user}
                />
              </div>
            ) : (
              /* Unauthenticated: Show Clean Officer Login Action */
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/60 shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-950" />
                <span>{t('nav.officerLogin')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
