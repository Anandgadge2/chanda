'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Modern Enterprise Solid Dark KPI Card
 * Modern, dark solid colors (deep blue, burnt orange, dark purple, dark emerald).
 * Solid, opaque, NO gradients, NO glassmorphism, prominent font-mono numbers, natural concise Marathi.
 */
const SOLID_DARK_THEMES = {
  // Deep Blue
  blue: {
    cardBg: 'bg-[#0F172A]',
    hoverBg: 'hover:bg-[#1E293B]',
    border: 'border-[#334155]',
    activeRing: 'ring-2 ring-blue-400 border-blue-400',
    titleColor: 'text-[#94A3B8]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#1E293B] text-[#93C5FD] border border-[#334155]',
    iconBg: 'bg-[#1E293B] text-[#60A5FA] border border-[#334155]',
    accentColor: '#3B82F6',
  },
  // Dark Burnt Orange / Terracotta
  burntOrange: {
    cardBg: 'bg-[#7C2D12]',
    hoverBg: 'hover:bg-[#9A3412]',
    border: 'border-[#9A3412]',
    activeRing: 'ring-2 ring-amber-300 border-amber-300',
    titleColor: 'text-[#FED7AA]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#9A3412] text-[#FFEDD5] border border-[#C2410C]',
    iconBg: 'bg-[#9A3412] text-[#FDBA74] border border-[#C2410C]',
    accentColor: '#F97316',
  },
  amber: {
    cardBg: 'bg-[#7C2D12]',
    hoverBg: 'hover:bg-[#9A3412]',
    border: 'border-[#9A3412]',
    activeRing: 'ring-2 ring-amber-300 border-amber-300',
    titleColor: 'text-[#FED7AA]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#9A3412] text-[#FFEDD5] border border-[#C2410C]',
    iconBg: 'bg-[#9A3412] text-[#FDBA74] border border-[#C2410C]',
    accentColor: '#F97316',
  },
  orange: {
    cardBg: 'bg-[#7C2D12]',
    hoverBg: 'hover:bg-[#9A3412]',
    border: 'border-[#9A3412]',
    activeRing: 'ring-2 ring-amber-300 border-amber-300',
    titleColor: 'text-[#FED7AA]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#9A3412] text-[#FFEDD5] border border-[#C2410C]',
    iconBg: 'bg-[#9A3412] text-[#FDBA74] border border-[#C2410C]',
    accentColor: '#F97316',
  },
  // Dark Royal Purple / Violet
  purple: {
    cardBg: 'bg-[#4C1D95]',
    hoverBg: 'hover:bg-[#581C87]',
    border: 'border-[#6D28D9]',
    activeRing: 'ring-2 ring-purple-300 border-purple-300',
    titleColor: 'text-[#DDD6FE]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#581C87] text-[#EDE9FE] border border-[#7C3AED]',
    iconBg: 'bg-[#581C87] text-[#C4B5FD] border border-[#7C3AED]',
    accentColor: '#A855F7',
  },
  violet: {
    cardBg: 'bg-[#4C1D95]',
    hoverBg: 'hover:bg-[#581C87]',
    border: 'border-[#6D28D9]',
    activeRing: 'ring-2 ring-purple-300 border-purple-300',
    titleColor: 'text-[#DDD6FE]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#581C87] text-[#EDE9FE] border border-[#7C3AED]',
    iconBg: 'bg-[#581C87] text-[#C4B5FD] border border-[#7C3AED]',
    accentColor: '#A855F7',
  },
  // Dark Emerald
  emerald: {
    cardBg: 'bg-[#064E3B]',
    hoverBg: 'hover:bg-[#065F46]',
    border: 'border-[#047857]',
    activeRing: 'ring-2 ring-emerald-300 border-emerald-300',
    titleColor: 'text-[#A7F3D0]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#065F46] text-[#D1FAE5] border border-[#059669]',
    iconBg: 'bg-[#065F46] text-[#6EE7B7] border border-[#059669]',
    accentColor: '#10B981',
  },
  green: {
    cardBg: 'bg-[#064E3B]',
    hoverBg: 'hover:bg-[#065F46]',
    border: 'border-[#047857]',
    activeRing: 'ring-2 ring-emerald-300 border-emerald-300',
    titleColor: 'text-[#A7F3D0]',
    valueColor: 'text-[#FFFFFF]',
    badgeBg: 'bg-[#065F46] text-[#D1FAE5] border border-[#059669]',
    iconBg: 'bg-[#065F46] text-[#6EE7B7] border border-[#059669]',
    accentColor: '#10B981',
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
  const theme = SOLID_DARK_THEMES[variant] || SOLID_DARK_THEMES.blue;

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
        'py-3.5 px-4 sm:py-4 sm:px-5 rounded-xl border transition-all duration-150 flex flex-col justify-between select-none text-left relative overflow-hidden group shadow-sm',
        theme.cardBg,
        theme.hoverBg,
        isActive ? theme.activeRing : clsx(theme.border, 'hover:border-white/40'),
        isInteractive && 'cursor-pointer active:scale-[0.99] focus:outline-none'
      )}
    >
      {/* Top Header: Title + Action Icon + Category Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className={clsx('text-xs sm:text-[13px] font-bold tracking-tight leading-snug truncate', theme.titleColor)}>
          {displayTitle}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'नोंदवहीत उघडा' : 'Open')}
              className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', theme.iconBg)}>
              <Icon className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          )}
        </div>
      </div>

      {/* Center: Bold, Prominent Metric Number */}
      <div className="mt-2.5 sm:mt-3">
        <p className={clsx('text-2xl sm:text-3xl font-extrabold tracking-tight font-mono leading-none', theme.valueColor)}>
          {value}
        </p>
      </div>

      {/* Bottom: Context Sub-metric & Filter Badge */}
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-1 text-[11px]">
        {displaySubtext ? (
          <span className={clsx('px-2 py-0.5 rounded-md font-semibold font-mono truncate text-[11px]', theme.badgeBg)}>
            {displaySubtext}
          </span>
        ) : (
          <span />
        )}

        {isInteractive && (
          <span className="text-[10px] font-bold flex items-center gap-1 text-white/70 group-hover:text-white">
            {isActive ? (
              <>
                <Check className="w-3 h-3 stroke-[2.5] text-white" />
                <span className="text-white font-extrabold">{isMarathi ? 'सक्रिय' : 'Active'}</span>
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
