'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Enterprise Data Analytics KPI Card
 * Distinct solid, subtle background colors per category (Blue, Amber, Violet, Emerald, Neutral)
 * Minimalist, high information density, prominent metrics, zero redundant text.
 */
const KPI_THEMES = {
  blue: {
    bg: 'bg-[#F0F5FF]',
    hoverBg: 'hover:bg-[#E8F0FE]',
    border: 'border-[#D0E1FD]',
    activeBorder: 'border-[#2563EB] ring-2 ring-[#2563EB]/20',
    accent: 'bg-[#2563EB]',
    iconBg: 'bg-[#FFFFFF] text-[#2563EB] border-[#D0E1FD]',
    badgeBg: 'bg-[#DBEAFE] text-[#1E40AF]',
    valueColor: 'text-[#0F172A]',
    labelColor: 'text-[#334155]',
  },
  amber: {
    bg: 'bg-[#FFFBEB]',
    hoverBg: 'hover:bg-[#FEF3C7]',
    border: 'border-[#FDE68A]',
    activeBorder: 'border-[#D97706] ring-2 ring-[#D97706]/20',
    accent: 'bg-[#D97706]',
    iconBg: 'bg-[#FFFFFF] text-[#D97706] border-[#FDE68A]',
    badgeBg: 'bg-[#FEF3C7] text-[#92400E]',
    valueColor: 'text-[#0F172A]',
    labelColor: 'text-[#334155]',
  },
  orange: {
    bg: 'bg-[#FFFBEB]',
    hoverBg: 'hover:bg-[#FEF3C7]',
    border: 'border-[#FDE68A]',
    activeBorder: 'border-[#D97706] ring-2 ring-[#D97706]/20',
    accent: 'bg-[#D97706]',
    iconBg: 'bg-[#FFFFFF] text-[#D97706] border-[#FDE68A]',
    badgeBg: 'bg-[#FEF3C7] text-[#92400E]',
    valueColor: 'text-[#0F172A]',
    labelColor: 'text-[#334155]',
  },
  violet: {
    bg: 'bg-[#F5F3FF]',
    hoverBg: 'hover:bg-[#EDE9FE]',
    border: 'border-[#DDD6FE]',
    activeBorder: 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20',
    accent: 'bg-[#7C3AED]',
    iconBg: 'bg-[#FFFFFF] text-[#7C3AED] border-[#DDD6FE]',
    badgeBg: 'bg-[#EDE9FE] text-[#5B21B6]',
    valueColor: 'text-[#0F172A]',
    labelColor: 'text-[#334155]',
  },
  purple: {
    bg: 'bg-[#F5F3FF]',
    hoverBg: 'hover:bg-[#EDE9FE]',
    border: 'border-[#DDD6FE]',
    activeBorder: 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20',
    accent: 'bg-[#7C3AED]',
    iconBg: 'bg-[#FFFFFF] text-[#7C3AED] border-[#DDD6FE]',
    badgeBg: 'bg-[#EDE9FE] text-[#5B21B6]',
    valueColor: 'text-[#0F172A]',
    labelColor: 'text-[#334155]',
  },
  emerald: {
    bg: 'bg-[#ECFDF5]',
    hoverBg: 'hover:bg-[#D1FAE5]',
    border: 'border-[#A7F3D0]',
    activeBorder: 'border-[#059669] ring-2 ring-[#059669]/20',
    accent: 'bg-[#059669]',
    iconBg: 'bg-[#FFFFFF] text-[#059669] border-[#A7F3D0]',
    badgeBg: 'bg-[#D1FAE5] text-[#065F46]',
    valueColor: 'text-[#0F172A]',
    labelColor: 'text-[#334155]',
  },
  green: {
    bg: 'bg-[#ECFDF5]',
    hoverBg: 'hover:bg-[#D1FAE5]',
    border: 'border-[#A7F3D0]',
    activeBorder: 'border-[#059669] ring-2 ring-[#059669]/20',
    accent: 'bg-[#059669]',
    iconBg: 'bg-[#FFFFFF] text-[#059669] border-[#A7F3D0]',
    badgeBg: 'bg-[#D1FAE5] text-[#065F46]',
    valueColor: 'text-[#0F172A]',
    labelColor: 'text-[#334155]',
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
}) {
  const { isMarathi } = useTranslation();
  const theme = KPI_THEMES[variant] || KPI_THEMES.blue;

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
        'p-4 sm:p-5 rounded-xl border transition-all duration-150 flex flex-col justify-between select-none text-left relative overflow-hidden group',
        theme.bg,
        theme.hoverBg,
        isActive
          ? theme.activeBorder
          : clsx(theme.border, 'hover:border-slate-400/60 shadow-xs hover:shadow-sm'),
        isInteractive && 'cursor-pointer active:scale-[0.99] focus:outline-none'
      )}
    >
      {/* Top Bar Indicator for Active State */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-150',
          theme.accent,
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        )}
      />

      {/* Top Header: Title + Icon + Action */}
      <div className="flex items-center justify-between gap-2">
        <span className={clsx('text-xs sm:text-[13px] font-bold tracking-tight leading-snug truncate', theme.labelColor)}>
          {displayTitle}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'नोंदवहीत उघडा' : 'Open')}
              className="w-6 h-6 rounded-md bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center transition-all shadow-2xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div className={clsx('w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs', theme.iconBg)}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
            </div>
          )}
        </div>
      </div>

      {/* Center: Prominent Data Metric */}
      <div className="mt-3">
        <p className={clsx('text-2xl sm:text-3xl font-extrabold tracking-tight font-mono leading-none', theme.valueColor)}>
          {value}
        </p>
      </div>

      {/* Bottom: Crisp Context Badge & Filter State */}
      <div className="mt-3.5 pt-2 border-t border-black/5 flex items-center justify-between gap-1 text-[11px]">
        {displaySubtext ? (
          <span className={clsx('px-2 py-0.5 rounded-md font-semibold truncate', theme.badgeBg)}>
            {displaySubtext}
          </span>
        ) : (
          <span />
        )}

        {isInteractive && (
          <span className={clsx('text-[10px] font-bold flex items-center gap-1', isActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 group-hover:text-slate-800')}>
            {isActive ? (
              <>
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>{isMarathi ? 'फिल्टर सक्रिय' : 'Active'}</span>
              </>
            ) : (
              <span>{isMarathi ? 'फिल्टर' : 'Filter'}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
