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
  ChevronDown,
  ChevronUp,
  MapPin,
  LandPlot,
  Scale,
  Building2,
  Activity
} from 'lucide-react';
import clsx from 'clsx';
import { formatTalukaName, formatVillageName, formatScopeText } from '../../lib/villageUtils';

const TENURE_COLORS = {
  class1: '#059669', // Emerald
  class2: '#d97706', // Amber
  sarkar: '#2563eb', // Royal Blue
  devasthan: '#7c3aed', // Purple
  forest: '#047857'  // Teal
};

export default function Checklist46Analytics({
  parcels = [],
  stats = null,
  serverRollup = null,
  taluka = 'all',
  village = 'all',
  isMarathi = true,
  activeScope = ''
}) {
  const [metricType, setMetricType] = useState('count'); // 'count' | 'area'
  const [chartStyle, setChartStyle] = useState('donut'); // 'donut' | 'pie'
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeSliceIndex, setActiveSliceIndex] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute tenure classification distribution from parcels or serverRollup
  const tenureDistribution = useMemo(() => {
    let c1Count = 0;
    let c1Area = 0;
    let c2Count = 0;
    let c2Area = 0;
    let sarkarCount = 0;
    let sarkarArea = 0;
    let otherCount = 0;
    let otherArea = 0;

    if (serverRollup?.districtTotal && (!taluka || taluka === 'all')) {
      const dt = serverRollup.districtTotal;
      c1Count = Number(dt.c1Count || 0);
      c1Area = Number(dt.c1Area || 0);
      c2Count = Number(dt.c2Count || 0);
      c2Area = Number(dt.c2Area || 0);
      sarkarCount = Number(dt.sarkarCount || 0);
      sarkarArea = Number(dt.sarkarArea || 0);
      otherCount = Math.max(0, Number(dt.total712Count || 0) - (c1Count + c2Count + sarkarCount));
      otherArea = Math.max(0, Number(dt.totalArea || 0) - (c1Area + c2Area + sarkarArea));
    } else if (parcels && parcels.length > 0) {
      parcels.forEach(p => {
        const ar = Number(p.totalAreaHa || 0);
        const tClass = (p.tenureClass || '').toUpperCase();
        if (tClass === 'BHOGVATDAR_CLASS_1') {
          c1Count++;
          c1Area += ar;
        } else if (tClass === 'BHOGVATDAR_CLASS_2') {
          c2Count++;
          c2Area += ar;
        } else if (tClass === 'SARKAR_SHASAN' || p.currentOwner?.includes('शासन') || p.currentOwner?.includes('महाराष्ट्र')) {
          sarkarCount++;
          sarkarArea += ar;
        } else {
          otherCount++;
          otherArea += ar;
        }
      });
    }

    const totalCnt = c1Count + c2Count + sarkarCount + otherCount;
    const totalAr = c1Area + c2Area + sarkarArea + otherArea;

    return [
      {
        key: 'class1',
        label: isMarathi ? 'भोगवटदार वर्ग १' : 'Class-1 Freehold',
        count: c1Count,
        area: Number(c1Area.toFixed(2)),
        value: metricType === 'area' ? Number(c1Area.toFixed(2)) : c1Count,
        color: TENURE_COLORS.class1,
        pct: totalCnt > 0 ? Number(((c1Count / totalCnt) * 100).toFixed(1)) : 0
      },
      {
        key: 'class2',
        label: isMarathi ? 'भोगवटदार वर्ग २' : 'Class-2 Restricted',
        count: c2Count,
        area: Number(c2Area.toFixed(2)),
        value: metricType === 'area' ? Number(c2Area.toFixed(2)) : c2Count,
        color: TENURE_COLORS.class2,
        pct: totalCnt > 0 ? Number(((c2Count / totalCnt) * 100).toFixed(1)) : 0
      },
      {
        key: 'sarkar',
        label: isMarathi ? 'सरकार / महाराष्ट्र शासन' : 'Government Land',
        count: sarkarCount,
        area: Number(sarkarArea.toFixed(2)),
        value: metricType === 'area' ? Number(sarkarArea.toFixed(2)) : sarkarCount,
        color: TENURE_COLORS.sarkar,
        pct: totalCnt > 0 ? Number(((sarkarCount / totalCnt) * 100).toFixed(1)) : 0
      },
      {
        key: 'other',
        label: isMarathi ? 'इतर / विशेष धारणा' : 'Other Tenures',
        count: otherCount,
        area: Number(otherArea.toFixed(2)),
        value: metricType === 'area' ? Number(otherArea.toFixed(2)) : otherCount,
        color: '#64748b',
        pct: totalCnt > 0 ? Number(((otherCount / totalCnt) * 100).toFixed(1)) : 0
      }
    ].filter(d => d.value > 0);
  }, [serverRollup, taluka, parcels, metricType, isMarathi]);

  // Taluka Comparison for 46 checklist
  const talukaBarData = useMemo(() => {
    if (serverRollup?.byTaluka && serverRollup.byTaluka.length > 0) {
      return serverRollup.byTaluka.map(t => {
        const rawName = (t.taluka || '').replace(/\s*\((?:संपूर्ण|Whole|All)[^)]*\)/gi, '').trim();
        const dispName = formatTalukaName(rawName, isMarathi);
        const tot = Number(t.total712Count || 0);
        const br = Number(t.shartCount || t.illegalDeletionsCount || 0);
        const comp = Math.max(0, tot - br);

        return {
          name: dispName,
          total: tot,
          compliant: comp,
          breach: br
        };
      });
    }
    return [];
  }, [serverRollup, isMarathi]);

  // Tooltip for Pie
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs z-50">
          <div className="flex items-center gap-2 mb-1 border-b border-slate-800 pb-1 font-bold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.label}</span>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{isMarathi ? 'नोंद संख्या:' : 'Count:'}</span>
              <span className="font-mono font-bold">{data.count.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between gap-4 text-emerald-400">
              <span>{isMarathi ? 'क्षेत्र (हेक्टर):' : 'Area (Ha):'}</span>
              <span className="font-mono font-bold">{data.area.toLocaleString('en-IN')} Ha</span>
            </div>
            <div className="flex justify-between gap-4 text-amber-400 pt-0.5 border-t border-slate-800">
              <span>{isMarathi ? 'टक्केवारी:' : 'Percentage:'}</span>
              <span className="font-mono font-bold">{data.pct}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white">
              {isMarathi ? '१ ते ४६ मुद्द्यांचे महसूल आलेख व वैधानिक स्थिती' : '1 to 46 Checkpoints Audit Visualizer'}
            </h3>
            <span className="text-[10px] text-slate-300">
              {formatScopeText(activeScope, isMarathi) || (isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric switcher */}
          <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/15 text-[11px]">
            <button
              type="button"
              onClick={() => setMetricType('count')}
              className={clsx(
                'px-2 py-0.5 rounded font-bold transition cursor-pointer',
                metricType === 'count' ? 'bg-white text-slate-900 font-extrabold shadow-2xs' : 'text-slate-300'
              )}
            >
              {isMarathi ? 'संख्या' : 'Count'}
            </button>
            <button
              type="button"
              onClick={() => setMetricType('area')}
              className={clsx(
                'px-2 py-0.5 rounded font-bold transition cursor-pointer',
                metricType === 'area' ? 'bg-white text-slate-900 font-extrabold shadow-2xs' : 'text-slate-300'
              )}
            >
              {isMarathi ? 'क्षेत्र (Ha)' : 'Area (Ha)'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(p => !p)}
            className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Pie Chart: Land Tenure Distribution */}
            <div className="lg:col-span-5 bg-slate-50/60 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PieIcon className="w-3.5 h-3.5 text-indigo-600" />
                  {isMarathi ? 'भूधारणा वर्गवारी वितरण' : 'Tenure Classification'}
                </span>
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.2 rounded">
                  {metricType === 'area' ? 'Hectares' : 'Parcels'}
                </span>
              </div>

              <div className="relative w-full h-[200px] flex items-center justify-center">
                {mounted && tenureDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <RechartsTooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={tenureDistribution}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={chartStyle === 'donut' ? 45 : 0}
                        outerRadius={72}
                        paddingAngle={1}
                      >
                        {tenureDistribution.map((entry, index) => (
                          <Cell key={`cell-46-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1.5} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-slate-400">{isMarathi ? 'डेटा उपलब्ध नाही' : 'No data'}</span>
                )}
              </div>

              {/* Mini Legend */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/80 text-[11px]">
                {tenureDistribution.map((td, idx) => (
                  <div key={`td-${idx}`} className="flex items-center justify-between p-1 rounded bg-white border border-slate-200/70">
                    <div className="flex items-center gap-1 truncate pr-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: td.color }} />
                      <span className="truncate text-slate-700">{td.label}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {metricType === 'area' ? `${td.area} Ha` : td.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Taluka Comparison */}
            <div className="lg:col-span-7 bg-slate-50/60 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  {isMarathi ? 'तालुकानिहाय ७/१२ व शर्तभंग तुलना' : 'Taluka-wise Audit Comparison'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District'}
                </span>
              </div>

              <div className="w-full h-[220px] pt-1">
                {mounted && talukaBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={talukaBarData}
                      margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={10}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <RechartsTooltip />
                      <Bar dataKey="compliant" name={isMarathi ? 'नियमित' : 'Compliant'} fill="#059669" stackId="a" />
                      <Bar dataKey="breach" name={isMarathi ? 'शर्तभंग/चौकशी' : 'Breaches'} fill="#e11d48" stackId="a" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    {isMarathi ? 'तुलनात्मक आलेख डेटा उपलब्ध नाही' : 'No comparison data'}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 pt-1 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                  <span>{isMarathi ? 'नियमित' : 'Compliant'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-600" />
                  <span>{isMarathi ? 'शर्तभंग / संशयित' : 'Breaches / Flagged'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
