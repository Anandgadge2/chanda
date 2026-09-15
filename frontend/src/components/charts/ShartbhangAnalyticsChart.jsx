'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';
import { VIOLATION_TYPES, ENFORCEMENT_STATUSES } from '../../lib/constants';

const VIOLATION_PALETTE = {
  SHARTBHANG: { barColor: 'bg-rose-600', textColor: 'text-rose-700', badgeColor: 'bg-rose-50 border-rose-200' },
  TRIBAL_LAND_VIOLATION: { barColor: 'bg-red-600', textColor: 'text-red-700', badgeColor: 'bg-red-50 border-red-200' },
  UNAUTHORIZED_NA_CONVERSION: { barColor: 'bg-amber-600', textColor: 'text-amber-700', badgeColor: 'bg-amber-50 border-amber-200' },
  ENCROACHMENT: { barColor: 'bg-orange-600', textColor: 'text-orange-700', badgeColor: 'bg-orange-50 border-orange-200' },
  POKALIST_NONDI: { barColor: 'bg-yellow-600', textColor: 'text-yellow-800', badgeColor: 'bg-yellow-50 border-yellow-200' },
  GOVERNMENT_NAME_MISSING: { barColor: 'bg-slate-600', textColor: 'text-slate-700', badgeColor: 'bg-slate-100 border-slate-200' },
};

export default function ShartbhangAnalyticsChart({ violations = [], statuses = [] }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'pipeline'

  const totalViolations = (violations || []).reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalEncroachedArea = (violations || []).reduce((acc, curr) => acc + (curr.encroachedAreaHa || 0), 0);

  // Map category data
  const categoryData = Object.entries(VIOLATION_TYPES).map(([typeKey, config]) => {
    const matched = (violations || []).find((v) => v.type === typeKey);
    const count = matched ? Number(matched.count || 0) : 0;
    const areaHa = matched ? Number(Number(matched.encroachedAreaHa || 0).toFixed(2)) : 0;
    const pct = totalViolations > 0 ? ((count / totalViolations) * 100).toFixed(0) : 0;
    const palette = VIOLATION_PALETTE[typeKey] || {
      barColor: 'bg-blue-600',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-50 border-blue-200',
    };

    return {
      typeKey,
      labelMr: config.labelMr,
      labelEn: config.labelEn,
      count,
      areaHa,
      pct: Number(pct),
      ...palette,
    };
  });

  // Map enforcement pipeline data
  const pipelineStages = [
    { key: 'FLAGGED_IN_AUDIT', labelMr: 'लेखापरीक्षणात नोंद', short: 'ऑडिट नोंद' },
    { key: 'FIELD_PANCHNAMA_COMPLETED', labelMr: 'स्थळ पंचनामा पूर्ण', short: 'पंचनामा' },
    { key: 'NOTICE_ISSUED', labelMr: 'कारणे दाखवा नोटीस', short: 'नोटीस बजावली' },
    { key: 'HEARING_SCHEDULED', labelMr: 'SDO / तहसीलदार सुनावणी', short: 'सुनावणी सुरू' },
    { key: 'FINAL_ORDER_PASSED', labelMr: 'अंतिम आदेश / शासन जमा', short: 'आदेश पारित' },
  ];

  const pipelineData = pipelineStages.map((stage) => {
    const matched = (statuses || []).find((s) => s.status === stage.key);
    return {
      ...stage,
      count: matched ? Number(matched.count || 0) : 0,
    };
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>शर्तभंग व महसूल उल्लंघन विश्लेषण</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-semibold">
                {totalViolations} प्रकरणे
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              MLRC कलम ३६, ३६अ, ५०-५४ व अ.कृ. अनधिकृत वापर सनियंत्रण
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto" role="group" aria-label="Violations View Toggle">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={activeTab === 'categories'}
          >
            वैधानिक संवर्ग
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
              activeTab === 'pipeline'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={activeTab === 'pipeline'}
          >
            सुनावणी टप्पे
          </button>
        </div>
      </div>

      {/* Tab 1: Categories Graphical Bars */}
      {activeTab === 'categories' && (
        <div className="my-2.5 space-y-2.5">
          {categoryData.map((item) => (
            <div key={item.typeKey} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 truncate pr-2 text-[11px]">
                  {item.labelMr}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {item.areaHa > 0 && (
                    <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
                      {item.areaHa.toFixed(2)} Ha
                    </span>
                  )}
                  <span className="font-black text-slate-900 px-1.5 py-0.2 bg-slate-100 rounded text-[11px]">
                    {item.count}
                  </span>
                </div>
              </div>

              {/* Graphical Progress Fill */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex items-center">
                <div
                  className={`h-full ${item.barColor} transition-all duration-500 rounded-full`}
                  style={{
                    width: totalViolations > 0 ? `${Math.max((item.count / totalViolations) * 100, item.count > 0 ? 6 : 0)}%` : '0%',
                  }}
                  title={`${item.labelMr}: ${item.count} प्रकरणे (${item.pct}%)`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Quasi-Judicial Pipeline Funnel */}
      {activeTab === 'pipeline' && (
        <div className="my-2.5 py-1">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {pipelineData.map((stage, idx) => (
              <div
                key={stage.key}
                className="relative p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    टप्पा {idx + 1}
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md border ${
                      stage.count > 0
                        ? 'bg-blue-900 text-white border-blue-950'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {stage.count}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-[11px] font-bold text-slate-900 leading-snug line-clamp-2">
                    {stage.labelMr}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-[11px] font-medium">
                सर्व अर्ध-न्यायिक सुनावण्या महसूल न्यायालयीन प्रणालीशी (SDO Court) संलग्न आहेत.
              </span>
            </div>
            <Link
              href="/cases"
              className="text-[11px] font-bold text-blue-900 hover:text-blue-800 shrink-0 underline"
            >
              न्यायालयीन नोंदवही
            </Link>
          </div>
        </div>
      )}

      {/* Footer Details */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
          <span>बाधित महसूल क्षेत्र:</span>
          <span className="font-black text-rose-700">{totalEncroachedArea.toFixed(2)} Ha</span>
        </div>

        <Link
          href="/cases"
          className="text-[11px] text-blue-900 hover:text-blue-800 font-bold flex items-center gap-0.5 transition"
        >
          <span>सर्व प्रकरणे व सुनावण्या</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
