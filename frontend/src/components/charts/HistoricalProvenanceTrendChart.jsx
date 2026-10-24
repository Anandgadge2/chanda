'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { History, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, CheckCircle2 } from 'lucide-react';

export default function HistoricalProvenanceTrendChart({ data = [] }) {
  const [metricMode, setMetricMode] = useState('area'); // 'area' | 'count'

  // Format historical timeline epochs (1950 baseline to 2026 current status)
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      year: String(item.epochYear),
      epochLabel:
        item.epochYear === 1950
          ? '१९५० (मूळ सनद)'
          : item.epochYear === 2026
          ? '२०२६ (चालू ७/१२)'
          : `वर्ष ${item.epochYear}`,
      count: Number(item.recordsCount || 0),
      areaHa: Number(Number(item.totalAreaHa || 0).toFixed(2)),
      value:
        metricMode === 'area'
          ? Number(Number(item.totalAreaHa || 0).toFixed(2))
          : Number(item.recordsCount || 0),
    }));
  }, [data, metricMode]);

  // Compute Delta between earliest (1950) and latest (2026) epochs
  const deltaStats = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0];
    const last = chartData[chartData.length - 1];

    const areaDiff = Number((last.areaHa - first.areaHa).toFixed(2));
    const areaPct = first.areaHa > 0 ? ((areaDiff / first.areaHa) * 100).toFixed(2) : '0';

    const countDiff = last.count - first.count;
    const countPct = first.count > 0 ? ((countDiff / first.count) * 100).toFixed(2) : '0';

    return {
      areaDiff,
      areaPct,
      countDiff,
      countPct,
      firstYear: first.year,
      lastYear: last.year,
    };
  }, [chartData]);

  // Dynamic Y-Domain to make subtle historical shifts clearly visible without being crushed
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map((d) => d.value).filter((v) => !isNaN(v) && v > 0);
    if (values.length === 0) return [0, 100];
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) {
      return [Math.floor(min * 0.9), Math.ceil(max * 1.1)];
    }
    const spread = max - min;
    const padding = Math.max(spread * 0.35, min * 0.05);
    return [
      Math.max(0, Math.floor(min - padding)),
      Math.ceil(max + padding),
    ];
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const is1950 = item.year === '1950';
      const is2026 = item.year === '2026';

      return (
        <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs pointer-events-none z-50 min-w-[210px]">
          <div className="flex items-center justify-between gap-1.5 font-bold mb-2 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${is1950 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-white text-xs">{item.epochLabel}</span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                is1950
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  : is2026
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {is1950 ? 'आधारभूत बंदोबस्त' : is2026 ? 'विद्यमान पडताळणी' : 'मध्यवर्ती टप्पा'}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">नोंदणीकृत क्षेत्र:</span>
              <span className="font-black text-amber-400">{item.areaHa.toLocaleString('en-IN')} Ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">अभिलेख खाते संख्या:</span>
              <span className="font-bold text-white">{item.count.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>१९५० ते २०२६ भूमी स्थित्यंतर व फेरफार वक्र</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                Backward Linkage • ७६ वर्षांचे स्थित्यंतर
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              स्वातंत्र्योत्तर १९५० आधारभूत वर्षापासून ते २०२६ चालू अभिलेखापर्यंतचे हक्क स्थित्यंतर
            </p>
          </div>
        </div>

        {/* Switcher */}
        <div
          className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto shrink-0"
          role="group"
          aria-label="Metric Switcher"
        >
          <button
            type="button"
            onClick={() => setMetricMode('area')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
              metricMode === 'area'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={metricMode === 'area'}
          >
            क्षेत्रफळ (Ha)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('count')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
              metricMode === 'count'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={metricMode === 'count'}
          >
            फेरफार / खाती संख्या
          </button>
        </div>
      </div>

      {/* Analytical Delta Pill Strip */}
      {deltaStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-2.5 p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-medium block">
              {metricMode === 'area' ? '१९५० मूळ आधारभूत क्षेत्र' : '१९५० मूळ खातेदार'}
            </span>
            <span className="font-extrabold text-slate-800 text-xs">
              {metricMode === 'area'
                ? `${chartData[0].areaHa.toLocaleString('en-IN')} Ha`
                : `${chartData[0].count.toLocaleString('en-IN')}`}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-medium block">
              {metricMode === 'area' ? '२०२६ विद्यमान चालू क्षेत्र' : '२०२६ चालू खाती संख्या'}
            </span>
            <span className="font-extrabold text-slate-900 text-xs">
              {metricMode === 'area'
                ? `${chartData[chartData.length - 1].areaHa.toLocaleString('en-IN')} Ha`
                : `${chartData[chartData.length - 1].count.toLocaleString('en-IN')}`}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 font-medium block">७६ वर्षांतील निव्वळ बदल</span>
            <div className="flex items-center gap-1 font-extrabold text-xs">
              {metricMode === 'area' ? (
                deltaStats.areaDiff >= 0 ? (
                  <span className="inline-flex items-center text-emerald-700">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    +{deltaStats.areaDiff.toLocaleString('en-IN')} Ha ({deltaStats.areaPct}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-700">
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    {deltaStats.areaDiff.toLocaleString('en-IN')} Ha ({deltaStats.areaPct}%)
                  </span>
                )
              ) : deltaStats.countDiff >= 0 ? (
                <span className="inline-flex items-center text-emerald-700">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  +{deltaStats.countDiff.toLocaleString('en-IN')} खाती ({deltaStats.countPct}%)
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-700">
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  {deltaStats.countDiff.toLocaleString('en-IN')} खाती ({deltaStats.countPct}%)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Wave Chart / Fallback View */}
      <div className="relative my-1 h-52 w-full flex items-center justify-center" aria-label="Historical title trend chart">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-8">
            <History className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
            <p className="text-xs font-semibold">इतिहास नोंदणी उपलब्ध नाही.</p>
          </div>
        ) : chartData.length === 1 ? (
          /* Defensive UI: Single-point Provenance Card instead of an empty coordinate box with a lonely dot */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-center">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">
              १९५० मूळ आधारभूत सनद नोंदणीकृत (एकमेव आधारभूत टप्पा)
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 max-w-md">
              सध्या फक्त १९५० बंदोबस्त नोंद उपलब्ध आहे ({chartData[0].areaHa.toLocaleString('en-IN')} Ha,{' '}
              {chartData[0].count.toLocaleString('en-IN')} खाती). मध्यवर्ती फेरफार व २०२६ चालू अभिलेखांची पडताळणी प्रक्रियेत आहे.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 22, right: 28, left: -10, bottom: 4 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="epochLabel"
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 700 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaGradient)"
                dot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Screen Reader Accessible Data Table (WCAG 1.1.1) */}
      <table className="sr-only">
        <caption>१९५० ते २०२६ भूमी स्थित्यंतर व फेरफार प्रवृत्ती सारणी</caption>
        <thead>
          <tr>
            <th scope="col">वर्ष / टप्पा</th>
            <th scope="col">फेरफार नोंदी संख्या</th>
            <th scope="col">क्षेत्रफळ (हे.)</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((item) => (
            <tr key={item.year}>
              <td>{item.epochLabel}</td>
              <td>{item.count}</td>
              <td>{item.areaHa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Epoch Pills Footer & Statutory Milestone Breadcrumbs */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">अभिलेख टप्पे:</span>
            {chartData.map((item) => (
              <span
                key={item.year}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                  item.year === '1950'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-slate-500 font-semibold">{item.year}:</span>
                <span className="font-black">
                  {metricMode === 'area'
                    ? `${item.areaHa.toLocaleString('en-IN')} Ha`
                    : `${item.count.toLocaleString('en-IN')}`}
                </span>
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>विशेष महसूल तपासणी मोहीम</span>
          </div>
        </div>

        {/* 4-Phase Historical Progression Breadcrumb */}
        <div className="hidden sm:grid grid-cols-4 gap-1 text-[9px] pt-1 border-t border-slate-100/70 text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate font-semibold text-slate-700">१. १९५० मूळ बंदोबस्त सनद</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span className="truncate">२. कमाल जमीन धारणा/भूदान</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span className="truncate">३. आदिवासी संरक्षण (Sec 36)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="truncate font-semibold text-emerald-800">४. २०२६ चालू प्रपत्र पडताळणी</span>
          </div>
        </div>
      </div>
    </div>
  );
}
