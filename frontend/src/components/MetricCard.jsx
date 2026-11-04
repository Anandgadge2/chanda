'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Modern enterprise SaaS KPI card color variants
 * Strategic multicolour palette: Blue (#4169E1), Purple (#7656D6), Teal (#0D9488), Orange (#F59E0B), Green (#16A34A), Pink (#E85D9E)
 */
const KPI_VARIANTS = {
  blue: {
    accent: 'bg-[#4169E1]',
    iconBox: 'bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20',
    activeTag: 'bg-[#4169E1] text-white',
    actionBtn: 'hover:bg-[#4169E1] hover:text-white hover:border-[#4169E1]',
    activeRing: 'border-[#4169E1] ring-2 ring-[#4169E1]/20',
    numberColor: 'text-[#252B36]',
  },
  purple: {
    accent: 'bg-[#7656D6]',
    iconBox: 'bg-[#7656D6]/10 text-[#7656D6] border-[#7656D6]/20',
    activeTag: 'bg-[#7656D6] text-white',
    actionBtn: 'hover:bg-[#7656D6] hover:text-white hover:border-[#7656D6]',
    activeRing: 'border-[#7656D6] ring-2 ring-[#7656D6]/20',
    numberColor: 'text-[#252B36]',
  },
  teal: {
    accent: 'bg-[#0D9488]',
    iconBox: 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20',
    activeTag: 'bg-[#0D9488] text-white',
    actionBtn: 'hover:bg-[#0D9488] hover:text-white hover:border-[#0D9488]',
    activeRing: 'border-[#0D9488] ring-2 ring-[#0D9488]/20',
    numberColor: 'text-[#252B36]',
  },
  orange: {
    accent: 'bg-[#F59E0B]',
    iconBox: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    activeTag: 'bg-[#F59E0B] text-white',
    actionBtn: 'hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B]',
    activeRing: 'border-[#F59E0B] ring-2 ring-[#F59E0B]/20',
    numberColor: 'text-[#252B36]',
  },
  amber: {
    accent: 'bg-[#F59E0B]',
    iconBox: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    activeTag: 'bg-[#F59E0B] text-white',
    actionBtn: 'hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B]',
    activeRing: 'border-[#F59E0B] ring-2 ring-[#F59E0B]/20',
    numberColor: 'text-[#252B36]',
  },
  green: {
    accent: 'bg-[#16A34A]',
    iconBox: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
    activeTag: 'bg-[#16A34A] text-white',
    actionBtn: 'hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A]',
    activeRing: 'border-[#16A34A] ring-2 ring-[#16A34A]/20',
    numberColor: 'text-[#252B36]',
  },
  emerald: {
    accent: 'bg-[#16A34A]',
    iconBox: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
    activeTag: 'bg-[#16A34A] text-white',
    actionBtn: 'hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A]',
    activeRing: 'border-[#16A34A] ring-2 ring-[#16A34A]/20',
    numberColor: 'text-[#252B36]',
  },
  pink: {
    accent: 'bg-[#E85D9E]',
    iconBox: 'bg-[#E85D9E]/10 text-[#E85D9E] border-[#E85D9E]/20',
    activeTag: 'bg-[#E85D9E] text-white',
    actionBtn: 'hover:bg-[#E85D9E] hover:text-white hover:border-[#E85D9E]',
    activeRing: 'border-[#E85D9E] ring-2 ring-[#E85D9E]/20',
    numberColor: 'text-[#252B36]',
  },
  rose: {
    accent: 'bg-[#E85D9E]',
    iconBox: 'bg-[#E85D9E]/10 text-[#E85D9E] border-[#E85D9E]/20',
    activeTag: 'bg-[#E85D9E] text-white',
    actionBtn: 'hover:bg-[#E85D9E] hover:text-white hover:border-[#E85D9E]',
    activeRing: 'border-[#E85D9E] ring-2 ring-[#E85D9E]/20',
    numberColor: 'text-[#252B36]',
  },
  indigo: {
    accent: 'bg-[#7656D6]',
    iconBox: 'bg-[#7656D6]/10 text-[#7656D6] border-[#7656D6]/20',
    activeTag: 'bg-[#7656D6] text-white',
    actionBtn: 'hover:bg-[#7656D6] hover:text-white hover:border-[#7656D6]',
    activeRing: 'border-[#7656D6] ring-2 ring-[#7656D6]/20',
    numberColor: 'text-[#252B36]',
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
        'p-4 sm:p-5 border rounded-2xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group select-none text-left bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.03)]',
        isActive
          ? theme.activeRing
          : clsx(borderColor || 'border-[#E9E7E1]', 'hover:border-[#CBD5E1] hover:shadow-md'),
        isInteractive && 'cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]'
      )}
    >
      {/* Top Accent Stripe */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-200',
          theme.accent,
          isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
        )}
      />

      {/* Card Header: Title + Icons */}
      <div className="flex items-start justify-between gap-2 min-h-[1.75rem] sm:min-h-0 pt-0.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={clsx(
              'text-[13px] sm:text-sm font-bold leading-snug line-clamp-2 transition-colors text-[#252B36]'
            )}
          >
            {displayTitle}
          </span>
          {isActive && (
            <span
              className={clsx(
                'hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 shadow-xs',
                theme.activeTag
              )}
            >
              <Check className="w-3 h-3" />
              <span>{isMarathi ? 'सक्रिय' : 'Active'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              onClick={(e) => e.stopPropagation()}
              title={displayActionTitle || (isMarathi ? 'थेट नोंदवहीत उघडा' : 'Open in Register')}
              className={clsx(
                'w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-[#E9E7E1] bg-[#FFFFFF] text-[#64748B] flex items-center justify-center transition-all duration-150 hover:bg-[#F3F2ED] active:scale-95',
                theme.actionBtn
              )}
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}

          {Icon && (
            <div
              className={clsx(
                'w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105',
                badgeColor || theme.iconBox
              )}
            >
              <Icon className={clsx('w-4 h-4 sm:w-4.5 sm:h-4.5', iconColor)} />
            </div>
          )}
        </div>
      </div>

      {/* Card Content: Value + Subtext */}
      <div className="mt-3.5 flex items-baseline justify-between gap-2 flex-wrap sm:flex-nowrap">
        <p
          className={clsx(
            'text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight font-mono',
            textColor || theme.numberColor
          )}
        >
          {value}
        </p>
        {displaySubtext && (
          <span className="text-xs sm:text-[13px] font-medium truncate leading-normal max-w-full sm:max-w-[180px] text-[#64748B]">
            {displaySubtext}
          </span>
        )}
      </div>

      {/* Active state hint / interactive indicator */}
      {isInteractive && (
        <div className="mt-3 pt-2.5 border-t border-[#E9E7E1] flex items-center justify-between text-[11px] text-[#64748B]">
          <span className="font-medium">
            {isActive
              ? (isMarathi ? '● फोकस सक्रिय (क्लिक करून सर्व पहा)' : '● Focus Active (Click to show all)')
              : (isMarathi ? 'डेटा फिल्टर करण्यासाठी क्लिक करा' : 'Click to filter data')}
          </span>
          {actionHref && (
            <span className="font-semibold text-[#4169E1] group-hover:underline flex items-center gap-0.5">
              {isMarathi ? 'नोंदवही' : 'Register'} →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
