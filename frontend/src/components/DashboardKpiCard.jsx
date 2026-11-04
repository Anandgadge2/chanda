'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Solid-Colour Executive KPI Cards for Modern Enterprise Analytics Dashboard
 * Strict Colour Assignments:
 * - Registered Land Records: #4169E1 (Royal Blue)
 * - Encroachment & Pending Cases: #F59E0B (Orange)
 * - Included Revenue Villages: #7656D6 (Purple)
 * - Class 2 to Class 1 Conversion: #0D9488 (Teal)
 *
 * All backgrounds are 100% solid CSS colors. No gradients, no gradient overlays.
 * All card text, numbers, and icons are pure white for maximum visual contrast and legibility.
 */
const SOLID_PALETTES = {
  blue: {
    bg: '#4169E1',
    border: '#3454B4',
    badgeBg: 'bg-white/20 text-white border-white/30',
    iconBox: 'bg-white/15 text-white border-white/25',
    actionBtn: 'bg-white/20 hover:bg-white text-white hover:text-[#4169E1] border-white/30',
    ring: 'ring-4 ring-white/60 shadow-lg',
  },
  orange: {
    bg: '#F59E0B',
    border: '#D97706',
    badgeBg: 'bg-white/20 text-white border-white/30',
    iconBox: 'bg-white/15 text-white border-white/25',
    actionBtn: 'bg-white/20 hover:bg-white text-white hover:text-[#F59E0B] border-white/30',
    ring: 'ring-4 ring-white/60 shadow-lg',
  },
  purple: {
    bg: '#7656D6',
    border: '#5E3DBE',
    badgeBg: 'bg-white/20 text-white border-white/30',
    iconBox: 'bg-white/15 text-white border-white/25',
    actionBtn: 'bg-white/20 hover:bg-white text-white hover:text-[#7656D6] border-white/30',
    ring: 'ring-4 ring-white/60 shadow-lg',
  },
  teal: {
    bg: '#0D9488',
    border: '#0B756C',
    badgeBg: 'bg-white/20 text-white border-white/30',
    iconBox: 'bg-white/15 text-white border-white/25',
    actionBtn: 'bg-white/20 hover:bg-white text-white hover:text-[#0D9488] border-white/30',
    ring: 'ring-4 ring-white/60 shadow-lg',
  },
};

export default function DashboardKpiCard({
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
  const theme = SOLID_PALETTES[variant] || SOLID_PALETTES.blue;

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
      style={{ backgroundColor: theme.bg }}
      className={clsx(
        'p-5 sm:p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between relative select-none text-left shadow-md border',
        isActive ? theme.ring : 'border-transparent hover:shadow-xl hover:translate-y-[-2px]',
        isInteractive && 'cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-white'
      )}
    >
      {/* Card Header: Title + Badges + Action Buttons */}
      <div className="flex items-start justify-between gap-3 min-h-[2.5rem]">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-[19px] sm:text-[20px] lg:text-[22px] font-bold leading-snug line-clamp-2 text-white tracking-tight">
            {displayTitle}
          </span>
          {isActive && (
            <span
              className={clsx(
                'hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 border shadow-xs',
                theme.badgeBg
              )}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isMarathi ? 'सक्रिय' : 'Active'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'थेट नोंदवहीत उघडा' : 'Open in Register')}
              className={clsx(
                'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-150 border cursor-pointer active:scale-95 shadow-xs',
                theme.actionBtn
              )}
            >
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          )}

          {Icon && (
            <div
              className={clsx(
                'w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs',
                theme.iconBox
              )}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Number (40-46px, main visual focus) */}
      <div className="my-3 sm:my-4">
        <p className="text-[40px] sm:text-[44px] lg:text-[46px] font-black tracking-tight leading-none text-white font-mono drop-shadow-xs">
          {value}
        </p>
      </div>

      {/* Supporting Text (16-17px) */}
      {displaySubtext && (
        <div className="mb-2">
          <span className="text-white/95 text-[16px] sm:text-[17px] font-semibold leading-normal block truncate">
            {displaySubtext}
          </span>
        </div>
      )}

      {/* Interactive Footer Hint & Navigation Indicator (16-17px) */}
      {isInteractive && (
        <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[15px] sm:text-[16px] text-white/90">
          <span className="font-medium truncate pr-2">
            {isActive
              ? (isMarathi ? '● फोकस दृश्य सक्रिय (क्लिक करा)' : '● Focus Active (Click to reset)')
              : (isMarathi ? 'माहिती पाहण्यासाठी क्लिक करा' : 'Click to inspect analytics')}
          </span>
          {actionHref && (
            <span className="font-bold text-white hover:underline shrink-0 flex items-center gap-1">
              {isMarathi ? 'नोंदवही' : 'Register'} →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
