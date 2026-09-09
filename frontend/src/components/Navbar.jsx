'use client';

import Link from 'next/link';
import {
  FileSpreadsheet,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react';
import ChandrapurDistrictLogo from './landing/ChandrapurDistrictLogo';

export default function Navbar({
  sidebarCollapsed = false,
  onToggleSidebar = () => {},
  onToggleMobileSidebar = () => {},
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-3">
          {/* Left: Sidebar Collapse/Open Button & Brand Emblem */}
          <div className="flex items-center gap-3">
            {/* Desktop Small Collapse / Open Button */}
            <button
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? 'साइडबार उघडा (Expand Sidebar)' : 'साइडबार संक्षिप्त करा (Collapse Sidebar)'}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-950 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs group"
              aria-label="Toggle Sidebar"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-900 group-hover:scale-110 transition-transform" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
              )}
            </button>

            {/* Mobile Drawer Menu Toggle Button */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Collectorate Office Title */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="transition-transform group-hover:scale-105 flex-shrink-0">
                <ChandrapurDistrictLogo className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-blue-950 transition">
                    जिल्हाधिकारी कार्यालय, चंद्रपूर
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    MLRC 1966
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  जमीन महसूल व भूमी अभिलेख संनियंत्रण प्रणाली (Collectorate Chandrapur)
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Quick Tools & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-950 hover:bg-slate-50 transition shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>सार्वजनिक पोर्टल</span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>महसूल सर्व्हर सक्रीय</span>
            </div>

            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">प्रपत्र-३ डाऊनलोड</span>
              <span className="sm:hidden">प्रपत्र-३</span>
            </Link>

            {/* Officer Profile Badge */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-indigo-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                अ
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">महसूल अधिकारी</p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">SDO / तहसीलदार</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
