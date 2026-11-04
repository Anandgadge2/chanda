'use client';

import clsx from 'clsx';

export default function TopicProgressBarCard({
  title,
  subtitle,
  items = [],
  variant = 'coral', // 'coral' (weakest/breaches) or 'emerald' (strongest/tenure)
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Ranked Items List */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const pct = Math.min(100, Math.max(0, item.percentage || 0));

          return (
            <div key={item.title + idx} className="flex items-center gap-3 w-full">
              {/* Thumbnail / Icon Badge */}
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 border border-slate-200/60 shadow-2xs">
                {item.icon ? (
                  <item.icon className={clsx('w-5 h-5', item.iconColor || 'text-slate-700')} />
                ) : (
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    0{idx + 1}
                  </span>
                )}
              </div>

              {/* Title & Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {item.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 shrink-0 font-mono">
                    {item.valueLabel || `${pct}%`}
                  </span>
                </div>

                {/* Progress Bar with Soft Track */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-700 ease-out',
                      variant === 'coral'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'
                        : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
