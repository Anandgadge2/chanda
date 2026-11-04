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
          1. EXECUTIVE COMMAND RIBBON (Visibly Fresh Header Composition)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-3">
        {/* Title & Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                {isMarathi ? 'महसूल संनियंत्रण केंद्र' : 'Revenue Intelligence Command Center'}
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700 shrink-0">
                {selectedTalukaScope}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isMarathi ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर • जमीन अभिलेख व वैधानिक संनियंत्रण' : 'Collectorate, Chandrapur • Land Records & Statutory Monitoring'}
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap w-full md:w-auto">
          {/* Taluka Selector */}
          <div className="flex-1 min-w-[140px] sm:w-[180px] sm:flex-initial">
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
              'h-9 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer shadow-xs',
              isFilterPending
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/40'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
            title={isMarathi ? 'फिल्टर लागू करा' : 'Apply'}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-9 px-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-xs font-semibold transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1"
            title={isMarathi ? 'रीसेट' : 'Reset'}
            aria-label={isMarathi ? 'रीसेट' : 'Reset'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => loadData(taluka, true)}
            disabled={loading}
            className="h-9 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
            title={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh'}
            aria-label={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Bulk Upload Shortcut */}
          <Link
            href="/bulk-upload"
            className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition active:scale-95 flex items-center gap-1.5 shrink-0 border border-slate-700"
            title={isMarathi ? 'गाव डेटा अपलोड' : 'Upload Data'}
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{isMarathi ? 'अपलोड' : 'Upload'}</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SOLID DARK ENTERPRISE KPI CARDS (NO GRADIENTS, NO GLASSMORPHISM)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-full min-w-0">
        <MetricCard
          variant="blue"
          titleMr="नोंदणीकृत भूखंड"
          titleEn="Registered Land"
          value={analytics.totalParcels.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={isMarathi ? 'गट संख्या' : 'Parcels'}
          subtextEn="Total Parcels"
          icon={Landmark}
          isActive={activeKpi === 'parcels'}
          onClick={() => handleKpiToggle('parcels')}
          actionHref={parcelsUrl}
          actionTitleMr="नोंदवहीत उघडा"
          actionTitleEn="Open Land Register"
        />

        <MetricCard
          variant="burntOrange"
          titleMr="शर्तभंग व महसूल वाद"
          titleEn="Breaches & Inquiries"
          value={analytics.totalViolations.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={isMarathi ? 'कलम ३६, ५०-५४' : 'Sec 36, 50-54'}
          subtextEn="Sec 36, 50-54"
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
          subtextEn={
            taluka
              ? `${CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase())?.nameEn || taluka} Taluka`
              : '15 Talukas'
          }
          icon={MapPin}
          isActive={activeKpi === 'villages'}
          onClick={() => handleKpiToggle('villages')}
          actionHref={villagesReportUrl}
          actionTitleMr="गावनिहाय अहवाल"
          actionTitleEn="View Village Reports"
        />

        <MetricCard
          variant="emerald"
          titleMr="भोगवटादार वर्ग २ ते १ रूपांतर"
          titleEn="Class 2 to 1 Conversion"
          value={(analytics.totalClass2To1Conversions || 0).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
          subtext={`${Number(analytics.totalClass2To1AreaHa || 0).toFixed(2)} Ha`}
          subtextEn={`${Number(analytics.totalClass2To1AreaHa || 0).toFixed(2)} Ha`}
          icon={ArrowRightLeft}
          isActive={activeKpi === 'conversions'}
          onClick={() => handleKpiToggle('conversions')}
          actionHref={conversionsUrl}
          actionTitleMr="रूपांतरित भूखंड नोंदवही"
          actionTitleEn="View Converted Parcels"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE FOCUS FILTER BAR (Sleek Toolbar, Zero Fluff)
         ───────────────────────────────────────────────────────────── */}
      {activeKpi && (
        <div
          id="dashboard-focused-section"
          className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {activeKpi === 'parcels' && (isMarathi ? 'सक्रिय दृश्य: नोंदणीकृत भूखंड व धारणाधिकार' : 'Active View: Land Parcels & Tenure')}
              {activeKpi === 'violations' && (isMarathi ? 'सक्रिय दृश्य: शर्तभंग व महसूल चौकशी' : 'Active View: Breaches & Inquiries')}
              {activeKpi === 'villages' && (isMarathi ? 'सक्रिय दृश्य: समाविष्ट महसूल गावे' : 'Active View: Covered Villages')}
              {activeKpi === 'conversions' && (isMarathi ? 'सक्रिय दृश्य: वर्ग-२ ते वर्ग-१ रूपांतरण' : 'Active View: Class-2 to 1 Conversions')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
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
              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>{isMarathi ? 'नोंदवहीत उघडा' : 'Open Register'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setActiveKpi(null)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition border border-slate-200 active:scale-95 flex items-center gap-1 cursor-pointer"
              title={isMarathi ? 'फिल्टर बंद करा' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
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
        {/* Viz 3: 15 Talukas Ranked Analytics Leaderboard */}
        <TalukaRankedTable
          data={analytics.talukaDistribution}
          selectedTaluka={taluka}
        />

        {/* Viz 4: 1950 vs 2026 Historical Epoch Baseline Verification */}
        <HistoricalEpochComparison
          data={analytics.historicalTimeline}
          class2To1Area={analytics.totalClass2To1AreaHa}
          class2To1Count={analytics.totalClass2To1Conversions}
          taluka={taluka}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. STATUTORY GOVERNANCE STRIP (MLRC 1966 Compliance & Direct Links)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl px-4 py-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-700 shrink-0" />
          <p className="text-slate-700 font-medium truncate">
            {isMarathi
              ? 'MLRC १९६६ वैधानिक तरतुदी: आदिवासी जमीन संरक्षण (कलम ३६, ३६अ) व शासकीय अतिक्रमण (कलम ५०-५४) • SDO / तहसीलदार न्यायालय'
              : 'MLRC 1966 Statutory Governance: Tribal Land Protection (Sec 36, 36A) & Govt Encroachment (Sec 50-54) • SDO / Tahsildar Court'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Link
            href="/reports"
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition"
          >
            {isMarathi ? 'प्रपत्र १ ते ६ अहवाल' : 'Prapatra 1-6 Reports'}
          </Link>
          <Link
            href="/documents"
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition"
          >
            {isMarathi ? 'जिल्हा अभिलेखागार' : 'District Archives'}
          </Link>
        </div>
      </div>
    </div>
  );
}
