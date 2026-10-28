'use client';

import clsx from 'clsx';
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
}) {
  const { isMarathi } = useTranslation();
  const displayTitle = isMarathi ? titleMr : (titleEn || titleMr);
  const displaySubtext = isMarathi ? subtext : (subtextEn || subtext);

  return (
    <div
      className={clsx(
        'p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border rounded-xl sm:rounded-2xl shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group',
        borderColor
      )}
    >
      <div className="flex items-start justify-between gap-1.5 min-h-[1.75rem] sm:min-h-0">
        <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-2 leading-tight flex-1">
          {displayTitle}
        </span>
        {Icon && (
          <div className={clsx('w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105', badgeColor)}>
            <Icon className={clsx('w-3 h-3 sm:w-4 sm:h-4', iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-1.5 sm:mt-2.5 flex items-baseline justify-between gap-1 flex-wrap sm:flex-nowrap">
        <p className={clsx('text-lg sm:text-2xl font-black tracking-tight leading-tight font-mono', textColor)}>
          {value}
        </p>
        {displaySubtext && (
          <span className="text-[9.5px] sm:text-xs text-slate-400 font-medium truncate leading-tight max-w-full sm:max-w-[170px]">
            {displaySubtext}
          </span>
        )}
      </div>
    </div>
  );
}
