'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MapPin, Mountain, BarChart3, Layers } from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

export default function TalukaMountainChart({ data = [], selectedTaluka = '' }) {
  const [chartType, setChartType] = useState('bars'); // 'bars' | 'mountain'

  const talukaMap = new Map();
  CHANDRAPUR_TALUKAS.forEach((t) => {
    talukaMap.set(t.id.toLowerCase(), t.nameMr);
  });

  const chartData = (data || []).map((item) => {
    const nameMr = talukaMap.get((item.taluka || '').toLowerCase()) || item.taluka;
    const totalArea = Number(Number(item.totalAreaHa || 0).toFixed(2));
    const parcels = Number(item.parcelCount || 0);
    const violations = Number(item.violationCount || 0);
    const disputes = Number(item.disputeCount || 0);

    return {
      taluka: item.taluka,
      nameMr,
      parcelCount: parcels,
      violationCount: violations,
      disputeCount: disputes,
      totalAreaHa: totalArea,
      // Approx cultivable vs safe area ratio
      cultivableAreaHa: Number((totalArea * 0.9).toFixed(2)),
      disputedAreaHa: Number((violations * 1.5).toFixed(2)),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-xs z-50 pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold mb-1.5 border-b border-slate-800 pb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-white text-xs">तालुका {item.nameMr}</span>
            <span className="text-[10px] text-slate-400 font-normal">({item.taluka})</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between gap-4 text-slate-300">
              <span>नोंदणीकृत भूखंड:</span>
              <span className="font-bold text-white">{item.parcelCount}</span>
            </div>
            <div className="flex justify-between gap-4 text-amber-300">
              <span>शर्तभंग चौकशी:</span>
              <span className="font-bold">{item.violationCount}</span>
            </div>
            <div className="flex justify-between gap-4 text-rose-300">
              <span>सक्रीय वाद:</span>
              <span className="font-bold">{item.disputeCount}</span>
            </div>
            <div className="flex justify-between gap-4 text-emerald-300 pt-1 border-t border-slate-800">
              <span>एकूण क्षेत्रफळ:</span>
              <span className="font-black text-amber-400">{item.totalAreaHa.toFixed(2)} Ha</span>
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

        {/* Chart View Mode Switcher */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto" role="group" aria-label="Chart type toggle">
          <button
            type="button"
            onClick={() => setChartType('bars')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition ${
              chartType === 'bars'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={chartType === 'bars'}
          >
            <BarChart3 className="w-3 h-3" />
            <span>स्तंभालेख</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('mountain')}
            className={`px-2 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition ${
              chartType === 'mountain'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={chartType === 'mountain'}
          >
            <Mountain className="w-3 h-3" />
            <span>पर्वताकार वक्र</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative my-2 h-56 w-full flex items-center justify-center" aria-label="Taluka comparison visualizer">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-8">
            <BarChart3 className="w-8 h-8 stroke-[1.5] mb-2 opacity-40" />
            <p className="text-xs font-semibold">नोंदी उपलब्ध नाहीत.</p>
          </div>
        ) : chartType === 'bars' ? (
          // Multi-Series Grouped Bar Chart (Image 2 Chart 2 Style)
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 2 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="nameMr"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => {
                  if (value === 'parcelCount') return 'नोंदणीकृत भूखंड';
                  if (value === 'violationCount') return 'शर्तभंग चौकशी';
                  if (value === 'disputeCount') return 'सक्रीय वाद';
                  return value;
                }}
              />
              <Bar dataKey="parcelCount" name="parcelCount" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="violationCount" name="violationCount" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="disputeCount" name="disputeCount" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Multi-layer Mountain Wave Chart (Image 3 & 5 LATINE Style)
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 16, left: -18, bottom: 2 }}>
              <defs>
                <linearGradient id="totalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cultivableGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="disputeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="nameMr"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => {
                  if (value === 'totalAreaHa') return 'एकूण क्षेत्र (Ha)';
                  if (value === 'cultivableAreaHa') return 'लागवडीयोग्य क्षेत्र (Ha)';
                  if (value === 'disputedAreaHa') return 'बाधित क्षेत्र (Ha)';
                  return value;
                }}
              />
              <Area
                type="natural"
                dataKey="totalAreaHa"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#totalAreaGrad)"
                dot={{ r: 3, fill: '#2563eb' }}
              />
              <Area
                type="natural"
                dataKey="cultivableAreaHa"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cultivableGrad)"
                dot={{ r: 3, fill: '#059669' }}
              />
              <Area
                type="natural"
                dataKey="disputedAreaHa"
                stroke="#e11d48"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#disputeGrad)"
                dot={{ r: 3, fill: '#e11d48' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Screen Reader Accessible Data Table (WCAG 1.1.1) */}
      <table className="sr-only">
        <caption>तालुका पर्वत/स्तंभ आलेख तुलना सारणी</caption>
        <thead>
          <tr>
            <th scope="col">तालुका</th>
            <th scope="col">भूखंड</th>
            <th scope="col">शर्तभंग</th>
            <th scope="col">सक्रीय वाद</th>
            <th scope="col">एकूण क्षेत्र (हे.)</th>
            <th scope="col">लागवडीयोग्य क्षेत्र (हे.)</th>
            <th scope="col">बाधित क्षेत्र (हे.)</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((row) => (
            <tr key={row.taluka}>
              <td>{row.nameMr} ({row.taluka})</td>
              <td>{row.parcelCount}</td>
              <td>{row.violationCount}</td>
              <td>{row.disputeCount}</td>
              <td>{row.totalAreaHa}</td>
              <td>{row.cultivableAreaHa}</td>
              <td>{row.disputedAreaHa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Taluka Chips */}
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
