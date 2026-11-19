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
  CartesianGrid,
  Legend
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
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  LandPlot,
  Scale,
  Building2,
  FileSpreadsheet,
  Compass,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';
import { formatTalukaName, formatVillageName, formatScopeText } from '../../lib/villageUtils';

// Distinct, accessible high-contrast palette for statutory categories
const PALETTE_COLORS = [
  '#2563eb', // Royal Blue
  '#059669', // Emerald Green
  '#d97706', // Amber
  '#e11d48', // Rose / Red
  '#7c3aed', // Violet / Purple
  '#0284c7', // Sky Blue
  '#b91c1c', // Crimson
  '#0d9488', // Teal
  '#475569', // Slate
  '#ea580c'  // Orange
];

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
  const [barMetricType, setBarMetricType] = useState('count'); // 'count' | 'area'
  const [activeSliceIndex, setActiveSliceIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute aggregated totals and category slices for this selected booklet
  const analyticsData = useMemo(() => {
    let baseRows = [];
    const isSingleVillage = village && village !== 'all' && village !== 'सर्व गावे';
    const isSingleTaluka = taluka && taluka !== 'all' && taluka !== 'सर्व तालुके' && !isSingleVillage;

    if (isSingleVillage) {
      baseRows = (villageRows || []).filter(
        r => r.villageName === village || r.taluka === village
      );
      if (baseRows.length === 0) baseRows = villageRows || [];
    } else if (isSingleTaluka) {
      baseRows = (talukaRows || []).filter(
        r => (r.taluka || '').toLowerCase() === taluka.toLowerCase()
      );
      if (baseRows.length === 0 && villageRows && villageRows.length > 0) {
        baseRows = villageRows;
      }
    } else {
      if (districtRows && districtRows.length > 0 && Number(districtRows[0]?.total712Count || 0) > 0) {
        baseRows = districtRows;
      } else if (talukaRows && talukaRows.length > 0) {
        baseRows = talukaRows;
      } else {
        baseRows = categoryRollupRows || [];
      }
    }

    let totalSurveys = 0;
    let totalArea = 0;

    if (baseRows === districtRows && districtRows.length > 0) {
      totalSurveys = Number(districtRows[0].total712Count || 0);
      totalArea = Number(districtRows[0].totalArea || districtRows[0].totalAreaHa || 0);
    } else {
      totalSurveys = baseRows.reduce((a, b) => a + Number(b.total712Count || 0), 0);
      totalArea = baseRows.reduce((a, b) => a + Number(b.totalArea || b.totalAreaHa || 0), 0);
    }

    // Fallback if server rollup is still hydrating
    if (totalSurveys === 0 && parcels && parcels.length > 0) {
      totalSurveys = parcels.length;
      totalArea = parcels.reduce((a, b) => a + Number(b.totalAreaHa || 0), 0);
    }

    const categories = (goshDef?.superHeaders || []).map((sh, idx) => {
      let count = 0;
      let area = 0;

      if (baseRows === districtRows && districtRows.length > 0) {
        count = Number(districtRows[0][sh.countKey] || 0);
        area = Number(districtRows[0][sh.areaKey] || 0);
      } else {
        count = baseRows.reduce((a, b) => a + Number(b[sh.countKey] || 0), 0);
        area = baseRows.reduce((a, b) => a + Number(b[sh.areaKey] || 0), 0);
      }

      const color = PALETTE_COLORS[idx % PALETTE_COLORS.length];
      const countPct = totalSurveys > 0 ? (count / totalSurveys) * 100 : 0;
      const areaPct = totalArea > 0 ? (area / totalArea) * 100 : 0;

      return {
        key: sh.countKey,
        label: sh.label,
        count,
        area: Number(area.toFixed(2)),
        color,
        colorClass: sh.colorClass,
        countPct: Number(countPct.toFixed(1)),
        areaPct: Number(areaPct.toFixed(1)),
        value: metricType === 'area' ? Number(area.toFixed(2)) : count
      };
    });

    // Detect breach or high-risk counts based on booklet type
    let totalBreachCount = 0;
    let totalBreachArea = 0;

    categories.forEach(cat => {
      const lbl = (cat.label || '').toLowerCase();
      const key = (cat.key || '').toLowerCase();
      if (
        key.includes('conv') ||
        key.includes('breach') ||
        key.includes('shart') ||
        key.includes('unpermitted') ||
        key.includes('unauthorized') ||
        key.includes('del') ||
        key.includes('encroach') ||
        lbl.includes('शर्तभंग') ||
        lbl.includes('अवैध') ||
        lbl.includes('अतिक्रमण') ||
        lbl.includes('विना')
      ) {
        totalBreachCount += cat.count;
        totalBreachArea += cat.area;
      }
    });

    const compliantCount = Math.max(0, totalSurveys - totalBreachCount);
    const compliantPct = totalSurveys > 0 ? Number(((compliantCount / totalSurveys) * 100).toFixed(1)) : 100;
    const breachPct = totalSurveys > 0 ? Number(((totalBreachCount / totalSurveys) * 100).toFixed(1)) : 0;

    return {
      totalSurveys,
      totalArea: Number(totalArea.toFixed(2)),
      categories,
      totalBreachCount,
      totalBreachArea: Number(totalBreachArea.toFixed(2)),
      compliantCount,
      compliantPct,
      breachPct,
      baseRows
    };
  }, [
    village,
    taluka,
    villageRows,
    talukaRows,
    districtRows,
    categoryRollupRows,
    goshDef,
    parcels,
    metricType
  ]);

  // Comparative Bar Chart Data across Talukas or Villages for this selected Booklet
  const comparisonBarData = useMemo(() => {
    const isSingleTaluka = taluka && taluka !== 'all' && taluka !== 'सर्व तालुके';

    if (isSingleTaluka && villageRows && villageRows.length > 0) {
      // Village level comparison within selected Taluka
      return villageRows
        .slice(0, 15)
        .map(v => {
          const totCnt = Number(v.total712Count || 0);
          const totAr = Number(Number(v.totalArea || v.totalAreaHa || 0).toFixed(2));
          // Identify breach counts in this row
          let brCnt = 0;
          let brAr = 0;
          (goshDef?.superHeaders || []).forEach(sh => {
            const k = (sh.countKey || '').toLowerCase();
            if (k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized')) {
              brCnt += Number(v[sh.countKey] || 0);
              brAr += Number(v[sh.areaKey] || 0);
            }
          });
          const compCnt = Math.max(0, totCnt - brCnt);
          const compAr = Math.max(0, Number((totAr - brAr).toFixed(2)));

          return {
            name: formatVillageName(v.villageName, isMarathi),
            fullName: v.villageName,
            totalCount: totCnt,
            totalArea: totAr,
            compliantCount: compCnt,
            compliantArea: compAr,
            breachCount: brCnt,
            breachArea: Number(brAr.toFixed(2)),
            displayTotal: barMetricType === 'area' ? totAr : totCnt,
            displayCompliant: barMetricType === 'area' ? compAr : compCnt,
            displayBreach: barMetricType === 'area' ? Number(brAr.toFixed(2)) : brCnt
          };
        })
        .filter(d => d.displayTotal > 0);
    }

    // Default: Taluka level comparison across Chandrapur district
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
            if (k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized')) {
              brCnt += Number(t[sh.countKey] || 0);
              brAr += Number(t[sh.areaKey] || 0);
            }
          });
          const compCnt = Math.max(0, totCnt - brCnt);
          const compAr = Math.max(0, Number((totAr - brAr).toFixed(2)));

          return {
            name: dispName,
            fullName: rawName,
            totalCount: totCnt,
            totalArea: totAr,
            compliantCount: compCnt,
            compliantArea: compAr,
            breachCount: brCnt,
            breachArea: Number(brAr.toFixed(2)),
            displayTotal: barMetricType === 'area' ? totAr : totCnt,
            displayCompliant: barMetricType === 'area' ? compAr : compCnt,
            displayBreach: barMetricType === 'area' ? Number(brAr.toFixed(2)) : brCnt
          };
        })
        .filter(d => d.displayTotal > 0);
    }

    return [];
  }, [taluka, villageRows, talukaRows, goshDef, isMarathi, barMetricType]);

  // Slices for Pie Chart
  const pieChartSlices = useMemo(() => {
    return analyticsData.categories.filter(c => c.value > 0);
  }, [analyticsData.categories]);

  // Active highlighted slice
  const activeSlice = activeSliceIndex !== null ? pieChartSlices[activeSliceIndex] : null;

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = metricType === 'area' ? data.areaPct : data.countPct;
      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs z-50 max-w-xs backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1.5 border-b border-slate-800 pb-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
            <span className="font-black text-slate-100 text-[13px] leading-tight">{data.label}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>{isMarathi ? 'अभिलेख संख्या:' : 'Parcel Count:'}</span>
              <span className="font-mono font-bold text-white text-xs">{data.count.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>{isMarathi ? 'एकूण क्षेत्र:' : 'Total Area:'}</span>
              <span className="font-mono font-bold text-xs">{data.area.toLocaleString('en-IN')} Ha</span>
            </div>
            <div className="flex justify-between items-center text-amber-400 pt-1 border-t border-slate-800 font-bold">
              <span>{isMarathi ? 'एकूण प्रमाणातील वाटा:' : 'Share of Total:'}</span>
              <span className="font-mono">{pct}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Comparative Bar Chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const unit = barMetricType === 'area' ? 'Ha' : '';
      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs z-50 min-w-[200px] backdrop-blur-md">
          <div className="flex items-center gap-1.5 mb-2 border-b border-slate-800 pb-1.5 font-black text-amber-400 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{label}</span>
          </div>
          <div className="space-y-1.5 font-sans">
            <div className="flex justify-between items-center text-slate-200">
              <span>{isMarathi ? 'एकूण नोंदणी:' : 'Total Registered:'}</span>
              <span className="font-mono font-black text-white">
                {data.displayTotal.toLocaleString('en-IN')} {unit}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>{isMarathi ? 'नियमित नोंदी:' : 'Compliant:'}</span>
              <span className="font-mono font-bold">
                {data.displayCompliant.toLocaleString('en-IN')} {unit}
              </span>
            </div>
            <div className="flex justify-between items-center text-rose-400">
              <span>{isMarathi ? 'शर्तभंग / चौकशी:' : 'Breaches / Inquiry:'}</span>
              <span className="font-mono font-bold">
                {data.displayBreach.toLocaleString('en-IN')} {unit}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!category) return null;

  return (
    <div className="mb-6 bg-gradient-to-b from-white via-slate-50/50 to-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* 1. Executive Analytics Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/10">
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
                — {isMarathi ? 'आलेख, आकडेवारी व वैधानिक विश्लेषण' : 'Analytics, Charts & Statutory Insights'}
              </span>
            </h2>
          </div>
        </div>

        {/* Action Controls & Collapse/Expand */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Metric Toggle: Count vs Area */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/15">
            <button
              type="button"
              onClick={() => {
                setMetricType('count');
                setBarMetricType('count');
              }}
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
              onClick={() => {
                setMetricType('area');
                setBarMetricType('area');
              }}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                metricType === 'area'
                  ? 'bg-white text-indigo-950 shadow-xs font-extrabold'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              {isMarathi ? 'क्षेत्रफळ (हेक्टर)' : 'Area (Ha)'}
            </button>
          </div>

          {/* Toggle Expand / Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(p => !p)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
            title={isExpanded ? (isMarathi ? 'आलेख संकुचित करा' : 'Collapse Charts') : (isMarathi ? 'आलेख विस्तृत करा' : 'Expand Charts')}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-5">
          {/* 2. Top Dynamic KPI Metric Cards tailored to this booklet */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* Total 7/12 Records in Booklet */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-200/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-900 mb-1">
                <span className="text-[11px] font-bold truncate">
                  {isMarathi ? 'एकूण ७/१२ अभिलेख' : 'Total 7/12 Records'}
                </span>
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-indigo-950 font-mono">
                  {analyticsData.totalSurveys.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-semibold text-indigo-700/90 mt-0.5">
                  {analyticsData.totalArea.toLocaleString('en-IN')} Ha
                </div>
              </div>
            </div>

            {/* Dynamic SuperHeader Cards */}
            {analyticsData.categories.map((cat, idx) => (
              <div
                key={`cat-card-${idx}`}
                className={clsx(
                  'rounded-xl p-3 shadow-2xs border flex flex-col justify-between transition-all hover:shadow-xs',
                  cat.count > 0 ? 'bg-white' : 'bg-slate-50/60 opacity-80',
                  cat.key.includes('breach') || cat.key.includes('conv') || cat.key.includes('del') || cat.key.includes('unauthorized') || cat.key.includes('unpermitted')
                    ? 'border-rose-200/90 hover:border-rose-300'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2">
                    {cat.label}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                      {cat.count.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {metricType === 'area' ? `${cat.areaPct}%` : `${cat.countPct}%`}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
                    {cat.area.toLocaleString('en-IN')} Ha
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Statutory Compliance & Risk Horizon Gauge Bar */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {isMarathi ? 'वैधानिक पूर्तता व जोखीम स्थिती' : 'Statutory Compliance & Risk Horizon'}
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

            {/* Visual 100% Stacked Progress Bar */}
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
                  ? `एकूण ${analyticsData.totalSurveys.toLocaleString('en-IN')} अभिलेखांपैकी ${analyticsData.compliantCount.toLocaleString('en-IN')} नियमित व ${analyticsData.totalBreachCount.toLocaleString('en-IN')} चौकशी आवश्यक.`
                  : `Out of ${analyticsData.totalSurveys.toLocaleString('en-IN')} records, ${analyticsData.compliantCount.toLocaleString('en-IN')} are regular and ${analyticsData.totalBreachCount.toLocaleString('en-IN')} require inquiry.`}
              </span>
              <span className="font-mono font-bold text-slate-700">
                {analyticsData.totalArea.toLocaleString('en-IN')} Ha
              </span>
            </div>
          </div>

          {/* 4. Two-Column Visual Analytics: Pie Chart & Comparative Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Column A: Interactive Distribution Pie / Donut Chart */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    {isMarathi ? 'प्रकारनिहाय वितरण आलेख' : 'Category Distribution Chart'}
                  </h3>
                </div>

                {/* Donut vs Solid Pie Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setChartStyle('donut')}
                    className={clsx(
                      'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                      chartStyle === 'donut'
                        ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {isMarathi ? 'डोनट' : 'Donut'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartStyle('pie')}
                    className={clsx(
                      'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                      chartStyle === 'pie'
                        ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {isMarathi ? 'पाय' : 'Pie'}
                  </button>
                </div>
              </div>

              {/* Chart Render Container */}
              <div className="relative w-full h-[240px] flex items-center justify-center">
                {mounted && pieChartSlices.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <RechartsTooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={pieChartSlices}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={chartStyle === 'donut' ? 55 : 0}
                        outerRadius={88}
                        paddingAngle={chartStyle === 'donut' ? 2 : 1}
                        onMouseEnter={(_, index) => setActiveSliceIndex(index)}
                        onMouseLeave={() => setActiveSliceIndex(null)}
                      >
                        {pieChartSlices.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={activeSliceIndex === index ? 3 : 1.5}
                            className="cursor-pointer transition-all duration-200"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <Info className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                    <span className="text-xs">{isMarathi ? 'आलेख डेटा उपलब्ध नाही' : 'No chart data available'}</span>
                  </div>
                )}

                {/* Donut Center Total Label */}
                {chartStyle === 'donut' && pieChartSlices.length > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {metricType === 'area' ? (isMarathi ? 'एकूण क्षेत्र' : 'Total Area') : (isMarathi ? 'एकूण' : 'Total')}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                      {metricType === 'area'
                        ? `${analyticsData.totalArea.toLocaleString('en-IN')} Ha`
                        : analyticsData.totalSurveys.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Color Legend Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 max-h-[140px] overflow-y-auto no-scrollbar">
                {analyticsData.categories.map((cat, idx) => (
                  <div
                    key={`legend-${idx}`}
                    onMouseEnter={() => {
                      const sIdx = pieChartSlices.findIndex(s => s.key === cat.key);
                      if (sIdx !== -1) setActiveSliceIndex(sIdx);
                    }}
                    onMouseLeave={() => setActiveSliceIndex(null)}
                    className={clsx(
                      'flex items-center justify-between p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer',
                      activeSlice && activeSlice.key === cat.key
                        ? 'bg-slate-100 border-indigo-400 shadow-2xs font-bold'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate text-slate-700">{cat.label}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {metricType === 'area' ? `${cat.area} Ha` : cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column B: Comparative Bar Chart across Talukas / Villages */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      {taluka && taluka !== 'all' && taluka !== 'सर्व तालुके'
                        ? (isMarathi ? `${formatTalukaName(taluka, true)} — गावनिहाय तुलनात्मक आलेख` : `${taluka} — Village Comparison`)
                        : (isMarathi ? 'तालुकानिहाय तुलनात्मक आलेख (चंद्रपूर जिल्हा)' : 'Taluka Comparison Chart (Chandrapur)')}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isMarathi ? 'या निवडलेल्या पुस्तिकेतील नोंदींचे प्रादेशिक वितरण' : 'Regional breakdown for this selected booklet'}
                    </span>
                  </div>
                </div>

                {/* Bar Metric Switcher */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setBarMetricType('count')}
                      className={clsx(
                        'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                        barMetricType === 'count'
                          ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {isMarathi ? 'संख्या' : 'Count'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBarMetricType('area')}
                      className={clsx(
                        'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                        barMetricType === 'area'
                          ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {isMarathi ? 'क्षेत्र (Ha)' : 'Area (Ha)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="w-full h-[260px] pt-1">
                {mounted && comparisonBarData.length > 0 ? (
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
                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tick={{ fill: '#475569', fontWeight: 600 }}
                      />
                      <RechartsTooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="displayCompliant"
                        name={isMarathi ? 'नियमित नोंदी' : 'Compliant'}
                        fill="#059669"
                        stackId="a"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="displayBreach"
                        name={isMarathi ? 'शर्तभंग / चौकशी' : 'Breach / Inquiry'}
                        fill="#e11d48"
                        stackId="a"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Info className="w-8 h-8 mb-1 text-slate-300" />
                    <span className="text-xs">{isMarathi ? 'तुलनात्मक आलेख डेटा उपलब्ध नाही' : 'No comparison data available'}</span>
                  </div>
                )}
              </div>

              {/* Bar Chart Legend */}
              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                  <span>{isMarathi ? 'नियमित अभिलेख' : 'Compliant Holdings'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-rose-600 shrink-0" />
                  <span>{isMarathi ? 'शर्तभंग / संशयित बाबी' : 'Breaches / Flagged'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
