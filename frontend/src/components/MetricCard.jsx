'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Premium Executive Pastel Data Intelligence KPI Card
 * Soft pastel-tinted surfaces with crisp jewel accents, high-contrast typography,
 * compact vertical padding, and complete Marathi Devanagari numerals.
 */
const PASTEL_THEMES = {
  // Royal Sapphire Blue (Parcels / Inventory)
  blue: {
    bg: 'bg-[#F0F7FF]',
    border: 'border-[#BFDBFE]',
    accentBar: 'bg-[#2563EB]',
    badge: 'bg-[#DBEAFE] text-[#1E40AF]',
    iconBox: 'bg-white/95 border-[#BFDBFE] text-[#2563EB]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#1D4ED8] hover:border-[#BFDBFE]',
    activeRing: 'ring-2 ring-[#2563EB] border-[#2563EB]',
    activeText: 'text-[#2563EB]',
  },
  // Warm Saffron / Amber (Breaches & Statutory Inquiries)
  burntOrange: {
    bg: 'bg-[#FEF9EE]',
    border: 'border-[#FDE3B2]',
    accentBar: 'bg-[#D97706]',
    badge: 'bg-[#FEF3C7] text-[#92400E]',
    iconBox: 'bg-white/95 border-[#FDE3B2] text-[#D97706]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#92400E] hover:border-[#FDE3B2]',
    activeRing: 'ring-2 ring-[#D97706] border-[#D97706]',
    activeText: 'text-[#D97706]',
  },
  amber: {
    bg: 'bg-[#FEF9EE]',
    border: 'border-[#FDE3B2]',
    accentBar: 'bg-[#D97706]',
    badge: 'bg-[#FEF3C7] text-[#92400E]',
    iconBox: 'bg-white/95 border-[#FDE3B2] text-[#D97706]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#92400E] hover:border-[#FDE3B2]',
    activeRing: 'ring-2 ring-[#D97706] border-[#D97706]',
    activeText: 'text-[#D97706]',
  },
  orange: {
    bg: 'bg-[#FEF9EE]',
    border: 'border-[#FDE3B2]',
    accentBar: 'bg-[#D97706]',
    badge: 'bg-[#FEF3C7] text-[#92400E]',
    iconBox: 'bg-white/95 border-[#FDE3B2] text-[#D97706]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#92400E] hover:border-[#FDE3B2]',
    activeRing: 'ring-2 ring-[#D97706] border-[#D97706]',
    activeText: 'text-[#D97706]',
  },
  // Imperial Iris / Lavender (Geographic Reach / Covered Villages)
  purple: {
    bg: 'bg-[#F6F4FE]',
    border: 'border-[#E5DBFE]',
    accentBar: 'bg-[#7C3AED]',
    badge: 'bg-[#F3E8FF] text-[#6B21A8]',
    iconBox: 'bg-white/95 border-[#E5DBFE] text-[#7C3AED]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#6B21A8] hover:border-[#E5DBFE]',
    activeRing: 'ring-2 ring-[#7C3AED] border-[#7C3AED]',
    activeText: 'text-[#7C3AED]',
  },
  violet: {
    bg: 'bg-[#F6F4FE]',
    border: 'border-[#E5DBFE]',
    accentBar: 'bg-[#7C3AED]',
    badge: 'bg-[#F3E8FF] text-[#6B21A8]',
    iconBox: 'bg-white/95 border-[#E5DBFE] text-[#7C3AED]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#6B21A8] hover:border-[#E5DBFE]',
    activeRing: 'ring-2 ring-[#7C3AED] border-[#7C3AED]',
    activeText: 'text-[#7C3AED]',
  },
  // Mint / Vivid Emerald (Tenure Conversions Class 2 to 1)
  emerald: {
    bg: 'bg-[#EDFDF5]',
    border: 'border-[#BBF7D0]',
    accentBar: 'bg-[#059669]',
    badge: 'bg-[#DCFCE7] text-[#166534]',
    iconBox: 'bg-white/95 border-[#BBF7D0] text-[#059669]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#166534] hover:border-[#BBF7D0]',
    activeRing: 'ring-2 ring-[#059669] border-[#059669]',
    activeText: 'text-[#059669]',
  },
  green: {
    bg: 'bg-[#EDFDF5]',
    border: 'border-[#BBF7D0]',
    accentBar: 'bg-[#059669]',
    badge: 'bg-[#DCFCE7] text-[#166534]',
    iconBox: 'bg-white/95 border-[#BBF7D0] text-[#059669]',
    actionBtn: 'bg-white/95 border-slate-200 text-slate-400 hover:text-[#166534] hover:border-[#BBF7D0]',
    activeRing: 'ring-2 ring-[#059669] border-[#059669]',
    activeText: 'text-[#059669]',
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
  const theme = PASTEL_THEMES[variant] || PASTEL_THEMES.blue;

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
        'py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-xl border transition-all duration-200 flex flex-col justify-between select-none text-left relative overflow-hidden group shadow-[0_1px_3px_rgba(0,0,0,0.03)]',
        theme.bg,
        isActive
          ? theme.activeRing
          : `${theme.border} hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5`,
        isInteractive && 'cursor-pointer active:scale-[0.99] focus:outline-none'
      )}
    >
      {/* 2px Solid Top Accent Indicator */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-[2.5px] transition-opacity duration-200',
          theme.accentBar,
          isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
        )}
      />

      {/* Top Header: Title + Action Icon + Category Icon */}
      <div className="flex items-center justify-between gap-1.5 pt-0.5">
        <span className="text-xs sm:text-[13px] font-bold text-slate-800 tracking-tight leading-snug truncate">
          {displayTitle}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'नोंदवहीत उघडा' : 'Open')}
              className={clsx(
                'w-6 h-6 rounded-md border flex items-center justify-center transition-all shadow-2xs',
                theme.actionBtn
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div className={clsx('w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs', theme.iconBox)}>
              <Icon className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          )}
        </div>
      </div>

      {/* Center: Prominent, High-Contrast Metric Number */}
      <div className="mt-2 mb-2 sm:mt-2.5 sm:mb-2.5">
        <p className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-[#0F172A] leading-none">
          {value}
        </p>
      </div>

      {/* Bottom: Context Badge & Filter State */}
      <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-1 text-[11px]">
        {displaySubtext ? (
          <span className={clsx('px-2 py-0.5 rounded-md font-bold truncate text-[11px]', theme.badge)}>
            {displaySubtext}
          </span>
        ) : (
          <span />
        )}

        {isInteractive && (
          <span className={clsx('text-[11px] font-medium flex items-center gap-1 transition-colors', isActive ? theme.activeText : 'text-slate-400 group-hover:text-slate-700')}>
            {isActive ? (
              <>
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span className="font-extrabold">{isMarathi ? 'सक्रिय' : 'Active'}</span>
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
