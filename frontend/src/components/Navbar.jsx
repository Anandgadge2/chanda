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
import DpdpaRightsModal from './DpdpaRightsModal';

export default function Navbar({
  sidebarCollapsed = false,
  onToggleSidebar = () => {},
  onToggleMobileSidebar = () => {},
  hideSidebarToggle = false,
}) {
  const { user, logout, openLoginModal } = useAuth();
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

  const cleanDesignation = (user?.designation || (user?.role === 'COLLECTOR' ? 'जिल्हाधिकारी' : user?.role) || 'महसूल अधिकारी')
    .replace(/\s*\([^)]*[a-zA-Z][^)]*\)/g, '')
    .trim();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
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
                    जिल्हाधिकारी कार्यालय, चंद्रपूर
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold bg-amber-100 text-amber-950 px-2 py-0.2 rounded-full border border-amber-300 flex-shrink-0 shadow-2xs">
                    MLRC १९६६
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate leading-tight">
                  जमीन महसूल व भूमी अभिलेख संनियंत्रण प्रणाली
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Public Portal Link & Executive Profile Tray */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200/90 text-slate-700 hover:text-blue-900 hover:bg-blue-50/60 transition shadow-2xs"
              title="सार्वजनिक पोर्टलवर जा"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">सार्वजनिक पोर्टल</span>
              <span className="md:hidden">पोर्टल</span>
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
                      {user.fullName ? user.fullName.charAt(0) : 'अ'}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full"
                      title="सत्र सक्रीय"
                    />
                  </div>

                  {/* Officer Name & Designation */}
                  <div className="text-left hidden sm:flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-xs font-bold text-slate-900 tracking-tight block max-w-[150px] lg:max-w-[190px] truncate">
                        {user.fullName || 'महसूल अधिकारी'}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                          profileTrayOpen ? 'rotate-180 text-blue-950' : ''
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-blue-900 block leading-tight mt-0.5 truncate max-w-[150px] lg:max-w-[190px]">
                      {cleanDesignation}
                    </span>
                  </div>

                  {/* Mobile-only Chevron */}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 sm:hidden transition-transform duration-200 ${
                      profileTrayOpen ? 'rotate-180 text-blue-950' : ''
                    }`}
                  />
                </button>

                {/* Clean, Standard, Minimalist Profile Dropdown */}
                {profileTrayOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-64 sm:w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
                    role="dialog"
                    aria-label="User Profile Details"
                  >
                    {/* Officer Identity Header */}
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="font-extrabold text-slate-900 truncate text-xs sm:text-sm">
                        {user.fullName || 'महसूल अधिकारी'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 select-all font-medium">
                        {user.email || 'collector.chandrapur@maharashtra.gov.in'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                          {cleanDesignation}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 ml-auto">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          सत्र सक्रिय
                        </span>
                      </div>
                    </div>

                    {/* Standard Action Links */}
                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setProfileTrayOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold transition cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>खाते व सुरक्षा सेटिंग्ज</span>
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
                        <span>लॉगआउट करा</span>
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
                <span>अधिकारी लॉगिन</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
