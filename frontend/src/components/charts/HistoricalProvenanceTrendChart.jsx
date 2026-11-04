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
import { useTranslation } from '../LanguageContext';

export default function HistoricalProvenanceTrendChart({ data = [] }) {
  const { isMarathi } = useTranslation();
  const [metricMode, setMetricMode] = useState('area'); // 'area' | 'count'

  // Format historical timeline epochs (1950 baseline to 2026 current status)
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      year: String(item.epochYear),
      epochLabel:
        item.epochYear === 1950
          ? (isMarathi ? '१९५० (मूळ सनद)' : '1950 (Settlement)')
          : item.epochYear === 2026
          ? (isMarathi ? '२०२६ (चालू ७/१२)' : '2026 (Current 7/12)')
          : (isMarathi ? `वर्ष ${item.epochYear}` : `Year ${item.epochYear}`),
      count: Number(item.recordsCount || 0),
      areaHa: Number(Number(item.totalAreaHa || 0).toFixed(2)),
      value:
        metricMode === 'area'
          ? Number(Number(item.totalAreaHa || 0).toFixed(2))
          : Number(item.recordsCount || 0),
    }));
  }, [data, metricMode, isMarathi]);

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

  // Dynamic Y-Domain to make historical shifts clearly visible
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
        <div className="bg-[#252B36] text-white p-4 rounded-2xl border border-slate-700 shadow-2xl text-xs sm:text-sm pointer-events-none z-50 min-w-[240px]">
          <div className="flex items-center justify-between gap-2 font-bold mb-2.5 border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${is1950 ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'}`} />
              <span className="text-white text-sm sm:text-base font-bold">{item.epochLabel}</span>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                is1950
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                  : is2026
                  ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {is1950
                ? (isMarathi ? 'आधारभूत' : 'Baseline')
                : is2026
                ? (isMarathi ? 'विद्यमान' : 'Current')
                : (isMarathi ? 'टप्पा' : 'Milestone')}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-200 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">{isMarathi ? 'नोंदणीकृत क्षेत्र:' : 'Registered Area:'}</span>
              <span className="font-black text-[#F59E0B]">{item.areaHa.toLocaleString('en-IN')} Ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">{isMarathi ? 'अभिलेख खाते संख्या:' : 'Record Accounts:'}</span>
              <span className="font-bold text-white">{item.count.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#E9E7E1] pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#4169E1]/10 border border-[#4169E1]/20 flex items-center justify-center text-[#4169E1] shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-[22px] font-bold text-[#252B36] flex items-center gap-2.5 flex-wrap">
              <span>{isMarathi ? '१९५० ते २०२६ भूमी स्थित्यंतर व फेरफार वक्र' : '1950 to 2026 Provenance & Mutation Timeline'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 font-bold shrink-0">
                {isMarathi ? '७६ वर्षांचे स्थित्यंतर' : '76-Year Trajectory'}
              </span>
            </h3>
            <p className="text-sm sm:text-[15px] text-[#64748B] font-medium truncate mt-0.5 leading-snug">
              {isMarathi
                ? 'मूळ शेतजमीन बंदोबस्त (१९५०) पासून चालू २०२६ पर्यंतची क्षेत्र व खाते स्थित्यंतरे'
                : 'Comparative area and parcel evolution from 1950 settlement to 2026 registry'}
            </p>
          </div>
        </div>

        {/* Metric Switcher */}
        <div
          className="inline-flex p-1 bg-[#F8F7F3] rounded-xl border border-[#E9E7E1] self-start sm:self-auto shrink-0"
          role="group"
          aria-label={isMarathi ? 'मापन पद्धती' : 'Metric Switcher'}
        >
          <button
            type="button"
            onClick={() => setMetricMode('area')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              metricMode === 'area'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#252B36]'
            }`}
            aria-pressed={metricMode === 'area'}
          >
            {isMarathi ? 'क्षेत्रफळ (Ha)' : 'Area (Ha)'}
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('count')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              metricMode === 'count'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#252B36]'
            }`}
            aria-pressed={metricMode === 'count'}
          >
            {isMarathi ? 'खाते संख्या' : 'Accounts'}
          </button>
        </div>
      </div>

      {/* Delta Callout Box */}
      {deltaStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#E9E7E1]">
            <span className="text-xs text-[#64748B] font-bold block">
              {isMarathi ? '१९५० आधारभूत क्षेत्र' : '1950 Baseline Area'}
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-[#252B36] mt-0.5 block">
              {(chartData[0]?.areaHa || 0).toLocaleString('en-IN')} Ha
            </span>
          </div>

          <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#E9E7E1]">
            <span className="text-xs text-[#64748B] font-bold block">
              {isMarathi ? '२०२६ विद्यमान क्षेत्र' : '2026 Current Area'}
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-[#4169E1] mt-0.5 block">
              {(chartData[chartData.length - 1]?.areaHa || 0).toLocaleString('en-IN')} Ha
            </span>
          </div>

          <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#E9E7E1]">
            <span className="text-xs text-[#64748B] font-bold block">
              {isMarathi ? 'निव्वळ स्थित्यंतर फरक' : 'Net Shift Area'}
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-[#16A34A] mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +{deltaStats.areaDiff} Ha
            </span>
          </div>

          <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#E9E7E1]">
            <span className="text-xs text-[#64748B] font-bold block">
              {isMarathi ? 'खातेदार संख्या वाढ' : 'Account Growth'}
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-[#7656D6] mt-0.5 flex items-center gap-1">
              +{deltaStats.countDiff.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="h-72 sm:h-80 lg:h-92 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E7E1" vertical={false} />
            <XAxis
              dataKey="epochLabel"
              tick={{ fontSize: 16, fill: '#252B36', fontWeight: 600 }}
              stroke="#CBD5E1"
              dy={10}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 15, fill: '#64748B', fontWeight: 600 }}
              stroke="#CBD5E1"
              dx={-5}
              tickFormatter={(v) => Number(v).toLocaleString('en-IN')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4169E1"
              strokeWidth={3.5}
              fill="#4169E1"
              fillOpacity={0.12}
              activeDot={{ r: 7, stroke: '#FFFFFF', strokeWidth: 3, fill: '#4169E1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Guidance */}
      <div className="pt-3 border-t border-[#E9E7E1] flex items-center justify-between text-xs sm:text-[13px] text-[#64748B]">
        <span className="font-medium">
          {isMarathi
            ? '१९५० चा मूळ शेतजमीन बंदोबस्त हा जमिनीच्या मालकीहक्काचा सर्वोच्च कायदेशीर आधार मानला जातो.'
            : 'The 1950 baseline settlement records serve as foundational proof of original title.'}
        </span>
        <span className="font-bold text-[#4169E1]">
          {chartData.length} {isMarathi ? 'कालखंड' : 'Milestones'}
        </span>
      </div>
    </div>
  );
}
