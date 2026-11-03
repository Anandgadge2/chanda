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
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E8E4DA] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Sleek Royal Blue Top Accent */}
      <div className="h-[2px] w-full bg-[#4169E1]" />

      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex justify-between h-13 sm:h-14 items-center gap-2 sm:gap-3">
          {/* Left: Brand Emblem & District Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!hideSidebarToggle && user && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#252B36] hover:bg-[#F0EDE5] transition cursor-pointer"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="p-0.5 bg-[#FFFFFF] border border-[#E8E4DA] rounded-lg group-hover:border-[#4169E1] transition flex-shrink-0">
                <ChandrapurDistrictLogo className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="font-bold text-[#252B36] text-xs sm:text-sm lg:text-base tracking-tight group-hover:text-[#4169E1] transition truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
                    {t('portal.title')}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold bg-[#F0EDE5] text-[#252B36] px-2 py-0.5 rounded-md border border-[#E8E4DA] flex-shrink-0">
                    {t('portal.mlrcBadge')}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium hidden md:block truncate leading-tight">
                  {t('portal.officialTagline')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Language Switcher, Public Portal Link & Executive Profile Tray */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Bilingual Switcher */}
            <div className="hidden sm:inline-flex items-center">
              <LanguageSwitcher variant="pill" />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] text-[#252B36] hover:text-[#4169E1] hover:bg-[#F0EDE5] transition"
              title={t('nav.publicPortal')}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden md:inline">{t('nav.publicPortal')}</span>
            </Link>

            {user ? (
              /* Authenticated Officer Profile Trigger & Dropdown Tray */
              <div className="relative" ref={trayRef}>
                <button
                  type="button"
                  onClick={() => setProfileTrayOpen((prev) => !prev)}
                  className={`flex items-center gap-2 py-1 px-1.5 sm:px-2 rounded-xl transition border text-left cursor-pointer ${
                    profileTrayOpen
                      ? 'bg-[#F0EDE5] border-[#E8E4DA]'
                      : 'bg-[#FFFFFF] hover:bg-[#F0EDE5] border-[#E8E4DA]'
                  }`}
                  aria-expanded={profileTrayOpen}
                  aria-haspopup="true"
                  aria-label="Officer Profile and Settings"
                >
                  {/* Officer Avatar with Online Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4169E1] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                      {officerInitial}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#16A34A] border border-white rounded-full"
                      title={t('common.active')}
                    />
                  </div>

                  {/* Officer Name & Designation */}
                  <div className="text-left hidden sm:flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-xs font-bold text-[#252B36] tracking-tight block max-w-[150px] lg:max-w-[190px] truncate">
                        {displayOfficerName()}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${
                          profileTrayOpen ? 'rotate-180 text-[#4169E1]' : ''
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#4169E1] block leading-tight mt-0.5 truncate max-w-[150px] lg:max-w-[190px]">
                      {displayDesignation()}
                    </span>
                  </div>

                  {/* Mobile-only Chevron */}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#64748B] sm:hidden transition-transform duration-200 ${
                      profileTrayOpen ? 'rotate-180 text-[#4169E1]' : ''
                    }`}
                  />
                </button>

                {/* Profile Tray Dropdown */}
                {profileTrayOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-[#FFFFFF] rounded-xl shadow-lg border border-[#E8E4DA] p-3 space-y-3 z-50 text-xs animate-in fade-in duration-150"
                    role="menu"
                  >
                    <div className="pb-2.5 border-b border-[#E8E4DA] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#4169E1] text-[#FFFFFF] font-bold text-sm flex items-center justify-center">
                        {officerInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#252B36] text-sm truncate">
                          {displayOfficerName()}
                        </p>
                        <p className="text-[11px] font-medium text-[#64748B] truncate">
                          {user.email || user.username}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/settings"
                        onClick={() => setProfileTrayOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#252B36] hover:text-[#4169E1] hover:bg-[#F0EDE5] font-semibold transition cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#64748B]" />
                        <span>{t('nav.settings')}</span>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1 border-t border-[#E8E4DA]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileTrayOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#DC2626] hover:bg-[#DC2626]/10 font-bold transition cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-[#DC2626]" />
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
              /* Unauthenticated: Clean Royal Blue Officer Login Action */
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3454B4] transition active:scale-95 cursor-pointer shadow-xs"
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
