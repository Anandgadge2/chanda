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
  borderColor = 'border-slate-200',
}) {
  return (
    <div
      className={clsx(
        'p-3 sm:p-3.5 bg-white border rounded-xl shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-150 flex flex-col justify-between',
        borderColor
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700 truncate leading-tight">
          {titleMr}
        </span>
        {Icon && (
          <div className={clsx('w-7 h-7 rounded-lg border flex items-center justify-center shrink-0', badgeColor)}>
            <Icon className={clsx('w-3.5 h-3.5', iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-1 flex-wrap sm:flex-nowrap">
        <p className={clsx('text-xl sm:text-2xl font-black tracking-tight leading-tight', textColor)}>
          {value}
        </p>
        {subtext && (
          <span className="text-[10px] text-slate-400 font-medium truncate leading-tight max-w-[140px]">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
