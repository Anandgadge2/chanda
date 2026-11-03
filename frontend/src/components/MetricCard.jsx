'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Minimal, clean semantic styles for executive KPI cards (No gradients)
 */
const KPI_VARIANTS = {
  blue: {
    accent: 'bg-[#4169E1]',
    iconBox: 'bg-[#F0EDE5] text-[#4169E1] border-[#E8E4DA]',
    activeTag: 'bg-[#4169E1] text-white',
    actionBtn: 'hover:bg-[#4169E1] hover:text-white hover:border-[#4169E1]',
  },
  amber: {
    accent: 'bg-[#D97706]',
    iconBox: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20',
    activeTag: 'bg-[#D97706] text-white',
    actionBtn: 'hover:bg-[#D97706] hover:text-white hover:border-[#D97706]',
  },
  indigo: {
    accent: 'bg-[#4169E1]',
    iconBox: 'bg-[#F0EDE5] text-[#4169E1] border-[#E8E4DA]',
    activeTag: 'bg-[#4169E1] text-white',
    actionBtn: 'hover:bg-[#4169E1] hover:text-white hover:border-[#4169E1]',
  },
  emerald: {
    accent: 'bg-[#16A34A]',
    iconBox: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
    activeTag: 'bg-[#16A34A] text-white',
    actionBtn: 'hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A]',
  },
  rose: {
    accent: 'bg-[#DC2626]',
    iconBox: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
    activeTag: 'bg-[#DC2626] text-white',
    actionBtn: 'hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626]',
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
        'p-3.5 sm:p-4 border rounded-xl transition-all duration-150 flex flex-col justify-between relative overflow-hidden group select-none text-left bg-[#FFFFFF]',
        isActive
          ? 'border-[#4169E1] ring-1 ring-[#4169E1]'
          : clsx(borderColor || 'border-[#E8E4DA]', 'hover:border-[#cbd5e1]'),
        isInteractive && 'cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]'
      )}
    >
      {/* Top Accent Stripe */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-150',
          theme.accent,
          isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
        )}
      />

      {/* Card Header: Title + Icons */}
      <div className="flex items-start justify-between gap-1.5 min-h-[1.75rem] sm:min-h-0 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className={clsx(
              'text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 transition-colors',
              isActive ? 'text-[#252B36]' : 'text-[#252B36]'
            )}
          >
            {displayTitle}
          </span>
          {isActive && (
            <span
              className={clsx(
                'hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0',
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
                'w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-[#E8E4DA] bg-[#FFFFFF] text-[#64748B] flex items-center justify-center transition-all duration-150 hover:bg-[#F0EDE5] active:scale-95',
                theme.actionBtn
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {Icon && (
            <div
              className={clsx(
                'w-6 h-6 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform',
                badgeColor || theme.iconBox
              )}
            >
              <Icon className={clsx('w-3.5 h-3.5 sm:w-4 sm:h-4', iconColor)} />
            </div>
          )}
        </div>
      </div>

      {/* Card Content: Value + Subtext */}
      <div className="mt-2.5 flex items-baseline justify-between gap-1 flex-wrap sm:flex-nowrap">
        <p
          className={clsx(
            'text-lg sm:text-2xl font-bold tracking-tight leading-tight font-mono',
            textColor || 'text-[#252B36]'
          )}
        >
          {value}
        </p>
        {displaySubtext && (
          <span className="text-[10px] sm:text-xs font-medium truncate leading-tight max-w-full sm:max-w-[170px] text-[#64748B]">
            {displaySubtext}
          </span>
        )}
      </div>

      {/* Active state hint */}
      {isInteractive && (
        <div className="mt-2 pt-1.5 border-t border-[#E8E4DA] flex items-center justify-between text-[10px] text-[#64748B]">
          <span>
            {isActive
              ? (isMarathi ? '● फोकस सक्रिय (क्लिक करून सर्व पहा)' : '● Focus Active (Click to show all)')
              : (isMarathi ? 'डेटा फिल्टर करण्यासाठी क्लिक करा' : 'Click to filter data')}
          </span>
          {actionHref && (
            <span className="font-semibold text-[#4169E1] group-hover:underline flex items-center">
              {isMarathi ? 'नोंदवही' : 'Register'} →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
