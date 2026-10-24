'use client';

import clsx from 'clsx';

export default function MetricCard({
  titleMr,
  titleEn,
  value,
  subtext,
  icon: Icon,
  badgeColor = 'bg-blue-50 text-blue-700 border-blue-200',
  textColor = 'text-slate-900',
  iconColor = 'text-blue-600',
  borderColor = 'border-slate-200/90',
}) {
  return (
    <div
      className={clsx(
        'p-4 sm:p-4.5 bg-white/95 backdrop-blur-md border rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group',
        borderColor
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate leading-tight">
          {titleMr}
        </span>
        {Icon && (
          <div className={clsx('w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105', badgeColor)}>
            <Icon className={clsx('w-4 h-4 sm:w-4.5 sm:h-4.5', iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-1.5 flex-wrap sm:flex-nowrap">
        <p className={clsx('text-2xl sm:text-3xl font-black tracking-tight leading-tight font-mono', textColor)}>
          {value}
        </p>
        {subtext && (
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate leading-tight max-w-[170px]">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
