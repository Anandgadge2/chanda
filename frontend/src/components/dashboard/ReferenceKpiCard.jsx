'use client';

import clsx from 'clsx';
import { Info } from 'lucide-react';

export default function ReferenceKpiCard({
  title,
  value,
  subtext,
  hasInfo = false,
  showSparkline = false,
  sparklineVariant = 'wave1',
  onClick,
  isActive = false,
}) {
  const isInteractive = typeof onClick === 'function';

  // Distinct smooth SVG sparkline waves matching reference image
  const sparklinePaths = {
    wave1: {
      line: 'M0,24 C30,12 50,30 80,18 C110,6 140,26 170,14 C190,8 210,16 240,4',
      area: 'M0,24 C30,12 50,30 80,18 C110,6 140,26 170,14 C190,8 210,16 240,4 L240,36 L0,36 Z',
    },
    wave2: {
      line: 'M0,18 C25,28 55,8 85,22 C115,32 145,10 175,16 C205,22 225,6 240,12',
      area: 'M0,18 C25,28 55,8 85,22 C115,32 145,10 175,16 C205,22 225,6 240,12 L240,36 L0,36 Z',
    },
    wave3: {
      line: 'M0,28 C35,16 65,24 95,12 C125,2 155,20 185,10 C215,2 230,8 240,2',
      area: 'M0,28 C35,16 65,24 95,12 C125,2 155,20 185,10 C215,2 230,8 240,2 L240,36 L0,36 Z',
    },
  };

  const path = sparklinePaths[sparklineVariant] || sparklinePaths.wave1;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      className={clsx(
        'bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between relative overflow-hidden select-none',
        isActive
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-100 hover:border-slate-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]',
        isInteractive && 'cursor-pointer active:scale-[0.99]'
      )}
      style={{ minHeight: showSparkline ? '142px' : '110px' }}
    >
      {/* Top Label */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500 tracking-tight truncate">
          {title}
        </span>
        {hasInfo && (
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-1.5 flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none font-mono">
          {value}
        </span>
        {subtext && !showSparkline && (
          <span className="text-xs font-semibold text-slate-400">
            {subtext}
          </span>
        )}
      </div>

      {/* Bottom Subtext or Sparkline Wave */}
      {showSparkline ? (
        <div className="w-full mt-1 relative h-9 overflow-hidden">
          {subtext && (
            <span className="absolute left-0 bottom-0 text-[11px] font-medium text-slate-400 z-10">
              {subtext}
            </span>
          )}
          <svg
            viewBox="0 0 240 36"
            preserveAspectRatio="none"
            className="w-full h-8 absolute bottom-0 right-0 overflow-visible"
          >
            <defs>
              <linearGradient id={`spark-grad-${sparklineVariant}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={path.area}
              fill={`url(#spark-grad-${sparklineVariant})`}
            />
            <path
              d={path.line}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : (
        <div className="h-1" />
      )}
    </div>
  );
}
