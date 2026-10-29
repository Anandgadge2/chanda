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
  Filter,
  Layers,
  MapPin,
} from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import LandTypeDonutChart from '../../components/charts/LandTypeDonutChart';
import EnforcementDisposalDonut from '../../components/charts/EnforcementDisposalDonut';
import HistoricalProvenanceTrendChart from '../../components/charts/HistoricalProvenanceTrendChart';
import TalukaMountainChart from '../../components/charts/TalukaMountainChart';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import SearchableSelect from '../../components/SearchableSelect';
import { useTranslation } from '../../components/LanguageContext';

export default function DashboardPage() {
  const { isMarathi } = useTranslation();
  const [taluka, setTaluka] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalParcels: 0,
    totalVillages: 0,
    totalViolations: 0,
    pendingHearings: 0,
    totalRepossessedHa: 0,
    totalRepossessedCases: 0,
    inProgressCases: 0,
    inProgressAreaHa: 0,
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
    { value: '', label: isMarathi ? 'सर्व तालुके (१५)' : 'All Talukas (15)' },
    ...CHANDRAPUR_TALUKAS.map((t) => ({
      value: t.id,
      label: isMarathi ? t.nameMr : t.nameEn
    }))
  ], [isMarathi]);

  const handleExport = () => {
    window.location.href = api.getPrapatra3DownloadUrl(taluka);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0">
      {/* Modern Executive Command Header - Pro Compact */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-blue-200/80 relative z-30 flex flex-col md:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2.5 relative z-10 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                {isMarathi ? "महसूल २०२६" : "Revenue 2026"}
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                {isMarathi ? "जमीन अभिलेख व्यवस्थापन व महसूल चौकशी प्रणाली" : "Land Governance & Revenue Inquiries Command Center"}
              </h1>
              <span className="hidden lg:inline text-[11px] text-slate-500 font-medium">
                {isMarathi ? "• चंद्रपूर जिल्हा • १५ तालुके संनियंत्रण" : "• Chandrapur District • 15 Talukas Monitoring"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 lg:hidden truncate font-medium">
              {isMarathi ? "चंद्रपूर जिल्हा • MLRC १९६६ अंतर्गत १५ तालुक्यांचे संनियंत्रण" : "Chandrapur District • 15 Talukas under MLRC 1966"}
            </p>
          </div>
        </div>

        {/* Integrated Actions & Filter - Single Unified Row on Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-30 w-full md:w-auto">
          <div className="flex-1 min-w-0 sm:w-[185px] sm:flex-initial">
            <SearchableSelect
              options={talukaSelectOptions}
              value={taluka}
              onChange={(val) => setTaluka(val)}
              placeholder={isMarathi ? 'सर्व तालुके' : 'All Talukas'}
              searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
              icon={Filter}
              showCount={false}
              align="right"
            />
          </div>

          <button
            onClick={() => loadData(taluka, true)}
            disabled={loading}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-300 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
            title={isMarathi ? 'माहिती रिफ्रेश करा' : 'Refresh Data'}
            aria-label={isMarathi ? 'माहिती रिफ्रेश करा' : 'Refresh Data'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-700'}`} />
            <span className="hidden sm:inline">{isMarathi ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>

          <Link
            href="/bulk-upload"
            className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 border border-amber-400"
            title={isMarathi ? 'गाव डेटा अपलोड' : 'Upload Village Data'}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMarathi ? 'गाव डेटा अपलोड' : 'Upload Village Data'}</span>
            <span className="sm:hidden">{isMarathi ? 'अपलोड' : 'Upload'}</span>
          </Link>
        </div>
      </div>

      {/* Compact Analytical Metric Cards (2-col mobile, 4-col desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 w-full max-w-full min-w-0">
        <MetricCard
          titleMr="नोंदणीकृत भूखंड"
          titleEn="Registered Land"
          value={analytics.totalParcels}
          subtext="गट क्र. • चंद्रपूर"
          subtextEn="Gat No. • Chandrapur"
          icon={Landmark}
          badgeColor="bg-blue-50 border-blue-200"
          iconColor="text-blue-700"
          textColor="text-slate-900"
        />

        <MetricCard
          titleMr="शर्तभंग व चौकशी"
          titleEn="Breaches & Inquiries"
          value={analytics.totalViolations}
          subtext="कलम ३६, ५०-५४"
          subtextEn="Sec 36, 50-54"
          icon={AlertTriangle}
          badgeColor="bg-amber-50 border-amber-200"
          iconColor="text-amber-600"
          textColor="text-amber-600"
        />

        <MetricCard
          titleMr="समाविष्ट महसूल गावे"
          titleEn="Covered Villages"
          value={analytics.totalVillages}
          subtext={
            taluka
              ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameMr || taluka} तालुका`
              : '१५ तालुके'
          }
          subtextEn={
            taluka
              ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameEn || taluka} Taluka`
              : '15 Talukas'
          }
          icon={MapPin}
          badgeColor="bg-indigo-50 border-indigo-200"
          iconColor="text-indigo-600"
          textColor="text-indigo-600"
        />

        <MetricCard
          titleMr="शासन जमा कार्यवाही (प्रक्रियेत)"
          titleEn="Govt Vesting in Progress"
          value={(analytics.inProgressCases ?? (analytics.totalViolations - (analytics.totalRepossessedCases || 0)) ?? 0).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={`${Number(analytics.totalRepossessedCases || 0).toLocaleString('mr-IN')} पूर्ण (${Number(analytics.totalRepossessedHa || 0).toFixed(2)} Ha शासन जमा)`}
          subtextEn={`${Number(analytics.totalRepossessedCases || 0)} Completed (${Number(analytics.totalRepossessedHa || 0).toFixed(2)} Ha Vested)`}
          icon={ShieldCheck}
          badgeColor="bg-emerald-50 border-emerald-200"
          iconColor="text-emerald-600"
          textColor="text-emerald-600"
        />
      </div>

      {/* Official Chandrapur District Interactive Cadastral GIS Map */}
      {/* <ChandrapurGisMap
        selectedTaluka={taluka}
        onSelectTaluka={(newTaluka) => setTaluka(newTaluka)}
        analyticsData={analytics.talukaDistribution}
      /> */}

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

     

      

      {/* Statutory Guidance Banner - Sleek & Minimalist */}
      <div className="bg-gradient-to-r from-[#17203d] via-[#1a2550] to-[#17203d] text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25">
              {isMarathi ? "वैधानिक मार्गदर्शक (MLRC १९६६)" : "Statutory Guidance (MLRC 1966)"}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            {isMarathi ? "आदिवासी व शासकीय जमीन संरक्षण (कलम ३६, ३६अ व ५०-५४)" : "Tribal & Govt Land Protection (Sec 36, 36A & 50-54)"}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {isMarathi
              ? "कलम ३६ व ३६अ नुसार अनुसूचित जमातीच्या जमिनीचे विनापरवानगी गैर-आदिवासी व्यक्तीस हस्तांतरण प्रतिबंधित असून, सक्षम प्राधिकारी पूर्वपरवानगी नसलेले व्यवहार रद्दबातल ठरवून जमीन मूळ आदिवासी किंवा शासनाकडे जमा करण्यात येते."
              : "Under MLRC Sections 36 & 36A, alienation of tribal land to non-tribals without prior sanction of the Collector is void; illegal transfers are rescinded and land is restored to the tribal or vested in Government."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition border border-white/10 shadow-2xs"
          >
            <span>{isMarathi ? "प्रपत्र १ ते ६ अहवाल" : "Prapatra 1-6 Reports"}</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-2xs"
          >
            <span>{isMarathi ? "जिल्हा अभिलेखागार" : "District Archives"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
