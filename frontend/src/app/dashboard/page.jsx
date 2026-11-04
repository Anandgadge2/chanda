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
import MetricCard from '../../components/MetricCard';
import ChartSkeleton from '../../components/charts/ChartSkeleton';

const LandTypeDonutChart = dynamic(
  () => import('../../components/charts/LandTypeDonutChart'),
  { ssr: false, loading: () => <ChartSkeleton height="h-[340px]" /> }
);

const EnforcementDisposalDonut = dynamic(
  () => import('../../components/charts/EnforcementDisposalDonut'),
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

  // Selected taluka metadata
  const selectedTalukaName = useMemo(() => {
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
          1. DASHBOARD HEADER - Compact Enterprise Analytics Bar
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between md:items-center gap-3">
        {/* Title & Scope */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {isMarathi ? 'महसूल संनियंत्रण डॅशबोर्ड' : 'Revenue Analytics Dashboard'}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              {selectedTalukaName}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
            {isMarathi
              ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर • जमीन अभिलेख व महसूल चौकशी'
              : 'Collectorate, Chandrapur • Land Governance & Inquiries'}
          </p>
        </div>

        {/* Compact Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap w-full md:w-auto">
          {/* Taluka Dropdown */}
          <div className="flex-1 min-w-[150px] sm:w-[190px] sm:flex-initial">
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

          {/* Apply Filter */}
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className={clsx(
              'h-9 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0 shadow-2xs cursor-pointer',
              isFilterPending
                ? 'bg-blue-700 hover:bg-blue-800 text-white ring-2 ring-blue-500/20'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            )}
            title={isMarathi ? 'फिल्टर लागू करा' : 'Apply'}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
          </button>

          {/* Reset Filter */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-9 px-2.5 text-slate-700 hover:text-red-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1"
            title={isMarathi ? 'रीसेट' : 'Reset'}
            aria-label={isMarathi ? 'रीसेट' : 'Reset'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={() => loadData(taluka, true)}
            disabled={loading}
            className="h-9 px-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
            title={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh'}
            aria-label={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-700' : 'text-slate-500'}`} />
          </button>

          {/* Bulk Upload Action */}
          <Link
            href="/bulk-upload"
            className="h-9 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition active:scale-95 flex items-center gap-1.5 shrink-0 border border-slate-200"
            title={isMarathi ? 'गाव डेटा अपलोड' : 'Upload Data'}
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">{isMarathi ? 'अपलोड' : 'Upload'}</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ENTERPRISE KPI CARDS - Solid Subtle Backgrounds
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
          variant="amber"
          titleMr="शर्तभंग व चौकशी"
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
          variant="violet"
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
          titleMr="वर्ग २ ते वर्ग १ रूपांतर"
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
          3. ACTIVE KPI FOCUS BAR - Sleek Enterprise Filter Toolbar
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
          4. CONDITIONAL DEEP-DIVE VIEWS
         ───────────────────────────────────────────────────────────── */}

      {/* PARCELS DEEP-DIVE VIEW */}
      {activeKpi === 'parcels' && (
        <div className="space-y-4">
          {/* Quick Tenure Shortcuts */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-slate-500 whitespace-nowrap text-xs flex items-center gap-1.5 shrink-0">
              <Layers className="w-3.5 h-3.5 text-blue-700" />
              {isMarathi ? 'वर्गवारी:' : 'Tenure:'}
            </span>
            <Link
              href={parcelsUrl}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'सर्व भूखंड' : 'All Parcels'}
            </Link>
            <Link
              href={`/parcels?tenureClass=BHOGVATDAR_CLASS_1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'वर्ग-१' : 'Class-1'}
            </Link>
            <Link
              href={`/parcels?tenureClass=BHOGVATDAR_CLASS_2${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'वर्ग-२' : 'Class-2'}
            </Link>
            <Link
              href={`/parcels?tenureClass=SARKAR_SHASAN${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'शासकीय' : 'Govt'}
            </Link>
            <Link
              href={`/parcels?tenureClass=FOREST_JANGAL${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'वन जमीन' : 'Forest'}
            </Link>
            <Link
              href={`/parcels?tenureClass=DEVASTHAN_INAM${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'देवस्थान' : 'Devasthan'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LandTypeDonutChart data={analytics.tenureDistribution} />
            <HistoricalProvenanceTrendChart data={analytics.historicalTimeline} />
          </div>
        </div>
      )}

      {/* VIOLATIONS DEEP-DIVE VIEW */}
      {activeKpi === 'violations' && (
        <div className="space-y-4">
          {/* Quick Violation Type Shortcuts */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-slate-500 whitespace-nowrap text-xs flex items-center gap-1.5 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {isMarathi ? 'उल्लंघन प्रकार:' : 'Type:'}
            </span>
            <Link
              href={casesUrl}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'सर्व प्रकरणे' : 'All Cases'}
            </Link>
            <Link
              href={`/cases?violationType=SHARTBHANG${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'शर्तभंग' : 'Breaches'}
            </Link>
            <Link
              href={`/cases?violationType=TRIBAL_LAND_VIOLATION${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'आदिवासी जमीन संरक्षण (कलम ३६)' : 'Tribal Land (Sec 36)'}
            </Link>
            <Link
              href={`/cases?violationType=ENCROACHMENT${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'गायरान / शासकीय अतिक्रमण' : 'Encroachment'}
            </Link>
            <Link
              href={`/cases?isRepossessedToGovt=true${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
              className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold whitespace-nowrap transition"
            >
              {isMarathi ? 'शासन जमा आदेश' : 'Govt Vested'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EnforcementDisposalDonut
              violations={analytics.violationsByType}
              statuses={analytics.statusDistribution}
              totalViolations={analytics.totalViolations}
              repossessedArea={analytics.totalRepossessedHa}
            />

            {/* Statutory Overview Card */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    §
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isMarathi ? 'MLRC १९६६ वैधानिक कार्यवाही (SDO / तहसीलदार न्यायालय)' : 'Statutory Framework (SDO / Tahsildar Court)'}
                    </h3>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-rose-700 block mb-0.5">
                      {isMarathi ? 'कलम ३६ व ३६अ (आदिवासी जमीन संरक्षण):' : 'Section 36 & 36A (Tribal Land Protection):'}
                    </span>
                    <span className="text-slate-600">
                      {isMarathi
                        ? 'विनापरवानगी गैर-आदिवासी व्यक्तीस विक्री किंवा हस्तांतरण बेकायदेशीर ठरवून जमीन मूळ खातेदार किंवा शासनाकडे जमा करण्याची तरतूद.'
                        : 'Unauthorized transfer to non-tribals is void; restored to tribal or vested in Government.'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-amber-700 block mb-0.5">
                      {isMarathi ? 'कलम ५० ते ५४ (गायरान व शासकीय भूमी अतिक्रमण):' : 'Sections 50-54 (Govt & Gairan Encroachment):'}
                    </span>
                    <span className="text-slate-600">
                      {isMarathi
                        ? 'शासकीय जमिनीवरील अनधिकृत वहिवाट किंवा अतिक्रमण निष्कासित करून भूमी शासन जमा व दंड आकारणीची कार्यवाही.'
                        : 'Eviction of encroachments from government lands and vesting with penal action.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {isMarathi ? 'एकूण चौकशी प्रकरणे:' : 'Total Active Cases:'}{' '}
                  <strong className="text-slate-900 font-mono text-sm">{analytics.totalViolations}</strong>
                </span>
                <Link
                  href={casesUrl}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>{isMarathi ? 'न्यायालयीन कक्ष' : 'Open Chamber'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VILLAGES DEEP-DIVE VIEW */}
      {activeKpi === 'villages' && (
        <div className="space-y-4">
          <TalukaMountainChart
            data={analytics.talukaDistribution}
            selectedTaluka={taluka}
          />

          {/* 15 Talukas Quick Access Grid */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  {isMarathi ? 'चंद्रपूर जिल्ह्यातील १५ तालुके' : '15 Talukas of Chandrapur'}
                </h3>
              </div>
              <Link
                href={villagesReportUrl}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>{isMarathi ? 'प्रपत्र १ अहवाल पहा' : 'View Prapatra 1'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
                      'p-2.5 rounded-lg border text-left transition active:scale-95 group',
                      isCurrent
                        ? 'bg-blue-50/70 border-blue-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                        {isMarathi ? t.nameMr : t.nameEn}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-700 shrink-0" />
                    </div>
                    <div className="mt-1 flex items-baseline justify-between text-[11px] text-slate-500 font-mono">
                      <span>{talukaData?.parcelCount ? `${talukaData.parcelCount.toLocaleString()} गट` : '–'}</span>
                      {talukaData?.violationCount > 0 && (
                        <span className="text-rose-600 font-bold text-[10px]">
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

      {/* CONVERSIONS DEEP-DIVE VIEW */}
      {activeKpi === 'conversions' && (
        <div className="space-y-4">
          {/* Conversion Spotlight Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {isMarathi ? 'एकूण रूपांतरित भूखंड' : 'Total Converted'}
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono mt-1">
                {(analytics.totalClass2To1Conversions || 19526).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {isMarathi ? 'रूपांतरित क्षेत्र (हे.)' : 'Converted Area (Ha)'}
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono mt-1">
                {Number(analytics.totalClass2To1AreaHa || 40479.32).toFixed(2)}
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {isMarathi ? 'उर्वरित वर्ग-२ क्षेत्र' : 'Remaining Class-2'}
              </span>
              <p className="text-xl sm:text-2xl font-bold text-amber-700 font-mono mt-1">
                62,450.17 Ha
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {isMarathi ? 'एकूण वर्ग-१ क्षेत्र' : 'Total Class-1'}
              </span>
              <p className="text-xl sm:text-2xl font-bold text-blue-700 font-mono mt-1">
                3,31,494.45 Ha
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LandTypeDonutChart data={analytics.tenureDistribution} />

            {/* Conversion Details Card */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isMarathi ? 'वर्ग-२ ते वर्ग-१ रूपांतरण माहिती' : 'Class-2 to Class-1 Regulations'}
                    </h3>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p className="text-slate-600">
                    {isMarathi
                      ? 'भोगवटादार वर्ग-२ (मर्यादित मालकी हक्क) च्या जमिनीचे वेळोवेळी जारी शासन निर्णयानुसार (नजराणा / अधिमूल्य भरणा किंवा मुदतीअंती) वर्ग-१ मध्ये रूपांतरण करण्यात येते.'
                      : 'Occupant Class-2 lands (restricted tenure) are converted to Class-1 (freehold tenure) upon payment of nazarana/premium or completion of statutory grant periods.'}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 font-medium text-[11px]">
                    {isMarathi
                      ? 'सध्या चंद्रपूर जिल्ह्यात एकूण १९,५२६ भूखंड (४०,४७९.३२ हे.) वर्ग-१ मध्ये रूपांतरित नोंद झाले आहेत. या नोंदींची प्रपत्र २ नुसार नियमित पडताळणी करण्यात येते.'
                      : 'Currently, 19,526 parcels (40,479.32 Ha) are recorded as converted to Class-1 in Chandrapur. Routinely verified under Prapatra 2.'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <Link
                  href={conversionsUrl}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>{isMarathi ? 'नोंदवहीत पहा' : 'View in Register'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/reports?tab=prapatra5&prapatra=2${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition border border-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isMarathi ? 'प्रपत्र २ अहवाल' : 'Prapatra 2'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. DEFAULT ANALYTICS GRID (ALL CHARTS)
         ───────────────────────────────────────────────────────────── */}
      {activeKpi === null && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LandTypeDonutChart data={analytics.tenureDistribution} />
            <EnforcementDisposalDonut
              violations={analytics.violationsByType}
              statuses={analytics.statusDistribution}
              totalViolations={analytics.totalViolations}
              repossessedArea={analytics.totalRepossessedHa}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HistoricalProvenanceTrendChart data={analytics.historicalTimeline} />
            <TalukaMountainChart
              data={analytics.talukaDistribution}
              selectedTaluka={taluka}
            />
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. STATUTORY COMPLIANCE STRIP - Minimalist Enterprise Footer
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl px-4 py-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <p className="text-slate-600 font-medium truncate">
            {isMarathi
              ? 'MLRC १९६६ वैधानिक संनियंत्रण: आदिवासी जमीन संरक्षण (कलम ३६, ३६अ) व शासकीय अतिक्रमण (कलम ५०-५४)'
              : 'MLRC 1966 Statutory Governance: Tribal Land Protection (Sec 36, 36A) & Govt Encroachment (Sec 50-54)'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Link
            href="/reports"
            className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition"
          >
            {isMarathi ? 'प्रपत्र १ ते ६' : 'Prapatra 1-6'}
          </Link>
          <Link
            href="/documents"
            className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition"
          >
            {isMarathi ? 'अभिलेखागार' : 'Archives'}
          </Link>
        </div>
      </div>
    </div>
  );
}
