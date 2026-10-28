'use client';

import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Layers, PieChart as PieIcon } from 'lucide-react';
import { TENURE_CLASSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const TENURE_PALETTE = {
  BHOGVATDAR_CLASS_1: { color: '#059669', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
  BHOGVATDAR_CLASS_2: { color: '#d97706', bg: 'bg-amber-500', text: 'text-amber-800', border: 'border-amber-200' },
  SARKAR_SHASAN: { color: '#2563eb', bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200' },
  DEVASTHAN_INAM: { color: '#7c3aed', bg: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-200' },
  FOREST_JANGAL: { color: '#047857', bg: 'bg-teal-700', text: 'text-teal-800', border: 'border-teal-200' },
};

export default function LandTypeDonutChart({ data = [] }) {
  const { isMarathi } = useTranslation();
  const [metricType, setMetricType] = useState('area'); // 'area' | 'count'
  const [activeIndex, setActiveIndex] = useState(null);

  // Transform real production database records
  const chartData = (data || []).map((item) => {
    const config = TENURE_CLASSES[item.tenure] || {
      labelMr: item.tenure,
      labelEn: item.tenure,
      description: '',
    };
    const palette = TENURE_PALETTE[item.tenure] || {
      color: '#64748b',
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

  // Ultra-sleek non-intrusive micro tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
      const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

      return (
        <div className="bg-slate-950/95 text-white px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-800 text-[11px] pointer-events-none whitespace-nowrap z-50">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span>{displayName}</span>
            <span className="text-amber-400 text-[10px] font-mono">({pct}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300/80 transition-all">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
              <span>{isMarathi ? 'जमीन प्रकार व धारणाधिकार' : 'Land Classification & Tenure'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold shrink-0">
                {isMarathi ? 'MLRC वर्ग' : 'MLRC Class'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {isMarathi
                ? 'भोगवटादार वर्ग १, वर्ग २ व शासकीय भूमी विश्लेषण'
                : 'Occupant Class-1, Class-2 & Government Land Analytics'}
            </p>
          </div>
        </div>

        {/* Metric Switcher */}
        <div
          className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto shrink-0"
          role="group"
          aria-label={isMarathi ? 'मापन पद्धती' : 'Metric Switcher'}
        >
          <button
            type="button"
            onClick={() => setMetricType('area')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
              metricType === 'area'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={metricType === 'area'}
          >
            {isMarathi ? 'क्षेत्रफळ (Ha)' : 'Area (Ha)'}
          </button>
          <button
            type="button"
            onClick={() => setMetricType('count')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
              metricType === 'count'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={metricType === 'count'}
          >
            {isMarathi ? 'संख्या (Parcels)' : 'Count (Parcels)'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Chart & Metric Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-1.5">
        {/* Left: Donut Chart with Dynamic Center KPI */}
        <div className="md:col-span-6 relative h-52 flex items-center justify-center">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-6">
              <PieIcon className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
              <p className="text-xs font-semibold">{isMarathi ? 'नोंदी उपलब्ध नाहीत.' : 'No records available.'}</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1">
                {activeItem ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border shadow-2xs mb-0.5 truncate max-w-[110px]"
                      style={{
                        backgroundColor: `${activeItem.color}15`,
                        color: activeItem.color,
                        borderColor: `${activeItem.color}40`,
                      }}
                    >
                      {isMarathi ? activeItem.nameMr : (activeItem.nameEn || activeItem.nameMr)}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                      {metricType === 'area'
                        ? `${activeItem.areaHa.toFixed(2)} Ha`
                        : `${activeItem.count} ${isMarathi ? 'भूखंड' : 'Parcels'}`}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 font-mono">
                      {totalValue > 0 ? ((activeItem.value / totalValue) * 100).toFixed(1) : 0}% {isMarathi ? 'वाटा' : 'share'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                      {metricType === 'area'
                        ? (isMarathi ? 'एकूण क्षेत्र' : 'Total Area')
                        : (isMarathi ? 'एकूण भूखंड' : 'Total Parcels')}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                      {metricType === 'area'
                        ? `${totalArea.toFixed(2)} Ha`
                        : totalParcels.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium font-mono">
                      {metricType === 'area'
                        ? `${totalParcels.toLocaleString('en-IN')} ${isMarathi ? 'भूखंड' : 'Parcels'}`
                        : `${totalArea.toFixed(2)} Ha`}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Clean Metric List with Circular Dots & Bold Values */}
        {/* Strictly single-language: If Marathi is active show ONLY Marathi, if English is active show ONLY English */}
        <div className="md:col-span-6 space-y-2">
          {chartData.map((item, index) => {
            const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
            const isHighlighted = activeIndex === index;
            const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

            return (
              <div
                key={item.tenure}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-2 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isHighlighted
                    ? 'border-blue-300 bg-blue-50/70 shadow-2xs'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className={`text-xs truncate ${isHighlighted ? 'font-black text-blue-950' : 'font-bold text-slate-800'}`}>
                      {displayName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-black block font-mono ${isHighlighted ? 'text-blue-900' : 'text-slate-900'}`}>
                    {metricType === 'area'
                      ? `${item.areaHa.toFixed(2)} Ha`
                      : `${item.count} ${isMarathi ? 'भूखंड' : 'Parcels'}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Reader Accessible Data Table (WCAG 1.1.1) */}
      <table className="sr-only">
        <caption>
          {isMarathi
            ? 'जमीन धारणा वर्गनिहाय क्षेत्रफळ व भूखंड सारणी'
            : 'Land Tenure Classification Area and Parcels Table'}
        </caption>
        <thead>
          <tr>
            <th scope="col">{isMarathi ? 'धारणा प्रकार' : 'Tenure Classification'}</th>
            <th scope="col">{isMarathi ? 'भूखंड संख्या' : 'Parcel Count'}</th>
            <th scope="col">{isMarathi ? 'क्षेत्रफळ (हे.)' : 'Area (Ha)'}</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((item) => (
            <tr key={item.tenure}>
              <td>{isMarathi ? item.nameMr : (item.nameEn || item.nameMr)}</td>
              <td>{item.count}</td>
              <td>{item.areaHa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Outlay Tag */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-600">
        <span className="text-[11px] font-medium text-slate-500">
          {isMarathi ? 'एकूण महसूल नोंदणी:' : 'Total Registered Land:'}
        </span>
        <span className="font-black text-slate-900 text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md font-mono">
          {totalArea.toFixed(2)} Ha • {totalParcels.toLocaleString('en-IN')} {isMarathi ? 'भूखंड' : 'Parcels'}
        </span>
      </div>
    </div>
  );
}
