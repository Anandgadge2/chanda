'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Premium Solid-Color KPI Metric Card
 * High-impact, rich solid hues with crisp white typography and frosted translucent accents.
 * Designed to look executive, high-tech, and distinctively modern.
 */
const KPI_VARIANTS = {
  blue: {
    bg: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    border: 'border-indigo-500/80',
    shadow: 'shadow-md shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30',
    activeRing: 'ring-2 ring-inset ring-white shadow-xl shadow-indigo-950/30',
    title: 'text-indigo-100 group-hover:text-white',
    value: 'text-white',
    subtext: 'text-indigo-200/90',
    badge: 'bg-white/15 text-white border-white/20 group-hover:bg-white/25',
    actionBtn: 'bg-white/15 text-white border-white/20 hover:bg-white hover:text-indigo-700',
    footer: 'border-indigo-500/60 text-indigo-100/90 group-hover:text-white',
    pulse: 'bg-white',
  },
  amber: {
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-700',
    border: 'border-amber-500/80',
    shadow: 'shadow-md shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30',
    activeRing: 'ring-2 ring-inset ring-white shadow-xl shadow-amber-950/30',
    title: 'text-amber-100 group-hover:text-white',
    value: 'text-white',
    subtext: 'text-amber-200/90',
    badge: 'bg-white/15 text-white border-white/20 group-hover:bg-white/25',
    actionBtn: 'bg-white/15 text-white border-white/20 hover:bg-white hover:text-amber-700',
    footer: 'border-amber-500/60 text-amber-100/90 group-hover:text-white',
    pulse: 'bg-white',
  },
  indigo: {
    bg: 'bg-violet-600',
    hoverBg: 'hover:bg-violet-700',
    border: 'border-violet-500/80',
    shadow: 'shadow-md shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30',
    activeRing: 'ring-2 ring-inset ring-white shadow-xl shadow-violet-950/30',
    title: 'text-violet-100 group-hover:text-white',
    value: 'text-white',
    subtext: 'text-violet-200/90',
    badge: 'bg-white/15 text-white border-white/20 group-hover:bg-white/25',
    actionBtn: 'bg-white/15 text-white border-white/20 hover:bg-white hover:text-violet-700',
    footer: 'border-violet-500/60 text-violet-100/90 group-hover:text-white',
    pulse: 'bg-white',
  },
  emerald: {
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    border: 'border-emerald-500/80',
    shadow: 'shadow-md shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30',
    activeRing: 'ring-2 ring-inset ring-white shadow-xl shadow-emerald-950/30',
    title: 'text-emerald-100 group-hover:text-white',
    value: 'text-white',
    subtext: 'text-emerald-200/90',
    badge: 'bg-white/15 text-white border-white/20 group-hover:bg-white/25',
    actionBtn: 'bg-white/15 text-white border-white/20 hover:bg-white hover:text-emerald-700',
    footer: 'border-emerald-500/60 text-emerald-100/90 group-hover:text-white',
    pulse: 'bg-white',
  },
  rose: {
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-700',
    border: 'border-rose-500/80',
    shadow: 'shadow-md shadow-rose-600/20 hover:shadow-xl hover:shadow-rose-600/30',
    activeRing: 'ring-2 ring-inset ring-white shadow-xl shadow-rose-950/30',
    title: 'text-rose-100 group-hover:text-white',
    value: 'text-white',
    subtext: 'text-rose-200/90',
    badge: 'bg-white/15 text-white border-white/20 group-hover:bg-white/25',
    actionBtn: 'bg-white/15 text-white border-white/20 hover:bg-white hover:text-rose-700',
    footer: 'border-rose-500/60 text-rose-100/90 group-hover:text-white',
    pulse: 'bg-white',
  },
  cyan: {
    bg: 'bg-sky-600',
    hoverBg: 'hover:bg-sky-700',
    border: 'border-sky-500/80',
    shadow: 'shadow-md shadow-sky-600/20 hover:shadow-xl hover:shadow-sky-600/30',
    activeRing: 'ring-2 ring-inset ring-white shadow-xl shadow-sky-950/30',
    title: 'text-sky-100 group-hover:text-white',
    value: 'text-white',
    subtext: 'text-sky-200/90',
    badge: 'bg-white/15 text-white border-white/20 group-hover:bg-white/25',
    actionBtn: 'bg-white/15 text-white border-white/20 hover:bg-white hover:text-sky-700',
    footer: 'border-sky-500/50 text-sky-100/90 group-hover:text-white',
    pulse: 'bg-white',
  },
  slate: {
    bg: 'bg-slate-900',
    hoverBg: 'hover:bg-slate-950',
    border: 'border-slate-800',
    shadow: 'shadow-md shadow-slate-950/20 hover:shadow-xl hover:shadow-slate-950/30',
    activeRing: 'ring-2 ring-inset ring-white shadow-xl shadow-slate-950/40',
    title: 'text-slate-300 group-hover:text-white',
    value: 'text-white',
    subtext: 'text-slate-400',
    badge: 'bg-white/10 text-white border-white/15 group-hover:bg-white/20',
    actionBtn: 'bg-white/10 text-white border-white/15 hover:bg-white hover:text-slate-900',
    footer: 'border-slate-800 text-slate-300 group-hover:text-white',
    pulse: 'bg-white',
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
  isActive = false,
  onClick,
  actionHref,
  actionTitleMr,
  actionTitleEn,
  compact = false,
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
        `group relative flex flex-col justify-between overflow-hidden rounded-2xl ${compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'} text-left select-none text-white border`,
        'transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none',
        theme.bg,
        theme.border,
        theme.shadow,
        theme.hoverBg,
        isActive ? theme.activeRing : '',
        isInteractive && 'cursor-pointer hover:-translate-y-1 active:scale-[0.985] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white'
      )}
    >
      {/* Subtle top specular sheen */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/25 pointer-events-none" />

      {/* Card Header: Label + Active Indicator or Action Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={clsx(
              'text-[11px] sm:text-xs font-semibold tracking-tight transition-colors line-clamp-1',
              theme.title
            )}
          >
            {displayTitle}
          </span>
          {isActive && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', theme.pulse)} />
              <span className={clsx('relative inline-flex rounded-full h-2 w-2', theme.pulse)} />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'नोंदवहीत उघडा' : 'Open in Register')}
              className={clsx(
                'w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200',
                'opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95',
                theme.actionBtn
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div
              className={clsx(
                'w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
                theme.badge
              )}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Card Body: Big Solid Value + Numerals */}
      <div className={`flex items-baseline justify-between gap-1.5 flex-wrap sm:flex-nowrap ${compact ? "mt-2 sm:mt-2.5" : "mt-3 sm:mt-3.5"}`}>
        <p className={`font-black tracking-tight font-mono tabular-nums leading-none text-white ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl font-extrabold"}`}>
          {value}
        </p>
        {displaySubtext && (
          <span
            className={clsx(
              'text-[10px] sm:text-[11px] font-medium truncate leading-tight transition-colors',
              theme.subtext
            )}
          >
            {displaySubtext}
          </span>
        )}
      </div>

      {/* Interactive Micro-Footer Strip */}
      {isInteractive && (
        <div
          className={clsx(
            'mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-medium transition-colors',
            theme.footer
          )}
        >
          <span className="truncate">
            {isActive
              ? (isMarathi ? '● फोकस सक्रिय (रीसेटसाठी क्लिक करा)' : '● Focus Active (Click to reset)')
              : (isMarathi ? 'डेटा पाहण्यासाठी क्लिक करा' : 'Click to view analytics')}
          </span>
          {actionHref && (
            <span className="font-semibold flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <span>{isMarathi ? 'नोंदवही' : 'Register'}</span>
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
