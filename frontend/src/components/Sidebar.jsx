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
  BookOpen,
  ChevronRight,
  PanelLeftClose,
  X,
} from 'lucide-react';
import clsx from 'clsx';

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
    labelMr: 'प्रपत्र-३ वैधानिक अहवाल',
    icon: FileSpreadsheet,
  },
  {
    href: '/glossary',
    labelMr: 'महसूल शब्दावली व संक्षिप्त रूपे',
    icon: BookOpen,
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
      {/* Desktop Sidebar (Smooth Collapse to 72px Icon Rail) */}
      <aside
        className={clsx(
          'flex-shrink-0 hidden lg:block transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] z-30',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div
          className={clsx(
            'sticky top-20 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 transition-all duration-300',
            collapsed ? 'p-2' : 'p-2.5'
          )}
        >
          {/* Header Row: Title & Collapse Toggle */}
          <div
            className={clsx(
              'flex items-center min-h-[36px] mb-1',
              collapsed ? 'justify-center px-0' : 'justify-between px-2 py-0.5'
            )}
          >
            {!collapsed && (
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                मुख्य विभाग
              </span>
            )}
            <div className="relative group">
              <button
                onClick={onToggleCollapse}
                title={collapsed ? 'साइडबार विस्तृत करा' : 'साइडबार संक्षिप्त करा'}
                className={clsx(
                  'rounded-xl text-slate-400 hover:text-blue-950 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer',
                  collapsed ? 'w-11 h-11 text-slate-600 hover:bg-slate-100' : 'p-1.5'
                )}
                aria-label="Toggle Sidebar Width"
              >
                <PanelLeftClose
                  className={clsx(
                    'w-4 h-4 transition-transform duration-300 ease-in-out',
                    collapsed ? 'rotate-180 text-blue-900 scale-110' : 'text-slate-500 group-hover:-translate-x-0.5'
                  )}
                />
              </button>
              {collapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap text-xs font-medium border border-slate-800 -translate-x-1 group-hover:translate-x-0">
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                  <span>साइडबार उघडा</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group relative flex items-center rounded-xl transition-all duration-200 ease-in-out',
                    collapsed
                      ? 'w-11 h-11 mx-auto justify-center p-0 my-1'
                      : 'px-3 py-2.5 justify-between w-full',
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100/90 hover:text-blue-950'
                  )}
                >
                  <div className={clsx('flex items-center min-w-0', collapsed && 'justify-center')}>
                    {/* Icon */}
                    <Icon
                      className={clsx(
                        'w-4 h-4 transition-all duration-200 flex-shrink-0',
                        isActive
                          ? 'text-amber-400 scale-105'
                          : 'text-slate-400 group-hover:text-blue-900 group-hover:scale-110'
                      )}
                    />

                    {/* Text Container (Expanded State) */}
                    {!collapsed && (
                      <div className="overflow-hidden whitespace-nowrap ml-3 text-left min-w-0">
                        <p className="leading-tight text-xs font-bold truncate">{item.labelMr}</p>
                        
                      </div>
                    )}
                  </div>

                  {/* Active Indicator Arrow (Expanded State) */}
                  {!collapsed && (
                    <ChevronRight
                      className={clsx(
                        'w-3.5 h-3.5 transition-all duration-200 flex-shrink-0',
                        isActive
                          ? 'opacity-100 text-amber-400 translate-x-0'
                          : 'opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0'
                      )}
                    />
                  )}

                  {/* Floating Tooltip for Collapsed State */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap border border-slate-800 -translate-x-1 group-hover:translate-x-0">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                      <p className="text-xs font-bold text-white relative z-10 leading-tight">{item.labelMr}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Statutory Guide (Collapses to Compact Icon with Tooltip) */}
          {collapsed ? (
            <div className="pt-2 border-t border-slate-100 flex justify-center">
              <div className="group relative w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center cursor-pointer hover:bg-amber-100 transition shadow-2xs">
                <Layers className="w-4 h-4 text-amber-700" />
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3.5 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 w-64 text-left border border-slate-800 -translate-x-1 group-hover:translate-x-0">
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1 relative z-10">
                    <Layers className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>वैधानिक मार्गदर्शक (MLRC)</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-normal relative z-10">
                    महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ च्या कलम ३६, ३६अ व ५०-५४ अंतर्गत आदिवासी व शासकीय जमिनीचे संरक्षण.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
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
          )}
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
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
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
