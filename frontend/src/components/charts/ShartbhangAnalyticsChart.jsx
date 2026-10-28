'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldAlert, Scale } from 'lucide-react';
import { VIOLATION_TYPES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const VIOLATION_PALETTE = {
  SHARTBHANG: { barColor: 'bg-rose-600', textColor: 'text-rose-700', badgeColor: 'bg-rose-50 border-rose-200' },
  TRIBAL_LAND_VIOLATION: { barColor: 'bg-red-600', textColor: 'text-red-700', badgeColor: 'bg-red-50 border-red-200' },
  UNAUTHORIZED_NA_CONVERSION: { barColor: 'bg-amber-600', textColor: 'text-amber-700', badgeColor: 'bg-amber-50 border-amber-200' },
  ENCROACHMENT: { barColor: 'bg-orange-600', textColor: 'text-orange-700', badgeColor: 'bg-orange-50 border-orange-200' },
  POKALIST_NONDI: { barColor: 'bg-yellow-600', textColor: 'text-yellow-800', badgeColor: 'bg-yellow-50 border-yellow-200' },
  GOVERNMENT_NAME_MISSING: { barColor: 'bg-slate-600', textColor: 'text-slate-700', badgeColor: 'bg-slate-100 border-slate-200' },
};

export default function ShartbhangAnalyticsChart({ violations = [], statuses = [] }) {
  const { isMarathi } = useTranslation();
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'categories'

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

  // Map enforcement pipeline data with pure single-language labels
  const pipelineStages = [
    {
      key: 'FLAGGED_IN_AUDIT',
      labelMr: 'लेखापरीक्षणात नोंद',
      labelEn: 'Audit Flagged',
      stageMr: 'टप्पा १',
      stageEn: 'STAGE 1',
    },
    {
      key: 'FIELD_PANCHNAMA_COMPLETED',
      labelMr: 'स्थळ पंचनामा पूर्ण',
      labelEn: 'Spot Panchnama Completed',
      stageMr: 'टप्पा २',
      stageEn: 'STAGE 2',
    },
    {
      key: 'NOTICE_ISSUED',
      labelMr: 'कारणे दाखवा नोटीस',
      labelEn: 'Show-Cause Notice Issued',
      stageMr: 'टप्पा ३',
      stageEn: 'STAGE 3',
    },
    {
      key: 'HEARING_SCHEDULED',
      labelMr: 'SDO / तहसीलदार सुनावणी',
      labelEn: 'SDO / Tahsildar Hearing',
      stageMr: 'टप्पा ४',
      stageEn: 'STAGE 4',
    },
    {
      key: 'FINAL_ORDER_PASSED',
      labelMr: 'अंतिम आदेश / शासन जमा',
      labelEn: 'Final Order / Govt Vested',
      stageMr: 'टप्पा ५',
      stageEn: 'STAGE 5',
    },
  ];

  const pipelineData = pipelineStages.map((stage) => {
    const matched = (statuses || []).find((s) => s.status === stage.key);
    return {
      ...stage,
      count: matched ? Number(matched.count || 0) : 0,
    };
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300/80 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
              <span>{isMarathi ? 'शर्तभंग व महसूल उल्लंघन विश्लेषण' : 'Breach & Revenue Violation Analysis'}</span>
             
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {isMarathi
                ? 'MLRC कलम ३६, ३६अ, ५०-५४ व अ.कृ. अनधिकृत वापर सनियंत्रण'
                : 'MLRC Sec 36, 36A, 50-54 & Unauthorized Non-Agri Land Monitoring'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div
          className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto shrink-0"
          role="group"
          aria-label={isMarathi ? 'आलेख दृश्य प्रकार' : 'View Toggle'}
        >
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={activeTab === 'categories'}
          >
            {isMarathi ? 'वैधानिक संवर्ग' : 'Statutory Categories'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-white text-blue-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={activeTab === 'pipeline'}
          >
            {isMarathi ? 'सुनावणी टप्पे' : 'Hearing Pipeline'}
          </button>
        </div>
      </div>

      {/* Tab 1: Categories Graphical Bars */}
      {activeTab === 'categories' && (
        <div className="my-3 space-y-2.5">
          {categoryData.map((item) => (
            <div key={item.typeKey} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 truncate pr-2 text-[11px]">
                  {isMarathi ? item.labelMr : (item.labelEn || item.labelMr)}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {item.areaHa > 0 && (
                    <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
                      {item.areaHa.toFixed(2)} Ha
                    </span>
                  )}
                  <span className="font-black text-slate-900 px-1.5 py-0.2 bg-slate-100 rounded text-[11px] font-mono">
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
                  title={`${isMarathi ? item.labelMr : (item.labelEn || item.labelMr)}: ${item.count} ${isMarathi ? 'प्रकरणे' : 'Cases'} (${item.pct}%)`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Quasi-Judicial Pipeline Funnel */}
      {activeTab === 'pipeline' && (
        <div className="my-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
            {pipelineData.map((stage) => (
              <div
                key={stage.key}
                className="relative p-2.5 sm:p-3 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between min-h-[92px] shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                    {isMarathi ? stage.stageMr : stage.stageEn}
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md border font-mono ${
                      stage.count > 0
                        ? 'bg-blue-900 text-white border-blue-950 shadow-2xs'
                        : 'bg-slate-200/80 text-slate-600 border-slate-300/80'
                    }`}
                  >
                    {stage.count}
                  </span>
                </div>

                <div className="mt-2.5">
                  <p className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
                    {isMarathi ? stage.labelMr : stage.labelEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-[11px] font-medium leading-tight">
                {isMarathi
                  ? 'सर्व अर्ध-न्यायिक सुनावण्या महसूल न्यायालयीन प्रणालीशी (SDO Court) संलग्न आहेत.'
                  : 'All quasi-judicial hearings are linked to the Revenue Court System (SDO Court).'}
              </span>
            </div>
            <Link
              href="/cases"
              className="text-[11px] font-bold text-blue-900 hover:text-blue-800 shrink-0 underline self-end sm:self-auto"
            >
              {isMarathi ? 'न्यायालयीन नोंदवही' : 'Court Register'}
            </Link>
          </div>
        </div>
      )}

      {/* Screen Reader Accessible Data Table (WCAG 1.1.1) */}
      <table className="sr-only">
        <caption>
          {isMarathi
            ? 'शर्तभंग विश्लेषण व न्यायालयीन टप्पे सारणी'
            : 'Breach and Revenue Violation Analysis Data Table'}
        </caption>
        <thead>
          <tr>
            <th scope="col">{isMarathi ? 'प्रकार / टप्पा' : 'Category / Stage'}</th>
            <th scope="col">{isMarathi ? 'प्रकरणे संख्या' : 'Case Count'}</th>
            <th scope="col">{isMarathi ? 'टक्केवारी' : 'Percentage'}</th>
            <th scope="col">{isMarathi ? 'बाधित क्षेत्र (हे.)' : 'Affected Area (Ha)'}</th>
          </tr>
        </thead>
        <tbody>
          {categoryData.map((c) => (
            <tr key={c.typeKey}>
              <td>{isMarathi ? c.labelMr : (c.labelEn || c.labelMr)}</td>
              <td>{c.count}</td>
              <td>{c.pct}%</td>
              <td>{c.areaHa}</td>
            </tr>
          ))}
          {pipelineData.map((p) => (
            <tr key={p.key}>
              <td>{isMarathi ? p.labelMr : p.labelEn}</td>
              <td>{p.count}</td>
              <td>{isMarathi ? 'न्यायालयीन टप्पा' : 'Hearing Stage'}</td>
              <td>-</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Details */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
          <span>{isMarathi ? 'बाधित महसूल क्षेत्र:' : 'Affected Revenue Area:'}</span>
          <span className="font-black text-rose-700 font-mono">
            {totalEncroachedArea.toFixed(2)} Ha
          </span>
        </div>

        <Link
          href="/cases"
          className="text-[11px] text-blue-900 hover:text-blue-800 font-bold flex items-center gap-0.5 transition"
        >
          <span>{isMarathi ? 'सर्व प्रकरणे व सुनावण्या' : 'All Cases & Hearings'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
