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
  PanelLeftOpen,
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
      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={clsx(
          'flex-shrink-0 hidden lg:block transition-all duration-300 ease-in-out',
          collapsed ? 'w-18' : 'w-64'
        )}
      >
        <div className="sticky top-20 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-4">
          <div>
            {!collapsed && (
              <div className="flex items-center justify-between px-3 py-1 mb-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  मुख्य विभाग (Navigation)
                </p>
                <button
                  onClick={onToggleCollapse}
                  title="साइडबार संक्षिप्त करा"
                  className="text-slate-400 hover:text-blue-900 transition p-1 rounded-lg hover:bg-slate-100"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? `${item.labelMr} (${item.labelEn})` : undefined}
                    className={clsx(
                      'group flex items-center rounded-xl font-medium transition-all',
                      collapsed
                        ? 'justify-center p-2.5 my-1'
                        : 'justify-between px-3 py-2.5 text-sm',
                      isActive
                        ? 'bg-blue-900 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-900'
                    )}
                  >
                    <div className={clsx('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
                      <Icon
                        className={clsx(
                          'w-4 h-4 transition-colors flex-shrink-0',
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-blue-900'
                        )}
                      />
                      {!collapsed && (
                        <div>
                          <p className="leading-tight text-xs font-semibold">{item.labelMr}</p>
                          <p className={clsx('text-[11px]', isActive ? 'text-blue-200' : 'text-slate-500')}>
                            {item.labelEn}
                          </p>
                        </div>
                      )}
                    </div>
                    {!collapsed && (
                      <ChevronRight
                        className={clsx(
                          'w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0',
                          isActive && 'opacity-100 text-amber-400'
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Collapsed Mode Expand Button */}
          {collapsed && (
            <div className="pt-2 border-t border-slate-100 flex justify-center">
              <button
                onClick={onToggleCollapse}
                title="साइडबार उघडा"
                className="p-2 rounded-xl text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Statutory Guide Box (Shown only when expanded) */}
          {!collapsed && (
            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                <Layers className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>वैधानिक मार्गदर्शक</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ च्या कलम ३६, ३६अ व ५०-५४ अंतर्गत आदिवासी व शासकीय जमिनीचे संरक्षण.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (When mobileOpen is true) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-72 bg-white h-full shadow-2xl flex flex-col p-4 space-y-4 border-r border-slate-200 overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">प्रशासकीय विभाग</span>
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
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-blue-900 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-900'
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
                        <p className="leading-tight text-xs font-semibold">{item.labelMr}</p>
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
              <p className="text-[11px] text-amber-800 mt-0.5">जिल्हाधिकारी कार्यालय, चंद्रपूर</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
