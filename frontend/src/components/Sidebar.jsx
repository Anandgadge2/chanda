'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  MapPin,
  Scale,
  FolderArchive,
  UploadCloud,
  FileSpreadsheet,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import clsx from 'clsx';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useTranslation } from './LanguageContext';

export const navItems = [
  {
    href: '/dashboard',
    labelMr: 'महसूल डॅशबोर्ड',
    labelEn: 'Revenue Dashboard',
    icon: LayoutGrid,
  },
  {
    href: '/parcels',
    labelMr: 'भूखंड नोंदवही (७/१२)',
    labelEn: 'Land Parcel Register',
    icon: MapPin,
  },
  // {
  //   href: '/cases',
  //   labelMr: 'शर्तभंग व सुनावणी प्रकरणे',
  //   labelEn: 'Breach & Judicial Cases',
  //   icon: Scale,
  // },
  // {
  //   href: '/documents',
  //   labelMr: 'जिल्हा अभिलेखागार',
  //   labelEn: 'District Archives',
  //   icon: FolderArchive,
  // },
  {
    href: '/bulk-upload',
    labelMr: 'गाव एक्सेल अपलोड',
    labelEn: 'Village Excel Upload',
    icon: UploadCloud,
  },
  {
    href: '/reports',
    labelMr: 'अहवाल व प्रपत्र जनरेशन',
    labelEn: 'Reports & Prapatra',
    icon: FileSpreadsheet,
  },
  // {
  //   href: '/glossary',
  //   labelMr: 'महसूल शब्दावली व संक्षेप',
  //   labelEn: 'Revenue Glossary & Terms',
  //   icon: BookOpen,
  // },
  {
    href: '/settings',
    labelMr: 'खाते व सुरक्षा सेटिंग्ज',
    labelEn: 'Account & Security Settings',
    icon: Settings,
  },
];

export default function Sidebar({
  collapsed = true,
  mobileOpen = false,
  onCloseMobile = () => {},
  onToggleCollapse = () => {},
  onOpenMobile = () => {},
}) {
  const pathname = usePathname();
  const mobileTrapRef = useFocusTrap(mobileOpen);
  const { locale, setLocale, isMarathi } = useTranslation();

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  // Mobile quick nav items (Top 4 essentials + Menu button)
  const mobileQuickItems = [
    '/dashboard',
    '/parcels',
    '/cases',
    '/bulk-upload',
    '/reports',
  ]
    .map((href) => navItems.find((n) => n.href === href))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP FLOATING PILL DOCK (lg and up)
          - Sleek 56px symmetrical floating dock (collapsed)
          - 264px floating glass card (expanded)
          - Zero scrollbars, frosted backdrop blur, tactile shadow
          - Symmetrical vertical padding (no bottom dead space)
         ───────────────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/[0.03] transition-[width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] sticky top-[80px] self-start shrink-0 select-none z-40',
          collapsed
            ? 'w-[56px] py-2.5 px-1.5 rounded-[28px] items-center overflow-visible'
            : 'w-64 p-3 rounded-[24px] overflow-hidden'
        )}
        style={{
          height: 'fit-content',
        }}
        aria-label={isMarathi ? 'मुख्य नेव्हिगेशन साइडबार' : 'Main Navigation Sidebar'}
      >
        <div className="flex flex-col w-full items-center overflow-visible">
          {/* Top Toggle Button */}
          <div className="flex items-center justify-center shrink-0 mb-1.5 w-full overflow-visible">
            {collapsed ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 group relative"
                aria-label={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
                title={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
              >
                <PanelLeftOpen className="w-[19px] h-[19px] stroke-[1.8]" />
                {/* Floating Tooltip */}
                <div
                  role="tooltip"
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/95 backdrop-blur-sm text-slate-100 rounded-lg shadow-xl z-[100] whitespace-nowrap text-xs font-semibold border border-slate-800/80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-150 flex items-center"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900/95 border-l border-b border-slate-800/80 rotate-45" />
                  <span>{isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}</span>
                </div>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between px-1.5 pb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isMarathi ? 'मुख्य विभाग' : 'Main Modules'}
                </span>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                  title={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                >
                  <PanelLeftClose className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
          </div>

          {/* Micro Divider */}
          <div className={clsx('bg-slate-200/70 my-1 shrink-0', collapsed ? 'w-5 h-[1px]' : 'w-full h-[1px]')} />

          {/* Navigation Links (Zero overflow, zero scrollbar, pure floating dock) */}
          <nav
            className={clsx(
              'flex flex-col justify-center overflow-visible select-none my-1',
              collapsed ? 'space-y-1.5 items-center w-full' : 'space-y-1 w-full flex-1'
            )}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/');
              const label = isMarathi ? item.labelMr : item.labelEn;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'group relative flex items-center transition-all duration-200 select-none overflow-visible cursor-pointer',
                    collapsed
                      ? 'w-10 h-10 rounded-2xl justify-center active:scale-95'
                      : 'w-full px-3 py-2.5 rounded-2xl justify-start',
                    isActive
                      ? collapsed
                        ? 'bg-gradient-to-b from-[#1b2559] to-[#12193b] text-amber-300 shadow-[0_4px_14px_-2px_rgba(27,37,89,0.35)] ring-1 ring-white/20 scale-[1.02]'
                        : 'bg-gradient-to-r from-[#1b2559] to-[#13193a] text-white shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/75 font-medium'
                  )}
                >
                  {/* Icon */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className={clsx(
                        'w-[19px] h-[19px] transition-transform duration-200 shrink-0',
                        isActive
                          ? 'text-amber-300 stroke-[2.1]'
                          : 'text-slate-400 group-hover:text-slate-700 stroke-[1.8]'
                      )}
                    />
                  </div>

                  {/* Label (Expanded Mode) */}
                  {!collapsed && (
                    <>
                      <span
                        className={clsx(
                          'ml-3 text-[13px] tracking-tight whitespace-nowrap flex-1 leading-tight',
                          isActive ? 'text-white font-semibold' : 'text-slate-700 group-hover:text-slate-900 font-medium'
                        )}
                      >
                        {label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-amber-300 shrink-0 ml-auto" />
                      )}
                    </>
                  )}

                  {/* Dark Glass Floating Tooltip (Collapsed Mode) */}
                  {collapsed && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/95 backdrop-blur-sm text-slate-100 rounded-lg shadow-xl z-[100] whitespace-nowrap text-xs font-semibold border border-slate-800/80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-150 flex items-center"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900/95 border-l border-b border-slate-800/80 rotate-45" />
                      <span>{label}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Area: Status Indicator Pill */}
          {collapsed ? (
            <div className="mt-1 pt-1 shrink-0 flex flex-col items-center justify-center w-full">
              <div className="w-5 h-[1px] bg-slate-200/70 mb-1.5" />
              <div
                className="group relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-emerald-50/80 transition-colors cursor-help"
                aria-label={isMarathi ? '१५ तालुके संनियंत्रण सक्रिय' : '15 Talukas Active'}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-xs" />
                </span>

                {/* Status Tooltip */}
                <div
                  role="tooltip"
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/95 backdrop-blur-sm text-slate-100 rounded-lg shadow-xl z-[100] whitespace-nowrap text-xs font-medium border border-slate-800/80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-150 flex items-center"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900/95 border-l border-b border-slate-800/80 rotate-45" />
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {isMarathi ? '१५ तालुके संनियंत्रण सक्रिय' : '15 Talukas Active'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Expanded Mode Footer Status */
            <div className="w-full mt-3 pt-2.5 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-slate-800 leading-tight">
                    {isMarathi ? '१५ तालुके संनियंत्रण' : '15 Talukas Active'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isMarathi ? 'प्रणाली सक्रिय' : 'Live System'}
                  </span>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-xs" />
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE FLOATING QUICK-ACCESS DOCK (Phones & Tablets < lg)
          Sleek floating bottom pill dock with top modules + menu
         ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label={isMarathi ? 'मोबाईल जलद नेव्हिगेशन' : 'Mobile Quick Navigation'}
        className="lg:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-3 max-w-[340px] mx-auto z-40 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-3 py-1.5 flex items-center justify-between"
      >
        {mobileQuickItems.filter(Boolean).map((item) => {
          if (!item || !item.icon) return null;
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const label = isMarathi ? item.labelMr : item.labelEn;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              title={label}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95',
                isActive
                  ? 'bg-gradient-to-b from-[#1b2559] to-[#12193b] text-amber-300 shadow-[0_4px_12px_rgba(27,37,89,0.3)] scale-105'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100/70'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-amber-300 stroke-[2.1]' : 'text-slate-400 stroke-[1.8]')} />
            </Link>
          );
        })}

        {/* Menu Toggle Pill Button */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          aria-label={isMarathi ? 'सर्व विभाग मेनू उघडा' : 'Open All Modules Menu'}
          title={isMarathi ? 'सर्व विभाग मेनू उघडा' : 'Open All Modules Menu'}
        >
          <Menu className="w-5 h-5 stroke-[1.8]" />
        </button>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          3. MOBILE SLIDE-OVER DRAWER (Responsive & Dynamic)
          Full drawer featuring identical royal blue + amber branding
         ───────────────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'lg:hidden fixed inset-0 z-50 transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          ref={mobileTrapRef}
          role="dialog"
          aria-modal="true"
          aria-label={isMarathi ? 'प्रशासकीय विभाग नेव्हिगेशन' : 'Administrative Modules Navigation'}
          className={clsx(
            'relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] rounded-r-3xl border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#1b2559] to-[#13193a] text-amber-400 flex items-center justify-center shadow-xs">
                <LayoutGrid className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block leading-tight">
                  {isMarathi ? 'प्रशासकीय विभाग' : 'Administrative Modules'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {isMarathi ? 'चंद्रपूर महसूल प्रशासन' : 'Chandrapur Collectorate'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label={isMarathi ? 'मेनू बंद करा' : 'Close menu'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links in Mobile Drawer */}
          <nav className="space-y-1.5 flex-1 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const label = isMarathi ? item.labelMr : item.labelEn;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-bold transition-all',
                    isActive
                      ? 'bg-[#242b6b] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-5 h-5 shrink-0',
                        isActive ? 'text-amber-400 stroke-[2.2]' : 'text-slate-400 stroke-[1.9]'
                      )}
                    />
                    <span className="leading-tight text-[13px] font-bold">{label}</span>
                  </div>
                  <ChevronRight
                    className={clsx(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-amber-400 opacity-100' : 'text-slate-400 opacity-40'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Drawer Footer with Mobile Language Switcher */}
          <div className="mt-auto space-y-2 pt-2 border-t border-slate-100">
            {/* Mobile Language Switcher */}
            <div className="p-2.5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-700" />
                  <span>{isMarathi ? 'भाषा बदला / Language' : 'Change Language'}</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {isMarathi ? 'मराठी' : 'English'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocale('mr')}
                  className={clsx(
                    'py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95',
                    isMarathi
                      ? 'bg-blue-950 text-amber-400 border-blue-950 shadow-xs ring-1 ring-blue-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <span>मराठी (MR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={clsx(
                    'py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95',
                    !isMarathi
                      ? 'bg-blue-950 text-amber-400 border-blue-950 shadow-xs ring-1 ring-blue-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <span>English (EN)</span>
                </button>
              </div>
            </div>

            {/* Official Authority Micro Footer */}
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-slate-900 text-[11px]">{isMarathi ? 'MLRC १९६६ संनियंत्रण' : 'MLRC 1966 Monitoring'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {isMarathi
                  ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर • १५ तालुके'
                  : 'Collector Office, Chandrapur • 15 Talukas'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
