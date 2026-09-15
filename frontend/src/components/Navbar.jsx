'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Menu,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Mail,
  MapPin,
  Scale,
  LayoutDashboard,
  FileSpreadsheet,
  BookOpen,
  Lock,
} from 'lucide-react';
import ChandrapurDistrictLogo from './landing/ChandrapurDistrictLogo';
import { useAuth } from './AuthContext';

export default function Navbar({
  sidebarCollapsed = false,
  onToggleSidebar = () => {},
  onToggleMobileSidebar = () => {},
  hideSidebarToggle = false,
}) {
  const { user, logout, openLoginModal } = useAuth();
  const [profileTrayOpen, setProfileTrayOpen] = useState(false);
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex justify-between h-14 sm:h-16 items-center gap-2 sm:gap-3">
          {/* Left: Brand Emblem & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!hideSidebarToggle && user && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-3 group min-w-0">
              <div className="transition-transform group-hover:scale-105 flex-shrink-0">
                <ChandrapurDistrictLogo className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-slate-900 text-xs sm:text-base tracking-tight group-hover:text-blue-950 transition truncate">
                    जिल्हाधिकारी कार्यालय, चंद्रपूर
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 flex-shrink-0">
                    MLRC 1966
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden md:block truncate">
                  जमीन महसूल व भूमी अभिलेख संनियंत्रण प्रणाली
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Public Link & Profile Tray */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-950 hover:bg-slate-50 transition shadow-2xs"
              title="जमीन महसूल शब्दावली व संक्षिप्त रूपे"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">महसूल शब्दावली</span>
              <span className="md:hidden">शब्दावली</span>
            </Link>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-950 hover:bg-slate-50 transition shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">सार्वजनिक पोर्टल</span>
              <span className="md:hidden">पोर्टल</span>
            </Link>

            {user ? (
              /* Authenticated Officer
 Profile Tray */
              <div className="relative" ref={trayRef}>
                <button
                  type="button"
                  onClick={() => setProfileTrayOpen((prev) => !prev)}
                  className={`flex items-center gap-2 sm:gap-2.5 py-1 px-1.5 sm:px-2.5 rounded-xl transition border text-left ${
                    profileTrayOpen
                      ? 'bg-blue-50/90 border-blue-200 ring-2 ring-blue-900/10'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                  aria-expanded={profileTrayOpen}
                  aria-haspopup="true"
                  aria-label="Officer Profile and Settings"
                >
                  {/* Officer Avatar with Online Status Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
                      {user.fullName ? user.fullName.charAt(0) : 'अ'}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                      title="सत्र सक्रीय"
                    />
                  </div>

                  {/* Officer Name & Designation - High contrast, legible, no clipping */}
                  <div className="text-left hidden sm:flex flex-col justify-center">
                    <div className="flex items-center gap-1 leading-normal">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight block max-w-[170px] lg:max-w-[220px] truncate">
                        {user.fullName || 'महसूल अधिकारी'}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                          profileTrayOpen ? 'rotate-180 text-blue-950' : ''
                        }`}
                      />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-900 block leading-normal mt-0.5 truncate max-w-[170px] lg:max-w-[220px]">
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

                {/* Profile Tray Dropdown Card */}
                {profileTrayOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-auto min-w-[360px] sm:min-w-[410px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                    role="dialog"
                    aria-label="User Profile Details"
                  >
                    {/* Header: Avatar, Full Name & Designation */}
                    <div className="p-4 bg-white border-b border-slate-100">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                            {user.fullName ? user.fullName.charAt(0) : 'अ'}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {user.fullName}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-bold text-blue-900 mt-0.5 leading-snug">
                            {cleanDesignation}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="select-all text-slate-700 tracking-tight break-all">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instant Logout Action */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileTrayOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition active:scale-98 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>लॉगआउट करा</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated: Show Clean Officer Login Action */
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/60 shadow-xs hover:shadow-md transition active:scale-95"
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
