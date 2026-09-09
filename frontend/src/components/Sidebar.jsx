'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  MapPin,
  Scale,
  FolderArchive,
  UploadCloud,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  PanelLeftClose,
  X,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  {
    href: '/dashboard',
    labelMr: 'महसूल डॅशबोर्ड',
    labelEn: 'Officer Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/',
    labelMr: 'सार्वजनिक पोर्टल',
    labelEn: 'Public Landing Page',
    icon: Home,
  },
  {
    href: '/parcels',
    labelMr: 'भूखंड नोंदवही (७/१२)',
    labelEn: 'Land Parcels & 1950 Trace',
    icon: MapPin,
  },
  {
    href: '/cases',
    labelMr: 'शर्तभंग व सुनावणी प्रकरणे',
    labelEn: 'SDO Hearings & Cases',
    icon: Scale,
  },
  {
    href: '/documents',
    labelMr: 'जिल्हा अभिलेखागार',
    labelEn: 'Collectorate Record Room',
    icon: FolderArchive,
  },
  {
    href: '/bulk-upload',
    labelMr: 'गाव एक्सेल अपलोड',
    labelEn: 'Raw Excel Bulk Ingestion',
    icon: UploadCloud,
  },
  {
    href: '/reports',
    labelMr: 'प्रपत्र-३ वैधानिक अहवाल',
    labelEn: 'Prapatra-3 Statutory Export',
    icon: FileSpreadsheet,
  },
];

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
  onToggleCollapse = () => {},
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar (Silky Smooth Collapse & Expand Animation) */}
      <aside
        className={clsx(
          'flex-shrink-0 hidden lg:block transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width]',
          collapsed ? 'w-18' : 'w-64'
        )}
      >
        <div className="sticky top-20 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-3 transition-shadow hover:shadow-xs">
          {/* Header Row: Title & Smooth Rotate Collapse Toggle */}
          <div className="flex items-center justify-between px-2 py-1 min-h-[32px]">
            <span
              className={clsx(
                'text-[11px] font-bold text-slate-400 uppercase tracking-wider overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-100'
              )}
            >
              मुख्य विभाग
            </span>
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'साइडबार विस्तृत करा (Expand Sidebar)' : 'साइडबार संक्षिप्त करा (Collapse Sidebar)'}
              className={clsx(
                'p-1.5 rounded-lg text-slate-400 hover:text-blue-950 hover:bg-slate-100 transition-all flex items-center justify-center group',
                collapsed && 'mx-auto'
              )}
              aria-label="Toggle Sidebar Width"
            >
              <PanelLeftClose
                className={clsx(
                  'w-4 h-4 transition-transform duration-300 ease-in-out',
                  collapsed ? 'rotate-180 text-blue-900 scale-110' : 'group-hover:-translate-x-0.5'
                )}
              />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? `${item.labelMr} - ${item.labelEn}` : undefined}
                  className={clsx(
                    'group relative flex items-center rounded-xl transition-all duration-200 ease-in-out',
                    collapsed ? 'justify-center p-2.5 my-1' : 'px-3 py-2.5 justify-between',
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100/90 hover:text-blue-950'
                  )}
                >
                  <div className="flex items-center">
                    {/* Icon with Hover Scale */}
                    <Icon
                      className={clsx(
                        'w-4 h-4 transition-all duration-200 flex-shrink-0',
                        isActive
                          ? 'text-amber-400 scale-105'
                          : 'text-slate-400 group-hover:text-blue-900 group-hover:scale-110'
                      )}
                    />

                    {/* Smooth Fade & Slide-Fold Text Container */}
                    <div
                      className={clsx(
                        'overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap',
                        collapsed
                          ? 'max-w-0 opacity-0 -translate-x-2'
                          : 'max-w-[170px] opacity-100 translate-x-0 ml-3'
                      )}
                    >
                      <p className="leading-tight text-xs font-bold truncate">{item.labelMr}</p>
                      <p
                        className={clsx(
                          'text-[10px] truncate transition-colors',
                          isActive ? 'text-blue-200' : 'text-slate-500'
                        )}
                      >
                        {item.labelEn}
                      </p>
                    </div>
                  </div>

                  {/* Subtle Active Arrow Indicator */}
                  <div
                    className={clsx(
                      'overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0',
                      collapsed ? 'max-w-0 opacity-0' : 'max-w-[16px] opacity-100'
                    )}
                  >
                    <ChevronRight
                      className={clsx(
                        'w-3.5 h-3.5 transition-all duration-200',
                        isActive
                          ? 'opacity-100 text-amber-400 translate-x-0'
                          : 'opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0'
                      )}
                    />
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Collapsed Guide Tooltip Icon / Expanded Statutory Box */}
          <div
            className={clsx(
              'overflow-hidden transition-all duration-300 ease-in-out',
              collapsed
                ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none mt-0'
                : 'max-h-48 opacity-100 translate-y-0 pt-2 border-t border-slate-100'
            )}
          >
            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                <Layers className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>वैधानिक मार्गदर्शक</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ च्या कलम ३६, ३६अ व ५०-५४ अंतर्गत आदिवासी व शासकीय जमिनीचे संरक्षण.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Silky Smooth 60fps Hardware-Accelerated Sliding Animation) */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-in-out',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={onCloseMobile}
        />

        {/* Drawer Panel */}
        <div
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
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
              aria-label="Close menu"
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
                      <p className="leading-tight text-xs font-bold">{item.labelMr}</p>
                      <p className={clsx('text-[11px]', isActive ? 'text-blue-200' : 'text-slate-500')}>
                        {item.labelEn}
                      </p>
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
