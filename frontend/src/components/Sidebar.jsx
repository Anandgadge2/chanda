'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Scale,
  FolderArchive,
  UploadCloud,
  FileSpreadsheet,
  BookOpen,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useFocusTrap } from '../hooks/useFocusTrap';

const navItems = [
  {
    href: '/dashboard',
    labelMr: 'महसूल डॅशबोर्ड',
    icon: LayoutDashboard,
  },
  {
    href: '/parcels',
    labelMr: 'भूखंड नोंदवही (७/१२)',
    icon: MapPin,
  },
  {
    href: '/cases',
    labelMr: 'शर्तभंग व सुनावणी प्रकरणे',
    icon: Scale,
  },
  {
    href: '/documents',
    labelMr: 'जिल्हा अभिलेखागार',
    icon: FolderArchive,
  },
  {
    href: '/bulk-upload',
    labelMr: 'गाव एक्सेल अपलोड',
    icon: UploadCloud,
  },
  {
    href: '/reports',
    labelMr: 'अहवाल व प्रपत्र जनरेशन',
    icon: FileSpreadsheet,
  },
  {
    href: '/glossary',
    labelMr: 'महसूल शब्दावली व संक्षिप्त रूपे',
    icon: BookOpen,
  },
  {
    href: '/settings',
    labelMr: 'खाते व सुरक्षा सेटिंग्ज',
    icon: Settings,
  },
];

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
  onToggleCollapse = () => {},
}) {
  const pathname = usePathname();
  const mobileTrapRef = useFocusTrap(mobileOpen);

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

  return (
    <>
      {/* Desktop Sidebar (Smooth fluid width with zero layout jitter) */}
      <aside
        className={clsx(
          'flex-shrink-0 hidden lg:block transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] will-change-[width] z-30 select-none',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="sticky top-20 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] space-y-2 p-2.5">
          {/* Header Row: Title & Collapse Toggle Button */}
          <div className="h-10 flex items-center mb-1">
            {collapsed ? (
              <div className="relative group w-10 h-10 mx-auto flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                  title="साइडबार विस्तृत करा (Expand Sidebar)"
                  className="w-10 h-10 rounded-xl text-slate-600 hover:text-blue-950 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Expand Sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4 text-blue-900" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap text-xs font-medium border border-slate-800 -translate-x-1 group-hover:translate-x-0">
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                  <span>साइडबार विस्तृत करा</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between px-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  मुख्य विभाग
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                  title="साइडबार संकुचित करा (Collapse Sidebar)"
                  className="w-8 h-8 rounded-lg text-slate-500 hover:text-blue-950 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'group relative flex items-center rounded-xl h-10 w-full px-2 transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-sm font-bold ring-1 ring-blue-700/40'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 font-semibold'
                  )}
                >
                  {/* Stable fixed icon box - identical position in both collapsed and expanded states */}
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <Icon
                      className={clsx(
                        'w-4 h-4 transition-transform duration-200 shrink-0',
                        isActive
                          ? 'text-amber-400 scale-110'
                          : 'text-slate-400 group-hover:text-blue-900 group-hover:scale-110'
                      )}
                    />
                  </div>

                  {/* Smooth Fluid Text Container (Always mounted, zero pop-in layout jitter) */}
                  <div
                    className={clsx(
                      'overflow-hidden whitespace-nowrap text-left transition-all duration-300 ease-out flex-1 min-w-0',
                      collapsed
                        ? 'max-w-0 opacity-0 pointer-events-none'
                        : 'max-w-[170px] opacity-100 ml-2.5'
                    )}
                  >
                    <p className="leading-tight text-sm font-bold truncate">{item.labelMr}</p>
                  </div>

                  {/* Active Indicator Arrow */}
                  <ChevronRight
                    className={clsx(
                      'w-3.5 h-3.5 transition-all duration-200 shrink-0',
                      collapsed
                        ? 'opacity-0 max-w-0 pointer-events-none'
                        : isActive
                        ? 'opacity-100 text-amber-400'
                        : 'opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0'
                    )}
                  />

                  {/* Floating Tooltip for Collapsed State */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap border border-slate-800 -translate-x-1 group-hover:translate-x-0">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                      <p className="text-xs font-bold text-white relative z-10 leading-tight">{item.labelMr}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-in-out',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          role="button"
          tabIndex={0}
          aria-label="मेनू बंद करा (Close menu)"
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 focus:outline-none"
          onClick={onCloseMobile}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onCloseMobile();
            }
          }}
        />

        {/* Drawer Panel */}
        <div
          ref={mobileTrapRef}
          role="dialog"
          aria-modal="true"
          aria-label="प्रशासकीय विभाग नेव्हिगेशन"
          className={clsx(
            'relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col p-4 space-y-4 border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">प्रशासकीय विभाग</span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="मेनू बंद करा (Close menu)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  aria-current={isActive ? 'page' : undefined}
                  className={clsx(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-950'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-4 h-4',
                        isActive ? 'text-amber-400' : 'text-slate-400'
                      )}
                    />
                    <div>
                      <p className="leading-tight text-sm font-bold">{item.labelMr}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              );
            })}
          </nav>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <p className="font-bold">MLRC १९६६ संनियंत्रण</p>
            <p className="text-[11px] text-amber-800 mt-0.5 font-medium">जिल्हाधिकारी कार्यालय, चंद्रपूर</p>
          </div>
        </div>
      </div>
    </>
  );
}
