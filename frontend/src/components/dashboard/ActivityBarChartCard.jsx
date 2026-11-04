'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../LanguageContext';

export default function ActivityBarChartCard({ data = [] }) {
  const { isMarathi } = useTranslation();
  const [activeRange, setActiveRange] = useState('Month');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // 12 bars matching reference image (Jan - Dec)
  const defaultBars = [
    { label: isMarathi ? 'जाने' : 'JAN', value: 105, max: 400 },
    { label: isMarathi ? 'फेब्रु' : 'FEB', value: 140, max: 400 },
    { label: isMarathi ? 'मार्च' : 'MAR', value: 140, max: 400 },
    { label: isMarathi ? 'एप्रिल' : 'APR', value: 245, max: 400 },
    { label: isMarathi ? 'मे' : 'MAY', value: 280, max: 400 },
    { label: isMarathi ? 'जून' : 'JUN', value: 205, max: 400 },
    { label: isMarathi ? 'जुलै' : 'JUL', value: 240, max: 400 },
    { label: isMarathi ? 'ऑग' : 'AUG', value: 105, max: 400 },
    { label: isMarathi ? 'सप्टें' : 'SEP', value: 280, max: 400 },
    { label: isMarathi ? 'ऑक्टो' : 'OCT', value: 335, max: 400 },
    { label: isMarathi ? 'नोव्हे' : 'NOV', value: 365, max: 400 },
    { label: isMarathi ? 'डिसें' : 'DEC', value: 395, max: 400 },
  ];

  const bars = data.length === 12 ? data : defaultBars;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
      {/* Top Card Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {isMarathi ? 'महसूल नोंदणी व फेरफार प्रवृत्ती' : 'Activity'}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isMarathi ? 'मासिक नोंदणी व चौकशी प्रकरणे' : 'Monthly Land Mutations & Cases'}
          </p>
        </div>

        {/* Dropdown pill matching reference */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:border-slate-300 px-3 py-1.5 rounded-full shadow-2xs transition"
          >
            <span>{isMarathi ? 'महिना' : 'Month'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="flex items-stretch gap-3 h-[200px] sm:h-[220px] w-full pt-2">
        {/* Y-axis Labels */}
        <div className="flex flex-col justify-between text-[11px] font-semibold text-slate-400 font-mono py-1 shrink-0 select-none">
          <span>400</span>
          <span>300</span>
          <span>200</span>
          <span>100</span>
          <span>0</span>
        </div>

        {/* 12 Vertical Pill Bars */}
        <div className="flex-1 grid grid-cols-12 gap-1.5 sm:gap-2.5 h-full items-end pb-6 relative">
          {bars.map((bar, idx) => {
            const fillHeightPct = Math.min(100, Math.max(8, (bar.value / bar.max) * 100));
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={bar.label + idx}
                className="h-full flex flex-col items-center justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-7 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-2 rounded shadow-md z-20 whitespace-nowrap pointer-events-none">
                    {bar.value} {isMarathi ? 'नोंदी' : 'cases'}
                  </div>
                )}

                {/* Track Background + Filled Royal Blue Bar */}
                <div className="w-2.5 sm:w-3.5 h-full bg-[#EFF6FF] rounded-full overflow-hidden flex flex-col justify-end transition-all">
                  <div
                    className="w-full bg-[#3B82F6] rounded-full transition-all duration-500 ease-out group-hover:bg-blue-700"
                    style={{ height: `${fillHeightPct}%` }}
                  />
                </div>

                {/* X-axis Month Label */}
                <span className="absolute -bottom-5 text-[9px] sm:text-[10px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors uppercase tracking-tight">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
