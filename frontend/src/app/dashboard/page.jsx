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
  ArrowRightLeft,
  RotateCcw,
  ArrowUpRight,
  Check,
  X,
  FileText,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import DashboardKpiCard from '../../components/DashboardKpiCard';
import ChartSkeleton from '../../components/charts/ChartSkeleton';

const LandTypeDonutChart = dynamic(
  () => import('../../components/charts/LandTypeDonutChart'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[360px]" /> }
);

const EnforcementDisposalDonut = dynamic(
  () => import('../../components/charts/EnforcementDisposalDonut'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[360px]" /> }
);

const HistoricalProvenanceTrendChart = dynamic(
  () => import('../../components/charts/HistoricalProvenanceTrendChart'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[360px]" /> }
);

const TalukaMountainChart = dynamic(
  () => import('../../components/charts/TalukaMountainChart'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[400px]" /> }
);

import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import SearchableSelect from '../../components/SearchableSelect';
import { useTranslation } from '../../components/LanguageContext';

export default function DashboardPage() {
  const { isMarathi } = useTranslation();
  const [draftTaluka, setDraftTaluka] = useState('');
  const [taluka, setTaluka] = useState('');
  const [activeKpi, setActiveKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalParcels: 0,
    totalVillages: 0,
    totalViolations: 0,
    totalClass2To1Conversions: 0,
    totalClass2To1AreaHa: 0,
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
    let initialTaluka = '';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qTaluka = urlParams.get('taluka');
      const qKpi = urlParams.get('kpi');
      if (qTaluka) {
        initialTaluka = qTaluka;
        setDraftTaluka(qTaluka);
        setTaluka(qTaluka);
      }
      if (qKpi && ['parcels', 'violations', 'villages', 'conversions'].includes(qKpi)) {
        setActiveKpi(qKpi);
      }
    }
    loadData(initialTaluka);
  }, []);

  const handleApplyFilters = () => {
    setTaluka(draftTaluka);
    loadData(draftTaluka);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (draftTaluka) {
        url.searchParams.set('taluka', draftTaluka);
      } else {
        url.searchParams.delete('taluka');
      }
      window.history.replaceState({}, '', url);
    }
  };

  const handleResetFilters = () => {
    setDraftTaluka('');
    setTaluka('');
    setActiveKpi(null);
    loadData('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.delete('taluka');
      url.searchParams.delete('kpi');
      window.history.replaceState({}, '', url);
    }
  };

  const handleKpiToggle = (kpiKey) => {
    const nextKpi = activeKpi === kpiKey ? null : kpiKey;
    setActiveKpi(nextKpi);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (nextKpi) {
        url.searchParams.set('kpi', nextKpi);
      } else {
        url.searchParams.delete('kpi');
      }
      window.history.replaceState({}, '', url);
    }

    if (nextKpi) {
      setTimeout(() => {
        const el = document.getElementById('dashboard-focused-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  const talukaSelectOptions = useMemo(() => {
    const allLabel = isMarathi ? 'सर्व १५ तालुके' : 'All 15 Talukas';
    return [
      { value: '', label: allLabel },
      ...CHANDRAPUR_TALUKAS.map((t) => ({
        value: t.id,
        label: isMarathi ? `${t.nameMr} (${t.nameEn})` : `${t.nameEn} (${t.nameMr})`,
      })),
    ];
  }, [isMarathi]);

  const isFilterPending = draftTaluka !== taluka;

  // Construct target URLs preserving active taluka filter
  const parcelsUrl = `/parcels${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`;
  const casesUrl = `/cases${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`;
  const villagesReportUrl = `/reports?tab=prapatra5&prapatra=1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`;
  const conversionsUrl = `/parcels?tenureClass=BHOGVATDAR_CLASS_1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 pb-8">
      {/* ─────────────────────────────────────────────────────────────
          1. DASHBOARD COMMAND HEADER
          - Main Heading: 28-32px
          - Subtitle: 15-17px
          - Generous padding and SaaS action bar
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] text-[#252B36] rounded-2xl p-5 sm:p-6 lg:p-7 border border-[#E9E7E1] shadow-sm relative z-30 flex flex-col md:flex-row justify-between sm:items-center gap-5">
        <div className="flex items-center gap-4 relative z-10 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#4169E1] text-white flex items-center justify-center shrink-0 shadow-md">
            <Landmark className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[13px] sm:text-[14px] font-bold bg-[#F8F7F3] text-[#4169E1] px-3 py-1 rounded-full border border-[#E9E7E1]">
                {isMarathi ? "महसूल २०२६" : "Revenue 2026"}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-[30px] font-black text-[#252B36] tracking-tight leading-tight truncate">
                {isMarathi ? "जमीन अभिलेख व्यवस्थापन व महसूल चौकशी प्रणाली" : "Land Governance & Revenue Inquiries Command Center"}
              </h1>
              <span className="hidden lg:inline text-[15px] sm:text-[16px] text-[#64748B] font-semibold">
                {isMarathi ? "• चंद्रपूर जिल्हा • १५ तालुके संनियंत्रण" : "• Chandrapur District • 15 Talukas Monitoring"}
              </span>
            </div>
            <p className="text-[15px] sm:text-[16px] text-[#64748B] font-medium mt-1 leading-normal truncate">
              {isMarathi
                ? "चंद्रपूर जिल्हा • MLRC १९६६ अंतर्गत १५ तालुक्यांचे डिजिटल संनियंत्रण व महसूल विश्लेषण"
                : "Chandrapur District • 15 Talukas Statutory Land Governance under MLRC 1966"}
            </p>
          </div>
        </div>

        {/* Integrated Actions & Filter Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0 relative z-30 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-0 sm:w-[220px] sm:flex-initial">
            <SearchableSelect
              options={talukaSelectOptions}
              value={draftTaluka}
              onChange={(val) => setDraftTaluka(val || '')}
              placeholder={isMarathi ? 'सर्व तालुके' : 'All Talukas'}
              searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
              icon={Filter}
              showCount={false}
              align="right"
            />
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className={clsx(
              'h-11 sm:h-12 px-4.5 rounded-xl font-bold text-sm sm:text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer select-none',
              isFilterPending
                ? 'bg-[#4169E1] hover:bg-[#3454B4] text-white ring-2 ring-[#4169E1]/30'
                : 'bg-[#4169E1] hover:bg-[#3454B4] text-white'
            )}
            title={isMarathi ? 'फिल्टर लागू करा' : 'Apply Filter'}
          >
            <Filter className="w-4 h-4 shrink-0" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
            {isFilterPending && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            )}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-11 sm:h-12 px-4 text-[#252B36] hover:text-[#DC2626] bg-[#FFFFFF] hover:bg-[#F3F2ED] rounded-xl border border-[#E9E7E1] transition-all active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-1.5 text-sm sm:text-[15px] font-semibold"
            title={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
            aria-label={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
          >
            <RotateCcw className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>

          <button
            onClick={() => loadData(taluka, true)}
            disabled={loading}
            className="h-11 sm:h-12 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F2ED] text-[#252B36] border border-[#E9E7E1] text-sm sm:text-[15px] font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
            title={isMarathi ? 'माहिती रिफ्रेश करा' : 'Refresh Data'}
            aria-label={isMarathi ? 'माहिती रिफ्रेश करा' : 'Refresh Data'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#4169E1]' : 'text-[#64748B]'}`} />
            <span className="hidden sm:inline">{isMarathi ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>

          <Link
            href="/bulk-upload"
            className="h-11 sm:h-12 px-4.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F2ED] text-[#252B36] font-bold text-sm sm:text-[15px] transition-all active:scale-95 flex items-center gap-2 shrink-0 border border-[#E9E7E1]"
            title={isMarathi ? 'गाव डेटा अपलोड' : 'Upload Village Data'}
          >
            <UploadCloud className="w-4.5 h-4.5 text-[#4169E1]" />
            <span className="hidden sm:inline">{isMarathi ? 'गाव डेटा अपलोड' : 'Upload Village Data'}</span>
            <span className="sm:hidden">{isMarathi ? 'अपलोड' : 'Upload'}</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FOUR SOLID-COLOUR EXECUTIVE KPI CARDS (HIGHEST PRIORITY)
          - Card 1: Registered Land Records -> #4169E1 (Royal Blue)
          - Card 2: Encroachment & Pending Cases -> #F59E0B (Orange)
          - Card 3: Included Revenue Villages -> #7656D6 (Purple)
          - Card 4: Class 2 to Class 1 Conversion -> #0D9488 (Teal)
          - Typography: Numbers 40-46px, Headings 19-22px, Subtext 16-17px
          - 100% Solid CSS Background, No gradients, pure white typography
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-full min-w-0">
        <DashboardKpiCard
          variant="blue"
          titleMr="नोंदणीकृत भूखंड"
          titleEn="Registered Land"
          value={analytics.totalParcels.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext="गट क्र. • चंद्रपूर जिल्हा"
          subtextEn="Gat No. • Chandrapur District"
          icon={Landmark}
          isActive={activeKpi === 'parcels'}
          onClick={() => handleKpiToggle('parcels')}
          actionHref={parcelsUrl}
          actionTitleMr="नोंदवहीत जा (सर्व गट क्र.)"
          actionTitleEn="Open Land Register"
        />

        <DashboardKpiCard
          variant="orange"
          titleMr="शर्तभंग व चौकशी"
          titleEn="Breaches & Inquiries"
          value={analytics.totalViolations.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext="कलम ३६, कलम ५०-५४"
          subtextEn="Sec 36, Sec 50-54"
          icon={AlertTriangle}
          isActive={activeKpi === 'violations'}
          onClick={() => handleKpiToggle('violations')}
          actionHref={casesUrl}
          actionTitleMr="न्यायालयीन चौकशी कक्ष उघडा"
          actionTitleEn="Open Breaches Register"
        />

        <DashboardKpiCard
          variant="purple"
          titleMr="समाविष्ट महसूल गावे"
          titleEn="Covered Villages"
          value={analytics.totalVillages.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={
            taluka
              ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameMr || taluka} तालुका`
              : '१५ तालुके संनियंत्रण'
          }
          subtextEn={
            taluka
              ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameEn || taluka} Taluka`
              : '15 Talukas Monitored'
          }
          icon={MapPin}
          isActive={activeKpi === 'villages'}
          onClick={() => handleKpiToggle('villages')}
          actionHref={villagesReportUrl}
          actionTitleMr="गावनिहाय अहवाल व व्याप्ती पहा"
          actionTitleEn="View Village Reports"
        />

        <DashboardKpiCard
          variant="teal"
          titleMr="वर्ग २ ते वर्ग १ रूपांतर"
          titleEn="Class 2 to Class 1 Conversion"
          value={(analytics.totalClass2To1Conversions || 0).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={`${Number(analytics.totalClass2To1AreaHa || 0).toFixed(2)} Ha रूपांतरित`}
          subtextEn={`${Number(analytics.totalClass2To1AreaHa || 0).toFixed(2)} Ha Converted`}
          icon={ArrowRightLeft}
          isActive={activeKpi === 'conversions'}
          onClick={() => handleKpiToggle('conversions')}
          actionHref={conversionsUrl}
          actionTitleMr="वर्ग-१ रूपांतरित भूखंड नोंदवहीत पहा"
          actionTitleEn="View Converted Parcels"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE KPI FOCUS BANNER
          - Section Heading: 23-25px
          - Body: 15-17px
         ───────────────────────────────────────────────────────────── */}
      {activeKpi && (
        <div
          id="dashboard-focused-section"
          className="bg-[#FFFFFF] text-[#252B36] rounded-2xl p-6 sm:p-7 border border-[#E9E7E1] shadow-md transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#F8F7F3] border border-[#E9E7E1] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {activeKpi === 'parcels' && <Landmark className="w-6 h-6 text-[#4169E1]" />}
                {activeKpi === 'violations' && <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />}
                {activeKpi === 'villages' && <MapPin className="w-6 h-6 text-[#7656D6]" />}
                {activeKpi === 'conversions' && <ArrowRightLeft className="w-6 h-6 text-[#0D9488]" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#F8F7F3] text-[#252B36] border border-[#E9E7E1]">
                    {isMarathi ? 'सक्रिय फोकस दृश्य' : 'Active Focus View'}
                  </span>
                  <h2 className="text-xl sm:text-[23px] lg:text-[25px] font-bold text-[#252B36] tracking-tight truncate">
                    {activeKpi === 'parcels' && (isMarathi ? 'नोंदणीकृत भूखंड व धारणाधिकार विश्लेषण (१,५३,११३ गट)' : 'Registered Land Parcels & Tenure Analytics')}
                    {activeKpi === 'violations' && (isMarathi ? 'शर्तभंग व महसूल उल्लंघन चौकशी कक्ष (१०,४४८ प्रकरणे)' : 'Breaches & Statutory Inquiries (10,448 Cases)')}
                    {activeKpi === 'villages' && (isMarathi ? 'समाविष्ट महसूल गावे व तालुकानिहाय संनियंत्रण (८७० गावे)' : 'Covered Revenue Villages & Talukas (870 Villages)')}
                    {activeKpi === 'conversions' && (isMarathi ? 'भोगवटादार वर्ग २ ते वर्ग १ रूपांतरण विश्लेषण (१९,५२६ भूखंड)' : 'Class 2 to Class 1 Conversion Analytics')}
                  </h2>
                </div>
                <p className="text-[15px] sm:text-[16px] text-[#64748B] font-medium mt-1.5 leading-relaxed">
                  {activeKpi === 'parcels' && (isMarathi ? 'जिल्ह्यातील सर्व गट क्रमांकांचे MLRC वर्गनिहाय (वर्ग १, वर्ग २, शासकीय, वन, देवस्थान) क्षेत्र व धारणाधिकार माहिती दर्शविली आहे.' : 'Class-wise (Class-1, Class-2, Govt, Forest, Devasthan) land tenure and parcel distribution.')}
                  {activeKpi === 'violations' && (isMarathi ? 'MLRC कलम ३६, ३६अ (आदिवासी जमीन संरक्षण), कलम ५०-५४ (शासकीय जमीन अतिक्रमण) व भोगवटादार वर्ग-२ शर्तभंग चौकशी विश्लेषण.' : 'MLRC Sec 36, 36A (Tribal land protection), Sec 50-54 (Govt land encroachment) & Class-2 condition breach inquiries.')}
                  {activeKpi === 'villages' && (isMarathi ? 'चंद्रपूर जिल्ह्यातील १५ तालुक्यांमधील समाविष्ट महसूल गावांची व्याप्ती, भूखंड घनता व तपासणी अहवाल.' : 'Coverage of 870 revenue villages across 15 talukas with baseline inspection status.')}
                  {activeKpi === 'conversions' && (isMarathi ? 'MLRC तरतुदी व शासन निर्णयानुसार वर्ग-२ वरून वर्ग-१ मध्ये रूपांतरित झालेले भूखंड, क्षेत्र व महसूल अभिलेख स्थिती.' : 'Parcels, area and revenue records converted from Occupant Class-2 to Class-1 under MLRC provisions.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              <Link
                href={
                  activeKpi === 'parcels'
                    ? parcelsUrl
                    : activeKpi === 'violations'
                    ? casesUrl
                    : activeKpi === 'villages'
                    ? villagesReportUrl
                    : conversionsUrl
                }
                className="px-5 py-2.5 rounded-xl bg-[#4169E1] hover:bg-[#3454B4] text-white font-bold text-sm sm:text-base transition flex items-center gap-2 active:scale-95 cursor-pointer shadow-xs"
              >
                <span>{isMarathi ? 'सविस्तर नोंदवहीत जा' : 'Open Full Register'}</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </Link>

              <button
                type="button"
                onClick={() => setActiveKpi(null)}
                className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F2ED] text-[#252B36] font-semibold text-sm sm:text-base transition border border-[#E9E7E1] active:scale-95 flex items-center gap-2 cursor-pointer"
                title={isMarathi ? 'सर्व माहिती पूर्ववत दाखवा' : 'Show all metrics'}
              >
                <X className="w-4.5 h-4.5" />
                <span>{isMarathi ? 'सर्व दाखवा' : 'Show All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FOCUSED KPI DETAILED VIEWS
         ───────────────────────────────────────────────────────────── */}
      {/* 4.1 PARCELS VIEW */}
      {activeKpi === 'parcels' && (
        <div className="space-y-5">
          {/* Quick Tenure Filter Shortcuts */}
          <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-4 sm:p-5 flex items-center gap-3 overflow-x-auto text-sm sm:text-[15px]">
            <span className="font-bold text-[#64748B] whitespace-nowrap text-sm sm:text-[15px] flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-[#4169E1]" />
              {isMarathi ? 'थेट वर्गवारी फिल्टर:' : 'Direct Tenure Filter:'}
            </span>
            <Link
              href={parcelsUrl}
              className="px-3.5 py-2 rounded-xl bg-[#F8F7F3] hover:bg-[#E9E7E1] text-[#252B36] font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'सर्व भूखंड (1,53,113)' : 'All Parcels'}
            </Link>
            <Link
              href={`/parcels?tenureClass=BHOGVATDAR_CLASS_1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#16A34A]/10 hover:bg-[#16A34A]/20 border border-[#16A34A]/30 text-[#16A34A] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'भोगवटादार वर्ग-१ (3,31,494 Ha)' : 'Class-1 (3,31,494 Ha)'}
            </Link>
            <Link
              href={`/parcels?tenureClass=BHOGVATDAR_CLASS_2${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'भोगवटादार वर्ग-२ (62,450 Ha)' : 'Class-2 (62,450 Ha)'}
            </Link>
            <Link
              href={`/parcels?tenureClass=SARKAR_SHASAN${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#4169E1]/10 hover:bg-[#4169E1]/20 border border-[#4169E1]/30 text-[#4169E1] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'शासकीय / शासन (1,46,137 Ha)' : 'Govt / Sarkar (1,46,137 Ha)'}
            </Link>
            <Link
              href={`/parcels?tenureClass=FOREST_JANGAL${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#0D9488]/10 hover:bg-[#0D9488]/20 border border-[#0D9488]/30 text-[#0D9488] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'वन जमीन (21,177 Ha)' : 'Forest Land (21,177 Ha)'}
            </Link>
            <Link
              href={`/parcels?tenureClass=DEVASTHAN_INAM${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#7656D6]/10 hover:bg-[#7656D6]/20 border border-[#7656D6]/30 text-[#7656D6] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'देवस्थान / इनाम (13.57 Ha)' : 'Devasthan / Inam'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <LandTypeDonutChart data={analytics.tenureDistribution} />
            <HistoricalProvenanceTrendChart data={analytics.historicalTimeline} />
          </div>
        </div>
      )}

      {/* 4.2 VIOLATIONS VIEW */}
      {activeKpi === 'violations' && (
        <div className="space-y-5">
          {/* Quick Violation Type Shortcuts */}
          <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-4 sm:p-5 flex items-center gap-3 overflow-x-auto text-sm sm:text-[15px]">
            <span className="font-bold text-[#64748B] whitespace-nowrap text-sm sm:text-[15px] flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-[#F59E0B]" />
              {isMarathi ? 'उल्लंघन प्रकार फिल्टर:' : 'Violation Filter:'}
            </span>
            <Link
              href={casesUrl}
              className="px-3.5 py-2 rounded-xl bg-[#F8F7F3] hover:bg-[#E9E7E1] text-[#252B36] font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'सर्व प्रकरणे (10,448)' : 'All Cases'}
            </Link>
            <Link
              href={`/cases?violationType=SHARTBHANG${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#E85D75]/10 hover:bg-[#E85D75]/20 border border-[#E85D75]/30 text-[#E85D75] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'शर्तभंग (7,288)' : 'Breaches (7,288)'}
            </Link>
            <Link
              href={`/cases?violationType=TRIBAL_LAND_VIOLATION${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#7656D6]/10 hover:bg-[#7656D6]/20 border border-[#7656D6]/30 text-[#7656D6] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'आदिवासी जमीन संरक्षण (2,383)' : 'Tribal Land (Sec 36)'}
            </Link>
            <Link
              href={`/cases?violationType=ENCROACHMENT${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'गायरान / शासकीय अतिक्रमण (857)' : 'Govt Encroachment (857)'}
            </Link>
            <Link
              href={`/cases?isRepossessedToGovt=true${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-3.5 py-2 rounded-xl bg-[#16A34A]/10 hover:bg-[#16A34A]/20 border border-[#16A34A]/30 text-[#16A34A] font-bold whitespace-nowrap transition"
            >
              {isMarathi ? 'शासन जमा आदेश' : 'Govt Vested'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <EnforcementDisposalDonut
              violations={analytics.violationsByType}
              statuses={analytics.statusDistribution}
              totalViolations={analytics.totalViolations}
              repossessedArea={analytics.totalRepossessedHa}
            />

            {/* Statutory Overview Card */}
            <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 pb-4 border-b border-[#E9E7E1]">
                  <span className="w-10 h-10 rounded-xl bg-[#F8F7F3] border border-[#E9E7E1] text-[#252B36] flex items-center justify-center font-bold text-lg">
                    §
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#252B36]">
                      {isMarathi ? 'MLRC १९६६ अंतर्गत वैधानिक कार्यवाही' : 'Statutory Inquiries Framework'}
                    </h3>
                    <p className="text-sm text-[#64748B] font-medium">
                      {isMarathi ? 'कलम ३६, ३६अ, ५० ते ५४ अन्वये महसूल न्यायालयीन चौकशी' : 'Revenue judicial inquiries under Sections 36, 36A & 50-54'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5 text-sm sm:text-[15px] text-[#252B36] leading-relaxed">
                  <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E9E7E1]">
                    <span className="font-bold text-[#E85D75] block mb-1.5 text-base">
                      {isMarathi ? '१. कलम ३६ व ३६अ (आदिवासी जमीन संरक्षण):' : '1. Section 36 & 36A (Tribal Land Protection):'}
                    </span>
                    <span className="text-[#64748B]">
                      {isMarathi
                        ? 'विनापरवानगी गैर-आदिवासी व्यक्तीस विक्री किंवा हस्तांतरण बेकायदेशीर ठरवून जमीन मूळ खातेदार किंवा शासनाकडे जमा करण्याची तरतूद.'
                        : 'Unauthorized transfer to non-tribals is void; restored to tribal or vested in Government.'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E9E7E1]">
                    <span className="font-bold text-[#F59E0B] block mb-1.5 text-base">
                      {isMarathi ? '२. कलम ५० ते ५४ (गायरान व शासकीय भूमी अतिक्रमण):' : '2. Sections 50-54 (Govt & Gairan Encroachment):'}
                    </span>
                    <span className="text-[#64748B]">
                      {isMarathi
                        ? 'शासकीय जमिनीवरील अनधिकृत वहिवाट किंवा अतिक्रमण निष्कासित करून भूमी शासन जमा व दंड आकारणीची कार्यवाही.'
                        : 'Eviction of encroachments from government lands and vesting with penal action.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E9E7E1] flex items-center justify-between">
                <span className="text-sm text-[#64748B] font-medium">
                  {isMarathi ? 'एकूण चौकशी प्रकरणे:' : 'Total Active Cases:'}{' '}
                  <strong className="text-[#252B36] font-mono text-base sm:text-lg">{analytics.totalViolations}</strong>
                </span>
                <Link
                  href={casesUrl}
                  className="px-4.5 py-2.5 rounded-xl bg-[#4169E1] hover:bg-[#3454B4] text-white font-bold text-sm sm:text-base transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>{isMarathi ? 'न्यायालयीन कक्ष उघडा' : 'Open Cases Chamber'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.3 VILLAGES VIEW */}
      {activeKpi === 'villages' && (
        <div className="space-y-5">
          <TalukaMountainChart
            data={analytics.talukaDistribution}
            selectedTaluka={taluka}
          />

          {/* 15 Talukas Quick Access Grid */}
          <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9E7E1] mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#7656D6]" />
                <h3 className="text-base sm:text-lg font-bold text-[#252B36]">
                  {isMarathi ? 'चंद्रपूर जिल्ह्यातील १५ तालुके व महसूल गावे' : '15 Talukas & Revenue Villages of Chandrapur'}
                </h3>
              </div>
              <Link
                href={villagesReportUrl}
                className="text-sm sm:text-base font-bold text-[#4169E1] hover:underline flex items-center gap-1.5"
              >
                <span>{isMarathi ? 'प्रपत्र १ अहवाल पहा' : 'View Prapatra 1 Report'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CHANDRAPUR_TALUKAS.map((t) => {
                const talukaData = (analytics.talukaDistribution || []).find(
                  (item) => (item.taluka || '').toLowerCase() === t.id.toLowerCase()
                );
                const isCurrent = (taluka || '').toLowerCase() === t.id.toLowerCase();
                return (
                  <Link
                    key={t.id}
                    href={`/parcels?taluka=${encodeURIComponent(t.id)}`}
                    className={clsx(
                      'p-3.5 rounded-xl border text-left transition-all active:scale-95 group',
                      isCurrent
                        ? 'bg-[#F8F7F3] border-[#7656D6] shadow-sm'
                        : 'bg-[#FFFFFF] hover:bg-[#F3F2ED] border-[#E9E7E1]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-[15px] font-bold text-[#252B36] group-hover:text-[#7656D6]">
                        {isMarathi ? t.nameMr : t.nameEn}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#7656D6]" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between text-xs sm:text-sm text-[#64748B] font-mono">
                      <span>{talukaData?.parcelCount ? `${talukaData.parcelCount.toLocaleString()} गट` : '–'}</span>
                      {talukaData?.violationCount > 0 && (
                        <span className="text-[#E85D75] font-bold text-xs">
                          {talukaData.violationCount} वाद
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4.4 CONVERSIONS VIEW */}
      {activeKpi === 'conversions' && (
        <div className="space-y-5">
          {/* Conversion Spotlight Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-5 bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl shadow-sm">
              <span className="text-sm font-semibold text-[#64748B] block">
                {isMarathi ? 'एकूण रूपांतरित भूखंड' : 'Total Converted Parcels'}
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#16A34A] font-mono mt-2">
                {(analytics.totalClass2To1Conversions || 19526).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </p>
              <span className="text-xs sm:text-sm text-[#16A34A] font-bold mt-1 block">
                {isMarathi ? 'वर्ग-२ वरून वर्ग-१ रूपांतरण' : 'Class-2 to Class-1'}
              </span>
            </div>

            <div className="p-5 bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl shadow-sm">
              <span className="text-sm font-semibold text-[#64748B] block">
                {isMarathi ? 'रूपांतरित क्षेत्र (हे.)' : 'Converted Area (Ha)'}
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#16A34A] font-mono mt-2">
                {Number(analytics.totalClass2To1AreaHa || 40479.32).toFixed(2)}
              </p>
              <span className="text-xs sm:text-sm text-[#16A34A] font-bold mt-1 block">
                {isMarathi ? 'हेक्टर रूपांतरित' : 'Hectares Converted'}
              </span>
            </div>

            <div className="p-5 bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl shadow-sm">
              <span className="text-sm font-semibold text-[#64748B] block">
                {isMarathi ? 'उर्वरित वर्ग-२ क्षेत्र' : 'Remaining Class-2 Area'}
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#F59E0B] font-mono mt-2">
                62,450.17
              </p>
              <span className="text-xs sm:text-sm text-[#F59E0B] font-bold mt-1 block">
                {isMarathi ? 'हेक्टर (११.१% जिल्हा क्षेत्र)' : 'Ha (11.1% district area)'}
              </span>
            </div>

            <div className="p-5 bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl shadow-sm">
              <span className="text-sm font-semibold text-[#64748B] block">
                {isMarathi ? 'एकूण वर्ग-१ क्षेत्र' : 'Total Class-1 Area'}
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#4169E1] font-mono mt-2">
                3,31,494.45
              </p>
              <span className="text-xs sm:text-sm text-[#4169E1] font-bold mt-1 block">
                {isMarathi ? 'हेक्टर (५९.१% जिल्हा क्षेत्र)' : 'Ha (59.1% district area)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <LandTypeDonutChart data={analytics.tenureDistribution} />

            {/* Conversion Details Card */}
            <div className="bg-[#FFFFFF] border border-[#E9E7E1] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 pb-4 border-b border-[#E9E7E1]">
                  <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 border border-[#0D9488]/20 text-[#0D9488] flex items-center justify-center font-bold">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#252B36]">
                      {isMarathi ? 'वर्ग-२ ते वर्ग-१ रूपांतरण वैधानिक पार्श्वभूमी' : 'Class-2 to Class-1 Conversion Regulations'}
                    </h3>
                    <p className="text-sm text-[#64748B] font-medium">
                      {isMarathi ? 'महाराष्ट्र जमीन महसूल संहिता व शासन निर्णय अन्वये' : 'Per Maharashtra Land Revenue Code & Govt Resolutions'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5 text-sm sm:text-[15px] text-[#252B36] leading-relaxed">
                  <p className="text-[#64748B]">
                    {isMarathi
                      ? 'भोगवटादार वर्ग-२ (मर्यादित मालकी हक्क) च्या जमिनीचे शासनाने वेळोवेळी जारी केलेल्या शासन निर्णयानुसार (नजराणा / अधिमूल्य भरणा किंवा मुदतीअंती) वर्ग-१ (बिनशर्त मालकी हक्क) मध्ये रूपांतरण करण्यात येते.'
                      : 'Occupant Class-2 lands (restricted tenure) are converted to Class-1 (freehold tenure) upon payment of nazarana/premium or completion of statutory grant periods per state government orders.'}
                  </p>
                  <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E9E7E1] text-[#252B36] font-medium text-sm">
                    {isMarathi
                      ? 'सध्या चंद्रपूर जिल्ह्यात एकूण १९,५२६ भूखंड (४०,४७९.३२ हे.) वर्ग-१ मध्ये रूपांतरित नोंद झाले आहेत. या नोंदींची प्रपत्र २ नुसार नियमित पडताळणी करण्यात येते.'
                      : 'Currently, 19,526 parcels (40,479.32 Ha) are recorded as converted to Class-1 in Chandrapur. These are routinely verified under Prapatra 2.'}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E9E7E1] flex items-center justify-between gap-3 flex-wrap">
                <Link
                  href={conversionsUrl}
                  className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0B756C] text-white font-bold text-sm sm:text-base transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>{isMarathi ? 'रूपांतरित भूखंड नोंदवहीत पहा' : 'View in Land Register'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/reports?tab=prapatra5&prapatra=2${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
                  className="px-4.5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F2ED] text-[#252B36] font-semibold text-sm sm:text-base transition border border-[#E9E7E1] flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4.5 h-4.5 text-[#64748B]" />
                  <span>{isMarathi ? 'प्रपत्र २ अहवाल' : 'Prapatra 2 Report'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. DEFAULT ANALYTICS GRIDS: BALANCED 2-COLUMN LAYOUT
          - Graph Titles: 22-24px
          - Prominent, visible graphs
         ───────────────────────────────────────────────────────────── */}
      {activeKpi === null && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LandTypeDonutChart data={analytics.tenureDistribution} />
            <EnforcementDisposalDonut
              violations={analytics.violationsByType}
              statuses={analytics.statusDistribution}
              totalViolations={analytics.totalViolations}
              repossessedArea={analytics.totalRepossessedHa}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HistoricalProvenanceTrendChart data={analytics.historicalTimeline} />
            <TalukaMountainChart
              data={analytics.talukaDistribution}
              selectedTaluka={taluka}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. STATUTORY GUIDANCE BANNER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] text-[#252B36] rounded-2xl p-6 sm:p-7 border border-[#E9E7E1] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F8F7F3] text-[#4169E1] border border-[#E9E7E1]">
              {isMarathi ? "वैधानिक मार्गदर्शक (MLRC १९६६)" : "Statutory Guidance (MLRC 1966)"}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#252B36] tracking-tight">
            {isMarathi ? "आदिवासी व शासकीय जमीन संरक्षण (कलम ३६, ३६अ व ५०-५४)" : "Tribal & Govt Land Protection (Sec 36, 36A & 50-54)"}
          </h3>
          <p className="text-sm sm:text-[15px] text-[#64748B] leading-relaxed font-normal">
            {isMarathi
              ? "कलम ३६ व ३६अ नुसार अनुसूचित जमातीच्या जमिनीचे विनापरवानगी गैर-आदिवासी व्यक्तीस हस्तांतरण प्रतिबंधित असून, सक्षम प्राधिकारी पूर्वपरवानगी नसलेले व्यवहार रद्दबातल ठरवून जमीन मूळ आदिवासी किंवा शासनाकडे जमा करण्यात येते."
              : "Under MLRC Sections 36 & 36A, alienation of tribal land to non-tribals without prior sanction of the Collector is void; illegal transfers are rescinded and land is restored to the tribal or vested in Government."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F3F2ED] text-sm sm:text-base font-bold text-[#252B36] transition border border-[#E9E7E1] shadow-xs cursor-pointer"
          >
            <span>{isMarathi ? "प्रपत्र १ ते ६ अहवाल" : "Prapatra 1-6 Reports"}</span>
            <ChevronRight className="w-4.5 h-4.5 text-[#64748B]" />
          </Link>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#4169E1] hover:bg-[#3454B4] text-white text-sm sm:text-base font-bold transition shadow-xs cursor-pointer"
          >
            <span>{isMarathi ? "जिल्हा अभिलेखागार" : "District Archives"}</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
