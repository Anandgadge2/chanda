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
        'p-3.5 sm:p-4 bg-white border rounded-xl shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between relative overflow-hidden group',
        borderColor
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate leading-tight">
          {titleMr}
        </span>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105', badgeColor)}>
            <Icon className={clsx('w-4 h-4', iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap sm:flex-nowrap">
        <p className={clsx('text-2xl sm:text-3xl font-black tracking-tight leading-tight', textColor)}>
          {value}
        </p>
        {subtext && (
          <span className="text-xs text-slate-400 font-medium truncate leading-tight max-w-[160px]">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
