'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  MapPin,
  UploadCloud,
  FileSpreadsheet,
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

  // Mobile quick nav items
  const mobileQuickItems = [
    '/dashboard',
    '/parcels',
    '/bulk-upload',
    '/reports',
  ]
    .map((href) => navItems.find((n) => n.href === href))
    .filter(Boolean);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP DOCK (lg and up)
          - Clean modern enterprise dock, sleek borders
         ───────────────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-[#FFFFFF] border border-slate-200/90 shadow-2xs transition-[width,padding] duration-200 sticky top-[68px] self-start shrink-0 select-none z-40',
          collapsed
            ? 'w-[54px] py-2.5 px-1 rounded-xl items-center overflow-visible'
            : 'w-64 p-3 rounded-xl overflow-hidden'
        )}
        style={{
          height: 'fit-content',
        }}
        aria-label={isMarathi ? 'मुख्य नेव्हिगेशन साइडबार' : 'Main Navigation Sidebar'}
      >
        <div className="flex flex-col w-full items-center overflow-visible">
          {/* Top Toggle Button */}
          <div className="flex items-center justify-center shrink-0 mb-1 w-full overflow-visible">
            {collapsed ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 group relative"
                aria-label={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
                title={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
              >
                <PanelLeftOpen className="w-4.5 h-4.5" />
                {/* Floating Tooltip */}
                <div
                  role="tooltip"
                  className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white rounded-md shadow-md z-[100] whitespace-nowrap text-xs font-semibold opacity-0 pointer-events-none group-hover:opacity-100 transition-all flex items-center"
                >
                  <span>{isMarathi ? 'विस्तृत करा' : 'Expand'}</span>
                </div>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between px-1.5 pb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isMarathi ? 'विभाग' : 'Navigation'}
                </span>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer"
                  aria-label={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                  title={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                >
                  <PanelLeftClose className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
          </div>

          {/* Micro Divider */}
          <div className={clsx('bg-slate-100 my-1 shrink-0', collapsed ? 'w-5 h-[1px]' : 'w-full h-[1px]')} />

          {/* Navigation Links */}
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
                    'group relative flex items-center transition-all select-none overflow-visible cursor-pointer',
                    collapsed
                      ? 'w-9 h-9 rounded-lg justify-center active:scale-95'
                      : 'w-full px-3 py-2 rounded-lg justify-start',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                  )}
                >
                  {/* Icon */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className={clsx(
                        'w-4.5 h-4.5 shrink-0 transition-colors',
                        isActive ? 'text-blue-700 stroke-[2.2]' : 'text-slate-500 group-hover:text-slate-900 stroke-[1.8]'
                      )}
                    />
                  </div>

                  {/* Label (Expanded Mode) */}
                  {!collapsed && (
                    <>
                      <span className="ml-2.5 text-xs sm:text-[13px] tracking-tight whitespace-nowrap flex-1 truncate">
                        {label}
                      </span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-auto" />
                      )}
                    </>
                  )}

                  {/* Tooltip (Collapsed Mode) */}
                  {collapsed && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white rounded-md shadow-md z-[100] whitespace-nowrap text-xs font-semibold opacity-0 pointer-events-none group-hover:opacity-100 transition-all flex items-center"
                    >
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
              <div className="w-5 h-[1px] bg-slate-100 mb-1.5" />
              <div
                className="group relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors cursor-help"
                aria-label={isMarathi ? '१५ तालुके संनियंत्रण' : '15 Talukas Active'}
              >
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>

                {/* Status Tooltip */}
                <div
                  role="tooltip"
                  className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white rounded-md shadow-md z-[100] whitespace-nowrap text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-all flex items-center"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {isMarathi ? '१५ तालुके सक्रिय' : '15 Talukas Active'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Expanded Mode Footer Status */
            <div className="w-full mt-2 pt-2 border-t border-slate-100">
              <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  {isMarathi ? '१५ तालुके संनियंत्रण' : '15 Talukas Active'}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE FLOATING QUICK-ACCESS DOCK (< lg)
         ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label={isMarathi ? 'मोबाईल जलद नेव्हिगेशन' : 'Mobile Quick Navigation'}
        className="lg:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-3 max-w-[340px] mx-auto z-40 bg-[#FFFFFF] border border-[#E9E7E1] rounded-full shadow-md px-3 py-1.5 flex items-center justify-between"
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
                  ? 'bg-[#4169E1] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#252B36] hover:bg-[#F3F2ED]'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-white stroke-[2.2]' : 'text-[#64748B] stroke-[1.8]')} />
            </Link>
          );
        })}

        {/* Menu Toggle Pill Button */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#252B36] hover:bg-[#F3F2ED] active:scale-95 transition-all cursor-pointer"
          aria-label={isMarathi ? 'सर्व विभाग मेनू उघडा' : 'Open All Modules Menu'}
          title={isMarathi ? 'सर्व विभाग मेनू उघडा' : 'Open All Modules Menu'}
        >
          <Menu className="w-5 h-5 stroke-[1.8]" />
        </button>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          3. MOBILE SLIDE-OVER DRAWER
         ───────────────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'lg:hidden fixed inset-0 z-50 transition-opacity duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#252B36]/50 transition-opacity"
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
            'relative w-80 max-w-[85vw] bg-[#FFFFFF] h-full shadow-xl flex flex-col p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] rounded-r-2xl border-r border-[#E9E7E1] overflow-y-auto transform transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E9E7E1]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4169E1] text-white flex items-center justify-center shadow-xs">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-[#252B36] text-[15px] block leading-tight">
                  {isMarathi ? 'प्रशासकीय विभाग' : 'Administrative Modules'}
                </span>
                <span className="text-xs text-[#64748B] font-medium">
                  {isMarathi ? 'चंद्रपूर महसूल प्रशासन' : 'Chandrapur Collectorate'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#252B36] hover:bg-[#F3F2ED] transition cursor-pointer"
              aria-label={isMarathi ? 'मेनू बंद करा' : 'Close menu'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links in Mobile Drawer */}
          <nav className="space-y-1.5 flex-1 py-3.5">
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
                    'flex items-center justify-between px-3.5 py-3 rounded-xl text-[15px] sm:text-base font-semibold transition-all',
                    isActive
                      ? 'bg-[#4169E1] text-white shadow-sm'
                      : 'text-[#252B36] hover:bg-[#F3F2ED]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-5 h-5 shrink-0',
                        isActive ? 'text-white stroke-[2.2]' : 'text-[#64748B] stroke-[1.8]'
                      )}
                    />
                    <span className="leading-snug text-[15px] sm:text-base font-semibold">{label}</span>
                  </div>
                  <ChevronRight
                    className={clsx(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-white' : 'text-[#64748B] opacity-50'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Drawer Footer with Mobile Language Switcher */}
          <div className="mt-auto space-y-2.5 pt-3 border-t border-[#E9E7E1]">
            {/* Mobile Language Switcher */}
            <div className="p-3 bg-[#F8F7F3] border border-[#E9E7E1] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#252B36] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#4169E1]" />
                  <span>{isMarathi ? 'भाषा बदला / Language' : 'Change Language'}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#252B36] border border-[#E9E7E1]">
                  {isMarathi ? 'मराठी' : 'English'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocale('mr')}
                  className={clsx(
                    'py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95',
                    isMarathi
                      ? 'bg-[#4169E1] text-white border-[#4169E1]'
                      : 'bg-[#FFFFFF] text-[#252B36] border-[#E9E7E1] hover:bg-[#F3F2ED]'
                  )}
                >
                  <span>मराठी (MR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={clsx(
                    'py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95',
                    !isMarathi
                      ? 'bg-[#4169E1] text-white border-[#4169E1]'
                      : 'bg-[#FFFFFF] text-[#252B36] border-[#E9E7E1] hover:bg-[#F3F2ED]'
                  )}
                >
                  <span>English (EN)</span>
                </button>
              </div>
            </div>

            {/* Official Authority Micro Footer */}
            <div className="p-3 bg-[#F8F7F3] border border-[#E9E7E1] rounded-xl text-xs text-[#64748B]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-[#252B36] text-xs">{isMarathi ? 'MLRC १९६६ संनियंत्रण' : 'MLRC 1966 Monitoring'}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              </div>
              <p className="text-[11px] text-[#64748B]">
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
