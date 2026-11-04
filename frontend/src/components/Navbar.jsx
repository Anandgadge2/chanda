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
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E9E7E1] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Sleek Enterprise Royal Blue Accent Line */}
      <div className="h-[2.5px] w-full bg-[#4169E1]" />

      <div className="w-full px-3.5 sm:px-6 lg:px-8">
        <div className="flex justify-between h-15 sm:h-16 items-center gap-3">
          {/* Left: Brand Emblem & District Title */}
          <div className="flex items-center gap-3 min-w-0">
            {!hideSidebarToggle && user && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#252B36] hover:bg-[#F3F2ED] transition cursor-pointer"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <div className="p-1 bg-[#FFFFFF] border border-[#E9E7E1] rounded-xl group-hover:border-[#4169E1] transition flex-shrink-0 shadow-2xs">
                <ChandrapurDistrictLogo className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="font-extrabold text-[#252B36] text-sm sm:text-base lg:text-lg tracking-tight group-hover:text-[#4169E1] transition truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
                    {t('portal.title')}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-bold bg-[#4169E1]/10 text-[#4169E1] px-2.5 py-0.5 rounded-full border border-[#4169E1]/20 flex-shrink-0">
                    {t('portal.mlrcBadge')}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] font-medium hidden md:block truncate leading-tight">
                  {t('portal.officialTagline')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Language Switcher, Public Portal Link & Executive Profile Tray */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Bilingual Switcher */}
            <div className="hidden sm:inline-flex items-center">
              <LanguageSwitcher variant="pill" />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 sm:py-2 rounded-xl border border-[#E9E7E1] text-[#252B36] hover:text-[#4169E1] hover:bg-[#F3F2ED] transition shadow-2xs"
              title={t('nav.publicPortal')}
            >
              <ExternalLink className="w-4 h-4 text-[#64748B]" />
              <span className="hidden md:inline">{t('nav.publicPortal')}</span>
            </Link>

            {user ? (
              /* Authenticated Officer Profile Trigger & Dropdown Tray */
              <div className="relative" ref={trayRef}>
                <button
                  type="button"
                  onClick={() => setProfileTrayOpen((prev) => !prev)}
                  className={`flex items-center gap-2.5 py-1.5 px-2 sm:px-3 rounded-xl transition border text-left cursor-pointer shadow-2xs ${
                    profileTrayOpen
                      ? 'bg-[#F3F2ED] border-[#E9E7E1]'
                      : 'bg-[#FFFFFF] hover:bg-[#F3F2ED] border-[#E9E7E1]'
                  }`}
                  aria-expanded={profileTrayOpen}
                  aria-haspopup="true"
                  aria-label="Officer Profile and Settings"
                >
                  {/* Officer Avatar with Online Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4169E1] text-[#FFFFFF] font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {officerInitial}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#16A34A] border-2 border-white rounded-full"
                      title={t('common.active')}
                    />
                  </div>

                  {/* Officer Name & Designation */}
                  <div className="text-left hidden sm:flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-sm font-bold text-[#252B36] tracking-tight block max-w-[160px] lg:max-w-[210px] truncate">
                        {displayOfficerName()}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                          profileTrayOpen ? 'rotate-180 text-[#4169E1]' : ''
                        }`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#4169E1] block leading-tight mt-0.5 truncate max-w-[160px] lg:max-w-[210px]">
                      {displayDesignation()}
                    </span>
                  </div>

                  {/* Mobile-only Chevron */}
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] sm:hidden transition-transform duration-200 ${
                      profileTrayOpen ? 'rotate-180 text-[#4169E1]' : ''
                    }`}
                  />
                </button>

                {/* Profile Tray Dropdown */}
                {profileTrayOpen && (
                  <div
                    className="absolute right-0 mt-2 w-76 sm:w-84 max-w-[calc(100vw-1.5rem)] bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E9E7E1] p-3.5 space-y-3 z-50 text-sm animate-in fade-in duration-150"
                    role="menu"
                  >
                    <div className="pb-3 border-b border-[#E9E7E1] flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#4169E1] text-[#FFFFFF] font-extrabold text-base flex items-center justify-center shadow-xs">
                        {officerInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#252B36] text-[15px] truncate">
                          {displayOfficerName()}
                        </p>
                        <p className="text-xs font-medium text-[#64748B] truncate mt-0.5">
                          {user.email || user.username}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/settings"
                        onClick={() => setProfileTrayOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#252B36] hover:text-[#4169E1] hover:bg-[#F3F2ED] font-semibold transition cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#64748B]" />
                        <span>{t('nav.settings')}</span>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1.5 border-t border-[#E9E7E1]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileTrayOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#DC2626] hover:bg-[#DC2626]/10 font-bold transition cursor-pointer text-left"
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
              /* Unauthenticated: Modern SaaS Officer Login Button */
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#4169E1] hover:bg-[#3454B4] transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>{t('nav.officerLogin')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
