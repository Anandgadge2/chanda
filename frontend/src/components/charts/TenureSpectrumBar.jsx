'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Layers, ArrowUpRight, PieChart as PieIcon } from 'lucide-react';
import { TENURE_CLASSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const TENURE_STYLES = {
  BHOGVATDAR_CLASS_1: {
    color: '#059669',
    barBg: 'bg-[#059669]',
    cardBg: 'bg-emerald-50/70',
    cardBorder: 'border-emerald-200/80',
    countText: 'text-emerald-700',
    idxText: 'text-emerald-800',
    labelText: 'text-emerald-900',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  SARKAR_SHASAN: {
    color: '#2563EB',
    barBg: 'bg-[#2563EB]',
    cardBg: 'bg-blue-50/70',
    cardBorder: 'border-blue-200/80',
    countText: 'text-blue-700',
    idxText: 'text-blue-800',
    labelText: 'text-blue-900',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  BHOGVATDAR_CLASS_2: {
    color: '#D97706',
    barBg: 'bg-[#D97706]',
    cardBg: 'bg-amber-50/70',
    cardBorder: 'border-amber-200/80',
    countText: 'text-amber-700',
    idxText: 'text-amber-800',
    labelText: 'text-amber-900',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  FOREST_JANGAL: {
    color: '#0D9488',
    barBg: 'bg-[#0D9488]',
    cardBg: 'bg-teal-50/70',
    cardBorder: 'border-teal-200/80',
    countText: 'text-teal-700',
    idxText: 'text-teal-800',
    labelText: 'text-teal-900',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  DEVASTHAN_INAM: {
    color: '#7C3AED',
    barBg: 'bg-[#7C3AED]',
    cardBg: 'bg-purple-50/70',
    cardBorder: 'border-purple-200/80',
    countText: 'text-purple-700',
    idxText: 'text-purple-800',
    labelText: 'text-purple-900',
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
  const [activeIndex, setActiveIndex] = useState(null);

  const sourceData = (data && data.length > 0) ? data : DEFAULT_TENURE_DATA;

  const items = useMemo(() => {
    return sourceData.map((item) => {
      const config = TENURE_CLASSES[item.tenure] || { labelMr: item.tenure, labelEn: item.tenure };
      const styles = TENURE_STYLES[item.tenure] || {
        color: '#64748B',
        barBg: 'bg-slate-500',
        cardBg: 'bg-slate-50',
        cardBorder: 'border-slate-200',
        countText: 'text-slate-700',
        idxText: 'text-slate-800',
        labelText: 'text-slate-900',
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

  // 4 Top KPI Cards
  const summaryTiers = useMemo(() => {
    const class1 = items.find((i) => i.key === 'BHOGVATDAR_CLASS_1') || { areaHa: 318757.62, count: 85940 };
    const sarkar = items.find((i) => i.key === 'SARKAR_SHASAN') || { areaHa: 102335.66, count: 27580 };
    const class2 = items.find((i) => i.key === 'BHOGVATDAR_CLASS_2') || { areaHa: 54607.26, count: 14720 };
    const forest = items.find((i) => i.key === 'FOREST_JANGAL') || { areaHa: 20769.51, count: 5615 };
    const inam = items.find((i) => i.key === 'DEVASTHAN_INAM') || { areaHa: 13.57, count: 20 };
    const forestAndInamArea = Number((forest.areaHa + inam.areaHa).toFixed(2));
    const forestAndInamCount = forest.count + inam.count;

    return [
      {
        stageNumber: '1',
        titleMr: 'वर्ग-१ (खाजगी)',
        titleEn: 'Class-1',
        valArea: class1.areaHa,
        valCount: class1.count,
        pct: totalArea > 0 ? ((class1.areaHa / totalArea) * 100).toFixed(1) : '64.2',
        cardBg: 'bg-emerald-50/70',
        cardBorder: 'border-emerald-200/80',
        countText: 'text-emerald-700',
        idxText: 'text-emerald-800',
        labelText: 'text-emerald-900',
      },
      {
        stageNumber: '2',
        titleMr: 'शासन/सार्वजनिक',
        titleEn: 'Govt Land',
        valArea: sarkar.areaHa,
        valCount: sarkar.count,
        pct: totalArea > 0 ? ((sarkar.areaHa / totalArea) * 100).toFixed(1) : '20.6',
        cardBg: 'bg-blue-50/70',
        cardBorder: 'border-blue-200/80',
        countText: 'text-blue-700',
        idxText: 'text-blue-800',
        labelText: 'text-blue-900',
      },
      {
        stageNumber: '3',
        titleMr: 'वर्ग-२ (शर्तयुक्त)',
        titleEn: 'Class-2',
        valArea: class2.areaHa,
        valCount: class2.count,
        pct: totalArea > 0 ? ((class2.areaHa / totalArea) * 100).toFixed(1) : '11.0',
        cardBg: 'bg-amber-50/70',
        cardBorder: 'border-amber-200/80',
        countText: 'text-amber-700',
        idxText: 'text-amber-800',
        labelText: 'text-amber-900',
      },
      {
        stageNumber: '4',
        titleMr: 'वन व देवस्थान',
        titleEn: 'Forest/Inam',
        valArea: forestAndInamArea,
        valCount: forestAndInamCount,
        pct: totalArea > 0 ? ((forestAndInamArea / totalArea) * 100).toFixed(1) : '4.2',
        cardBg: 'bg-teal-50/70',
        cardBorder: 'border-teal-200/80',
        countText: 'text-teal-700',
        idxText: 'text-teal-800',
        labelText: 'text-teal-900',
      },
    ];
  }, [items, totalArea]);

  const activeItem = activeIndex !== null && items[activeIndex] ? items[activeIndex] : null;

  const CustomTooltip = ({ active, payload }) => {
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

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between font-sans">
      {/* ── HEADER ── */}
      <div>
        <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-[18px] font-bold text-[#0F172A] tracking-tight leading-[1.5]">
                  <span>{isMarathi ? 'जमीन धारणा व मालकी वर्गवारी' : 'Land Tenure Classification'}</span>
                </h3>
                <span className="text-[13px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">
                  MLRC
                </span>
              </div>
              <p className="text-[14px] text-[#475569] font-medium mt-0.5 leading-[1.5]">
                {isMarathi
                  ? 'महाराष्ट्र जमीन महसूल संहिता (MLRC) कलम २९ अन्वये अभिलेख वर्गवारी'
                  : 'Statutory land tenure and ownership distribution under MLRC Sec 29'}
              </p>
            </div>
          </div>

          {/* Toggle: Area vs Count */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setMetricMode('area')}
              className={`px-3 py-1.5 text-[14px] font-semibold rounded-md transition cursor-pointer leading-[1.5] ${
                metricMode === 'area' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              {isMarathi ? 'क्षेत्रफळ (Ha)' : 'Area'}
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('count')}
              className={`px-3 py-1.5 text-[14px] font-semibold rounded-md transition cursor-pointer leading-[1.5] ${
                metricMode === 'count' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              {isMarathi ? 'संख्या (गट)' : 'Count'}
            </button>
          </div>
        </div>

        {/* ── TOP 4 KEY TENURE KPI CARDS ── */}
        <div className="my-4">
          <div className="text-[13.5px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between leading-[1.5]">
            <span>{isMarathi ? 'प्रमुख धारणा प्रवर्ग (KEY TENURE TIERS)' : 'Key Tenure Tiers'}</span>
            <span className="text-[13px] font-medium text-slate-400">
              {isMarathi ? 'वैधानिक वर्गवारी' : 'Statutory Breakdown'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {summaryTiers.map((tier) => {
              const displayVal = metricMode === 'area'
                ? `${tier.valArea >= 100000 ? `${(tier.valArea / 100000).toFixed(2)}L` : tier.valArea.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Ha`
                : `${tier.valCount.toLocaleString('en-IN')}`;

              return (
                <div
                  key={tier.stageNumber}
                  className={`p-3 sm:p-3.5 rounded-xl border ${tier.cardBorder} ${tier.cardBg} flex flex-col justify-between transition-all duration-150 hover:shadow-xs`}
                >
                  <div className="flex items-center justify-between text-[13px] font-bold leading-[1.5]">
                    <span className={tier.idxText}>#{tier.stageNumber}</span>
                    <span className={`text-[11.5px] font-mono px-1.5 py-0.2 rounded bg-white/70 ${tier.idxText}`}>
                      {tier.pct}%
                    </span>
                  </div>

                  <p className={`text-lg sm:text-[20px] font-black tracking-tight my-1.5 tabular-nums font-mono ${tier.countText}`}>
                    {displayVal}
                  </p>

                  <p className={`text-[13.5px] font-bold truncate leading-[1.5] ${tier.labelText}`}>
                    {isMarathi ? tier.titleMr : tier.titleEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RICH GRAPHICAL VISUALIZER: DONUT CHART + INTERACTIVE CATEGORY LIST ── */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[13.5px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between leading-[1.5]">
            <span>{isMarathi ? 'धारणा वाटा व वर्गीकरण वक्र' : 'Tenure Share & Donut Distribution'}</span>
            <span className="text-[13px] font-medium text-slate-400">
              {isMarathi ? 'आलेखात्मक विश्लेषण' : 'Graphical Analytics'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Left: Interactive Donut Chart */}
            <div className="md:col-span-5 relative h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={items}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={74}
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
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Hero Inspector */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1 text-center">
                {activeItem ? (
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border mb-0.5 truncate max-w-[120px]"
                      style={{
                        backgroundColor: `${activeItem.color}15`,
                        color: activeItem.color,
                        borderColor: `${activeItem.color}40`,
                      }}
                    >
                      {isMarathi ? activeItem.nameMr : activeItem.nameEn}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                      {metricMode === 'area'
                        ? `${activeItem.areaHa >= 100000 ? `${(activeItem.areaHa / 100000).toFixed(2)}L` : activeItem.areaHa.toFixed(0)} Ha`
                        : `${activeItem.count.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {totalMetric > 0 ? ((activeItem.value / totalMetric) * 100).toFixed(1) : 0}% {isMarathi ? 'वाटा' : 'share'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      {metricMode === 'area'
                        ? (isMarathi ? 'एकूण क्षेत्र' : 'Total Area')
                        : (isMarathi ? 'एकूण गट' : 'Total Parcels')}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                      {metricMode === 'area'
                        ? `${(totalArea / 100000).toFixed(2)}L Ha`
                        : totalCount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium font-mono">
                      {items.length} {isMarathi ? 'प्रवर्ग' : 'Classes'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Interactive Category List */}
            <div className="md:col-span-7 space-y-1.5">
              {items.map((item, index) => {
                const pct = totalMetric > 0 ? ((item.value / totalMetric) * 100).toFixed(1) : '0';
                const isHovered = activeIndex === index;

                return (
                  <Link
                    key={item.key}
                    href={item.filterHref}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                      isHovered
                        ? 'border-blue-300 bg-blue-50/70 shadow-2xs'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-[13.5px] truncate leading-[1.5] ${isHovered ? 'font-bold text-blue-950' : 'font-semibold text-[#0F172A]'}`}>
                        {isMarathi ? item.nameMr : item.nameEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-[13.5px] font-bold font-mono tabular-nums ${isHovered ? 'text-blue-900' : 'text-[#0F172A]'}`}>
                        {metricMode === 'area'
                          ? `${item.areaHa.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ha`
                          : `${item.count.toLocaleString('en-IN')} गट`}
                      </span>
                      <span className="text-[12px] font-medium text-[#475569] font-mono w-11 text-right tabular-nums">
                        {pct}%
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 transition" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER TOTAL ── */}
      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[13.5px] leading-[1.5]">
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
