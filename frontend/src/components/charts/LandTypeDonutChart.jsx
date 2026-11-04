'use client';

import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Layers, PieChart as PieIcon } from 'lucide-react';
import { TENURE_CLASSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

/**
 * Coordinated Multicolour Palette for Land Classification
 * - Royal Blue: #4169E1 (Sarkar / Shasan)
 * - Orange: #F59E0B (Class-2)
 * - Green: #16A34A (Class-1)
 * - Purple: #7656D6 (Devasthan / Inam)
 * - Teal: #0D9488 (Forest / Jangal)
 */
const TENURE_PALETTE = {
  BHOGVATDAR_CLASS_1: { color: '#16A34A', bg: 'bg-[#16A34A]', text: 'text-[#16A34A]', border: 'border-[#16A34A]/30' },
  BHOGVATDAR_CLASS_2: { color: '#F59E0B', bg: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
  SARKAR_SHASAN: { color: '#4169E1', bg: 'bg-[#4169E1]', text: 'text-[#4169E1]', border: 'border-[#4169E1]/30' },
  DEVASTHAN_INAM: { color: '#7656D6', bg: 'bg-[#7656D6]', text: 'text-[#7656D6]', border: 'border-[#7656D6]/30' },
  FOREST_JANGAL: { color: '#0D9488', bg: 'bg-[#0D9488]', text: 'text-[#0D9488]', border: 'border-[#0D9488]/30' },
};

export default function LandTypeDonutChart({ data = [] }) {
  const { isMarathi } = useTranslation();
  const [metricType, setMetricType] = useState('area'); // 'area' | 'count'
  const [activeIndex, setActiveIndex] = useState(null);

  // Transform production database records
  const chartData = (data || []).map((item) => {
    const config = TENURE_CLASSES[item.tenure] || {
      labelMr: item.tenure,
      labelEn: item.tenure,
      description: '',
    };
    const palette = TENURE_PALETTE[item.tenure] || {
      color: '#64748B',
      bg: 'bg-slate-500',
      text: 'text-slate-700',
      border: 'border-slate-200',
    };

    const count = Number(item.count || 0);
    const areaHa = Number(item.totalAreaHa || 0);

    return {
      tenure: item.tenure,
      nameMr: config.labelMr,
      nameEn: config.labelEn,
      description: config.description,
      count,
      areaHa: Number(areaHa.toFixed(2)),
      value: metricType === 'area' ? Number(areaHa.toFixed(2)) : count,
      color: palette.color,
      bg: palette.bg,
      text: palette.text,
      border: palette.border,
    };
  }).filter((d) => d.count > 0 || d.areaHa > 0);

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const totalParcels = chartData.reduce((acc, curr) => acc + curr.count, 0);
  const totalArea = chartData.reduce((acc, curr) => acc + curr.areaHa, 0);

  const activeItem = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
      const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

      return (
        <div className="bg-[#252B36] text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs sm:text-sm pointer-events-none whitespace-nowrap z-50">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span>{displayName}</span>
            <span className="text-[#F59E0B] font-mono font-extrabold">({pct}%)</span>
          </div>
          <div className="text-white/80 font-mono text-xs flex items-center justify-between gap-4">
            <span>{item.count.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} {isMarathi ? 'भूखंड' : 'Parcels'}</span>
            <span>{item.areaHa.toFixed(2)} Ha</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#E9E7E1] pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#4169E1]/10 border border-[#4169E1]/20 flex items-center justify-center text-[#4169E1] shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-[22px] font-bold text-[#252B36] flex items-center gap-2.5 truncate">
              <span>{isMarathi ? 'जमीन प्रकार व धारणाधिकार' : 'Land Classification & Tenure'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F8F7F3] text-[#252B36] border border-[#E9E7E1] font-bold shrink-0">
                {isMarathi ? 'MLRC वर्ग' : 'MLRC Class'}
              </span>
            </h3>
            <p className="text-sm sm:text-[15px] text-[#64748B] font-medium truncate mt-0.5 leading-snug">
              {isMarathi
                ? 'भोगवटादार वर्ग १, वर्ग २ व शासकीय भूमी विश्लेषण'
                : 'Occupant Class-1, Class-2 & Government Land Analytics'}
            </p>
          </div>
        </div>

        {/* Metric Switcher */}
        <div
          className="inline-flex p-1 bg-[#F8F7F3] rounded-xl border border-[#E9E7E1] self-start sm:self-auto shrink-0"
          role="group"
          aria-label={isMarathi ? 'मापन पद्धती' : 'Metric Switcher'}
        >
          <button
            type="button"
            onClick={() => setMetricType('area')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              metricType === 'area'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#252B36]'
            }`}
            aria-pressed={metricType === 'area'}
          >
            {isMarathi ? 'क्षेत्रफळ (Ha)' : 'Area (Ha)'}
          </button>
          <button
            type="button"
            onClick={() => setMetricType('count')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              metricType === 'count'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#252B36]'
            }`}
            aria-pressed={metricType === 'count'}
          >
            {isMarathi ? 'संख्या (Parcels)' : 'Count (Parcels)'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Chart & Metric Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-3">
        {/* Left: Donut Chart with Dynamic Center KPI */}
        <div className="md:col-span-6 relative h-64 sm:h-72 lg:h-80 flex items-center justify-center">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-8">
              <PieIcon className="w-10 h-10 stroke-[1.5] mb-2 opacity-40" />
              <p className="text-sm font-semibold">{isMarathi ? 'नोंदी उपलब्ध नाहीत.' : 'No records available.'}</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={106}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.tenure}`}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Hero Inspector */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2">
                {activeItem ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs mb-1 truncate max-w-[140px]"
                      style={{
                        backgroundColor: `${activeItem.color}15`,
                        color: activeItem.color,
                        borderColor: `${activeItem.color}40`,
                      }}
                    >
                      {isMarathi ? activeItem.nameMr : (activeItem.nameEn || activeItem.nameMr)}
                    </span>
                    <span className="text-[24px] sm:text-[27px] font-black text-[#252B36] tracking-tight leading-none my-1 font-mono">
                      {metricType === 'area'
                        ? `${activeItem.areaHa.toFixed(2)} Ha`
                        : `${activeItem.count.toLocaleString()} ${isMarathi ? 'गट' : 'Gat'}`}
                    </span>
                    <span className="text-xs sm:text-[13px] font-bold text-[#64748B] font-mono">
                      {totalValue > 0 ? ((activeItem.value / totalValue) * 100).toFixed(1) : 0}% {isMarathi ? 'वाटा' : 'share'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-xs uppercase tracking-wider font-bold text-[#64748B]">
                      {metricType === 'area'
                        ? (isMarathi ? 'एकूण क्षेत्र' : 'Total Area')
                        : (isMarathi ? 'एकूण भूखंड' : 'Total Parcels')}
                    </span>
                    <span className="text-[25px] sm:text-[28px] font-black text-[#252B36] tracking-tight leading-none my-1 font-mono">
                      {metricType === 'area'
                        ? `${totalArea.toFixed(2)} Ha`
                        : totalParcels.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
                    </span>
                    <span className="text-xs sm:text-[13px] text-[#64748B] font-semibold font-mono">
                      {metricType === 'area'
                        ? `${totalParcels.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} ${isMarathi ? 'भूखंड' : 'Parcels'}`
                        : `${totalArea.toFixed(2)} Ha`}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Clean Metric List with Larger Typography (16-17px) */}
        <div className="md:col-span-6 space-y-2.5">
          {chartData.map((item, index) => {
            const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
            const isHighlighted = activeIndex === index;
            const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

            return (
              <div
                key={item.tenure}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isHighlighted
                    ? 'border-[#4169E1] bg-[#4169E1]/5 shadow-sm'
                    : 'border-[#E9E7E1] bg-[#F8F7F3] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className={`text-[16px] sm:text-[17px] truncate leading-snug ${isHighlighted ? 'font-black text-[#4169E1]' : 'font-bold text-[#252B36]'}`}>
                      {displayName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[16px] sm:text-[17px] font-black block font-mono ${isHighlighted ? 'text-[#4169E1]' : 'text-[#252B36]'}`}>
                    {metricType === 'area'
                      ? `${item.areaHa.toFixed(2)} Ha`
                      : `${item.count.toLocaleString()} ${isMarathi ? 'गट' : 'Gat'}`}
                  </span>
                  <span className="text-xs sm:text-[13px] text-[#64748B] font-bold font-mono">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Pill */}
      <div className="pt-3 border-t border-[#E9E7E1] flex items-center justify-between text-xs sm:text-[13px] text-[#64748B]">
        <span className="font-medium">
          {isMarathi ? 'महाराष्ट्र जमीन महसूल संहिता (MLRC) कलम २९ अन्वये वर्गीकरण' : 'Classification under MLRC 1966 Section 29'}
        </span>
        <span className="font-bold text-[#4169E1]">
          {chartData.length} {isMarathi ? 'प्रवर्ग' : 'Classes'}
        </span>
      </div>
    </div>
  );
}
