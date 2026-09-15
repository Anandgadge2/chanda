'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  UploadCloud,
  Scale,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Landmark,
  Calendar,
  Filter,
} from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS, VIOLATION_TYPES } from '../../lib/constants';

export default function DashboardPage() {
  const [taluka, setTaluka] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalParcels: 0,
    totalViolations: 0,
    pendingHearings: 0,
    totalRepossessedHa: 0,
    totalRepossessedCases: 0,
    violationsByType: [],
    tenureDistribution: [],
    recentHearings: [],
  });

  const loadData = async (selectedTaluka = taluka, forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsSummary(selectedTaluka, forceRefresh);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(taluka);
  }, [taluka]);

  const handleExport = () => {
    window.location.href = api.getPrapatra3DownloadUrl(taluka);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Streamlined Executive Command & Filter Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                महसूल प्रशासन २०२६
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate">चंद्रपूर जिल्हा (महाराष्ट्र)</span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 mt-0.5 leading-snug truncate">
              जमीन अभिलेख व्यवस्थापन व महसूल चौकशी प्रणाली
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate">
              MLRC १९६६ अंतर्गत महसूल संनियंत्रण, आदिवासी जमीन संरक्षण व सुनावणी प्रणाली
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
         
            <Link
              href="/bulk-upload"
              className="inline-flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs shadow-2xs transition active:scale-95"
              title="गाव एक्सेल डेटा अपलोड"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>गाव डेटा अपलोड</span>
            </Link>
          </div>
        </div>

        {/* Compact Integrated Filter Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Filter className="w-3.5 h-3.5 text-blue-900 shrink-0" />
            <select
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="">सर्व तालुके (All 15 Talukas - District Level)</option>
              {CHANDRAPUR_TALUKAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameMr} ({t.nameEn})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {taluka && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                फिल्टर सक्रीय
              </span>
            )}
            <button
              onClick={() => loadData(taluka, true)}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-950 font-bold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="माहिती रिफ्रेश करा"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-900' : ''}`} />
              <span className="hidden sm:inline">रिफ्रेश</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Analytical Metric Cards (2-col mobile, 4-col desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <MetricCard
          titleMr="नोंदणीकृत भूखंड"
          value={analytics.totalParcels}
          subtext="चंद्रपूर महसूल अभिलेख"
          icon={Landmark}
          badgeColor="bg-blue-50 border-blue-200"
          iconColor="text-blue-700"
          textColor="text-slate-900"
        />

        <MetricCard
          titleMr="शर्तभंग व चौकशी"
          value={analytics.totalViolations}
          subtext="कलम ३६, ३६अ व ५०-५४"
          icon={AlertTriangle}
          badgeColor="bg-amber-50 border-amber-200"
          iconColor="text-amber-600"
          textColor="text-amber-600"
        />

        <MetricCard
          titleMr="SDO सुनावणी प्रलंबित"
          value={analytics.pendingHearings}
          subtext="उपविभाग न्यायालय"
          icon={Scale}
          badgeColor="bg-indigo-50 border-indigo-200"
          iconColor="text-indigo-600"
          textColor="text-indigo-600"
        />

        <MetricCard
          titleMr="शासन जमा क्षेत्र"
          value={`${Number(analytics.totalRepossessedHa).toFixed(2)} Ha`}
          subtext={`${analytics.totalRepossessedCases || 1} प्रकरणे नियमित/जप्त`}
          icon={ShieldCheck}
          badgeColor="bg-emerald-50 border-emerald-200"
          iconColor="text-emerald-600"
          textColor="text-emerald-600"
        />
      </div>

      {/* Violation Breakdown & Statutory Guidance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Violations by Statutory Category */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                उल्लंघन प्रकारानुसार प्रकरणे (Violations by Statutory Category)
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Maharashtra Land Revenue Code Audit Flags</p>
            </div>
            <Link
              href="/cases"
              className="text-[11px] text-blue-900 hover:text-blue-800 font-bold flex items-center gap-0.5 transition"
            >
              <span>सर्व प्रकरणे पहा</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(VIOLATION_TYPES).map(([typeKey, config]) => {
              const matched = analytics.violationsByType?.find((v) => v.type === typeKey);
              const count = matched ? matched.count : 0;

              return (
                <div
                  key={typeKey}
                  className="px-3 py-2 rounded-lg border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{config.labelMr}</p>
                    <p className="text-[10px] text-slate-400 truncate">{config.labelEn}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-black text-xs bg-white border border-slate-200 text-slate-900 shadow-2xs shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Statutory Reference Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-xl p-3 sm:p-3.5 shadow-sm flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5" />
              <span>वैधानिक मार्गदर्शक (MLRC 1966)</span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white mt-1 leading-snug">
              आदिवासी व शासकीय जमीन संरक्षण
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-normal">
              कलम ३६ व ३६अ नुसार अनुसूचित जमातीच्या जमिनीचे गैर-आदिवासी व्यक्तीस हस्तांतरण प्रतिबंधित असून, सक्षम प्राधिकारी पूर्वपरवानगीशिवाय झालेले सर्व व्यवहार रद्दबातल ठरवून जमीन मूळ आदिवासी किंवा शासनाकडे जमा करण्यात येते.
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <Link
              href="/reports"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
            >
              <span>प्रपत्र १ ते ६ अहवाल केंद्र</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
            <Link
              href="/documents"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
            >
              <span>जिल्हा अभिलेखागार शोध</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Quasi-Judicial Proceedings */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              अलिकडील अर्ध-न्यायिक सुनावणी नोंदी (Recent Hearing Proceedings)
            </h3>
          </div>
          <Link
            href="/cases"
            className="text-[11px] text-blue-900 hover:text-blue-800 font-bold flex items-center gap-0.5 transition"
          >
            <span>सर्व सुनावण्या पहा</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analytics.recentHearings?.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">कोणत्याही सुनावण्या नोंदवलेल्या नाहीत.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {analytics.recentHearings?.slice(0, 3).map((h) => (
              <div key={h.id} className="py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {h.case?.caseNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                      {h.authority}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {h.case?.parcel?.villageName} (गट {h.case?.parcel?.gatNumber})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-snug mt-0.5 line-clamp-1">{h.proceedingsLog}</p>
                </div>

                <div className="text-right shrink-0 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px]">दिनांक: {new Date(h.hearingDate).toLocaleDateString('mr-IN')}</span>
                  </div>
                  {h.nextHearingDate && (
                    <span className="text-[10px] text-amber-700 font-bold block">
                      पुढील: {new Date(h.nextHearingDate).toLocaleDateString('mr-IN')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
