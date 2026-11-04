'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { VIOLATION_TYPES, ENFORCEMENT_STATUSES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

/**
 * Coordinated Multicolour Palette for Statutory Violations & Inquiries:
 * - Rose: #E85D75 (Shartbhang / Condition Breach)
 * - Orange: #F59E0B (Encroachment)
 * - Purple: #7656D6 (Tribal Land Protection Sec 36)
 * - Royal Blue: #4169E1 (Unauthorized NA Conversion)
 * - Teal: #0D9488 (Pokalist Nondi / Rectified)
 * - Green: #16A34A (Final Order Passed / Govt Vested)
 */
const VIOLATION_PALETTE = {
  SHARTBHANG: { color: '#E85D75', bg: 'bg-[#E85D75]/10', text: 'text-[#E85D75]', border: 'border-[#E85D75]/30' },
  ENCROACHMENT: { color: '#F59E0B', bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
  TRIBAL_LAND_VIOLATION: { color: '#7656D6', bg: 'bg-[#7656D6]/10', text: 'text-[#7656D6]', border: 'border-[#7656D6]/30' },
  UNAUTHORIZED_NA_CONVERSION: { color: '#4169E1', bg: 'bg-[#4169E1]/10', text: 'text-[#4169E1]', border: 'border-[#4169E1]/30' },
  POKALIST_NONDI: { color: '#0D9488', bg: 'bg-[#0D9488]/10', text: 'text-[#0D9488]', border: 'border-[#0D9488]/30' },
  GOVERNMENT_NAME_MISSING: { color: '#64748B', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

const STATUS_PALETTE = {
  FINAL_ORDER_PASSED: { color: '#16A34A', labelMr: 'अंतिम आदेश व शासन जमा', labelEn: 'Final Order & Govt Vested' },
  HEARING_SCHEDULED: { color: '#4169E1', labelMr: 'SDO / तहसीलदार सुनावणी', labelEn: 'SDO / Tahsildar Hearing' },
  NOTICE_ISSUED: { color: '#F59E0B', labelMr: 'कारणे दाखवा नोटीस', labelEn: 'Show-Cause Notice Issued' },
  FIELD_PANCHNAMA_COMPLETED: { color: '#7656D6', labelMr: 'स्थळ पंचनामा पूर्ण', labelEn: 'Spot Panchnama Completed' },
  FLAGGED_IN_AUDIT: { color: '#64748B', labelMr: 'लेखापरीक्षणात नोंद', labelEn: 'Audit Flagged' },
  RECTIFIED_7_12: { color: '#0D9488', labelMr: '७/१२ दुरुस्ती प्रमाणित', labelEn: '7/12 Rectified' },
  DISMISSED: { color: '#94A3B8', labelMr: 'प्रकरण निकाली', labelEn: 'Dismissed' },
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
        color: '#64748B',
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
      const palette = STATUS_PALETTE[item.status] || { color: '#64748B', labelMr: item.status, labelEn: item.status };
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

  const activeItem = activeIndex !== null && activeChartData[activeIndex] ? activeChartData[activeIndex] : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
      const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

      return (
        <div className="bg-[#252B36] text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs sm:text-sm pointer-events-none whitespace-nowrap z-50">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{displayName}</span>
            <span className="text-[#F59E0B] font-mono font-extrabold">[{pct}%]</span>
          </div>
          <div className="text-white/80 font-mono text-xs flex items-center gap-3">
            <span>{item.count.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} {isMarathi ? 'प्रकरणे' : 'Cases'}</span>
            {item.areaHa > 0 && <span>({item.areaHa.toFixed(2)} Ha)</span>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      {/* Header with Switchers */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#E9E7E1] pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E85D75]/10 border border-[#E85D75]/20 flex items-center justify-center text-[#E85D75] shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-[22px] font-bold text-[#252B36] flex items-center gap-2.5 truncate">
              <span>
                {viewMode === 'categories'
                  ? (isMarathi ? 'शर्तभंग व महसूल उल्लंघन प्रकार' : 'Breach & Revenue Violation Categories')
                  : (isMarathi ? 'अर्ध-न्यायिक प्रकरणे व स्थिती' : 'Quasi-Judicial Cases & Status')}
              </span>
            </h3>
            <p className="text-sm sm:text-[15px] text-[#64748B] font-medium truncate mt-0.5 leading-snug">
              {isMarathi
                ? 'MLRC कलम ३६, ३६अ व कलम ५०-५४ अन्वये कार्यवाही'
                : 'Proceedings under MLRC Sections 36, 36A & 50-54'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div
          className="inline-flex p-1 bg-[#F8F7F3] rounded-xl border border-[#E9E7E1] self-start sm:self-auto shrink-0"
          role="group"
          aria-label={isMarathi ? 'दृश्य पद्धती' : 'View Mode'}
        >
          <button
            type="button"
            onClick={() => {
              setViewMode('categories');
              setActiveIndex(null);
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              viewMode === 'categories'
                ? 'bg-[#E85D75] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#252B36]'
            }`}
            aria-pressed={viewMode === 'categories'}
          >
            {isMarathi ? 'उल्लंघन प्रकार' : 'Categories'}
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('pipeline');
              setActiveIndex(null);
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              viewMode === 'pipeline'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#252B36]'
            }`}
            aria-pressed={viewMode === 'pipeline'}
          >
            {isMarathi ? 'न्यायालयीन स्थिती' : 'Status'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Chart & Breakdown List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-3">
        {/* Left: Donut Chart with Dynamic Center Inspection */}
        <div className="md:col-span-6 relative h-64 sm:h-72 lg:h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeChartData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={106}
                paddingAngle={3}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2.5}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {activeChartData.map((entry, index) => (
                  <Cell
                    key={`viol-cell-${entry.key}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    className="transition-all duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Dynamic Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2">
            {activeItem ? (
              <div className="flex flex-col items-center justify-center text-center">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs mb-1 truncate max-w-[140px]"
                  style={{
                    backgroundColor: `${activeItem.color}15`,
                    color: activeItem.color,
                    borderColor: `${activeItem.color}40`,
                  }}
                >
                  {isMarathi ? activeItem.nameMr : (activeItem.nameEn || activeItem.nameMr)}
                </span>
                <span className="text-[24px] sm:text-[27px] font-black text-[#252B36] tracking-tight leading-none my-1 font-mono">
                  {activeItem.count.toLocaleString()} {isMarathi ? 'प्रकरणे' : 'Cases'}
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#64748B] font-mono">
                  {totalValue > 0 ? ((activeItem.value / totalValue) * 100).toFixed(1) : 0}% {isMarathi ? 'वाटा' : 'share'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wider font-bold text-[#64748B]">
                  {viewMode === 'categories'
                    ? (isMarathi ? 'एकूण उल्लंघन' : 'Total Violations')
                    : (isMarathi ? 'सक्रीय न्यायालयीन प्रकरणे' : 'Active Pipeline')}
                </span>
                <span className="text-[25px] sm:text-[28px] font-black text-[#252B36] tracking-tight leading-none my-1 font-mono">
                  {totalCount.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
                </span>
                <span className="text-xs sm:text-[13px] text-[#64748B] font-semibold font-mono">
                  {isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Legend Breakdown List with Larger Typography (16-17px) */}
        <div className="md:col-span-6 space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
          {activeChartData.map((item, index) => {
            const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
            const isHighlighted = activeIndex === index;
            const displayName = isMarathi ? item.nameMr : (item.nameEn || item.nameMr);

            return (
              <div
                key={item.key}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isHighlighted
                    ? 'border-[#E85D75] bg-[#E85D75]/5 shadow-sm'
                    : 'border-[#E9E7E1] bg-[#F8F7F3] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className={`text-[16px] sm:text-[17px] truncate leading-snug ${isHighlighted ? 'font-black text-[#E85D75]' : 'font-bold text-[#252B36]'}`}>
                      {displayName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[16px] sm:text-[17px] font-black block font-mono ${isHighlighted ? 'text-[#E85D75]' : 'text-[#252B36]'}`}>
                    {item.count.toLocaleString()} {isMarathi ? 'प्रकरणे' : 'Cases'}
                  </span>
                  <span className="text-xs sm:text-[13px] text-[#64748B] font-bold font-mono">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Links & Summary */}
      <div className="pt-3 border-t border-[#E9E7E1] flex items-center justify-between text-xs sm:text-[13px] text-[#64748B]">
        <span className="font-medium">
          {repossessedArea > 0
            ? `${repossessedArea.toFixed(2)} Ha ${isMarathi ? 'जमीन शासन जमा अंतिम आदेश पारित' : 'Land Govt Vested Decrees'}`
            : (isMarathi ? 'अर्ध-न्यायिक चौकशी कक्ष' : 'Quasi-Judicial Chamber')}
        </span>
        <Link href="/cases" className="font-bold text-[#4169E1] hover:underline flex items-center gap-1">
          <span>{isMarathi ? 'चौकशी कक्ष उघडा' : 'Open Register'}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
