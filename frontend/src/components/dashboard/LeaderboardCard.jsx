'use client';

import clsx from 'clsx';
import { Triangle } from 'lucide-react';

export default function LeaderboardCard({
  title,
  subtitle,
  items = [],
  showAvatar = true,
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

      {/* Leaderboard Items */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isUp = item.trend === 'up';
          const isDown = item.trend === 'down';

          return (
            <div
              key={item.name + idx}
              className="flex items-center justify-between gap-3 py-1"
            >
              {/* Left Identity: Avatar/Badge + Name & Subtitle */}
              <div className="flex items-center gap-3 min-w-0">
                {showAvatar && (
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs uppercase shadow-2xs text-white',
                      item.avatarBg || 'bg-blue-600'
                    )}
                  >
                    {item.avatarChar || item.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 truncate">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Rank & Trend Indicator */}
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs font-bold">
                <span className="text-slate-800 font-extrabold">
                  {item.rank || idx + 1}
                </span>

                {isUp && (
                  <Triangle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500 shrink-0" />
                )}
                {isDown && (
                  <Triangle className="w-2.5 h-2.5 fill-rose-500 text-rose-500 rotate-180 shrink-0" />
                )}
                {!isUp && !isDown && (
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
