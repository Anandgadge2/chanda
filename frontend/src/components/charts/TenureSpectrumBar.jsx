'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Layers, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
  const [hoveredTenure, setHoveredTenure] = useState(null);

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
        styles,
        filterHref: `/parcels?tenureClass=${item.tenure}${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`,
      };
    }).sort((a, b) => (metricMode === 'area' ? b.areaHa - a.areaHa : b.count - a.count));
  }, [sourceData, metricMode, taluka]);

  const totalArea = items.reduce((sum, item) => sum + item.areaHa, 0);
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalMetric = metricMode === 'area' ? totalArea : totalCount;

  // 4 Key Summary Tiers mirroring Enforcement Stages on the companion card
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
        subMr: 'मुक्त मालकी हक्क',
        subEn: 'Freehold',
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
        subMr: 'शासकीय राखीव',
        subEn: 'Sarkar',
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
        subMr: 'नियंत्रित सत्ताप्रकार',
        subEn: 'Restricted',
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
        subMr: 'संरक्षित व इनाम',
        subEn: 'Reserved',
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

        {/* ── SECTION 1: 4 KEY TENURE GROUP CARDS (Mirrors Enforcement Stages) ── */}
        <div className="my-4">
          <div className="text-[13.5px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between leading-[1.5]">
            <span>{isMarathi ? 'प्रमुख धारणा प्रवर्ग (KEY TENURE TIERS)' : 'Key Tenure Tiers'}</span>
            <span className="text-[13px] font-medium text-slate-400">
              {isMarathi ? 'वैधानिक वर्गवारी' : 'Statutory Breakdown'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {summaryTiers.map((tier) => {
              const displayVal = metricMode === 'area'
                ? `${tier.valArea >= 100000 ? `${(tier.valArea / 100000).toFixed(2)}L` : tier.valArea.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Ha`
                : `${tier.valCount.toLocaleString('en-IN')}`;

              return (
                <div
                  key={tier.stageNumber}
                  className={`p-3.5 sm:p-4 rounded-xl border ${tier.cardBorder} ${tier.cardBg} flex flex-col justify-between transition-all duration-150 hover:shadow-xs`}
                >
                  <div className="flex items-center justify-between text-[13.5px] font-bold leading-[1.5]">
                    <span className={tier.idxText}>#{tier.stageNumber}</span>
                    <span className={`text-[12px] font-mono px-1.5 py-0.5 rounded bg-white/70 ${tier.idxText}`}>
                      {tier.pct}%
                    </span>
                  </div>

                  <p className={`text-xl sm:text-[22px] font-black tracking-tight my-2 tabular-nums font-mono ${tier.countText}`}>
                    {displayVal}
                  </p>

                  <p className={`text-[14px] font-bold truncate leading-[1.5] ${tier.labelText}`}>
                    {isMarathi ? tier.titleMr : tier.titleEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MULTI-COLOR PROPORTIONAL SEGMENTED SPECTRUM BAR ── */}
        <div className="my-3">
          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100 border border-slate-200/90 shadow-2xs">
            {items.map((item) => {
              const val = metricMode === 'area' ? item.areaHa : item.count;
              const pct = totalMetric > 0 ? (val / totalMetric) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={item.key}
                  style={{ width: `${pct}%`, backgroundColor: item.styles.color }}
                  onMouseEnter={() => setHoveredTenure(item.key)}
                  onMouseLeave={() => setHoveredTenure(null)}
                  className="h-full transition-opacity cursor-pointer relative"
                  title={`${isMarathi ? item.nameMr : item.nameEn}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* ── SECTION 2: DETAILED TENURE BREAKDOWN WITH PROGRESS BARS (Mirrors Breach Categories) ── */}
        <div className="pt-3.5 border-t border-slate-100">
          <div className="text-[13.5px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between leading-[1.5]">
            <span>{isMarathi ? 'धारणा प्रवर्गनिहाय तपशील व विस्तार' : 'Tenure Categories & Exposure'}</span>
            <span className="text-[13px] font-medium text-slate-400">
              {isMarathi ? 'क्षेत्रफळ व वाटा' : 'Area & Share'}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const val = metricMode === 'area' ? item.areaHa : item.count;
              const pct = totalMetric > 0 ? ((val / totalMetric) * 100).toFixed(1) : '0';
              const isHovered = hoveredTenure === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.filterHref}
                  onMouseEnter={() => setHoveredTenure(item.key)}
                  onMouseLeave={() => setHoveredTenure(null)}
                  className={`p-3 rounded-xl border transition-all block group ${
                    isHovered
                      ? 'bg-slate-50 border-slate-300 shadow-2xs'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.styles.color }}
                      />
                      <span className="text-[14.5px] font-semibold text-[#0F172A] truncate leading-[1.5]">
                        {isMarathi ? item.nameMr : item.nameEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[14.5px] font-bold font-mono text-[#0F172A] tabular-nums">
                        {metricMode === 'area'
                          ? `${item.areaHa.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Ha`
                          : `${item.count.toLocaleString('en-IN')} गट`}
                      </span>
                      <span className="text-[13.5px] font-medium text-[#475569] font-mono w-14 text-right tabular-nums">
                        {pct}%
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition" />
                    </div>
                  </div>

                  {/* Horizontal Visual Fill Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.styles.color,
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FOOTER TOTAL ── */}
      <div className="pt-3.5 border-t border-slate-100 mt-4 flex items-center justify-between text-[13.5px] leading-[1.5]">
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
