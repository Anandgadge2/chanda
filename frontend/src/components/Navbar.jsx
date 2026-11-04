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
        return 'District Collector';
      }
      if (user.role === 'SDO' || user.fullName?.includes('उपविभागीय')) {
        return 'Sub-Divisional Officer';
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
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-slate-200/90 shadow-2xs">
      <div className="w-full px-3 sm:px-6">
        <div className="flex justify-between h-14 items-center gap-3">
          {/* Left: District Administration Brand Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
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

            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group min-w-0">
              <ChandrapurDistrictLogo className="w-8 h-8 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-blue-700 transition truncate">
                    {t('portal.title')}
                  </span>
                  <span className="hidden md:inline-block text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                    {t('portal.mlrcBadge')}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Language Switcher, Public Portal & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="hidden sm:inline-flex items-center">
              <LanguageSwitcher variant="pill" />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition"
              title={t('nav.publicPortal')}
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">{t('nav.publicPortal')}</span>
            </Link>

            {user ? (
              /* Officer Profile Trigger & Minimal Dropdown */
              <div className="relative" ref={trayRef}>
                <button
                  type="button"
                  onClick={() => setProfileTrayOpen((prev) => !prev)}
                  className={`flex items-center gap-2 py-1 px-2 rounded-lg transition border text-left cursor-pointer ${
                    profileTrayOpen
                      ? 'bg-slate-100 border-slate-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                  aria-expanded={profileTrayOpen}
                  aria-haspopup="true"
                  aria-label="Officer Profile"
                >
                  <div className="w-7 h-7 rounded-md bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {officerInitial}
                  </div>

                  <div className="text-left hidden sm:flex flex-col justify-center min-w-0">
                    <span className="text-xs font-bold text-slate-900 leading-tight block max-w-[140px] truncate">
                      {displayOfficerName()}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 leading-none truncate max-w-[140px]">
                      {displayDesignation()}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                      profileTrayOpen ? 'rotate-180 text-blue-700' : ''
                    }`}
                  />
                </button>

                {/* Profile Tray Dropdown */}
                {profileTrayOpen && (
                  <div
                    className="absolute right-0 mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-lg border border-slate-200 p-2.5 space-y-2 z-50 text-xs animate-in fade-in duration-100"
                    role="menu"
                  >
                    <div className="pb-2 border-b border-slate-100 px-1">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {displayOfficerName()}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user.email || user.username}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/settings"
                        onClick={() => setProfileTrayOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium transition cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t('nav.settings')}</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileTrayOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-semibold transition cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}

                <DpdpaRightsModal
                  isOpen={dpdpaModalOpen}
                  onClose={() => setDpdpaModalOpen(false)}
                  user={user}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>{t('nav.officerLogin')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
