'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  LandPlot,
  Scale,
  Building2,
  FileSpreadsheet,
  Activity,
  AlertOctagon,
  Percent,
  CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import { formatTalukaName, formatVillageName, formatScopeText } from '../../lib/villageUtils';

// Accessible, distinctive color scheme
const TENURE_PALETTE = {
  class1: { color: '#2563eb', labelMr: 'भोगवटदार वर्ग १', labelEn: 'Class-1 Freehold' },
  class2: { color: '#059669', labelMr: 'भोगवटदार वर्ग २', labelEn: 'Class-2 Restricted' },
  sarkar: { color: '#475569', labelMr: 'शासन / इतर जमिनी', labelEn: 'Govt / Other Lands' },
  companyPermit: { color: '#059669', labelMr: 'कंपनी परवानगी घेतलेली', labelEn: 'Company With Permit' },
  companyNoPermit: { color: '#e11d48', labelMr: 'कंपनी विनापरवानगी', labelEn: 'Company Without Permit' },
  other: { color: '#64748b', labelMr: 'इतर जमिनी', labelEn: 'Other Holdings' }
};

export default function BookletGoshwaraAnalytics({
  selectedCatId = 1,
  category = null,
  goshDef = null,
  talukaRows = [],
  villageRows = [],
  districtRows = [],
  categoryRollupRows = [],
  activeTier = 'all',
  taluka = 'all',
  village = 'all',
  isMarathi = true,
  parcels = [],
  isDetailedView = false,
  activeScope = ''
}) {
  const [metricType, setMetricType] = useState('count'); // 'count' | 'area'
  const [chartStyle, setChartStyle] = useState('donut'); // 'donut' | 'pie'
  const [pieMode, setPieMode] = useState('tenure'); // 'tenure' | 'compliance'
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute base rows corresponding strictly to the user's active filter & tier
  const baseRows = useMemo(() => {
    const isSingleVillage = village && village !== 'all' && village !== 'सर्व गावे';
    const isSingleTaluka = taluka && taluka !== 'all' && taluka !== 'सर्व तालुके' && !isSingleVillage;

    if (isSingleVillage) {
      const targetV = String(village).toLowerCase().trim();
      const matched = (villageRows || []).filter(r => {
        const vName = (r.villageName || '').toLowerCase().trim();
        return vName === targetV || vName.includes(targetV) || targetV.includes(vName);
      });
      if (matched.length > 0) return matched;

      // Fallback from categoryRollupRows
      const rollupMatched = (categoryRollupRows || []).filter(r => {
        const vName = (r.villageName || '').toLowerCase().trim();
        return vName === targetV || vName.includes(targetV) || targetV.includes(vName);
      });
      if (rollupMatched.length > 0) return rollupMatched;

      if (villageRows && villageRows.length === 1) return villageRows;
      return villageRows || [];
    }

    if (isSingleTaluka) {
      const targetT = String(taluka).toLowerCase().trim();
      const matched = (talukaRows || []).filter(r => {
        const tName = (r.taluka || '').toLowerCase().trim();
        return tName === targetT || tName.includes(targetT) || targetT.includes(tName);
      });
      if (matched.length > 0) return matched;
      if (villageRows && villageRows.length > 0) return villageRows;
      return talukaRows || [];
    }

    // Whole District
    if (districtRows && districtRows.length > 0 && Number(districtRows[0]?.total712Count || 0) > 0) {
      return districtRows;
    }
    if (talukaRows && talukaRows.length > 0) {
      return talukaRows;
    }
    return categoryRollupRows || [];
  }, [village, taluka, villageRows, talukaRows, districtRows, categoryRollupRows]);

  // Exact, non-duplicating total counts and metric calculations
  const analyticsData = useMemo(() => {
    let totalSurveys = 0;
    let totalArea = 0;

    if (baseRows === districtRows && districtRows.length > 0) {
      totalSurveys = Number(districtRows[0].total712Count || 0);
      totalArea = Number(districtRows[0].totalArea || districtRows[0].totalAreaHa || 0);
    } else {
      totalSurveys = baseRows.reduce((a, b) => a + Number(b.total712Count || 0), 0);
      totalArea = baseRows.reduce((a, b) => a + Number(b.totalArea || b.totalAreaHa || 0), 0);
    }

    // Fallback if data is currently hydrating
    if (totalSurveys === 0 && parcels && parcels.length > 0) {
      totalSurveys = parcels.length;
      totalArea = parcels.reduce((a, b) => a + Number(b.totalAreaHa || 0), 0);
    }

    // 1. Tenurial Composition (Pure Mutually Exclusive Non-Overlapping Partition)
    let c1Count = 0;
    let c1Area = 0;
    let c2Count = 0;
    let c2Area = 0;
    let companyPermittedCount = 0;
    let companyPermittedArea = 0;
    let companyUnpermittedCount = 0;
    let companyUnpermittedArea = 0;

    baseRows.forEach(r => {
      c1Count += Number(r.c1Count || 0);
      c1Area += Number(r.c1Area || 0);
      c2Count += Number(r.c2Count || 0);
      c2Area += Number(r.c2Area || 0);
      companyPermittedCount += Number(r.companyPermittedCount || 0);
      companyPermittedArea += Number(r.companyPermittedArea || 0);
      companyUnpermittedCount += Number(r.companyUnpermittedCount || 0);
      companyUnpermittedArea += Number(r.companyUnpermittedArea || 0);
    });

    c1Area = Number(c1Area.toFixed(2));
    c2Area = Number(c2Area.toFixed(2));
    companyPermittedArea = Number(companyPermittedArea.toFixed(2));
    companyUnpermittedArea = Number(companyUnpermittedArea.toFixed(2));

    // Other/Residual holdings (Govt/Forest/Other) to guarantee exact 100% total
    const otherCount = Math.max(0, totalSurveys - (c1Count + c2Count));
    const otherArea = Math.max(0, Number((totalArea - (c1Area + c2Area)).toFixed(2)));

    const isCompanyBooklet = selectedCatId === 18;

    // Mutually exclusive slices for Pie/Donut Chart
    const tenureSlices = isCompanyBooklet
      ? [
          {
            key: 'companyPermit',
            name: isMarathi ? 'कंपनी परवानगी घेतलेली' : 'Company With Permit',
            count: companyPermittedCount,
            area: companyPermittedArea,
            value: metricType === 'area' ? companyPermittedArea : companyPermittedCount,
            color: TENURE_PALETTE.companyPermit.color,
            pct: totalSurveys > 0 ? Number(((companyPermittedCount / totalSurveys) * 100).toFixed(1)) : 0,
            areaPct: totalArea > 0 ? Number(((companyPermittedArea / totalArea) * 100).toFixed(1)) : 0
          },
          {
            key: 'companyNoPermit',
            name: isMarathi ? 'कंपनी विनापरवानगी' : 'Company Without Permit',
            count: companyUnpermittedCount,
            area: companyUnpermittedArea,
            value: metricType === 'area' ? companyUnpermittedArea : companyUnpermittedCount,
            color: TENURE_PALETTE.companyNoPermit.color,
            pct: totalSurveys > 0 ? Number(((companyUnpermittedCount / totalSurveys) * 100).toFixed(1)) : 0,
            areaPct: totalArea > 0 ? Number(((companyUnpermittedArea / totalArea) * 100).toFixed(1)) : 0
          },
          {
            key: 'other',
            name: isMarathi ? 'इतर नोंदणीकृत जमिनी' : 'Other Registered Lands',
            count: Math.max(0, totalSurveys - (companyPermittedCount + companyUnpermittedCount)),
            area: Math.max(0, Number((totalArea - (companyPermittedArea + companyUnpermittedArea)).toFixed(2))),
            value: metricType === 'area'
              ? Math.max(0, Number((totalArea - (companyPermittedArea + companyUnpermittedArea)).toFixed(2)))
              : Math.max(0, totalSurveys - (companyPermittedCount + companyUnpermittedCount)),
            color: TENURE_PALETTE.other.color,
            pct: totalSurveys > 0 ? Number(((Math.max(0, totalSurveys - (companyPermittedCount + companyUnpermittedCount)) / totalSurveys) * 100).toFixed(1)) : 0,
            areaPct: totalArea > 0 ? Number(((Math.max(0, Number((totalArea - (companyPermittedArea + companyUnpermittedArea)).toFixed(2))) / totalArea) * 100).toFixed(1)) : 0
          }
        ].filter(s => s.value > 0)
      : [
          {
            key: 'class1',
            name: isMarathi ? 'भोगवटदार वर्ग १' : 'Class-1 Freehold',
            count: c1Count,
            area: c1Area,
            value: metricType === 'area' ? c1Area : c1Count,
            color: TENURE_PALETTE.class1.color,
            pct: totalSurveys > 0 ? Number(((c1Count / totalSurveys) * 100).toFixed(1)) : 0,
            areaPct: totalArea > 0 ? Number(((c1Area / totalArea) * 100).toFixed(1)) : 0
          },
          {
            key: 'class2',
            name: isMarathi ? 'भोगवटदार वर्ग २' : 'Class-2 Restricted',
            count: c2Count,
            area: c2Area,
            value: metricType === 'area' ? c2Area : c2Count,
            color: TENURE_PALETTE.class2.color,
            pct: totalSurveys > 0 ? Number(((c2Count / totalSurveys) * 100).toFixed(1)) : 0,
            areaPct: totalArea > 0 ? Number(((c2Area / totalArea) * 100).toFixed(1)) : 0
          },
          ...(otherCount > 0 || otherArea > 0
            ? [
                {
                  key: 'sarkar',
                  name: isMarathi ? 'शासन / इतर जमिनी' : 'Govt / Other Lands',
                  count: otherCount,
                  area: otherArea,
                  value: metricType === 'area' ? otherArea : otherCount,
                  color: TENURE_PALETTE.sarkar.color,
                  pct: totalSurveys > 0 ? Number(((otherCount / totalSurveys) * 100).toFixed(1)) : 0,
                  areaPct: totalArea > 0 ? Number(((otherArea / totalArea) * 100).toFixed(1)) : 0
                }
              ]
            : [])
        ].filter(s => s.value > 0);

    // 2. Statutory Audit Findings & Breaches Checklist Items (Specific to this Booklet)
    const statutoryAuditItems = (goshDef?.superHeaders || [])
      .map(sh => {
        let count = 0;
        let area = 0;
        baseRows.forEach(r => {
          count += Number(r[sh.countKey] || 0);
          area += Number(r[sh.areaKey] || 0);
        });
        area = Number(area.toFixed(2));

        const countPct = totalSurveys > 0 ? Number(((count / totalSurveys) * 100).toFixed(1)) : 0;
        const areaPct = totalArea > 0 ? Number(((area / totalArea) * 100).toFixed(1)) : 0;

        // Categorize severity
        const k = (sh.countKey || '').toLowerCase();
        const isBreach = k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized') || k.includes('tribal');
        const isWarning = k.includes('noother') || k.includes('unpermitted');

        return {
          key: sh.countKey,
          label: sh.label,
          count,
          area,
          countPct,
          areaPct,
          isBreach,
          isWarning,
          colorClass: sh.colorClass
        };
      })
      // Only include specific statutory violation/audit columns (exclude base Class 1 / Class 2 counts which belong in the composition pie)
      .filter(item => {
        if (!isCompanyBooklet && (item.key === 'c1Count' || item.key === 'c2Count')) return false;
        return true;
      });

    // Compute overall condition breach / severe violation totals
    let totalBreachCount = 0;
    let totalBreachArea = 0;

    statutoryAuditItems.forEach(item => {
      if (item.isBreach) {
        totalBreachCount = Math.max(totalBreachCount, item.count);
        totalBreachArea = Math.max(totalBreachArea, item.area);
      }
    });

    const compliantCount = Math.max(0, totalSurveys - totalBreachCount);
    const compliantPct = totalSurveys > 0 ? Number(((compliantCount / totalSurveys) * 100).toFixed(1)) : 100;
    const breachPct = totalSurveys > 0 ? Number(((totalBreachCount / totalSurveys) * 100).toFixed(1)) : 0;

    // Alternative Pie: Compliance Status (Compliant vs Flagged)
    const complianceSlices = [
      {
        key: 'compliant',
        name: isMarathi ? 'नियमित नोंदी' : 'Compliant Holdings',
        count: compliantCount,
        area: Number(Math.max(0, totalArea - totalBreachArea).toFixed(2)),
        value: metricType === 'area' ? Number(Math.max(0, totalArea - totalBreachArea).toFixed(2)) : compliantCount,
        color: '#059669',
        pct: compliantPct,
        areaPct: totalArea > 0 ? Number((((totalArea - totalBreachArea) / totalArea) * 100).toFixed(1)) : 100
      },
      {
        key: 'breach',
        name: isMarathi ? 'शर्तभंग / संशयित बाबी' : 'Breach / Inquiries',
        count: totalBreachCount,
        area: Number(totalBreachArea.toFixed(2)),
        value: metricType === 'area' ? Number(totalBreachArea.toFixed(2)) : totalBreachCount,
        color: '#e11d48',
        pct: breachPct,
        areaPct: totalArea > 0 ? Number(((totalBreachArea / totalArea) * 100).toFixed(1)) : 0
      }
    ].filter(s => s.value > 0);

    return {
      totalSurveys,
      totalArea: Number(totalArea.toFixed(2)),
      c1Count,
      c1Area,
      c2Count,
      c2Area,
      otherCount,
      otherArea,
      tenureSlices,
      complianceSlices,
      statutoryAuditItems,
      totalBreachCount,
      totalBreachArea: Number(totalBreachArea.toFixed(2)),
      compliantCount,
      compliantPct,
      breachPct
    };
  }, [baseRows, districtRows, parcels, selectedCatId, goshDef, metricType, isMarathi]);

  // Selected Pie Slices based on active toggle (Tenure vs Compliance)
  const activePieSlices = useMemo(() => {
    return pieMode === 'tenure' ? analyticsData.tenureSlices : analyticsData.complianceSlices;
  }, [pieMode, analyticsData.tenureSlices, analyticsData.complianceSlices]);

  // Regional Comparison Bar Chart Data
  const comparisonBarData = useMemo(() => {
    const isSingleTaluka = taluka && taluka !== 'all' && taluka !== 'सर्व तालुके';

    if (isSingleTaluka && villageRows && villageRows.length > 0) {
      return villageRows
        .slice(0, 12)
        .map(v => {
          const totCnt = Number(v.total712Count || 0);
          const totAr = Number(Number(v.totalArea || v.totalAreaHa || 0).toFixed(2));
          let brCnt = 0;
          let brAr = 0;
          (goshDef?.superHeaders || []).forEach(sh => {
            const k = (sh.countKey || '').toLowerCase();
            if (k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized') || k.includes('tribal')) {
              brCnt = Math.max(brCnt, Number(v[sh.countKey] || 0));
              brAr = Math.max(brAr, Number(v[sh.areaKey] || 0));
            }
          });
          const compCnt = Math.max(0, totCnt - brCnt);
          const compAr = Math.max(0, Number((totAr - brAr).toFixed(2)));

          return {
            name: formatVillageName(v.villageName, isMarathi),
            total: metricType === 'area' ? totAr : totCnt,
            compliant: metricType === 'area' ? compAr : compCnt,
            breach: metricType === 'area' ? Number(brAr.toFixed(2)) : brCnt
          };
        })
        .filter(d => d.total > 0);
    }

    if (talukaRows && talukaRows.length > 0) {
      return talukaRows
        .map(t => {
          const rawName = (t.taluka || t.villageName || '')
            .replace(/\s*\((?:संपूर्ण|Whole|All)[^)]*\)/gi, '')
            .trim();
          const dispName = formatTalukaName(rawName, isMarathi);
          const totCnt = Number(t.total712Count || 0);
          const totAr = Number(Number(t.totalArea || t.totalAreaHa || 0).toFixed(2));

          let brCnt = 0;
          let brAr = 0;
          (goshDef?.superHeaders || []).forEach(sh => {
            const k = (sh.countKey || '').toLowerCase();
            if (k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized') || k.includes('tribal')) {
              brCnt = Math.max(brCnt, Number(t[sh.countKey] || 0));
              brAr = Math.max(brAr, Number(t[sh.areaKey] || 0));
            }
          });
          const compCnt = Math.max(0, totCnt - brCnt);
          const compAr = Math.max(0, Number((totAr - brAr).toFixed(2)));

          return {
            name: dispName,
            total: metricType === 'area' ? totAr : totCnt,
            compliant: metricType === 'area' ? compAr : compCnt,
            breach: metricType === 'area' ? Number(brAr.toFixed(2)) : brCnt
          };
        })
        .filter(d => d.total > 0);
    }

    return [];
  }, [taluka, villageRows, talukaRows, goshDef, isMarathi, metricType]);

  // Active slice for dynamic center display in Donut mode
  const currentHoveredItem = hoveredSlice !== null ? activePieSlices[hoveredSlice] : null;

  if (!category) return null;

  return (
    <div className="mb-6 bg-white rounded-2xl border border-slate-300/80 shadow-xs overflow-hidden transition-all">
      {/* 1. Header Banner */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-indigo-500/50">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/10">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {isMarathi ? `पुस्तिका क्र. ${selectedCatId}` : `Booklet ${selectedCatId}`}
              </span>
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{formatScopeText(activeScope, isMarathi) || (isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District')}</span>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
              {isMarathi ? category.nameMr : category.nameEn}
              <span className="text-xs sm:text-sm font-normal text-indigo-200 ml-2">
                — {isMarathi ? 'आलेख व वैधानिक गोषवारा विश्लेषण' : 'Analytics & Statutory Insights'}
              </span>
            </h2>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Metric Switcher: Count vs Area */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/15">
            <button
              type="button"
              onClick={() => setMetricType('count')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                metricType === 'count'
                  ? 'bg-white text-indigo-950 shadow-xs font-extrabold'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              {isMarathi ? 'संख्यानिहाय' : 'By Count'}
            </button>
            <button
              type="button"
              onClick={() => setMetricType('area')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                metricType === 'area'
                  ? 'bg-white text-indigo-950 shadow-xs font-extrabold'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              {isMarathi ? 'क्षेत्रफळ (हे.)' : 'Area (Ha)'}
            </button>
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(p => !p)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
            title={isExpanded ? (isMarathi ? 'आलेख संकुचित करा' : 'Collapse') : (isMarathi ? 'आलेख विस्तृत करा' : 'Expand')}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-5 bg-slate-50/40">
          {/* 2. Primary KPI Cards Grid (Matches the exact numbers in Goshwara row) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* Card 1: Total Parcels & Total Area */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-950 text-white rounded-xl p-3 shadow-2xs flex flex-col justify-between border border-indigo-800">
              <div className="flex items-center justify-between text-indigo-200 mb-1">
                <span className="text-[11px] font-bold truncate">
                  {isMarathi ? 'एकूण सर्व्हे/गट क्रमांक' : 'Total Survey/Gat'}
                </span>
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                  {analyticsData.totalSurveys.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-bold text-emerald-300 font-mono mt-0.5">
                  {analyticsData.totalArea.toLocaleString('en-IN')} Ha
                </div>
              </div>
            </div>

            {/* Card 2: Bhogvatdar Class 1 */}
            <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-900 mb-1">
                <span className="text-[11px] font-bold truncate">
                  {isMarathi ? 'भोगवटदार वर्ग १' : 'Class-1 Freehold'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-900">
                    {analyticsData.c1Count.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {analyticsData.totalSurveys > 0 ? `${((analyticsData.c1Count / analyticsData.totalSurveys) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
                  {analyticsData.c1Area.toLocaleString('en-IN')} Ha
                </div>
              </div>
            </div>

            {/* Card 3: Bhogvatdar Class 2 */}
            <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-900 mb-1">
                <span className="text-[11px] font-bold truncate">
                  {isMarathi ? 'भोगवटदार वर्ग २' : 'Class-2 Restricted'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-900">
                    {analyticsData.c2Count.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {analyticsData.totalSurveys > 0 ? `${((analyticsData.c2Count / analyticsData.totalSurveys) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
                  {analyticsData.c2Area.toLocaleString('en-IN')} Ha
                </div>
              </div>
            </div>

            {/* Dynamic Specific Statutory Violation Cards */}
            {analyticsData.statutoryAuditItems.slice(0, 3).map((item, idx) => (
              <div
                key={`kpi-stat-${idx}`}
                className={clsx(
                  'bg-white rounded-xl p-3 shadow-2xs border flex flex-col justify-between',
                  item.isBreach
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200'
                )}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">
                    {item.label}
                  </span>
                  <span
                    className={clsx(
                      'w-2.5 h-2.5 rounded-full shrink-0 mt-0.5',
                      item.isBreach ? 'bg-rose-600' : 'bg-amber-500'
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg sm:text-xl font-black font-mono text-slate-900">
                      {item.count.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={clsx(
                        'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border',
                        item.count > 0 && item.isBreach
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {item.countPct}%
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
                    {item.area.toLocaleString('en-IN')} Ha
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Statutory Compliance Progress Meter */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {isMarathi ? 'वैधानिक पूर्तता व जोखीम स्थिती' : 'Statutory Compliance & Risk Status'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{isMarathi ? `नियमित: ${analyticsData.compliantPct}%` : `Compliant: ${analyticsData.compliantPct}%`}</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{isMarathi ? `शर्तभंग/चौकशी: ${analyticsData.breachPct}%` : `Breach/Inquiry: ${analyticsData.breachPct}%`}</span>
                </span>
              </div>
            </div>

            {/* 100% Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${analyticsData.compliantPct}%` }}
                title={`${isMarathi ? 'नियमित' : 'Compliant'}: ${analyticsData.compliantCount} (${analyticsData.compliantPct}%)`}
              />
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                style={{ width: `${analyticsData.breachPct}%` }}
                title={`${isMarathi ? 'शर्तभंग / चौकशी' : 'Breach / Inquiry'}: ${analyticsData.totalBreachCount} (${analyticsData.breachPct}%)`}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
              <span>
                {isMarathi
                  ? `एकूण ${analyticsData.totalSurveys.toLocaleString('en-IN')} अभिलेखांपैकी ${analyticsData.compliantCount.toLocaleString('en-IN')} नियमित व ${analyticsData.totalBreachCount.toLocaleString('en-IN')} शर्तभंग/तपासणी आवश्यक.`
                  : `Out of ${analyticsData.totalSurveys.toLocaleString('en-IN')} records, ${analyticsData.compliantCount.toLocaleString('en-IN')} are compliant and ${analyticsData.totalBreachCount.toLocaleString('en-IN')} require inquiry.`}
              </span>
              <span className="font-mono font-bold text-slate-700">
                {analyticsData.totalArea.toLocaleString('en-IN')} Ha
              </span>
            </div>
          </div>

          {/* 4. Two Primary Visual Charts: Mutually Exclusive Pie/Donut + Statutory Audit Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Pure Mutually Exclusive Composition Pie / Donut Chart */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    {pieMode === 'tenure'
                      ? (isMarathi ? 'भूधारणा वर्गवारी रचना (१००%)' : 'Tenure Composition (100%)')
                      : (isMarathi ? 'पूर्तता स्थिती विभागणी (१००%)' : 'Compliance Split (100%)')}
                  </h3>
                </div>

                {/* View Switchers */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPieMode('tenure')}
                      className={clsx(
                        'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                        pieMode === 'tenure'
                          ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {isMarathi ? 'भूधारणा' : 'Tenure'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPieMode('compliance')}
                      className={clsx(
                        'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                        pieMode === 'compliance'
                          ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {isMarathi ? 'स्थिती' : 'Status'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Donut Render with Live Interactive Center */}
              <div className="relative w-full h-[240px] flex items-center justify-center">
                {mounted && activePieSlices.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activePieSlices}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={chartStyle === 'donut' ? 62 : 0}
                        outerRadius={92}
                        paddingAngle={1.5}
                        onMouseEnter={(_, index) => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      >
                        {activePieSlices.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={hoveredSlice === index ? 3 : 1.5}
                            className="cursor-pointer transition-all duration-150"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <Info className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                    <span className="text-xs">{isMarathi ? 'आलेख डेटा उपलब्ध नाही' : 'No chart data'}</span>
                  </div>
                )}

                {/* Donut Center Label (Zero Tooltip Collision) */}
                {chartStyle === 'donut' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-4">
                    {currentHoveredItem ? (
                      <div className="animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[11px] font-black block truncate max-w-[130px]" style={{ color: currentHoveredItem.color }}>
                          {currentHoveredItem.name}
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-950 font-mono block">
                          {metricType === 'area'
                            ? `${currentHoveredItem.area} Ha`
                            : currentHoveredItem.count.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          {metricType === 'area' ? `${currentHoveredItem.areaPct}%` : `${currentHoveredItem.pct}%`}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {metricType === 'area' ? (isMarathi ? 'एकूण क्षेत्र' : 'Total Area') : (isMarathi ? 'एकूण नोंदी' : 'Total Records')}
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-900 font-mono block">
                          {metricType === 'area'
                            ? `${analyticsData.totalArea.toLocaleString('en-IN')} Ha`
                            : analyticsData.totalSurveys.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Complete Non-Truncated Legend Cards */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {activePieSlices.map((slice, idx) => (
                  <div
                    key={`slice-legend-${idx}`}
                    onMouseEnter={() => setHoveredSlice(idx)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={clsx(
                      'flex items-center justify-between p-2 rounded-lg border text-xs transition-all cursor-pointer',
                      hoveredSlice === idx
                        ? 'bg-slate-100 border-indigo-400 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="text-slate-800 font-bold truncate">{slice.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-slate-900">
                        {metricType === 'area' ? `${slice.area} Ha` : slice.count.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {metricType === 'area' ? `${slice.areaPct}%` : `${slice.pct}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Statutory Audit Findings & Breaches Checklist (No Overlap) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      {isMarathi ? 'वैधानिक तपासणी, शर्तभंग व हस्तांतरण आलेख' : 'Statutory Inquiries & Condition Breaches'}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isMarathi ? 'या पुस्तिकेतील विशिष्ट तपासणी मुद्द्यांचे प्रमाण' : 'Audit findings proportion for this booklet'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  {analyticsData.statutoryAuditItems.length} {isMarathi ? 'मुद्दे' : 'Items'}
                </span>
              </div>

              {/* Statutory Findings List with Progress Bars */}
              <div className="space-y-3 py-1 overflow-y-auto max-h-[360px] pr-1">
                {analyticsData.statutoryAuditItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {isMarathi ? 'या पुस्तिकेकरिता कोणतेही शर्तभंग नोंदवलेले नाहीत.' : 'No condition breaches recorded.'}
                    </span>
                  </div>
                ) : (
                  analyticsData.statutoryAuditItems.map((item, idx) => {
                    const pct = metricType === 'area' ? item.areaPct : item.countPct;
                    const val = metricType === 'area' ? `${item.area} Ha` : `${item.count} सर्व्हे`;

                    return (
                      <div key={`stat-item-${idx}`} className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 leading-snug">
                            {item.label}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-black font-mono text-slate-900">{val}</span>
                            <span
                              className={clsx(
                                'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border',
                                item.count > 0 && item.isBreach
                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                  : 'bg-slate-200/80 text-slate-700 border-slate-300'
                              )}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                          <div
                            className={clsx(
                              'h-full rounded-full transition-all duration-300',
                              item.count > 0 && item.isBreach
                                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                                : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                            )}
                            style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 3 : 0, pct))}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>
                            {item.count > 0
                              ? (isMarathi
                                  ? `एकूण ${analyticsData.totalSurveys} पैकी ${item.count} अभिलेखांवर नोंद आढळली.`
                                  : `${item.count} of ${analyticsData.totalSurveys} records flagged.`)
                              : (isMarathi ? 'निर्दोष नोंद (०)' : 'Clean (0)')}
                          </span>
                          <span className="font-mono font-semibold">
                            {item.area} Ha
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 5. Regional Comparison Bar Chart (Talukas across District or Villages across Taluka) */}
          {comparisonBarData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      {taluka && taluka !== 'all' && taluka !== 'सर्व तालुके'
                        ? (isMarathi ? `${formatTalukaName(taluka, true)} — गावनिहाय तुलनात्मक आलेख` : `${taluka} — Village Breakdown`)
                        : (isMarathi ? 'तालुकानिहाय तुलनात्मक आलेख (चंद्रपूर जिल्हा)' : 'Taluka Comparison (Chandrapur District)')}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {isMarathi ? 'या निवडलेल्या पुस्तिकेतील नोंदींचे प्रादेशिक वितरण' : 'Regional breakdown for this selected booklet'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                    <span>{isMarathi ? 'नियमित' : 'Compliant'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-600" />
                    <span>{isMarathi ? 'शर्तभंग/तपासणी' : 'Breach/Inquiry'}</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="w-full h-[220px]">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonBarData}
                      margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={10}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        tick={{ fill: '#475569', fontWeight: 600 }}
                      />
                      <YAxis stroke="#64748b" fontSize={10} tick={{ fill: '#475569', fontWeight: 600 }} />
                      <RechartsTooltip />
                      <Bar
                        dataKey="compliant"
                        name={isMarathi ? 'नियमित' : 'Compliant'}
                        fill="#059669"
                        stackId="a"
                      />
                      <Bar
                        dataKey="breach"
                        name={isMarathi ? 'शर्तभंग/चौकशी' : 'Breach/Inquiry'}
                        fill="#e11d48"
                        stackId="a"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
