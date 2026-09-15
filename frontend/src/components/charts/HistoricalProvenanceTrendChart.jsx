'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { History, TrendingUp } from 'lucide-react';

export default function HistoricalProvenanceTrendChart({ data = [] }) {
  const [metricMode, setMetricMode] = useState('area'); // 'area' | 'count'

  // Format historical timeline epochs (1950 baseline onwards)
  const chartData = (data || []).map((item) => ({
    year: String(item.epochYear),
    epochLabel: item.epochYear === 1950 ? '१९५० (मूळ सनद)' : `${item.epochYear}`,
    count: Number(item.recordsCount || 0),
    areaHa: Number(Number(item.totalAreaHa || 0).toFixed(2)),
    value: metricMode === 'area' ? Number(Number(item.totalAreaHa || 0).toFixed(2)) : Number(item.recordsCount || 0),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-xs pointer-events-none z-50">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white">वर्ष {item.year}</span>
            {item.year === '1950' && (
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-900/60 text-emerald-300 rounded font-semibold">
                मूळ आधारभूत वर्ष
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div>फेरफार भूखंड क्षेत्र: <span className="font-black text-amber-400">{item.areaHa.toFixed(2)} Ha</span></div>
            <div>अभिलेख फेरफार नोंदी: <span className="font-bold text-white">{item.count}</span></div>
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
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>१९५० ते २०२६ भूमी स्थित्यंतर व फेरफार वक्र</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                Backward Linkage
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              स्वातंत्र्योत्तर १९५० आधारभूत वर्षापासून ते आजपर्यंतचे फेरफार व हक्क स्थित्यंतर
            </p>
          </div>
        </div>

        {/* Switcher */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto" role="group" aria-label="Metric Switcher">
          <button
            type="button"
            onClick={() => setMetricMode('area')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
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
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
              metricMode === 'count'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={metricMode === 'count'}
          >
            फेरफार संख्या
          </button>
        </div>
      </div>

      {/* Smooth Area Wave Chart with Peak Value Labels */}
      <div className="relative my-2 h-56 w-full flex items-center justify-center" aria-label="Historical title trend chart">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-8">
            <History className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
            <p className="text-xs font-semibold">इतिहास नोंदणी उपलब्ध नाही.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 22, right: 16, left: -18, bottom: 2 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#areaGradient)"
                dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Epoch Pills Footer */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
        <span className="text-[11px] font-bold text-slate-600">स्थित्यंतर टप्पे:</span>
        {chartData.map((item) => (
          <span
            key={item.year}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-700"
          >
            <span className="text-slate-500">{item.year}:</span>
            <span className="text-emerald-700 font-black">
              {metricMode === 'area' ? `${item.areaHa} Ha` : `${item.count}`}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
