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
          - Solid White (#FFFFFF), Warm Grey border (#E8E4DA)
          - Royal Blue (#4169E1) active states
         ───────────────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-[#FFFFFF] border border-[#E8E4DA] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-[width,padding] duration-200 sticky top-[76px] self-start shrink-0 select-none z-40',
          collapsed
            ? 'w-[56px] py-2.5 px-1.5 rounded-2xl items-center overflow-visible'
            : 'w-64 p-3 rounded-2xl overflow-hidden'
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
                className="w-10 h-10 rounded-xl text-[#64748B] hover:text-[#252B36] hover:bg-[#F0EDE5] transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-[#E8E4DA] focus:outline-none focus:ring-2 focus:ring-[#4169E1]/30 group relative"
                aria-label={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
                title={isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}
              >
                <PanelLeftOpen className="w-[18px] h-[18px]" />
                {/* Floating Tooltip */}
                <div
                  role="tooltip"
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#252B36] text-white rounded-md shadow-md z-[100] whitespace-nowrap text-xs font-semibold border border-[#252B36] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-150 flex items-center"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#252B36] rotate-45" />
                  <span>{isMarathi ? 'साइडबार विस्तृत करा' : 'Expand Sidebar'}</span>
                </div>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between px-1.5 pb-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  {isMarathi ? 'मुख्य विभाग' : 'Main Modules'}
                </span>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-7 h-7 rounded-lg text-[#64748B] hover:text-[#252B36] hover:bg-[#F0EDE5] transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-[#E8E4DA] focus:outline-none focus:ring-2 focus:ring-[#4169E1]/30"
                  aria-label={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                  title={isMarathi ? 'साइडबार संकुचित करा' : 'Collapse Sidebar'}
                >
                  <PanelLeftClose className="w-4 h-4 text-[#64748B]" />
                </button>
              </div>
            )}
          </div>

          {/* Micro Divider */}
          <div className={clsx('bg-[#E8E4DA] my-1 shrink-0', collapsed ? 'w-5 h-[1px]' : 'w-full h-[1px]')} />

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
                      ? 'w-10 h-10 rounded-xl justify-center active:scale-95'
                      : 'w-full px-3 py-2 rounded-xl justify-start',
                    isActive
                      ? 'bg-[#4169E1] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#252B36] hover:bg-[#F0EDE5]'
                  )}
                >
                  {/* Icon */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className={clsx(
                        'w-[18px] h-[18px] shrink-0',
                        isActive ? 'text-white stroke-[2.2]' : 'text-[#64748B] group-hover:text-[#252B36] stroke-[1.8]'
                      )}
                    />
                  </div>

                  {/* Label (Expanded Mode) */}
                  {!collapsed && (
                    <>
                      <span
                        className={clsx(
                          'ml-3 text-[13px] tracking-tight whitespace-nowrap flex-1 leading-tight',
                          isActive ? 'text-white font-semibold' : 'text-[#252B36] font-medium'
                        )}
                      >
                        {label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/80 shrink-0 ml-auto" />
                      )}
                    </>
                  )}

                  {/* Tooltip (Collapsed Mode) */}
                  {collapsed && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#252B36] text-white rounded-md shadow-md z-[100] whitespace-nowrap text-xs font-semibold border border-[#252B36] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-150 flex items-center"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#252B36] rotate-45" />
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
              <div className="w-5 h-[1px] bg-[#E8E4DA] mb-1.5" />
              <div
                className="group relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#F0EDE5] transition-colors cursor-help"
                aria-label={isMarathi ? '१५ तालुके संनियंत्रण सक्रिय' : '15 Talukas Active'}
              >
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                </span>

                {/* Status Tooltip */}
                <div
                  role="tooltip"
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#252B36] text-white rounded-md shadow-md z-[100] whitespace-nowrap text-xs font-medium border border-[#252B36] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-150 flex items-center"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#252B36] rotate-45" />
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
                    {isMarathi ? '१५ तालुके संनियंत्रण सक्रिय' : '15 Talukas Active'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Expanded Mode Footer Status */
            <div className="w-full mt-3 pt-2.5 border-t border-[#E8E4DA]">
              <div className="p-2.5 bg-[#F8F6F0] border border-[#E8E4DA] rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-[#252B36] leading-tight">
                    {isMarathi ? '१५ तालुके संनियंत्रण' : '15 Talukas Active'}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    {isMarathi ? 'प्रणाली सक्रिय' : 'Live System'}
                  </span>
                </div>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
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
        className="lg:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-3 max-w-[340px] mx-auto z-40 bg-[#FFFFFF] border border-[#E8E4DA] rounded-full shadow-md px-3 py-1.5 flex items-center justify-between"
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
                  ? 'bg-[#4169E1] text-white'
                  : 'text-[#64748B] hover:text-[#252B36] hover:bg-[#F0EDE5]'
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
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#252B36] hover:bg-[#F0EDE5] active:scale-95 transition-all cursor-pointer"
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
            'relative w-72 max-w-[85vw] bg-[#FFFFFF] h-full shadow-xl flex flex-col p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] rounded-r-2xl border-r border-[#E8E4DA] overflow-y-auto transform transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E4DA]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#4169E1] text-white flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-[#252B36] text-sm block leading-tight">
                  {isMarathi ? 'प्रशासकीय विभाग' : 'Administrative Modules'}
                </span>
                <span className="text-[10px] text-[#64748B] font-medium">
                  {isMarathi ? 'चंद्रपूर महसूल प्रशासन' : 'Chandrapur Collectorate'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#252B36] hover:bg-[#F0EDE5] transition cursor-pointer"
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
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all',
                    isActive
                      ? 'bg-[#4169E1] text-white shadow-xs'
                      : 'text-[#252B36] hover:bg-[#F0EDE5]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-5 h-5 shrink-0',
                        isActive ? 'text-white stroke-[2.2]' : 'text-[#64748B] stroke-[1.8]'
                      )}
                    />
                    <span className="leading-tight text-[13px] font-semibold">{label}</span>
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
          <div className="mt-auto space-y-2 pt-2 border-t border-[#E8E4DA]">
            {/* Mobile Language Switcher */}
            <div className="p-2.5 bg-[#F8F6F0] border border-[#E8E4DA] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#252B36] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#4169E1]" />
                  <span>{isMarathi ? 'भाषा बदला / Language' : 'Change Language'}</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#252B36] border border-[#E8E4DA]">
                  {isMarathi ? 'मराठी' : 'English'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocale('mr')}
                  className={clsx(
                    'py-2 px-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95',
                    isMarathi
                      ? 'bg-[#4169E1] text-white border-[#4169E1]'
                      : 'bg-[#FFFFFF] text-[#252B36] border-[#E8E4DA] hover:bg-[#F0EDE5]'
                  )}
                >
                  <span>मराठी (MR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={clsx(
                    'py-2 px-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95',
                    !isMarathi
                      ? 'bg-[#4169E1] text-white border-[#4169E1]'
                      : 'bg-[#FFFFFF] text-[#252B36] border-[#E8E4DA] hover:bg-[#F0EDE5]'
                  )}
                >
                  <span>English (EN)</span>
                </button>
              </div>
            </div>

            {/* Official Authority Micro Footer */}
            <div className="p-2.5 bg-[#F8F6F0] border border-[#E8E4DA] rounded-xl text-xs text-[#64748B]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-[#252B36] text-[11px]">{isMarathi ? 'MLRC १९६६ संनियंत्रण' : 'MLRC 1966 Monitoring'}</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              </div>
              <p className="text-[10px] text-[#64748B]">
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
