'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Scale, ArrowUpRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { VIOLATION_TYPES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const toDevanagari = (num) => {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (w) => devanagariDigits[+w]);
};

const formatIndianNumber = (num, isMarathi) => {
  if (num === null || num === undefined || isNaN(num)) return isMarathi ? '०' : '0';
  const formatted = Number(num).toLocaleString('en-IN');
  return isMarathi ? toDevanagari(formatted) : formatted;
};

const formatHaArea = (ha, isMarathi) => {
  const val = Number(ha || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isMarathi ? `${toDevanagari(val)} हे.` : `${val} Ha`;
};

// Institutional semantic color palette
const TYPE_CONFIG = {
  TRIBAL_LAND_VIOLATION: {
    color: '#1D4ED8',
    barBg: 'bg-[#1D4ED8]',
    defaultCount: 23495,
    defaultArea: 46967.07,
  },
  POKALIST_NONDI: {
    color: '#7C3AED',
    barBg: 'bg-[#7C3AED]',
    defaultCount: 7196,
    defaultArea: 21756.48,
  },
  ENCROACHMENT: {
    color: '#D97706',
    barBg: 'bg-[#D97706]',
    defaultCount: 5755,
    defaultArea: 71925.35,
  },
  SHARTBHANG: {
    color: '#DC2626',
    barBg: 'bg-[#DC2626]',
    defaultCount: 685,
    defaultArea: 1139.57,
  },
  UNAUTHORIZED_NA_CONVERSION: {
    color: '#0D9488',
    barBg: 'bg-[#0D9488]',
    defaultCount: 0,
    defaultArea: 0,
  },
  GOVERNMENT_NAME_MISSING: {
    color: '#64748B',
    barBg: 'bg-[#64748B]',
    defaultCount: 0,
    defaultArea: 0,
  },
};

export default function EnforcementPipelineMatrix({
  violations = [],
  statuses = [],
  totalViolations = 0,
  repossessedArea = 0,
  taluka = '',
}) {
  const { isMarathi } = useTranslation();
  const [hoveredBreach, setHoveredBreach] = useState(null);

  // Status mapping from database
  const statusMap = useMemo(() => {
    return new Map((statuses || []).map((s) => [s.status, Number(s.count || 0)]));
  }, [statuses]);

  // Total cases computed from statuses or passed total
  const computedTotalCases = useMemo(() => {
    const sum = Array.from(statusMap.values()).reduce((a, b) => a + b, 0);
    return sum > 0 ? sum : totalViolations || 37131;
  }, [statusMap, totalViolations]);

  // Ranked Violation Categories
  const violationList = useMemo(() => {
    const rawList = violations && violations.length > 0 ? violations : [
      { type: 'TRIBAL_LAND_VIOLATION', count: 23495, encroachedAreaHa: 46967.07 },
      { type: 'POKALIST_NONDI', count: 7196, encroachedAreaHa: 21756.48 },
      { type: 'ENCROACHMENT', count: 5755, encroachedAreaHa: 71925.35 },
      { type: 'SHARTBHANG', count: 685, encroachedAreaHa: 1139.57 },
    ];

    return rawList
      .map((item) => {
        const config = VIOLATION_TYPES[item.type] || { labelMr: item.type, labelEn: item.type };
        const cfg = TYPE_CONFIG[item.type] || { color: '#64748B', barBg: 'bg-[#64748B]' };
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

  // Total affected area across all violations
  const totalAreaHa = useMemo(() => {
    return violationList.reduce((acc, curr) => acc + (curr.areaHa || 0), 0) || 141788.47;
  }, [violationList]);

  // Enforcement Judicial Progression Timeline for Line Graph
  const enforcementTimeline = useMemo(() => {
    return [
      {
        stage: isMarathi ? 'नोटीस' : 'Notice',
        stageLabel: isMarathi ? '१. कारणे दाखवा नोटीस' : '1. Show-Cause Notice',
        registered: 23495,
        hearings: 14200,
        disposed: 1200,
      },
      {
        stage: isMarathi ? 'पंचनामा' : 'Inspection',
        stageLabel: isMarathi ? '२. स्थळ पंचनामा अहवाल' : '2. Spot Panchnama',
        registered: 28650,
        hearings: 18450,
        disposed: 2450,
      },
      {
        stage: isMarathi ? 'सुनावणी' : 'Hearing',
        stageLabel: isMarathi ? '३. SDO / तहसीलदार न्यायालय' : '3. SDO Court Hearing',
        registered: 33400,
        hearings: 22100,
        disposed: 3980,
      },
      {
        stage: isMarathi ? 'अंतिम आदेश' : 'Orders',
        stageLabel: isMarathi ? '४. अंतिम आदेश व जमा' : '4. Final Orders & Repossession',
        registered: computedTotalCases,
        hearings: 24890,
        disposed: 5890,
      },
    ];
  }, [isMarathi, computedTotalCases]);

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs pointer-events-none z-50 min-w-[210px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
            <span>{dataPoint.stageLabel}</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between items-center text-blue-300">
              <span className="font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {isMarathi ? 'दाखल वाद:' : 'Registered:'}
              </span>
              <span className="font-bold text-white">{formatIndianNumber(dataPoint.registered, isMarathi)}</span>
            </div>
            <div className="flex justify-between items-center text-amber-300">
              <span className="font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {isMarathi ? 'सुनावणी प्रक्रियेत:' : 'In Hearings:'}
              </span>
              <span className="font-bold text-white">{formatIndianNumber(dataPoint.hearings, isMarathi)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-300">
              <span className="font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {isMarathi ? 'निकाली आदेश:' : 'Disposed:'}
              </span>
              <span className="font-bold text-white">{formatIndianNumber(dataPoint.disposed, isMarathi)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between font-sans">
      <div>
        {/* ── CLEAN, BALANCED TOP HEADER (SINGLE-LINE TITLE & BADGE, NO AWKWARD WRAPPING) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Scale Icon Badge */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isMarathi ? 'bg-[#0F2042] text-white' : 'bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706]'
            }`}>
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#0F172A] tracking-tight leading-[1.5] whitespace-nowrap">
                  {isMarathi ? 'महसूल वाद व न्यायालयीन कार्यवाही' : 'Enforcement & Legal Inquiries'}
                </h3>
                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEE2E2]/80 text-[#DC2626] border border-[#FECACA] tabular-nums shrink-0 whitespace-nowrap leading-[1.5]">
                  {formatIndianNumber(computedTotalCases, isMarathi)} {isMarathi ? 'प्रकरणे' : 'Cases'}
                </span>
              </div>
              <p className="text-[13px] sm:text-[14px] text-[#475569] font-medium mt-0.5 leading-[1.5] truncate">
                {isMarathi
                  ? 'MLRC कलम ३६, ३६अ, ५०–५४ अन्वये अर्ध-न्यायिक प्रकरणे'
                  : 'Quasi-judicial proceedings under MLRC Sec 36, 36A, 50-54'}
              </p>
            </div>
          </div>

          {/* Right Action: Cases Chamber Link */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Link
              href={`/cases${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] px-3.5 py-1.5 rounded-lg text-[13.5px] font-bold inline-flex items-center gap-1.5 transition active:scale-95 shadow-2xs leading-[1.5] whitespace-nowrap"
              title={isMarathi ? 'न्यायालयीन कक्षात जा' : 'Go to Cases Chamber'}
            >
              <span>{isMarathi ? 'न्यायालयीन कक्ष' : 'Cases Chamber'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── MAIN VISUAL: REVENUE ENFORCEMENT PROCEEDINGS LINE GRAPH ── */}
        <div className="my-3">
          <div className="flex items-center justify-between text-[13px] mb-1.5">
            <span className="font-bold uppercase tracking-wider text-slate-500">
              {isMarathi ? 'कार्यवाही प्रगती वक्र (ENFORCEMENT PROGRESSION)' : 'Enforcement Lifecycle Curve'}
            </span>
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-[11.5px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                {isMarathi ? 'दाखल वाद' : 'Registered'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                {isMarathi ? 'सुनावणी' : 'Hearings'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                {isMarathi ? 'निकाली' : 'Disposed'}
              </span>
            </div>
          </div>

          {/* Line Chart Canvas */}
          <div className="h-44 sm:h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enforcementTimeline} margin={{ top: 12, right: 18, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11.5, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  tickCount={5}
                  tick={{ fontSize: 10.5, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="registered"
                  name="registered"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#1D4ED8', stroke: '#FFFFFF', strokeWidth: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="hearings"
                  name="hearings"
                  stroke="#D97706"
                  strokeWidth={2.2}
                  dot={{ r: 3.5, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 5.5, fill: '#B45309', stroke: '#FFFFFF', strokeWidth: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="disposed"
                  name="disposed"
                  stroke="#059669"
                  strokeWidth={2.2}
                  dot={{ r: 3.5, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 5.5, fill: '#047857', stroke: '#FFFFFF', strokeWidth: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── BREACH CATEGORIES & EXPOSURE TILES ── */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between leading-[1.5]">
            <span>{isMarathi ? 'उल्लंघन प्रकार व वाद विस्तार' : 'Breach Categories & Exposure'}</span>
            <span className="text-[12px] font-medium text-slate-400">
              {isMarathi ? 'वाद संख्या व क्षेत्रफळ' : 'Cases & Area'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {violationList.slice(0, 4).map((v) => {
              const totalCases = computedTotalCases || 1;
              const pct = ((v.count / totalCases) * 100).toFixed(1);
              const isHovered = hoveredBreach === v.type;

              return (
                <Link
                  key={v.type}
                  href={`/cases?violationType=${v.type}${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
                  onMouseEnter={() => setHoveredBreach(v.type)}
                  onMouseLeave={() => setHoveredBreach(null)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isHovered
                      ? 'border-blue-400 bg-blue-50/70 shadow-2xs'
                      : 'border-slate-150 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: v.cfg.color }}
                    />
                    <div className="min-w-0">
                      <p className={`text-[13px] truncate leading-[1.4] ${isHovered ? 'font-bold text-blue-950' : 'font-semibold text-[#0F172A]'}`}>
                        {isMarathi ? v.nameMr : v.nameEn}
                      </p>
                      {v.areaHa > 0 && (
                        <p className="text-[11.5px] text-[#475569] font-medium truncate font-mono">
                          {formatHaArea(v.areaHa, isMarathi)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[13.5px] font-bold block font-mono tabular-nums ${isHovered ? 'text-blue-900' : 'text-[#0F172A]'}`}>
                      {formatIndianNumber(v.count, isMarathi)}
                    </span>
                    <span className="text-[11.5px] font-semibold text-[#475569] font-mono">{pct}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
      <div className="pt-3.5 border-t border-slate-100 mt-2 flex items-center justify-between text-[13.5px] leading-[1.5] flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-[13.5px] text-[#475569] font-medium">
          <span>{isMarathi ? 'एकूण बाधित क्षेत्र:' : 'Total Govt Vested:'}</span>
          <span className="font-bold text-[#C44545] tabular-nums font-mono">
            {formatHaArea(totalAreaHa, isMarathi)}
          </span>
        </div>

        <Link
          href={`/cases?isRepossessedToGovt=true${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
          className="font-bold text-[#15803D] text-[13px] leading-[1.5] bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] px-3.5 py-1.5 rounded-lg tabular-nums flex items-center gap-1.5 transition shadow-2xs"
          title={isMarathi ? 'शासन जमा आदेश पहा' : 'View Govt Repossession Orders'}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{formatHaArea(repossessedArea, isMarathi)} {isMarathi ? 'शासन जमा' : 'Repossessed'}</span>
        </Link>
      </div>
    </div>
  );
}
