'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

export default function MetricCard({
  titleMr,
  titleEn,
  value,
  subtext,
  subtextEn,
  icon: Icon,
  badgeColor = 'bg-blue-50 text-blue-700 border-blue-200',
  textColor = 'text-slate-900',
  iconColor = 'text-blue-600',
  borderColor = 'border-slate-200/90',
  isActive = false,
  onClick,
  actionHref,
  actionTitleMr,
  actionTitleEn,
}) {
  const { isMarathi } = useTranslation();
  const displayTitle = isMarathi ? titleMr : (titleEn || titleMr);
  const displaySubtext = isMarathi ? subtext : (subtextEn || subtext);
  const displayActionTitle = isMarathi ? actionTitleMr : (actionTitleEn || actionTitleMr);

  const isInteractive = typeof onClick === 'function';

  const handleKeyDown = (e) => {
    if (!isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isActive : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={clsx(
        'p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group select-none text-left',
        isInteractive && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500',
        isActive
          ? 'ring-2 ring-blue-600 ring-offset-2 border-blue-500 bg-gradient-to-b from-blue-50/60 to-white shadow-md'
          : clsx('shadow-2xs hover:border-slate-300', borderColor)
      )}
    >
      {/* Top Accent Line when Active */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />
      )}

      {/* Card Header: Title + Icons */}
      <div className="flex items-start justify-between gap-1.5 min-h-[1.75rem] sm:min-h-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={clsx(
            'text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 transition-colors',
            isActive ? 'text-blue-950 font-black' : 'text-slate-700 group-hover:text-slate-900'
          )}>
            {displayTitle}
          </span>
          {isActive && (
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white shrink-0 shadow-2xs">
              <Check className="w-2.5 h-2.5" />
              <span>{isMarathi ? 'सक्रिय' : 'Active'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'थेट नोंदवहीत उघडा' : 'Open in Register')}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div className={clsx(
              'w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105',
              badgeColor,
              isActive && 'ring-2 ring-blue-400/50'
            )}>
              <Icon className={clsx('w-3 h-3 sm:w-4 sm:h-4', iconColor)} />
            </div>
          )}
        </div>
      </div>

      {/* Card Content: Big Value + Subtext */}
      <div className="mt-1.5 sm:mt-2.5 flex items-baseline justify-between gap-1 flex-wrap sm:flex-nowrap">
        <p className={clsx(
          'text-lg sm:text-2xl font-black tracking-tight leading-tight font-mono',
          isActive ? 'text-blue-700' : textColor
        )}>
          {value}
        </p>
        {displaySubtext && (
          <span className="text-[9.5px] sm:text-xs text-slate-400 font-medium truncate leading-tight max-w-full sm:max-w-[170px]">
            {displaySubtext}
          </span>
        )}
      </div>

      {/* Active state micro-indicator or interactive hint on hover */}
      {isInteractive && (
        <div className="mt-1 pt-1 border-t border-slate-100/80 flex items-center justify-between text-[9px] text-slate-400 group-hover:text-blue-600 transition-colors">
          <span>{isActive ? (isMarathi ? '● फोकस सक्रिय (क्लिक करून सर्व पहा)' : '● Focus Active (Click to show all)') : (isMarathi ? 'डेटा फिल्टर करण्यासाठी क्लिक करा' : 'Click to filter data')}</span>
          {actionHref && (
            <span className="font-semibold text-blue-600 group-hover:underline flex items-center">
              {isMarathi ? 'नोंदवही' : 'Register'} →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
