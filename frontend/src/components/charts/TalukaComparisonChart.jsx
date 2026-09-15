'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MapPin, BarChart3 } from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

export default function TalukaComparisonChart({ data = [], selectedTaluka = '' }) {
  const [viewMode, setViewMode] = useState('counts'); // 'counts' | 'area'

  // Map Marathi names
  const talukaMap = new Map();
  CHANDRAPUR_TALUKAS.forEach((t) => {
    talukaMap.set(t.id.toLowerCase(), t.nameMr);
  });

  const chartData = (data || []).map((item) => {
    const nameMr = talukaMap.get((item.taluka || '').toLowerCase()) || item.taluka;
    return {
      taluka: item.taluka,
      nameMr,
      parcelCount: Number(item.parcelCount || 0),
      violationCount: Number(item.violationCount || 0),
      disputeCount: Number(item.disputeCount || 0),
      totalAreaHa: Number(Number(item.totalAreaHa || 0).toFixed(2)),
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xl text-xs max-w-xs z-50 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1.5 border-b border-slate-100 pb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-800 shrink-0" />
            <span className="font-black text-slate-900 text-xs">तालुका {item.nameMr}</span>
            <span className="text-[10px] text-slate-500 font-medium">({item.taluka})</span>
          </div>

          <div className="space-y-1 mt-1">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-[10px] font-medium">नोंदणीकृत भूखंड:</span>
              <span className="font-bold text-slate-900">{item.parcelCount}</span>
            </div>
            <div className="flex justify-between items-center text-amber-700">
              <span className="text-[10px] font-medium">शर्तभंग व चौकशी:</span>
              <span className="font-bold text-amber-800">{item.violationCount}</span>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span className="text-[10px] font-medium">सक्रीय वाद (Disputes):</span>
              <span className="font-bold text-rose-800">{item.disputeCount}</span>
            </div>
            <div className="flex justify-between items-center text-blue-900 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-semibold">एकूण क्षेत्रफळ:</span>
              <span className="font-black">{item.totalAreaHa.toFixed(2)} Ha</span>
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
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>तालुकानिहाय सनियंत्रण व तुलना</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">
                १५ तालुके
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              भूखंड, शर्तभंग प्रकरणे व महसूल क्षेत्राचे तुलनात्मक विवरण
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto" role="group" aria-label="Taluka Chart View Mode">
          <button
            type="button"
            onClick={() => setViewMode('counts')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
              viewMode === 'counts'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={viewMode === 'counts'}
          >
            प्रकरणे व भूखंड
          </button>
          <button
            type="button"
            onClick={() => setViewMode('area')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
              viewMode === 'area'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={viewMode === 'area'}
          >
            क्षेत्रफळ (Ha)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative my-2 h-56 w-full flex items-center justify-center" aria-label="Taluka comparison bar chart">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-8">
            <BarChart3 className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
            <p className="text-xs font-semibold">या निवडीसाठी तालुका नोंदी उपलब्ध नाहीत.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -16, bottom: 2 }}
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="nameMr"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={viewMode === 'area'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '8px', fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => {
                  if (value === 'parcelCount') return 'नोंदणीकृत भूखंड';
                  if (value === 'violationCount') return 'शर्तभंग चौकशी';
                  if (value === 'disputeCount') return 'सक्रीय वाद';
                  if (value === 'totalAreaHa') return 'एकूण क्षेत्र (Ha)';
                  return value;
                }}
              />
              {viewMode === 'counts' ? (
                <>
                  <Bar
                    dataKey="parcelCount"
                    name="parcelCount"
                    fill="#1e3a8a"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="violationCount"
                    name="violationCount"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="disputeCount"
                    name="disputeCount"
                    fill="#e11d48"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </>
              ) : (
                <Bar
                  dataKey="totalAreaHa"
                  name="totalAreaHa"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Chips Footer */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <span className="font-semibold text-slate-700 text-[11px]">नोंदणीकृत तालुके:</span>
        {chartData.map((t) => (
          <span
            key={t.taluka}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
              selectedTaluka && selectedTaluka.toLowerCase() === t.taluka.toLowerCase()
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>{t.nameMr}:</span>
            <span className="text-slate-900 font-extrabold">{t.parcelCount}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
