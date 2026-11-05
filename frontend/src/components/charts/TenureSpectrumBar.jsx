'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Layers, ArrowUpRight, PieChart as PieIcon, StretchHorizontal } from 'lucide-react';
import { TENURE_CLASSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const TENURE_STYLES = {
  BHOGVATDAR_CLASS_1: {
    color: '#059669',
    barBg: 'bg-[#059669]',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  SARKAR_SHASAN: {
    color: '#2563EB',
    barBg: 'bg-[#2563EB]',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  BHOGVATDAR_CLASS_2: {
    color: '#D97706',
    barBg: 'bg-[#D97706]',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  FOREST_JANGAL: {
    color: '#0D9488',
    barBg: 'bg-[#0D9488]',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  DEVASTHAN_INAM: {
    color: '#7C3AED',
    barBg: 'bg-[#7C3AED]',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
  },
};

const DEFAULT_TENURE_DATA = [
  { tenure: 'BHOGVATDAR_CLASS_1', count: 85940, totalAreaHa: 318757.62 },
  { tenure: 'SARKAR_SHASAN', count: 27580, totalAreaHa: 102335.66 },
  { tenure: 'BHOGVATDAR_CLASS_2', count: 14720, totalAreaHa: 54607.26 },
  { tenure: 'FOREST_JANGAL', count: 5615, totalAreaHa: 20769.51 },
  { tenure: 'DEVASTHAN_INAM', count: 20, totalAreaHa: 13.57 },
];

export default function TenureSpectrumBar({ data = [], taluka = '' }) {
  const { isMarathi } = useTranslation();
  const [metricMode, setMetricMode] = useState('area'); // 'area' | 'count'
  const [graphType, setGraphType] = useState('strip'); // 'strip' | 'pie' (default to 'strip')
  const [activeIndex, setActiveIndex] = useState(null);

  const sourceData = (data && data.length > 0) ? data : DEFAULT_TENURE_DATA;

  const items = useMemo(() => {
    return sourceData.map((item) => {
      const config = TENURE_CLASSES[item.tenure] || { labelMr: item.tenure, labelEn: item.tenure };
      const styles = TENURE_STYLES[item.tenure] || {
        color: '#64748B',
        barBg: 'bg-slate-500',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      };
      const count = Number(item.count || 0);
      const areaHa = Number(Number(item.totalAreaHa || 0).toFixed(2));

      return {
        key: item.tenure,
        nameMr: config.labelMr,
        nameEn: config.labelEn,
        count,
        areaHa,
        value: metricMode === 'area' ? areaHa : count,
        styles,
        color: styles.color,
        filterHref: `/parcels?tenureClass=${item.tenure}${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`,
      };
    }).sort((a, b) => (metricMode === 'area' ? b.areaHa - a.areaHa : b.count - a.count));
  }, [sourceData, metricMode, taluka]);

  const totalArea = items.reduce((sum, item) => sum + item.areaHa, 0);
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalMetric = metricMode === 'area' ? totalArea : totalCount;

  const activeItem = activeIndex !== null && items[activeIndex] ? items[activeIndex] : null;

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      const raw = p.payload || {};
      const val = typeof p.value === 'number' ? p.value : (typeof raw.value === 'number' ? raw.value : 0);
      const pct = totalMetric > 0 ? ((val / totalMetric) * 100).toFixed(1) : 0;

      const matched = items.find((i) =>
        i.id === raw.id ||
        (isMarathi ? i.nameMr : i.nameEn) === (p.name || raw.name) ||
        i.nameMr === raw.name ||
        i.nameEn === raw.name
      ) || raw;

      const displayName = (isMarathi ? (matched.nameMr || matched.name) : (matched.nameEn || matched.name)) || p.name || '';
      const color = matched.color || raw.color || p.color || '#2563EB';
      const numArea = typeof matched.areaHa === 'number' ? matched.areaHa : (metricMode === 'area' ? val : 0);
      const numCount = typeof matched.count === 'number' ? matched.count : (metricMode === 'count' ? val : 0);

      return (
        <div className="bg-slate-950 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-800 text-xs pointer-events-none z-50">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span>{displayName}</span>
            <span className="text-amber-400 font-mono">({pct}%)</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            {metricMode === 'area'
              ? `${(Number(numArea) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Ha`
              : `${(Number(numCount) || 0).toLocaleString('en-IN')} ${isMarathi ? 'गट' : 'Parcels'}`}
          </div>
        </div>
      );
    }
    return null;
  };

  // Reusable Category Rows (No truncation, 15px SemiBold name, 15px Bold values, 14px SemiBold pct, line-height 1.5)
  const renderCategoryRows = () => (
    <div className="w-full space-y-2">
      {items.map((item, index) => {
        const pct = totalMetric > 0 ? ((item.value / totalMetric) * 100).toFixed(1) : '0';
        const isHovered = activeIndex === index;

        return (
          <Link
            key={item.key}
            href={item.filterHref}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
              isHovered
                ? 'border-blue-400 bg-blue-50/80 shadow-xs'
                : 'border-slate-150 bg-slate-50/60 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-[15px] font-semibold text-[#0F172A] leading-[1.5] ${isHovered ? 'text-blue-950 font-bold' : ''}`}>
                {isMarathi ? item.nameMr : item.nameEn}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[15px] font-bold font-mono tabular-nums leading-[1.5] ${isHovered ? 'text-blue-900' : 'text-[#0F172A]'}`}>
                {metricMode === 'area'
                  ? `${item.areaHa.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ha`
                  : `${item.count.toLocaleString('en-IN')} ${isMarathi ? 'गट' : 'Parcels'}`}
              </span>
              <span className="text-[14px] font-semibold text-[#334155] font-mono w-14 text-right tabular-nums leading-[1.5]">
                {pct}%
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between font-sans">
      {/* ── HEADER WITH DUAL GRAPH TOGGLE (STRIP VS PIE) ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#0F172A] tracking-tight leading-[1.5] whitespace-nowrap">
                  <span>{isMarathi ? 'जमीन धारणा व मालकी वर्गवारी' : 'Land Tenure Classification'}</span>
                </h3>
                <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">
                  MLRC
                </span>
              </div>
              <p className="text-[13px] sm:text-[14px] text-[#475569] font-medium mt-0.5 leading-[1.5] truncate">
                {isMarathi
                  ? 'महाराष्ट्र जमीन महसूल संहिता (MLRC) कलम २९ अन्वये अभिलेख वर्गवारी'
                  : 'Statutory land tenure and ownership distribution under MLRC Sec 29'}
              </p>
            </div>
          </div>

          {/* Controls: Two-Graph Switcher (Strip vs Pie) + Metric Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
            {/* Graph Option Toggle: Strip vs Pie */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0" role="group" aria-label="Graph Type">
              <button
                type="button"
                onClick={() => setGraphType('strip')}
                className={`px-2.5 py-1 text-[13px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 leading-[1.5] ${
                  graphType === 'strip' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500 hover:text-[#0F172A]'
                }`}
                title={isMarathi ? 'प्रमाण पट्टी दृश्य' : 'Distribution Strip View'}
              >
                <StretchHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>{isMarathi ? 'प्रमाण पट्टी' : 'Strip'}</span>
              </button>
              <button
                type="button"
                onClick={() => setGraphType('pie')}
                className={`px-2.5 py-1 text-[13px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 leading-[1.5] ${
                  graphType === 'pie' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500 hover:text-[#0F172A]'
                }`}
                title={isMarathi ? 'वर्तुळ आलेख' : 'Pie / Donut Chart'}
              >
                <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isMarathi ? 'वर्तुळ' : 'Pie'}</span>
              </button>
            </div>

            {/* Metric Mode Toggle */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setMetricMode('area')}
                className={`px-2.5 py-1 text-[13px] font-semibold rounded-md transition cursor-pointer leading-[1.5] ${
                  metricMode === 'area' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {isMarathi ? 'क्षेत्र (Ha)' : 'Area'}
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('count')}
                className={`px-2.5 py-1 text-[13px] font-semibold rounded-md transition cursor-pointer leading-[1.5] ${
                  metricMode === 'count' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {isMarathi ? 'गट' : 'Count'}
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN VISUAL AREA ── */}
        <div className="py-3">
          {graphType === 'strip' ? (
            /* VIEW 1: DISTRIBUTION STRIP (100% Stacked Segmented Bar + Full-Width Rows) */
            <div className="space-y-3.5">
              {/* 100% Stacked Segmented Horizontal Bar */}
              <div
                className="h-4 w-full rounded-full overflow-hidden flex gap-0.5 bg-slate-100 p-0.5 shadow-inner"
                role="progressbar"
                aria-label={isMarathi ? 'जमीन धारणा वितरण पट्टी' : 'Land Tenure Distribution Strip'}
              >
                {items.map((item, index) => {
                  const pctNumber = totalMetric > 0 ? (item.value / totalMetric) * 100 : 0;
                  const pctString = pctNumber.toFixed(1);
                  const displayName = isMarathi ? item.nameMr : item.nameEn;
                  const formattedVal = metricMode === 'area'
                    ? `${item.areaHa.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ha`
                    : `${item.count.toLocaleString('en-IN')} ${isMarathi ? 'गट' : 'Parcels'}`;
                  const isHovered = activeIndex === index;
                  const isTiny = item.key === 'DEVASTHAN_INAM' || pctNumber < 0.8;

                  return (
                    <div
                      key={`strip-${item.key}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      title={`${displayName}: ${formattedVal} (${pctString}%)`}
                      className={`h-full rounded-full transition-all duration-150 cursor-pointer ${
                        isTiny ? 'min-w-[6px]' : ''
                      }`}
                      style={{
                        width: `${Math.max(pctNumber, 0.4)}%`,
                        backgroundColor: item.color,
                        opacity: activeIndex === null || isHovered ? 1 : 0.45,
                        filter: isHovered ? 'brightness(1.15)' : 'none',
                      }}
                    />
                  );
                })}
              </div>

              {/* Full-width Category Rows */}
              {renderCategoryRows()}
            </div>
          ) : (
            /* VIEW 2: PIE / DONUT VIEW WITH SIDE-BY-SIDE CATEGORY ROWS */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Left: Donut Chart with Center Stats */}
              <div className="md:col-span-5 relative h-64 sm:h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={items}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {items.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.key}`}
                          fill={entry.color}
                          opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                          className="transition-all duration-200 cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Hero Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1 text-center">
                  {activeItem ? (
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-1 truncate max-w-[130px]"
                        style={{
                          backgroundColor: `${activeItem.color}15`,
                          color: activeItem.color,
                          borderColor: `${activeItem.color}40`,
                        }}
                      >
                        {isMarathi ? activeItem.nameMr : activeItem.nameEn}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                        {metricMode === 'area'
                          ? `${(Number(activeItem.areaHa) || 0) >= 100000 ? `${((Number(activeItem.areaHa) || 0) / 100000).toFixed(2)}L` : (Number(activeItem.areaHa) || 0).toFixed(0)} Ha`
                          : `${(Number(activeItem.count) || 0).toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-[11.5px] font-bold text-slate-500 font-mono">
                        {totalMetric > 0 ? ((activeItem.value / totalMetric) * 100).toFixed(1) : 0}% {isMarathi ? 'वाटा' : 'share'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10.5px] uppercase tracking-wider font-bold text-slate-400">
                        {metricMode === 'area'
                          ? (isMarathi ? 'एकूण क्षेत्र' : 'Total Area')
                          : (isMarathi ? 'एकूण गट' : 'Total Parcels')}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                        {metricMode === 'area'
                          ? `${(totalArea / 100000).toFixed(2)}L Ha`
                          : totalCount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11.5px] text-slate-500 font-medium font-mono">
                        {items.length} {isMarathi ? 'प्रवर्ग' : 'Classes'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Category Rows */}
              <div className="md:col-span-7">
                {renderCategoryRows()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER TOTAL ── */}
      <div className="pt-3.5 border-t border-slate-100 mt-2 flex items-center justify-between text-[13.5px] leading-[1.5]">
        <span className="text-[#475569] font-medium">
          {isMarathi ? 'एकूण नोंदणीकृत क्षेत्र व भूखंड:' : 'Total Volume:'}
        </span>
        <span className="font-bold text-[#0F172A] font-mono tabular-nums">
          {totalArea.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ha • {totalCount.toLocaleString('en-IN')} {isMarathi ? 'गट' : 'Parcels'}
        </span>
      </div>
    </div>
  );
}
