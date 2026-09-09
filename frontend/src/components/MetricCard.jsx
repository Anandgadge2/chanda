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
        'p-3.5 sm:p-4 bg-white border rounded-xl shadow-2xs glass-card-hover transition-all duration-200 flex flex-col justify-between',
        borderColor
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 leading-tight">{titleMr}</p>
          <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{titleEn}</p>
        </div>
        {Icon && (
          <div className={clsx('p-2 rounded-lg border flex items-center justify-center flex-shrink-0', badgeColor)}>
            <Icon className={clsx('w-4 h-4', iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <p className={clsx('text-2xl sm:text-3xl font-black tracking-tight leading-none', textColor)}>
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium leading-none">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
