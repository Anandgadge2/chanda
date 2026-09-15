'use client';

import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { ENFORCEMENT_STATUSES } from '../../lib/constants';

const STATUS_PALETTE = {
  FINAL_ORDER_PASSED: { color: '#059669', labelMr: 'अंतिम आदेश व शासन जमा' },
  HEARING_SCHEDULED: { color: '#4f46e5', labelMr: 'SDO / तहसीलदार सुनावणी' },
  NOTICE_ISSUED: { color: '#d97706', labelMr: 'कारणे दाखवा नोटीस' },
  FIELD_PANCHNAMA_COMPLETED: { color: '#2563eb', labelMr: 'स्थळ पंचनामा पूर्ण' },
  FLAGGED_IN_AUDIT: { color: '#64748b', labelMr: 'लेखापरीक्षणात नोंद' },
  RECTIFIED_7_12: { color: '#0d9488', labelMr: '७/१२ दुरुस्ती प्रमाणित' },
  DISMISSED: { color: '#94a3b8', labelMr: 'प्रकरण निकाली' },
};

export default function EnforcementDisposalDonut({ statuses = [], totalViolations = 0, repossessedArea = 0 }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = (statuses || []).map((item) => {
    const config = ENFORCEMENT_STATUSES[item.status] || { labelMr: item.status, labelEn: item.status };
    const palette = STATUS_PALETTE[item.status] || { color: '#64748b', labelMr: item.status };
    const count = Number(item.count || 0);

    return {
      status: item.status,
      nameMr: config.labelMr || palette.labelMr,
      nameEn: config.labelEn,
      count,
      value: count,
      color: palette.color,
    };
  }).filter((d) => d.count > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0) || totalViolations;
  const resolvedCount = chartData.find((d) => d.status === 'FINAL_ORDER_PASSED' || d.status === 'RECTIFIED_7_12')?.count || 0;
  const resolutionPct = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const activeItem = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-950 text-white px-2.5 py-1 rounded-lg shadow-xl border border-slate-800 text-[11px] pointer-events-none whitespace-nowrap z-50">
          <span className="font-bold">{item.nameMr}</span>: <span className="font-mono text-amber-400 font-bold">{item.count} ({pct}%)</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>अर्ध-न्यायिक प्रकरणे व निर्गती स्थिती</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-semibold">
                Court Pipeline
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              SDO व तहसीलदार महसूल न्यायालयीन प्रकरणांचे टप्पानिहाय विवरण
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
          {total} एकूण प्रकरणे
        </span>
      </div>

      {/* Side-by-Side Chart & Metric List (Image 2 Chart 4 Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-1">
        {/* Left: Donut Chart with Resolution Center */}
        <div className="md:col-span-6 relative h-52 flex items-center justify-center">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-6">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
              <p className="text-xs font-semibold">कोणतीही प्रलंबित प्रकरणे नाहीत.</p>
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
                        key={`cell-${entry.status}`}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Readout (Matching Image 2 Reference) */}
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
                      {activeItem.count} प्रकरणे
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">
                      {total > 0 ? ((activeItem.count / total) * 100).toFixed(0) : 0}% प्रमाण
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {resolutionPct}%
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 mt-0.5">
                      निर्गती दर
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {resolvedCount} / {total} आदेशित
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Stacked Status Items with Colored Bullets */}
        <div className="md:col-span-6 space-y-2">
          {chartData.map((item, index) => {
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
            const isHighlighted = activeIndex === index;

            return (
              <div
                key={item.status}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-1.5 rounded-lg border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isHighlighted
                    ? 'border-indigo-300 bg-indigo-50/70 shadow-2xs'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className={`text-xs truncate ${isHighlighted ? 'font-black text-indigo-950' : 'font-bold text-slate-800'}`}>
                    {item.nameMr}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-black block ${isHighlighted ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {item.count} प्रकरणे
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Outlay */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
        <span className="text-[11px] font-medium text-slate-500">
          शासन जमा / जप्त क्षेत्र:
        </span>
        <span className="font-black text-emerald-800 text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          {Number(repossessedArea).toFixed(2)} Ha शासन जमा
        </span>
      </div>
    </div>
  );
}
