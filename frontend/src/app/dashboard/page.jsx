'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  UploadCloud,
  Scale,
  ShieldCheck,
  AlertTriangle,
  FolderArchive,
  ChevronRight,
  RefreshCw,
  Landmark,
  FileText,
  Calendar,
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

  const loadData = async (selectedTaluka = taluka) => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsSummary(selectedTaluka);
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
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
              महसूल प्रशासन २०२६
            </span>
            <span className="text-xs text-slate-500 font-medium">चंद्रपूर जिल्हा (महाराष्ट्र)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            जमीन अभिलेख व्यवस्थापन व महसूल चौकशी प्रणाली
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            MLRC 1966 Statutory Land Intelligence, Tribal Land Safeguard & Enforcement Platform
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>प्रपत्र-३ डाऊनलोड (Export Excel)</span>
          </button>
          <Link
            href="/bulk-upload"
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>गाव डेटा अपलोड</span>
          </Link>
        </div>
      </div>

      {/* Filter & Taluka Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            तालुका निवडा (Select Taluka):
          </label>
          <select
            value={taluka}
            onChange={(e) => setTaluka(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सर्व तालुके (All Talukas - District Level)</option>
            {CHANDRAPUR_TALUKAS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn} ({t.nameMr})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => loadData(taluka)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-900 font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश (Reload)</span>
        </button>
      </div>

      {/* Key Analytical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          titleMr="एकूण नोंदणीकृत भूखंड"
          titleEn="Master Land Parcels"
          value={analytics.totalParcels}
          subtext="चंद्रपूर महसूल अभिलेख"
          icon={Landmark}
          badgeColor="bg-blue-50 border-blue-200"
          iconColor="text-blue-700"
          textColor="text-slate-900"
        />

        <MetricCard
          titleMr="शर्तभंग व चौकशी प्रकरणे"
          titleEn="Active Violations & Disputes"
          value={analytics.totalViolations}
          subtext="कलम ३६, ३६अ व ५०-५४"
          icon={AlertTriangle}
          badgeColor="bg-amber-50 border-amber-200"
          iconColor="text-amber-600"
          textColor="text-amber-600"
        />

        <MetricCard
          titleMr="SDO सुनावणी प्रलंबित"
          titleEn="Hearings Scheduled"
          value={analytics.pendingHearings}
          subtext="उपविभागीय अधिकारी न्यायालय"
          icon={Scale}
          badgeColor="bg-indigo-50 border-indigo-200"
          iconColor="text-indigo-600"
          textColor="text-indigo-600"
        />

        <MetricCard
          titleMr="शासन जमा क्षेत्र"
          titleEn="Total Repossessed to Govt"
          value={`${Number(analytics.totalRepossessedHa).toFixed(2)} Ha`}
          subtext={`${analytics.totalRepossessedCases || 1} प्रकरणे नियमित/जप्त`}
          icon={ShieldCheck}
          badgeColor="bg-emerald-50 border-emerald-200"
          iconColor="text-emerald-600"
          textColor="text-emerald-600"
        />
      </div>

      {/* Violation Breakdown & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Violations by Category */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                उल्लंघन प्रकारानुसार प्रकरणे (Violations by Statutory Category)
              </h3>
              <p className="text-xs text-slate-500">Maharashtra Land Revenue Code Audit Flags</p>
            </div>
            <Link
              href="/cases"
              className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>सर्व प्रकरणे पहा</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(VIOLATION_TYPES).map(([typeKey, config]) => {
              const matched = analytics.violationsByType?.find((v) => v.type === typeKey);
              const count = matched ? matched.count : 0;

              return (
                <div
                  key={typeKey}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{config.labelMr}</p>
                    <p className="text-[11px] text-slate-500 truncate">{config.labelEn}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg font-black text-xs bg-white border border-slate-200 text-slate-900 shadow-2xs">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Statutory Reference Card */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Landmark className="w-4 h-4" />
              <span>वैधानिक मार्गदर्शक (MLRC 1966)</span>
            </div>
            <h3 className="text-base font-bold text-white mt-2">
              आदिवासी व शासकीय जमीन संरक्षण
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              कलम ३६ व ३६अ नुसार अनुसूचित जमातींच्या जमिनीचे गैर-आदिवासी व्यक्तीस हस्तांतरण प्रतिबंधित असून, सक्षम प्राधिकारी पूर्वपरवानगीशिवाय झालेले सर्व व्यवहार रद्दबातल ठरवून जमीन मूळ आदिवासी किंवा शासनाकडे जमा करण्यात येते.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <Link
              href="/reports"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
            >
              <span>प्रपत्र १ ते ६ अहवाल केंद्र</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
            <Link
              href="/documents"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
            >
              <span>अभिलेखागार रॅक व फाईल शोध</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Quasi-Judicial Proceedings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              अलिकडील अर्ध-न्यायिक सुनावणी नोंदी (Recent SDO / Collector Proceedings)
            </h3>
            <p className="text-xs text-slate-500">Live Quasi-Judicial Court Logs</p>
          </div>
          <Link
            href="/cases"
            className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>सर्व सुनावण्या पहा</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analytics.recentHearings?.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">कोणत्याही सुनावण्या नोंदवलेल्या नाहीत.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {analytics.recentHearings?.map((h) => (
              <div key={h.id} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {h.case?.caseNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      {h.authority}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {h.case?.parcel?.villageName} (गट {h.case?.parcel?.gatNumber})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{h.proceedingsLog}</p>
                </div>

                <div className="text-right flex-shrink-0 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>दिनांक: {new Date(h.hearingDate).toLocaleDateString('mr-IN')}</span>
                  </div>
                  {h.nextHearingDate && (
                    <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
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
