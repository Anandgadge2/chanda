'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Treemap,
} from 'recharts';
import { Layers, ArrowUpRight, PieChart as PieIcon, LayoutGrid } from 'lucide-react';
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
  const [graphType, setGraphType] = useState('pie'); // 'pie' | 'treemap'
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

  // Hierarchical Treemap dataset for Recharts Treemap
  const treemapData = useMemo(() => {
    return [
      {
        name: 'Tenure',
        children: items.map((item) => ({
          name: isMarathi ? item.nameMr : item.nameEn,
          nameMr: item.nameMr,
          nameEn: item.nameEn,
          value: item.value > 0 ? item.value : 0.1,
          color: item.color,
          pct: totalMetric > 0 ? ((item.value / totalMetric) * 100).toFixed(1) : '0',
          areaHa: item.areaHa,
          count: item.count,
        })),
      },
    ];
  }, [items, totalMetric, isMarathi]);

  const activeItem = activeIndex !== null && items[activeIndex] ? items[activeIndex] : null;

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalMetric > 0 ? ((item.value / totalMetric) * 100).toFixed(1) : 0;
      const displayName = isMarathi ? item.nameMr : item.nameEn;

      return (
        <div className="bg-slate-950 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-800 text-xs pointer-events-none z-50">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span>{displayName}</span>
            <span className="text-amber-400 font-mono">({pct}%)</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            {metricMode === 'area'
              ? `${item.areaHa.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Ha`
              : `${item.count.toLocaleString('en-IN')} ${isMarathi ? 'गट' : 'Parcels'}`}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Treemap Tile Content Renderer
  const CustomizedTreemapContent = (props) => {
    const { depth, x, y, width, height, name, color, pct, areaHa, count } = props;
    if (depth !== 1 || !width || !height || width < 4 || height < 4) return null;

    return (
      <g>
        <rect
          x={x + 2}
          y={y + 2}
          width={width - 4}
          height={height - 4}
          style={{
            fill: color || '#2563EB',
            stroke: '#FFFFFF',
            strokeWidth: 2,
          }}
          rx={6}
          ry={6}
          className="transition-opacity hover:opacity-90 cursor-pointer"
        />
        {width > 42 && height > 26 && (
          <text
            x={x + 8}
            y={y + 18}
            fill="#FFFFFF"
            fontSize={width > 90 ? 12 : 10.5}
            fontWeight={700}
            className="pointer-events-none select-none font-sans"
          >
            {name}
          </text>
        )}
        {width > 50 && height > 44 && (
          <text
            x={x + 8}
            y={y + 34}
            fill="rgba(255,255,255,0.92)"
            fontSize={11}
            fontWeight={700}
            className="pointer-events-none select-none font-mono"
          >
            {pct}%
          </text>
        )}
        {width > 85 && height > 64 && (
          <text
            x={x + 8}
            y={y + 50}
            fill="rgba(255,255,255,0.8)"
            fontSize={10}
            fontWeight={600}
            className="pointer-events-none select-none font-mono"
          >
            {metricMode === 'area'
              ? `${areaHa >= 100000 ? `${(areaHa / 100000).toFixed(2)}L` : areaHa.toFixed(0)} Ha`
              : `${count} गट`}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between font-sans">
      {/* ── HEADER WITH DUAL GRAPH TOGGLE (PIE VS TREEMAP) ── */}
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

          {/* Controls: Two-Graph Switcher (Pie vs Treemap) + Metric Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
            {/* Graph Option Toggle: Pie vs Treemap (Non-bar) */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0" role="group" aria-label="Graph Type">
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
              <button
                type="button"
                onClick={() => setGraphType('treemap')}
                className={`px-2.5 py-1 text-[13px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 leading-[1.5] ${
                  graphType === 'treemap' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500 hover:text-[#0F172A]'
                }`}
                title={isMarathi ? 'ट्रेमॅप आलेख' : 'Treemap Chart'}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                <span>{isMarathi ? 'ट्रेमॅप' : 'Treemap'}</span>
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

        {/* ── MAIN VISUAL AREA (SIDE-BY-SIDE GRAPH & CATEGORY BREAKDOWN) ── */}
        <div className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left: Selected Graph (Option 1: Pie/Donut | Option 2: Treemap) */}
            <div className="md:col-span-5 relative h-64 sm:h-72 flex items-center justify-center">
              {graphType === 'pie' ? (
                <>
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
                            ? `${activeItem.areaHa >= 100000 ? `${(activeItem.areaHa / 100000).toFixed(2)}L` : activeItem.areaHa.toFixed(0)} Ha`
                            : `${activeItem.count.toLocaleString('en-IN')}`}
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
                </>
              ) : (
                /* OPTION 2: TREEMAP CHART (Area-proportional mosaic tiles) */
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#ffffff"
                    isAnimationActive={false}
                    content={<CustomizedTreemapContent />}
                  >
                    <Tooltip content={<CustomPieTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              )}
            </div>

            {/* Right: Interactive 5 Tenure Category Tiles */}
            <div className="md:col-span-7 space-y-2">
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
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-[14px] truncate leading-[1.5] ${isHovered ? 'font-bold text-blue-950' : 'font-semibold text-[#0F172A]'}`}>
                        {isMarathi ? item.nameMr : item.nameEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[14px] font-bold font-mono tabular-nums ${isHovered ? 'text-blue-900' : 'text-[#0F172A]'}`}>
                        {metricMode === 'area'
                          ? `${item.areaHa.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ha`
                          : `${item.count.toLocaleString('en-IN')} गट`}
                      </span>
                      <span className="text-[13px] font-semibold text-[#475569] font-mono w-12 text-right tabular-nums">
                        {pct}%
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER TOTAL ── */}
      <div className="pt-3.5 border-t border-slate-100 mt-2 flex items-center justify-between text-[13.5px] leading-[1.5]">
        <span className="text-[#475569] font-medium">
          {isMarathi ? 'एकूण नोंदणीकृत क्षेत्र व भूखंड:' : 'Total Volume:'}
        </span>
        <span className="font-bold text-[#0F172A] font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 tabular-nums">
          {totalArea.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ha • {totalCount.toLocaleString('en-IN')} {isMarathi ? 'गट' : 'Parcels'}
        </span>
      </div>
    </div>
  );
}
