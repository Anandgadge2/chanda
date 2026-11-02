'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Meaningful semantic light color variants for executive KPI cards:
 * - 'blue'   : Foundational inventory / Master records / Governance scale
 * - 'amber'  : Regulatory vigilance / Compliance inquiries / Actionable audits
 * - 'indigo' : Territorial coverage / Talukas & administrative jurisdiction
 * - 'emerald': Completed conversions / Regularization progress / Positive resolutions
 * - 'rose'   : Severe violations / Encroachments / Critical alerts
 */
const KPI_VARIANTS = {
  blue: {
    bg: 'bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-white/95',
    activeBg: 'bg-gradient-to-br from-sky-100/90 via-blue-50/70 to-white',
    border: 'border-sky-200/80 hover:border-sky-300',
    activeBorder: 'border-sky-500 ring-2 ring-sky-500/30 shadow-md',
    topBar: 'from-sky-500 via-blue-600 to-indigo-600',
    badge: 'bg-sky-100/80 text-sky-700 border-sky-200/90',
    title: 'text-slate-700 group-hover:text-sky-950',
    activeTitle: 'text-sky-950 font-black',
    value: 'text-slate-900',
    activeValue: 'text-sky-950',
    icon: 'text-sky-600',
    activeTag: 'bg-sky-600 text-white',
    subtext: 'text-slate-500',
    actionBtn: 'hover:bg-sky-600 hover:text-white hover:border-sky-600',
    footerHover: 'group-hover:text-sky-700',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white/95',
    activeBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-white',
    border: 'border-amber-200/80 hover:border-amber-300',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/30 shadow-md',
    topBar: 'from-amber-500 via-orange-500 to-amber-600',
    badge: 'bg-amber-100/80 text-amber-800 border-amber-200/90',
    title: 'text-slate-700 group-hover:text-amber-950',
    activeTitle: 'text-amber-950 font-black',
    value: 'text-amber-950',
    activeValue: 'text-amber-900',
    icon: 'text-amber-600',
    activeTag: 'bg-amber-600 text-white',
    subtext: 'text-amber-800/80',
    actionBtn: 'hover:bg-amber-600 hover:text-white hover:border-amber-600',
    footerHover: 'group-hover:text-amber-700',
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-50/90 via-violet-50/40 to-white/95',
    activeBg: 'bg-gradient-to-br from-indigo-100/90 via-violet-50/70 to-white',
    border: 'border-indigo-200/80 hover:border-indigo-300',
    activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-md',
    topBar: 'from-indigo-500 via-violet-600 to-purple-600',
    badge: 'bg-indigo-100/80 text-indigo-700 border-indigo-200/90',
    title: 'text-slate-700 group-hover:text-indigo-950',
    activeTitle: 'text-indigo-950 font-black',
    value: 'text-indigo-950',
    activeValue: 'text-indigo-900',
    icon: 'text-indigo-600',
    activeTag: 'bg-indigo-600 text-white',
    subtext: 'text-slate-500',
    actionBtn: 'hover:bg-indigo-600 hover:text-white hover:border-indigo-600',
    footerHover: 'group-hover:text-indigo-700',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white/95',
    activeBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-white',
    border: 'border-emerald-200/80 hover:border-emerald-300',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md',
    topBar: 'from-emerald-500 via-teal-500 to-emerald-600',
    badge: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/90',
    title: 'text-slate-700 group-hover:text-emerald-950',
    activeTitle: 'text-emerald-950 font-black',
    value: 'text-emerald-950',
    activeValue: 'text-emerald-900',
    icon: 'text-emerald-600',
    activeTag: 'bg-emerald-600 text-white',
    subtext: 'text-emerald-800/80',
    actionBtn: 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    footerHover: 'group-hover:text-emerald-700',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white/95',
    activeBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50/70 to-white',
    border: 'border-rose-200/80 hover:border-rose-300',
    activeBorder: 'border-rose-500 ring-2 ring-rose-500/30 shadow-md',
    topBar: 'from-rose-500 via-pink-500 to-rose-600',
    badge: 'bg-rose-100/80 text-rose-700 border-rose-200/90',
    title: 'text-slate-700 group-hover:text-rose-950',
    activeTitle: 'text-rose-950 font-black',
    value: 'text-rose-950',
    activeValue: 'text-rose-900',
    icon: 'text-rose-600',
    activeTag: 'bg-rose-600 text-white',
    subtext: 'text-rose-700/80',
    actionBtn: 'hover:bg-rose-600 hover:text-white hover:border-rose-600',
    footerHover: 'group-hover:text-rose-700',
  },
};

export default function MetricCard({
  variant = 'blue',
  titleMr,
  titleEn,
  value,
  subtext,
  subtextEn,
  icon: Icon,
  badgeColor,
  textColor,
  iconColor,
  borderColor,
  isActive = false,
  onClick,
  actionHref,
  actionTitleMr,
  actionTitleEn,
}) {
  const { isMarathi } = useTranslation();
  const theme = KPI_VARIANTS[variant] || KPI_VARIANTS.blue;

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
        'p-3 sm:p-4 border rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group select-none text-left backdrop-blur-sm',
        isActive
          ? clsx(theme.activeBg, theme.activeBorder)
          : clsx(theme.bg, borderColor || theme.border, 'shadow-2xs'),
        isInteractive && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500'
      )}
    >
      {/* Top Gradient Accent Stripe */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-opacity duration-200',
          theme.topBar,
          isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
        )}
      />

      {/* Card Header: Title + Icons */}
      <div className="flex items-start justify-between gap-1.5 min-h-[1.75rem] sm:min-h-0 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className={clsx(
              'text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 transition-colors',
              isActive ? theme.activeTitle : theme.title
            )}
          >
            {displayTitle}
          </span>
          {isActive && (
            <span
              className={clsx(
                'hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 shadow-2xs',
                theme.activeTag
              )}
            >
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
              className={clsx(
                'w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-slate-200/90 bg-white/90 text-slate-500 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs',
                theme.actionBtn
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div
              className={clsx(
                'w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105',
                badgeColor || theme.badge,
                isActive && 'ring-2 ring-current/25'
              )}
            >
              <Icon className={clsx('w-3 h-3 sm:w-4 sm:h-4', iconColor || theme.icon)} />
            </div>
          )}
        </div>
      </div>

      {/* Card Content: Big Value + Subtext */}
      <div className="mt-2 sm:mt-2.5 flex items-baseline justify-between gap-1 flex-wrap sm:flex-nowrap">
        <p
          className={clsx(
            'text-lg sm:text-2xl font-black tracking-tight leading-tight font-mono transition-colors',
            isActive ? theme.activeValue : (textColor || theme.value)
          )}
        >
          {value}
        </p>
        {displaySubtext && (
          <span
            className={clsx(
              'text-[9.5px] sm:text-xs font-medium truncate leading-tight max-w-full sm:max-w-[170px]',
              theme.subtext
            )}
          >
            {displaySubtext}
          </span>
        )}
      </div>

      {/* Active state micro-indicator or interactive hint on hover */}
      {isInteractive && (
        <div
          className={clsx(
            'mt-1.5 pt-1 border-t border-slate-200/50 flex items-center justify-between text-[9px] text-slate-400 transition-colors',
            theme.footerHover
          )}
        >
          <span>
            {isActive
              ? (isMarathi ? '● फोकस सक्रिय (क्लिक करून सर्व पहा)' : '● Focus Active (Click to show all)')
              : (isMarathi ? 'डेटा फिल्टर करण्यासाठी क्लिक करा' : 'Click to filter data')}
          </span>
          {actionHref && (
            <span className="font-semibold group-hover:underline flex items-center">
              {isMarathi ? 'नोंदवही' : 'Register'} →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
