'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, Scale, ShieldAlert } from 'lucide-react';
import { VIOLATION_TYPES, ENFORCEMENT_STATUSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const TYPE_CONFIG = {
  SHARTBHANG: { color: '#E11D48', barBg: 'bg-[#E11D48]' },
  TRIBAL_LAND_VIOLATION: { color: '#2563EB', barBg: 'bg-[#2563EB]' },
  ENCROACHMENT: { color: '#D97706', barBg: 'bg-[#D97706]' },
  UNAUTHORIZED_NA_CONVERSION: { color: '#0284C7', barBg: 'bg-[#0284C7]' },
  POKALIST_NONDI: { color: '#7C3AED', barBg: 'bg-[#7C3AED]' },
  GOVERNMENT_NAME_MISSING: { color: '#64748B', barBg: 'bg-[#64748B]' },
};

export default function EnforcementPipelineMatrix({
  violations = [],
  statuses = [],
  totalViolations = 0,
  repossessedArea = 0,
  taluka = '',
}) {
  const { isMarathi } = useTranslation();

  // 1. Pipeline Stages
  const pipelineStages = useMemo(() => {
    const statusMap = new Map((statuses || []).map((s) => [s.status, Number(s.count || 0)]));
    return [
      {
        key: 'NOTICE_ISSUED',
        labelMr: 'नोटीस बजावली',
        labelEn: 'Notice Issued',
        count: statusMap.get('NOTICE_ISSUED') || 0,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
      },
      {
        key: 'FIELD_PANCHNAMA_COMPLETED',
        labelMr: 'स्थळ पंचनामा',
        labelEn: 'Spot Panchnama',
        count: statusMap.get('FIELD_PANCHNAMA_COMPLETED') || 0,
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      },
      {
        key: 'HEARING_SCHEDULED',
        labelMr: 'SDO सुनावणी',
        labelEn: 'SDO Hearing',
        count: statusMap.get('HEARING_SCHEDULED') || 0,
        color: 'text-purple-700 bg-purple-50 border-purple-200',
      },
      {
        key: 'FINAL_ORDER_PASSED',
        labelMr: 'शासन जमा आदेश',
        labelEn: 'Govt Vested',
        count: statusMap.get('FINAL_ORDER_PASSED') || 0,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
    ];
  }, [statuses]);

  // 2. Ranked Violation Categories
  const violationList = useMemo(() => {
    return (violations || [])
      .map((item) => {
        const config = VIOLATION_TYPES[item.type] || { labelMr: item.type, labelEn: item.type };
        const cfg = TYPE_CONFIG[item.type] || { color: '#64748B', barBg: 'bg-slate-500' };
        const count = Number(item.count || 0);
        const areaHa = Number(Number(item.encroachedAreaHa || 0).toFixed(2));
        return {
          type: item.type,
          nameMr: config.labelMr,
          nameEn: config.labelEn,
          count,
          areaHa,
          cfg,
        };
      })
      .filter((v) => v.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [violations]);

  const maxViolationCount = violationList.length > 0 ? violationList[0].count : 1;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                <span>{isMarathi ? 'महसूल वाद व न्यायालयीन कार्यवाही' : 'Enforcement & Legal Inquiries'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold shrink-0">
                  {totalViolations} {isMarathi ? 'प्रकरणे' : 'Cases'}
                </span>
              </h3>
            </div>
          </div>

          <Link
            href={`/cases${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{isMarathi ? 'न्यायालयीन कक्ष' : 'Cases'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-Stage Enforcement Pipeline Ribbon */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.key}
              className={`p-2.5 rounded-lg border text-center flex flex-col justify-between ${stage.color}`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold opacity-80">
                <span>#{idx + 1}</span>
                <span>{isMarathi ? 'टप्पा' : 'Stage'}</span>
              </div>
              <p className="text-lg font-black font-mono my-1">{stage.count.toLocaleString('en-IN')}</p>
              <p className="text-[11px] font-bold truncate">{isMarathi ? stage.labelMr : stage.labelEn}</p>
            </div>
          ))}
        </div>

        {/* Ranked Severity Progress Bars */}
        <div className="mt-4 space-y-2.5">
          {violationList.slice(0, 5).map((v) => {
            const pct = (v.count / maxViolationCount) * 100;
            return (
              <Link
                key={v.type}
                href={`/cases?violationType=${v.type}${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
                className="block group"
              >
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition truncate">
                    {isMarathi ? v.nameMr : v.nameEn}
                  </span>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-extrabold text-slate-900">{v.count.toLocaleString('en-IN')} वाद</span>
                    {v.areaHa > 0 && <span className="text-slate-400 text-[11px]">({v.areaHa} Ha)</span>}
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.max(5, pct)}%` }}
                    className={`h-full ${v.cfg.barBg} rounded-full transition-all`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Repossession Summary Strip */}
      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          {isMarathi ? 'शासन जमा झालेली भूमी:' : 'Total Govt Vested:'}
        </span>
        <span className="font-extrabold text-emerald-800 font-mono bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
          {Number(repossessedArea || 0).toFixed(2)} Ha {isMarathi ? 'शासन जमा' : 'Repossessed'}
        </span>
      </div>
    </div>
  );
}

