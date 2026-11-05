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
  History,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import MetricCard from '../../components/MetricCard';
import ChartSkeleton from '../../components/charts/ChartSkeleton';

// Visibly distinct, information-rich enterprise visualizations
const TenureSpectrumBar = dynamic(
  () => import('../../components/charts/TenureSpectrumBar'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[340px]" /> }
);

const EnforcementPipelineMatrix = dynamic(
  () => import('../../components/charts/EnforcementPipelineMatrix'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[340px]" /> }
);

const HistoricalProvenanceTrendChart = dynamic(
  () => import('../../components/charts/HistoricalProvenanceTrendChart'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[340px]" /> }
);

const TalukaMountainChart = dynamic(
  () => import('../../components/charts/TalukaMountainChart'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[340px]" /> }
);

const TalukaRankedTable = dynamic(
  () => import('../../components/charts/TalukaRankedTable'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[340px]" /> }
);

const HistoricalEpochComparison = dynamic(
  () => import('../../components/charts/HistoricalEpochComparison'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[340px]" /> }
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

  // Selected taluka scope name
  const selectedTalukaScope = useMemo(() => {
    if (!taluka) return isMarathi ? 'चंद्रपूर जिल्हा (१५ तालुके)' : 'Chandrapur District (15 Talukas)';
    const found = CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase());
    return isMarathi ? (found ? `${found.nameMr} तालुका` : taluka) : (found ? `${found.nameEn} Taluka` : taluka);
  }, [taluka, isMarathi]);

  // Construct target URLs preserving active taluka filter
  const parcelsUrl = `/parcels${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`;
  const casesUrl = `/cases${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`;
  const villagesReportUrl = `/reports?tab=prapatra5&prapatra=1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`;
  const conversionsUrl = `/parcels?tenureClass=BHOGVATDAR_CLASS_1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`;

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE COMMAND RIBBON - Luminous Enterprise White Toolbar
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white text-slate-900 rounded-2xl px-5 py-4 sm:px-6 sm:py-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/90 flex flex-col md:flex-row justify-between md:items-center gap-4 font-sans">
        {/* Title & Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Landmark className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[21px] font-bold text-[#0F172A] tracking-tight leading-[1.5]">
                {isMarathi ? 'महसूल संनियंत्रण केंद्र' : 'Revenue Intelligence Command Center'}
              </h1>
              <span className="text-[13.5px] font-bold px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0 leading-[1.5]">
                {selectedTalukaScope}
              </span>
            </div>
            <p className="text-[14px] text-[#334155] font-medium leading-[1.5] mt-0.5">
              {isMarathi ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर • जमीन अभिलेख व वैधानिक संनियंत्रण' : 'Collectorate, Chandrapur • Land Records & Statutory Monitoring'}
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap w-full md:w-auto">
          {/* Taluka Selector */}
          <div className="flex-1 min-w-[150px] sm:w-[200px] sm:flex-initial">
            <SearchableSelect
              options={talukaSelectOptions}
              value={draftTaluka}
              onChange={(val) => setDraftTaluka(val || '')}
              placeholder={isMarathi ? 'तालुका निवडा' : 'Select Taluka'}
              searchPlaceholder={isMarathi ? 'शोधा...' : 'Search...'}
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
              'h-10 min-h-[40px] px-4 rounded-xl font-semibold text-[14.5px] leading-[1.5] flex items-center justify-center gap-2 transition active:scale-95 shrink-0 cursor-pointer shadow-xs',
              isFilterPending
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
            title={isMarathi ? 'फिल्टर लागू करा' : 'Apply'}
          >
            <Filter className="w-4 h-4" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-10 min-h-[40px] px-3.5 text-[#334155] hover:text-[#0F172A] bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-[14.5px] font-semibold leading-[1.5] transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title={isMarathi ? 'रीसेट' : 'Reset'}
            aria-label={isMarathi ? 'रीसेट' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => loadData(taluka, true)}
            disabled={loading}
            className="h-10 min-h-[40px] px-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#334155] hover:text-[#0F172A] border border-slate-200 text-[14.5px] font-semibold leading-[1.5] transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
            title={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh'}
            aria-label={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          </button>

          {/* Bulk Upload Shortcut */}
          <Link
            href="/bulk-upload"
            className="h-10 min-h-[40px] px-4 rounded-xl bg-white hover:bg-slate-50 text-[#334155] hover:text-[#0F172A] font-semibold text-[14.5px] leading-[1.5] transition active:scale-95 flex items-center gap-2 shrink-0 border border-slate-200 shadow-2xs"
            title={isMarathi ? 'गाव डेटा अपलोड' : 'Upload Data'}
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">{isMarathi ? 'अपलोड' : 'Upload'}</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EXECUTIVE PASTEL DATA INTELLIGENCE KPI CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-full min-w-0">
        <MetricCard
          variant="blue"
          titleMr="नोंदणीकृत भूखंड"
          titleEn="Registered Land"
          value={analytics.totalParcels.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={isMarathi ? 'गट संख्या' : 'Parcels'}
          // subtextEn="Total Parcels"
          icon={Landmark}
          isActive={activeKpi === 'parcels'}
          onClick={() => handleKpiToggle('parcels')}
          actionHref={parcelsUrl}
          actionTitleMr="नोंदवहीत उघडा"
          actionTitleEn="Open Land Register"
        />

        <MetricCard
          variant="burntOrange"
          titleMr="शर्तभंग व चौकशी"
          titleEn="Breaches & Inquiries"
          value={analytics.totalViolations.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={isMarathi ? 'कलम ३६, ५०-५४' : 'Sec 36, 50-54'}
          // subtextEn="Sec 36, 50-54"
          icon={AlertTriangle}
          isActive={activeKpi === 'violations'}
          onClick={() => handleKpiToggle('violations')}
          actionHref={casesUrl}
          actionTitleMr="न्यायालयीन चौकशी कक्ष"
          actionTitleEn="Open Breaches Register"
        />

        <MetricCard
          variant="purple"
          titleMr="समाविष्ट महसूल गावे"
          titleEn="Covered Villages"
          value={analytics.totalVillages.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={
            taluka
              ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameMr || taluka} तालुका`
              : (isMarathi ? '१५ तालुके' : '15 Talukas')
          }
          // subtextEn={
          //   taluka
          //     ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameEn || taluka} Taluka`
          //     : '15 Talukas'
          // }
          icon={MapPin}
          isActive={activeKpi === 'villages'}
          onClick={() => handleKpiToggle('villages')}
          actionHref={villagesReportUrl}
          actionTitleMr="गावनिहाय अहवाल"
          actionTitleEn="View Village Reports"
        />

        <MetricCard
          variant="emerald"
          titleMr="वर्ग २ ते वर्ग १ रूपांतर"
          titleEn="Class 2 to 1 Conversion"
          value={(analytics.totalClass2To1Conversions || 0).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={`${Number(analytics.totalClass2To1AreaHa || 0).toFixed(2)} Ha`}
          // subtextEn={`${Number(analytics.totalClass2To1AreaHa || 0).toFixed(2)} Ha`}
          icon={ArrowRightLeft}
          isActive={activeKpi === 'conversions'}
          onClick={() => handleKpiToggle('conversions')}
          actionHref={conversionsUrl}
          actionTitleMr="भोगवटादार वर्ग २ ते १ रूपांतर नोंदवही"
          actionTitleEn="View Converted Parcels"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE FOCUS FILTER BAR (Sleek Toolbar, Zero Fluff)
         ───────────────────────────────────────────────────────────── */}
      {activeKpi && (
        <div
          id="dashboard-focused-section"
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <span className="text-[14.5px] font-bold text-[#0F172A] leading-[1.5] truncate">
              {activeKpi === 'parcels' && (isMarathi ? 'सक्रिय दृश्य: नोंदणीकृत भूखंड व धारणाधिकार' : 'Active View: Land Parcels & Tenure')}
              {activeKpi === 'violations' && (isMarathi ? 'सक्रिय दृश्य: शर्तभंग व महसूल चौकशी' : 'Active View: Breaches & Inquiries')}
              {activeKpi === 'villages' && (isMarathi ? 'सक्रिय दृश्य: समाविष्ट महसूल गावे' : 'Active View: Covered Villages')}
              {activeKpi === 'conversions' && (isMarathi ? 'सक्रिय दृश्य: भोगवटादार वर्ग-२ ते वर्ग-१ रूपांतरण' : 'Active View: Class-2 to 1 Conversions')}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
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
              className="h-10 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[14px] leading-[1.5] transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>{isMarathi ? 'नोंदवहीत उघडा' : 'Open Register'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => setActiveKpi(null)}
              className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#334155] font-semibold text-[14px] leading-[1.5] transition border border-slate-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title={isMarathi ? 'फिल्टर बंद करा' : 'Close'}
            >
              <X className="w-4 h-4" />
              <span>{isMarathi ? 'बंद करा' : 'Clear'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. VISIBLY NEW ANALYTICS SECTORS (NO REPEATING DONUTS / AREA CHARTS)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Viz 1: Land Tenure Spectrum Bar & Proportional Breakdown */}
        <TenureSpectrumBar
          data={analytics.tenureDistribution}
          taluka={taluka}
        />

        {/* Viz 2: Quasi-Judicial Enforcement Pipeline & Violation Matrix */}
        <EnforcementPipelineMatrix
          violations={analytics.violationsByType}
          statuses={analytics.statusDistribution}
          totalViolations={analytics.totalViolations}
          repossessedArea={analytics.totalRepossessedHa}
          taluka={taluka}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Viz 3: 1950 to 2026 Land Transformation & Mutation Curve */}
        <HistoricalProvenanceTrendChart
          data={analytics.historicalTimeline}
        />

        {/* Viz 4: Taluka-wise Monitoring & Comparison (Bar & Mountain Wave) */}
        <TalukaMountainChart
          data={analytics.talukaDistribution}
          selectedTaluka={taluka}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. STATUTORY GOVERNANCE STRIP (MLRC 1966 Compliance & Direct Links)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl px-5 py-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <p className="text-[14px] text-[#334155] font-medium leading-[1.5] truncate">
            {isMarathi
              ? 'MLRC १९६६ वैधानिक तरतुदी: आदिवासी जमीन संरक्षण (कलम ३६, ३६अ) व शासकीय अतिक्रमण (कलम ५०-५४) • SDO / तहसीलदार न्यायालय'
              : 'MLRC 1966 Statutory Governance: Tribal Land Protection (Sec 36, 36A) & Govt Encroachment (Sec 50-54) • SDO / Tahsildar Court'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <Link
            href="/reports"
            className="h-10 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#334155] font-semibold text-[14.5px] leading-[1.5] border border-slate-200 transition shadow-2xs flex items-center gap-1.5"
          >
            {isMarathi ? 'प्रपत्र १ ते ६ अहवाल' : 'Prapatra 1-6 Reports'}
          </Link>
          <Link
            href="/documents"
            className="h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] font-semibold text-[14.5px] leading-[1.5] border border-blue-200 transition shadow-2xs flex items-center gap-1.5"
          >
            {isMarathi ? 'जिल्हा अभिलेखागार' : 'District Archives'}
          </Link>
        </div>
      </div>
    </div>
  );
}
