'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { VIOLATION_TYPES, ENFORCEMENT_STATUSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const VIOLATION_PALETTE = {
  SHARTBHANG: { color: '#e11d48', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  ENCROACHMENT: { color: '#ea580c', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  TRIBAL_LAND_VIOLATION: { color: '#7c3aed', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  UNAUTHORIZED_NA_CONVERSION: { color: '#0284c7', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  POKALIST_NONDI: { color: '#d97706', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  GOVERNMENT_NAME_MISSING: { color: '#64748b', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

const STATUS_PALETTE = {
  FINAL_ORDER_PASSED: { color: '#059669', labelMr: 'अंतिम आदेश व शासन जमा', labelEn: 'Final Order & Govt Vested' },
  HEARING_SCHEDULED: { color: '#4f46e5', labelMr: 'SDO / तहसीलदार सुनावणी', labelEn: 'SDO / Tahsildar Hearing' },
  NOTICE_ISSUED: { color: '#d97706', labelMr: 'कारणे दाखवा नोटीस', labelEn: 'Show-Cause Notice Issued' },
  FIELD_PANCHNAMA_COMPLETED: { color: '#2563eb', labelMr: 'स्थळ पंचनामा पूर्ण', labelEn: 'Spot Panchnama Completed' },
  FLAGGED_IN_AUDIT: { color: '#64748b', labelMr: 'लेखापरीक्षणात नोंद', labelEn: 'Audit Flagged' },
  RECTIFIED_7_12: { color: '#0d9488', labelMr: '७/१२ दुरुस्ती प्रमाणित', labelEn: '7/12 Rectified' },
  DISMISSED: { color: '#94a3b8', labelMr: 'प्रकरण निकाली', labelEn: 'Dismissed' },
};

export default function EnforcementDisposalDonut({
  violations = [],
  statuses = [],
  totalViolations = 0,
  repossessedArea = 0,
}) {
  const { isMarathi } = useTranslation();
  const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'pipeline'
  const [metricType, setMetricType] = useState('count'); // 'count' | 'area'
  const [activeIndex, setActiveIndex] = useState(null);

  // Transform violations data
  const violationData = (violations || [])
    .map((item) => {
      const config = VIOLATION_TYPES[item.type] || {
        labelMr: item.type,
        labelEn: item.type,
      };
      const palette = VIOLATION_PALETTE[item.type] || {
        color: '#64748b',
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
      };
      const count = Number(item.count || 0);
      const areaHa = Number(Number(item.encroachedAreaHa || 0).toFixed(2));

      return {
        key: item.type,
        nameMr: config.labelMr,
        nameEn: config.labelEn,
        count,
        areaHa,
        value: metricType === 'area' ? areaHa : count,
        color: palette.color,
        bg: palette.bg,
        text: palette.text,
        border: palette.border,
      };
    })
    .filter((d) => d.count > 0 || d.areaHa > 0)
    .sort((a, b) => b.count - a.count);

  // Transform pipeline data
  const statusData = (statuses || [])
    .map((item) => {
      const config = ENFORCEMENT_STATUSES[item.status] || {
        labelMr: item.status,
        labelEn: item.status,
      };
      const palette = STATUS_PALETTE[item.status] || { color: '#64748b', labelMr: item.status, labelEn: item.status };
      const count = Number(item.count || 0);

      return {
        key: item.status,
        nameMr: palette.labelMr || config.labelMr,
        nameEn: palette.labelEn || config.labelEn || palette.labelMr,
        count,
        areaHa: 0,
        value: count,
        color: palette.color,
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
      };
    })
    .filter((d) => d.count > 0);

  const activeChartData = viewMode === 'categories' ? violationData : statusData;
  const totalValue = activeChartData.reduce((acc, curr) => acc + curr.value, 0);
  const totalCount = activeChartData.reduce((acc, curr) => acc + curr.count, 0) || totalViolations;
  const totalAreaHa = violationData.reduce((acc, curr) => acc + curr.areaHa, 0);

  const activeItem = activeIndex !== null && activeChartData[activeIndex] ? activeChartData[activeIndex] : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
      const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

      return (
        <div className="bg-slate-950 text-white px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-800 text-[11px] pointer-events-none whitespace-nowrap z-50">
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{displayName}</span>
          </div>
          <div className="text-[10px] text-slate-300 font-mono flex items-center gap-2">
            <span>{item.count} {isMarathi ? 'प्रकरणे' : 'Cases'}</span>
            {item.areaHa > 0 && <span>({item.areaHa.toFixed(2)} Ha)</span>}
            <span className="text-amber-400 font-bold">[{pct}%]</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300/80 transition-all">
      {/* Header with Switchers */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>
                {viewMode === 'categories'
                  ? (isMarathi ? 'शर्तभंग व महसूल उल्लंघन प्रकार' : 'Breach & Revenue Violation Categories')
                  : (isMarathi ? 'अर्ध-न्यायिक प्रकरणे व स्थिती' : 'Quasi-Judicial Cases & Status')}
              </span>
            
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {viewMode === 'categories'
                ? (isMarathi
                    ? 'MLRC कलम ३६, ३६अ, ५०-५४ व भोगवटादार वर्ग-२ शर्तभंग'
                    : 'MLRC Sec 36, 36A, 50-54 & Occupant Class-2 Breaches')
                : (isMarathi
                    ? 'SDO व तहसीलदार महसूल न्यायालयीन प्रकरणांचे टप्पानिहाय विवरण'
                    : 'Stage-wise summary of SDO & Tahsildar revenue court cases')}
            </p>
          </div>
        </div>

        {/* View Switchers: Mode + Metric Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          {/* Mode Switcher */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80" role="group" aria-label={isMarathi ? 'दृश्य प्रकार' : 'View Mode'}>
            <button
              type="button"
              onClick={() => {
                setViewMode('categories');
                setActiveIndex(null);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                viewMode === 'categories'
                  ? 'bg-white text-rose-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMarathi ? 'संवर्गनिहाय' : 'Categories'}
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('pipeline');
                setActiveIndex(null);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                viewMode === 'pipeline'
                  ? 'bg-white text-indigo-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMarathi ? 'टप्पे' : 'Pipeline'}
            </button>
          </div>

          {/* Metric Switcher (only for categories view) */}
          {viewMode === 'categories' && (
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80" role="group" aria-label={isMarathi ? 'मापन पद्धती' : 'Metric Switcher'}>
              <button
                type="button"
                onClick={() => setMetricType('count')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                  metricType === 'count'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={isMarathi ? 'प्रकरण संख्या' : 'Case Count'}
              >
                {isMarathi ? 'संख्या' : 'Count'}
              </button>
              <button
                type="button"
                onClick={() => setMetricType('area')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                  metricType === 'area'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={isMarathi ? 'क्षेत्र हेक्टर' : 'Area (Ha)'}
              >
                {isMarathi ? 'क्षेत्र Ha' : 'Area (Ha)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Chart & Metric List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-1.5">
        {/* Left: Donut Chart with Dynamic Center Readout */}
        <div className="md:col-span-6 relative h-52 flex items-center justify-center">
          {activeChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-6">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5] mb-2 opacity-40 text-emerald-500" />
              <p className="text-xs font-semibold">{isMarathi ? 'कोणतीही प्रलंबित प्रकरणे नाहीत.' : 'No pending cases.'}</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {activeChartData.map((entry, index) => (
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

              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1 text-center">
                {activeItem ? (
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border shadow-2xs mb-0.5 max-w-[120px]"
                      style={{
                        backgroundColor: `${activeItem.color}15`,
                        color: activeItem.color,
                        borderColor: `${activeItem.color}40`,
                      }}
                    >
                      {isMarathi ? activeItem.nameMr : (activeItem.nameEn || activeItem.nameMr)}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                      {metricType === 'area' && viewMode === 'categories'
                        ? `${activeItem.areaHa.toFixed(1)} Ha`
                        : `${activeItem.count} ${isMarathi ? 'प्रकरणे' : 'Cases'}`}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 font-mono">
                      {totalValue > 0
                        ? ((activeItem.value / totalValue) * 100 < 1 && activeItem.value > 0
                            ? '<1%'
                            : `${((activeItem.value / totalValue) * 100).toFixed(0)}% ${isMarathi ? 'वाटा' : 'share'}`)
                        : (isMarathi ? '०% वाटा' : '0% share')}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border shadow-2xs mb-0.5 bg-rose-50 text-rose-700 border-rose-200">
                      {viewMode === 'categories'
                        ? (isMarathi ? 'एकूण उल्लंघन' : 'Total Violations')
                        : (isMarathi ? 'एकूण प्रकरणे' : 'Total Cases')}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none my-0.5 font-mono">
                      {metricType === 'area' && viewMode === 'categories'
                        ? `${totalAreaHa.toFixed(1)} Ha`
                        : `${totalCount} ${isMarathi ? 'प्रकरणे' : 'Cases'}`}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 font-mono">
                      {viewMode === 'categories'
                        ? `${totalAreaHa.toFixed(1)} Ha ${isMarathi ? 'बाधित क्षेत्र' : 'Affected Area'}`
                        : `${totalViolations} ${isMarathi ? 'दाखल प्रकरणे' : 'Filed Cases'}`}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Stacked Categories / Status Items with Legend Bullets */}
        {/* Strictly single-language: If Marathi is active show ONLY Marathi, if English is active show ONLY English */}
        <div className="md:col-span-6 space-y-1.5">
          {activeChartData.map((item, index) => {
            const pct = totalValue > 0
              ? ((item.value / totalValue) * 100 < 1 && item.value > 0
                  ? '<1'
                  : ((item.value / totalValue) * 100).toFixed(0))
              : 0;
            const isHighlighted = activeIndex === index;
            const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

            return (
              <div
                key={item.key}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-2 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isHighlighted
                    ? 'border-slate-400 bg-slate-100/90 shadow-2xs'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <span className={`text-xs block ${isHighlighted ? 'font-black text-slate-950' : 'font-bold text-slate-800'}`}>
                      {displayName}
                    </span>
                    {item.areaHa > 0 && viewMode === 'categories' && (
                      <span className="text-[10px] text-slate-500 font-semibold block leading-tight font-mono">
                        {item.areaHa.toFixed(2)} {isMarathi ? 'Ha बाधित' : 'Ha affected'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-black block font-mono ${isHighlighted ? 'text-slate-950' : 'text-slate-900'}`}>
                    {item.count}
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
            ? 'शर्तभंग व महसूल उल्लंघन संवर्ग आलेख सारणी'
            : 'Breach and Revenue Violation Categories Data Table'}
        </caption>
        <thead>
          <tr>
            <th scope="col">{isMarathi ? 'उल्लंघन प्रकार / टप्पा' : 'Violation Type / Stage'}</th>
            <th scope="col">{isMarathi ? 'प्रकरण संख्या' : 'Case Count'}</th>
            <th scope="col">{isMarathi ? 'बाधित क्षेत्र (हे.)' : 'Affected Area (Ha)'}</th>
            <th scope="col">{isMarathi ? 'प्रमाण' : 'Share'}</th>
          </tr>
        </thead>
        <tbody>
          {activeChartData.map((item) => (
            <tr key={item.key}>
              <td>{isMarathi ? item.nameMr : (item.nameEn || item.nameMr)}</td>
              <td>{item.count}</td>
              <td>{item.areaHa}</td>
              <td>{totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Outlay */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <span>{isMarathi ? 'एकूण बाधित क्षेत्र:' : 'Total Affected Area:'}</span>
          <span className="font-black text-rose-700 font-mono">
            {totalAreaHa.toFixed(2)} Ha
          </span>
        </div>

        <Link
          href="/cases"
          className="font-black text-emerald-800 text-[11px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md transition flex items-center gap-1 font-mono"
          title={isMarathi ? 'प्रकरणे व शासन जमा आदेश सूची' : 'Cases & Govt Vesting Order List'}
        >
          <span>{Number(repossessedArea).toFixed(2)} {isMarathi ? 'Ha शासन जमा' : 'Ha Govt Vested'}</span>
        </Link>
      </div>
    </div>
  );
}
