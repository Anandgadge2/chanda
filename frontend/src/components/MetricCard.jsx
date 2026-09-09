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
        'p-5 bg-white border rounded-xl shadow-sm glass-card-hover transition-all duration-200 flex flex-col justify-between',
        borderColor
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{titleMr}</p>
          <p className="text-[11px] text-slate-400 font-medium">{titleEn}</p>
        </div>
        {Icon && (
          <div className={clsx('p-2.5 rounded-lg border flex items-center justify-center', badgeColor)}>
            <Icon className={clsx('w-5 h-5', iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className={clsx('text-3xl font-extrabold tracking-tight', textColor)}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
