'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Layers, ArrowUpRight } from 'lucide-react';
import { TENURE_CLASSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const TENURE_STYLES = {
  BHOGVATDAR_CLASS_1: { color: '#059669', barBg: 'bg-[#059669]', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  SARKAR_SHASAN: { color: '#2563EB', barBg: 'bg-[#2563EB]', badgeBg: 'bg-blue-50 text-blue-800 border-blue-200' },
  BHOGVATDAR_CLASS_2: { color: '#D97706', barBg: 'bg-[#D97706]', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  FOREST_JANGAL: { color: '#0D9488', barBg: 'bg-[#0D9488]', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
  DEVASTHAN_INAM: { color: '#7C3AED', barBg: 'bg-[#7C3AED]', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200' },
};

export default function TenureSpectrumBar({ data = [], taluka = '' }) {
  const { isMarathi } = useTranslation();
  const [metricMode, setMetricMode] = useState('area'); // 'area' | 'count'
  const [hoveredTenure, setHoveredTenure] = useState(null);

  const items = useMemo(() => {
    return (data || []).map((item) => {
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
        styles,
        filterHref: `/parcels?tenureClass=${item.tenure}${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`,
      };
    }).sort((a, b) => (metricMode === 'area' ? b.areaHa - a.areaHa : b.count - a.count));
  }, [data, metricMode, taluka]);

  const totalArea = items.reduce((sum, item) => sum + item.areaHa, 0);
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalMetric = metricMode === 'area' ? totalArea : totalCount;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between font-sans">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[18px] font-bold text-[#0F172A] flex items-center gap-2.5 truncate leading-[1.5]">
                <span>{isMarathi ? 'जमीन धारणा व मालकी वर्गवारी' : 'Land Tenure Classification'}</span>
                <span className="text-[13px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">
                  MLRC
                </span>
              </h3>
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

        {/* Proportional Segmented Spectrum Bar */}
        <div className="mt-4">
          <div className="h-4.5 w-full rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
            {items.map((item) => {
              const val = metricMode === 'area' ? item.areaHa : item.count;
              const pct = totalMetric > 0 ? (val / totalMetric) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={item.key}
                  style={{ width: `${pct}%` }}
                  onMouseEnter={() => setHoveredTenure(item.key)}
                  onMouseLeave={() => setHoveredTenure(null)}
                  className={`${item.styles.barBg} h-full transition-opacity cursor-pointer relative ${
                    hoveredTenure && hoveredTenure !== item.key ? 'opacity-40' : 'opacity-100'
                  }`}
                  title={`${isMarathi ? item.nameMr : item.nameEn}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Detailed Tenure Breakdown Grid */}
        <div className="mt-4 space-y-2.5">
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
                className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${
                  isHovered ? 'bg-slate-50 border-slate-300 shadow-2xs' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-3 h-3 rounded-full shrink-0 shadow-2xs ${item.styles.barBg}`} />
                  <span className="text-[14.5px] font-semibold text-[#0F172A] truncate leading-[1.5]">
                    {isMarathi ? item.nameMr : item.nameEn}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
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
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Total */}
      <div className="pt-3.5 border-t border-slate-100 mt-4 flex items-center justify-between text-[13.5px] leading-[1.5]">
        <span className="text-[#475569] font-medium">
          {isMarathi ? 'एकूण क्षेत्र व भूखंड:' : 'Total Volume:'}
        </span>
        <span className="font-bold text-[#0F172A] font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 tabular-nums">
          {totalArea.toFixed(2)} Ha • {totalCount.toLocaleString('en-IN')} {isMarathi ? 'गट' : 'Parcels'}
        </span>
      </div>
    </div>
  );
}

