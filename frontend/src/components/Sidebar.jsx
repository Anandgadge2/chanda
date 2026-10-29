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
          1. DESKTOP FLOATING PILL SIDEBAR (lg and up)
          - Sleek 58px slender capsule width (collapsed)
          - 240px card with rounded-[28px] (expanded)
          - overflow-visible when collapsed (zero scrollbars, floating tooltips)
          - overflow-hidden when expanded (zero horizontal scrollbars)
         ───────────────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-white border border-slate-200/90 shadow-sm transition-[width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] sticky top-[76px] self-start shrink-0 select-none z-40',
          collapsed
            ? 'w-[58px] py-3.5 px-1.5 rounded-[32px] items-center overflow-visible'
            : 'w-72 p-3.5 rounded-[28px] overflow-hidden'
        )}
        style={{
          height: collapsed ? 'auto' : 'fit-content',
          minHeight: collapsed ? '520px' : 'auto',
        }}
        aria-label={isMarathi ? 'मुख्य नेव्हिगेशन साइडबार' : 'Main Navigation Sidebar'}
      >
        <div className="flex flex-col h-full w-full justify-between items-center overflow-visible">
          {/* Top Toggle Button */}
          <div className="flex items-center justify-center shrink-0 mb-2.5 w-full overflow-visible">
            {collapsed ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-9 h-9 rounded-xl text-blue-900 hover:bg-slate-100/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group relative"
                aria-label={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
                title={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
              >
                <PanelLeftOpen className="w-[20px] h-[20px] text-blue-900 stroke-[2]" />
                {/* Floating Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0f172a] text-white rounded-xl shadow-xl z-[100] whitespace-nowrap text-xs font-bold border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0 drop-shadow-xl flex items-center">
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#0f172a] border-l border-b border-slate-800 rotate-45" />
                  <span>{isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}</span>
                </div>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                  {isMarathi ? 'मुख्य विभाग' : 'Main Modules'}
                </span>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                  title={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                >
                  <PanelLeftClose className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links (Zero overflow, zero scrollbar, pure floating layout) */}
          <nav
            className={clsx(
              'flex flex-col justify-center overflow-visible select-none',
              collapsed ? 'space-y-2.5 items-center w-full' : 'space-y-1 w-full flex-1'
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
                    'group relative flex items-center transition-all duration-150 select-none overflow-visible',
                    collapsed
                      ? 'w-[42px] h-[42px] rounded-[16px] justify-center'
                      : 'w-full px-3.5 py-2.5 rounded-2xl justify-start',
                    isActive
                      ? collapsed
                        ? 'bg-[#242b6b] text-amber-400 shadow-md ring-2 ring-blue-500/25'
                        : 'bg-[#242b6b] text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold'
                  )}
                >
                  {/* Icon */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-transform duration-150 shrink-0',
                        isActive
                          ? 'text-amber-400 stroke-[2.2]'
                          : 'text-slate-400 group-hover:text-slate-600 stroke-[1.9]'
                      )}
                    />
                  </div>

                  {/* Label (Expanded Mode) */}
                  {!collapsed && (
                    <>
                      <span
                        className={clsx(
                          'ml-3 text-[13px] font-bold tracking-tight whitespace-nowrap flex-1 leading-tight',
                          isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'
                        )}
                      >
                        {label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 ml-auto" />
                      )}
                    </>
                  )}

                  {/* Dark Floating Tooltip (Collapsed Mode) - Floating to the right with triangle pointer */}
                  {collapsed && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0f172a] text-white rounded-xl shadow-2xl z-[100] whitespace-nowrap text-xs font-bold border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0 drop-shadow-xl flex items-center"
                    >
                      {/* Left-pointing arrow caret */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#0f172a] border-l border-b border-slate-800 rotate-45" />
                      <span>{label}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Area: Slender Horizontal Capsule Track + Green Status Dot (Only in collapsed mode) */}
          {collapsed && (
            <div className="pt-3 mt-3 shrink-0 flex flex-col items-center justify-center w-full">
              <div className="w-6 h-1 bg-slate-200/90 rounded-full mb-2" />
              <div
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs"
                title={isMarathi ? '१५ तालुके संनियंत्रण सक्रिय' : '15 Talukas Active'}
              />
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
        className="lg:hidden fixed bottom-3 inset-x-3 max-w-[340px] mx-auto z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-xl shadow-slate-900/10 px-3 py-1.5 flex items-center justify-between"
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
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                isActive
                  ? 'bg-gradient-to-b from-[#1b2559] to-[#13193a] text-amber-400 shadow-md ring-2 ring-blue-500/25'
                  : 'text-slate-500 hover:text-blue-900 hover:bg-slate-100/60'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-amber-400 stroke-[2]' : 'text-slate-500 stroke-[1.8]')} />
            </Link>
          );
        })}

        {/* Menu Toggle Pill Button */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-900 hover:bg-slate-100 transition-all cursor-pointer"
          aria-label={isMarathi ? 'सर्व विभाग मेनू उघडा' : 'Open All Modules Menu'}
        >
          <Menu className="w-5 h-5" />
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
            'relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-4 rounded-r-3xl border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
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
