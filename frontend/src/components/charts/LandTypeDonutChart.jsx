'use client';

import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Layers, PieChart as PieIcon } from 'lucide-react';
import { TENURE_CLASSES } from '../../lib/constants';

const TENURE_PALETTE = {
  BHOGVATDAR_CLASS_1: { color: '#059669', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
  BHOGVATDAR_CLASS_2: { color: '#d97706', bg: 'bg-amber-500', text: 'text-amber-800', border: 'border-amber-200' },
  SARKAR_SHASAN: { color: '#2563eb', bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200' },
  DEVASTHAN_INAM: { color: '#7c3aed', bg: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-200' },
  FOREST_JANGAL: { color: '#047857', bg: 'bg-teal-700', text: 'text-teal-800', border: 'border-teal-200' },
};

export default function LandTypeDonutChart({ data = [] }) {
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

      return (
        <div className="bg-slate-950/95 text-white px-2 py-1 rounded-lg shadow-xl border border-slate-800 text-[11px] pointer-events-none whitespace-nowrap z-50">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span>{item.nameMr}</span>
            <span className="text-amber-400 text-[10px] font-mono">({pct}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>जमीन प्रकार व धारणाधिकार</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                MLRC वर्ग
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              भोगवटादार वर्ग १, वर्ग २ व शासकीय भूमी विश्लेषण
            </p>
          </div>
        </div>

        {/* Metric Switcher */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto" role="group" aria-label="Metric Toggle">
          <button
            type="button"
            onClick={() => setMetricType('area')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
              metricType === 'area'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={metricType === 'area'}
          >
            क्षेत्रफळ (Ha)
          </button>
          <button
            type="button"
            onClick={() => setMetricType('count')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
              metricType === 'count'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={metricType === 'count'}
          >
            संख्या (Parcels)
          </button>
        </div>
      </div>

      {/* Side-by-Side Chart & Metric Breakdown (Matching Image 2 Reference) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-1">
        {/* Left: Donut Chart with Dynamic Center KPI */}
        <div className="md:col-span-6 relative h-52 flex items-center justify-center">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-6">
              <PieIcon className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
              <p className="text-xs font-semibold">नोंदी उपलब्ध नाहीत.</p>
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
                      className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border shadow-2xs mb-0.5 truncate max-w-[100px]"
                      style={{
                        backgroundColor: `${activeItem.color}15`,
                        color: activeItem.color,
                        borderColor: `${activeItem.color}40`,
                      }}
                    >
                      {activeItem.nameMr}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5">
                      {metricType === 'area' ? `${activeItem.areaHa.toFixed(2)} Ha` : `${activeItem.count}`}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">
                      {totalValue > 0 ? ((activeItem.value / totalValue) * 100).toFixed(1) : 0}% वाटा
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                      {metricType === 'area' ? 'एकूण क्षेत्र' : 'एकूण भूखंड'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5">
                      {metricType === 'area' ? `${totalArea.toFixed(2)} Ha` : totalParcels}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      {metricType === 'area' ? `${totalParcels} भूखंड` : `${totalArea.toFixed(2)} Ha`}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Clean Metric List with Circular Dots & Bold Values */}
        <div className="md:col-span-6 space-y-2">
          {chartData.map((item, index) => {
            const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
            const isHighlighted = activeIndex === index;

            return (
              <div
                key={item.tenure}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-1.5 rounded-lg border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isHighlighted
                    ? 'border-blue-300 bg-blue-50/70 shadow-2xs'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className={`text-xs truncate ${isHighlighted ? 'font-black text-blue-950' : 'font-bold text-slate-800'}`}>
                      {item.nameMr}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{item.nameEn}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-black block ${isHighlighted ? 'text-blue-900' : 'text-slate-900'}`}>
                    {metricType === 'area' ? `${item.areaHa.toFixed(2)} Ha` : `${item.count} भूखंड`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Reader Accessible Data Table (WCAG 1.1.1) */}
      <table className="sr-only">
        <caption>जमीन धारणा वर्गनिहाय क्षेत्रफळ व भूखंड सारणी</caption>
        <thead>
          <tr>
            <th scope="col">धारणा प्रकार</th>
            <th scope="col">इंग्रजी नाव</th>
            <th scope="col">भूखंड संख्या</th>
            <th scope="col">क्षेत्रफळ (हे.)</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((item) => (
            <tr key={item.tenure}>
              <td>{item.nameMr}</td>
              <td>{item.nameEn}</td>
              <td>{item.count}</td>
              <td>{item.areaHa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Outlay Tag (Matching Reference Image 2) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
        <span className="text-[11px] font-medium text-slate-500">
          एकूण महसूल नोंदणी:
        </span>
        <span className="font-black text-slate-900 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
          {totalArea.toFixed(2)} Ha • {totalParcels} भूखंड
        </span>
      </div>
    </div>
  );
}
