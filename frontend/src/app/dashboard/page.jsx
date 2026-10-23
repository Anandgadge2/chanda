'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Layers,
  MapPin,
} from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import LandTypeDonutChart from '../../components/charts/LandTypeDonutChart';
import EnforcementDisposalDonut from '../../components/charts/EnforcementDisposalDonut';
import HistoricalProvenanceTrendChart from '../../components/charts/HistoricalProvenanceTrendChart';
import TalukaMountainChart from '../../components/charts/TalukaMountainChart';
import GatSurveyVisualizer from '../../components/charts/GatSurveyVisualizer';
import ShartbhangAnalyticsChart from '../../components/charts/ShartbhangAnalyticsChart';
import ChandrapurGisMap from '../../components/ChandrapurGisMap';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import SearchableSelect from '../../components/SearchableSelect';

export default function DashboardPage() {
  const [taluka, setTaluka] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalParcels: 0,
    totalVillages: 0,
    totalViolations: 0,
    pendingHearings: 0,
    totalRepossessedHa: 0,
    totalRepossessedCases: 0,
    violationsByType: [],
    tenureDistribution: [],
    talukaDistribution: [],
    statusDistribution: [],
    totalPotkharabaHa: 0,
    totalCultivableHa: 0,
    topGatParcels: [],
    historicalTimeline: [],
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

  const talukaSelectOptions = useMemo(() => [
    { value: '', label: 'सर्व तालुके (All 15)' },
    ...CHANDRAPUR_TALUKAS.map((t) => ({
      value: t.id,
      label: `${t.nameMr} (${t.nameEn})`
    }))
  ], []);

  const handleExport = () => {
    window.location.href = api.getPrapatra3DownloadUrl(taluka);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Streamlined Compact Executive Command & Filter Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 shrink-0">
            महसूल २०२६
          </span>
          <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 leading-none">
            जमीन अभिलेख व्यवस्थापन व महसूल चौकशी प्रणाली
          </h1>
          <span className="text-xs text-slate-500 font-semibold hidden xl:inline shrink-0">
            • चंद्रपूर (MLRC १९६६)
          </span>
        </div>

        {/* Compact Integrated Actions & Filter */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-[180px] sm:w-[210px]">
            <SearchableSelect
              options={talukaSelectOptions}
              value={taluka}
              onChange={(val) => setTaluka(val)}
              placeholder="सर्व तालुके"
              searchPlaceholder="तालुका शोधा..."
              icon={Filter}
              showCount={false}
              align="right"
            />
          </div>

          <button
            onClick={() => loadData(taluka, true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 hover:text-blue-950 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer shrink-0"
            title="माहिती रिफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-900' : ''}`} />
            <span className="hidden md:inline">रिफ्रेश</span>
          </button>

          <Link
            href="/bulk-upload"
            className="inline-flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-2xs transition active:scale-95 shrink-0"
            title="गाव एक्सेल डेटा अपलोड"
          >
            <UploadCloud className="w-4 h-4" />
            <span>गाव डेटा अपलोड</span>
          </Link>
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
          titleMr="समाविष्ट महसूल गावे"
          value={analytics.totalVillages}
          subtext={
            taluka
              ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameMr || taluka} तालुका`
              : '१५ तालुके कार्यक्षेत्र'
          }
          icon={MapPin}
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

      {/* Official Chandrapur District Interactive Cadastral GIS Map */}
      <ChandrapurGisMap
        selectedTaluka={taluka}
        onSelectTaluka={(newTaluka) => setTaluka(newTaluka)}
        analyticsData={analytics.talukaDistribution}
      />

      {/* Visual Analytics Row 1: Dual Donut Cards with Side Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        <LandTypeDonutChart data={analytics.tenureDistribution} />
        <EnforcementDisposalDonut
          violations={analytics.violationsByType}
          statuses={analytics.statusDistribution}
          totalViolations={analytics.totalViolations}
          repossessedArea={analytics.totalRepossessedHa}
        />
      </div>

      {/* Visual Analytics Row 2: 1950 Provenance Trend & Taluka Mountain/Bar Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        <HistoricalProvenanceTrendChart data={analytics.historicalTimeline} />
        <TalukaMountainChart
          data={analytics.talukaDistribution}
          selectedTaluka={taluka}
        />
      </div>

      {/* Visual Analytics Row 3: Land Usability & Quasi-Judicial Analytics (Strictly Visual Graphs & Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        <GatSurveyVisualizer
          parcels={analytics.topGatParcels}
          totalPotkharabaHa={analytics.totalPotkharabaHa}
          totalCultivableHa={analytics.totalCultivableHa}
        />
        <ShartbhangAnalyticsChart
          violations={analytics.violationsByType}
          statuses={analytics.statusDistribution}
        />
      </div>

      {/* Primary Revenue Modules Redirection Gateway (Replaces Data Table with Direct Portals) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 px-1">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-900" />
              <span>महसूल मुख्य विभाग नेव्हिगेशन केंद्र (Primary Revenue Modules)</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              डॅशबोर्डवर केवळ आलेख व नकाशा विश्लेषण उपलब्ध असून, सविस्तर नोंदवही, अभिलेख व प्रकरणांसाठी खालील मुख्य विभागांचा वापर करा:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Card 1: Parcels Portal */}
          <div className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {analytics.totalParcels} भूखंड नोंद
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition flex items-center gap-1">
                  <span>गट व सर्व्हे क्रमांक नोंदवही (Parcels)</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                  संपूर्ण गट व सर्व्हे क्रमांक महसूल अभिलेख सारणी, जुना-नवा स.नं. ताळमेळ, ७/१२ क्षेत्र, पोटखराबा व ३६०° फेरफार इतिहास.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <Link
                  href="/parcels?tenure=BHOGVATDAR_CLASS_2"
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  वर्ग-२ भूखंड
                </Link>
                <Link
                  href="/parcels?tenure=SARKAR_SHASAN"
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  शासकीय जमीन
                </Link>
                <Link
                  href="/parcels?hasActiveDispute=true"
                  className="text-[10px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold transition"
                >
                  शर्तभंग नोंद
                </Link>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100">
              <Link
                href="/parcels"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-2xs transition active:scale-98"
              >
                <span>भूखंड नोंदवहीत जा (Go to Parcels)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Cases Portal */}
          <div className="bg-white border border-slate-200/90 hover:border-amber-400 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {analytics.totalViolations} चौकशी
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition flex items-center gap-1">
                  <span>महसूल व अर्ध-न्यायिक प्रकरणे (Cases)</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                  कलम ३६, ३६अ व ५०-५४ शर्तभंग चौकशी, SDO व तहसीलदार सुनावणी नोंदी, स्थळ पंचनामे, नोटीस व शासन जमा हुकूमनामे.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <Link
                  href="/cases"
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  SDO सुनावण्या
                </Link>
                <Link
                  href="/cases"
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  तहसीलदार चौकशी
                </Link>
                <Link
                  href="/cases"
                  className="text-[10px] px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold transition"
                >
                  शासन जमा आदेश
                </Link>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100">
              <Link
                href="/cases"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-2xs transition active:scale-98"
              >
                <span>न्यायालयीन प्रकरणांत जा (Go to Cases)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Reports Portal */}
          <div className="bg-white border border-slate-200/90 hover:border-emerald-400 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  प्रपत्र १ ते ६
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition flex items-center gap-1">
                  <span>वैधानिक अहवाल व सांख्यिकी (Reports)</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                  प्रपत्र १ ते ६ वैधानिक विवरणपत्रे, तालुकावार विल्हेवाट ताळेबंद, आदिवासी संरक्षण अहवाल व एक्सेल/पीडीएफ डाऊनलोड.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <Link
                  href="/reports"
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  प्रपत्र १ (आदिवासी)
                </Link>
                <Link
                  href="/reports"
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition"
                >
                  प्रपत्र २ (शर्तभंग)
                </Link>
                <button
                  type="button"
                  onClick={handleExport}
                  className="text-[10px] px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded font-semibold transition cursor-pointer"
                  title="प्रपत्र ३ एक्सेल डाऊनलोड करा"
                >
                  प्रपत्र ३ डाऊनलोड ⤓
                </button>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100">
              <Link
                href="/reports"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-2xs transition active:scale-98"
              >
                <span>अहवाल केंद्रात जा (Go to Reports)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Guidance & Quick Links Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
        {/* Quick Statutory Reference Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-xl p-3 sm:p-3.5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="max-w-2xl">
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5" />
              <span>वैधानिक मार्गदर्शक (MLRC १९६६)</span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white mt-1 leading-snug">
              आदिवासी व शासकीय जमीन संरक्षण (कलम ३६, ३६अ व ५०-५४)
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-normal">
              कलम ३६ व ३६अ नुसार अनुसूचित जमातीच्या जमिनीचे गैर-आदिवासी व्यक्तीस हस्तांतरण प्रतिबंधित असून, सक्षम प्राधिकारी पूर्वपरवानगीशिवाय झालेले सर्व व्यवहार रद्दबातल ठरवून जमीन मूळ आदिवासी किंवा शासनाकडे जमा करण्यात येते.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              href="/reports"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition border border-white/10"
            >
              <span>प्रपत्र १ ते ६ अहवाल केंद्र</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
            <Link
              href="/documents"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition border border-white/10"
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
              अलिकडील अर्ध-न्यायिक सुनावणी नोंदी
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
