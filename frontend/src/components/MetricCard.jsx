'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Premium Enterprise Data Intelligence KPI Card
 * Clean luminous white architecture with distinct jewel-tone identity,
 * 3.5px solid colored top indicator, tinted capsule icons, high-contrast typography.
 */
const PREMIUM_THEMES = {
  // Royal Sapphire Blue (Parcels / Inventory)
  blue: {
    accentBar: 'bg-[#2563EB]',
    badge: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    iconBox: 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]',
    actionHover: 'hover:bg-[#EFF6FF] hover:text-[#1D4ED8] hover:border-[#BFDBFE]',
    activeRing: 'ring-2 ring-[#2563EB]/30 border-[#2563EB]',
    activeTag: 'text-[#2563EB]',
  },
  // Warm Amber / Saffron (Breaches & Inquiries)
  burntOrange: {
    accentBar: 'bg-[#EA580C]',
    badge: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]',
    iconBox: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    actionHover: 'hover:bg-[#FFF7ED] hover:text-[#C2410C] hover:border-[#FED7AA]',
    activeRing: 'ring-2 ring-[#EA580C]/30 border-[#EA580C]',
    activeTag: 'text-[#EA580C]',
  },
  amber: {
    accentBar: 'bg-[#EA580C]',
    badge: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]',
    iconBox: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    actionHover: 'hover:bg-[#FFF7ED] hover:text-[#C2410C] hover:border-[#FED7AA]',
    activeRing: 'ring-2 ring-[#EA580C]/30 border-[#EA580C]',
    activeTag: 'text-[#EA580C]',
  },
  orange: {
    accentBar: 'bg-[#EA580C]',
    badge: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]',
    iconBox: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    actionHover: 'hover:bg-[#FFF7ED] hover:text-[#C2410C] hover:border-[#FED7AA]',
    activeRing: 'ring-2 ring-[#EA580C]/30 border-[#EA580C]',
    activeTag: 'text-[#EA580C]',
  },
  // Royal Iris / Amethyst (Geographic Reach / Villages)
  purple: {
    accentBar: 'bg-[#7C3AED]',
    badge: 'bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]',
    iconBox: 'bg-[#F5F3FF] text-[#7C3AED] border border-[#EDE9FE]',
    actionHover: 'hover:bg-[#F5F3FF] hover:text-[#6D28D9] hover:border-[#DDD6FE]',
    activeRing: 'ring-2 ring-[#7C3AED]/30 border-[#7C3AED]',
    activeTag: 'text-[#7C3AED]',
  },
  violet: {
    accentBar: 'bg-[#7C3AED]',
    badge: 'bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]',
    iconBox: 'bg-[#F5F3FF] text-[#7C3AED] border border-[#EDE9FE]',
    actionHover: 'hover:bg-[#F5F3FF] hover:text-[#6D28D9] hover:border-[#DDD6FE]',
    activeRing: 'ring-2 ring-[#7C3AED]/30 border-[#7C3AED]',
    activeTag: 'text-[#7C3AED]',
  },
  // Deep Vivid Emerald (Conversions / Asset Upgrades)
  emerald: {
    accentBar: 'bg-[#059669]',
    badge: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    iconBox: 'bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5]',
    actionHover: 'hover:bg-[#ECFDF5] hover:text-[#047857] hover:border-[#A7F3D0]',
    activeRing: 'ring-2 ring-[#059669]/30 border-[#059669]',
    activeTag: 'text-[#059669]',
  },
  green: {
    accentBar: 'bg-[#059669]',
    badge: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    iconBox: 'bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5]',
    actionHover: 'hover:bg-[#ECFDF5] hover:text-[#047857] hover:border-[#A7F3D0]',
    activeRing: 'ring-2 ring-[#059669]/30 border-[#059669]',
    activeTag: 'text-[#059669]',
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
  const theme = PREMIUM_THEMES[variant] || PREMIUM_THEMES.blue;

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
        'py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between select-none text-left relative overflow-hidden group bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] font-sans',
        isActive
          ? theme.activeRing
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm',
        isInteractive && 'cursor-pointer active:scale-[0.99] focus:outline-none'
      )}
    >
      {/* 3px Solid Top Accent Indicator */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-200',
          theme.accentBar,
          isActive ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
        )}
      />

      {/* Top Header: Title + Action Icon + Category Icon */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[13.5px] font-semibold text-[#334155] tracking-tight leading-[1.4] truncate">
          {displayTitle}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'नोंदवहीत उघडा' : 'Open')}
              className={clsx(
                'w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-400 flex items-center justify-center transition-all shadow-2xs',
                theme.actionHover
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div className={clsx('w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg flex items-center justify-center shrink-0 shadow-2xs', theme.iconBox)}>
              <Icon className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          )}
        </div>
      </div>

      {/* Center: Prominent, High-Contrast Metric Number */}
      <div className="mt-1 sm:mt-1.5">
        <p className="text-[22px] sm:text-[24px] font-bold tracking-tight font-mono text-[#0F172A] leading-tight tabular-nums">
          {value}
        </p>
      </div>

      {/* Bottom: Context Badge & Filter State */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5 text-[12px] leading-[1.4]">
        {displaySubtext ? (
          <span className={clsx('px-2 py-0.5 rounded font-semibold font-mono truncate text-[12px] leading-[1.4] shadow-2xs', theme.badge)}>
            {displaySubtext}
          </span>
        ) : (
          <span />
        )}

        {isInteractive && (
          <span className={clsx('text-[12px] font-bold flex items-center gap-1 transition-colors leading-[1.4]', isActive ? theme.activeTag : 'text-slate-400 group-hover:text-slate-700')}>
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
