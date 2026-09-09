'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Scale,
  FolderArchive,
  UploadCloud,
  FileSpreadsheet,
  Layers,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  {
    href: '/',
    labelMr: 'डॅशबोर्ड',
    labelEn: 'Executive Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/parcels',
    labelMr: 'भूखंड नोंदवही (७/१२)',
    labelEn: 'Land Parcels & 360° Trace',
    icon: MapPin,
  },
  {
    href: '/cases',
    labelMr: 'शर्तभंग व सुनावणी प्रकरणे',
    labelEn: 'Forward Cases & Hearings',
    icon: Scale,
  },
  {
    href: '/documents',
    labelMr: 'अभिलेखागार (DMS Vault)',
    labelEn: 'Collectorate DMS Archive',
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-4">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            मुख्य विभाग (Navigation)
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-blue-900'
                      )}
                    />
                    <div>
                      <p className="leading-tight text-xs font-semibold">{item.labelMr}</p>
                      <p className={clsx('text-[11px]', isActive ? 'text-blue-200' : 'text-slate-500')}>
                        {item.labelEn}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={clsx(
                      'w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity',
                      isActive && 'opacity-100 text-amber-400'
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Regulatory Banner */}
        <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>वैधानिक मार्गदर्शक</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
            महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ च्या कलम ३६, ३६अ व ५०-५४ अंतर्गत आदिवासी व शासकीय जमिनीचे संरक्षण.
          </p>
        </div>
      </div>
    </aside>
  );
}
