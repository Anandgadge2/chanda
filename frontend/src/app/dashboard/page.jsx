'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Filter,
  RotateCcw,
  RefreshCw,
  UploadCloud,
  ChevronDown,
  ShieldCheck,
  Scale,
  ShieldAlert,
  FileText,
  Trees,
  Landmark,
  Building2,
  Calendar,
  Layers,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

import ReferenceKpiCard from '../../components/dashboard/ReferenceKpiCard';
import ActivityBarChartCard from '../../components/dashboard/ActivityBarChartCard';
import TopicProgressBarCard from '../../components/dashboard/TopicProgressBarCard';
import LeaderboardCard from '../../components/dashboard/LeaderboardCard';

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
  const [timeframe, setTimeframe] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');

  const [analytics, setAnalytics] = useState({
    totalParcels: 41984,
    totalVillages: 186,
    totalViolations: 8203,
    totalClass2To1Conversions: 6467,
    totalClass2To1AreaHa: 6145.31,
    pendingHearings: 0,
    totalRepossessedHa: 0,
    totalRepossessedCases: 0,
    inProgressCases: 8203,
    inProgressAreaHa: 72950.65,
    violationsByType: [
      { type: 'TRIBAL_LAND_VIOLATION', count: 5107, encroachedAreaHa: 7613.87 },
      { type: 'POKALIST_NONDI', count: 2280, encroachedAreaHa: 3521.37 },
      { type: 'ENCROACHMENT', count: 815, encroachedAreaHa: 61815.22 },
    ],
    tenureDistribution: [
      { tenure: 'BHOGVATDAR_CLASS_1', count: 29399, totalAreaHa: 209930.26 },
      { tenure: 'BHOGVATDAR_CLASS_2', count: 7175, totalAreaHa: 8071.37 },
      { tenure: 'SARKAR_SHASAN', count: 4300, totalAreaHa: 24508.24 },
      { tenure: 'FOREST_JANGAL', count: 1108, totalAreaHa: 7665.71 },
    ],
    talukaDistribution: [
      { taluka: 'Brahmapuri', villageCount: 48, parcelCount: 16743, totalAreaHa: 102577.25 },
      { taluka: 'Ballarpur', villageCount: 34, parcelCount: 12499, totalAreaHa: 23806.74 },
      { taluka: 'Chandrapur', villageCount: 50, parcelCount: 9844, totalAreaHa: 58209.40 },
      { taluka: 'Bhadravati', villageCount: 56, parcelCount: 2898, totalAreaHa: 65595.76 },
    ],
    statusDistribution: [
      { status: 'NOTICE_ISSUED', count: 5107 },
      { status: 'FLAGGED_IN_AUDIT', count: 3096 },
    ],
    historicalTimeline: [],
  });

  const loadData = async (selectedTaluka = taluka, forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsSummary(selectedTaluka, forceRefresh);
      if (data && typeof data === 'object') {
        setAnalytics((prev) => ({
          ...prev,
          ...data,
        }));
      }
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
    setTimeframe('all');
    setTopicFilter('all');
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

  // Selected taluka scope display
  const selectedTalukaScope = useMemo(() => {
    if (!taluka) return isMarathi ? 'चंद्रपूर जिल्हा (१५ तालुके)' : 'Chandrapur District (15 Talukas)';
    const found = CHANDRAPUR_TALUKAS.find((t) => t.id.toLowerCase() === taluka.toLowerCase());
    return isMarathi ? (found ? `${found.nameMr} तालुका` : taluka) : (found ? `${found.nameEn} Taluka` : taluka);
  }, [taluka, isMarathi]);

  // Derived metrics from analytics summary
  const tribalCount = useMemo(() => {
    const item = (analytics.violationsByType || []).find((v) => v.type === 'TRIBAL_LAND_VIOLATION');
    return item ? item.count : 5107;
  }, [analytics.violationsByType]);

  const encroachmentCount = useMemo(() => {
    const item = (analytics.violationsByType || []).find((v) => v.type === 'ENCROACHMENT');
    return item ? item.count : 815;
  }, [analytics.violationsByType]);

  // Weakest Topics equivalent: Statutory Breach Breakdown
  const breachProgressItems = useMemo(() => {
    const total = analytics.totalViolations || 8203;
    const tribal = (analytics.violationsByType || []).find((v) => v.type === 'TRIBAL_LAND_VIOLATION')?.count || 5107;
    const pokalist = (analytics.violationsByType || []).find((v) => v.type === 'POKALIST_NONDI')?.count || 2280;
    const encroachment = (analytics.violationsByType || []).find((v) => v.type === 'ENCROACHMENT')?.count || 815;

    return [
      {
        title: isMarathi ? 'आदिवासी जमीन संरक्षण (कलम ३६, ३६अ)' : 'Tribal Land Protection (Sec 36, 36A)',
        percentage: Math.round((tribal / total) * 100),
        valueLabel: `${tribal.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} (${Math.round((tribal / total) * 100)}%)`,
        icon: ShieldAlert,
        iconColor: 'text-amber-600',
      },
      {
        title: isMarathi ? 'पोकळीष्ट नोंदी / फेरफार चौकशी' : 'Pokalist Records & Mutation Audit',
        percentage: Math.round((pokalist / total) * 100),
        valueLabel: `${pokalist.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} (${Math.round((pokalist / total) * 100)}%)`,
        icon: FileText,
        iconColor: 'text-orange-600',
      },
      {
        title: isMarathi ? 'शासकीय जमीन अतिक्रमण (कलम ५०-५४)' : 'Govt Land Encroachments (Sec 50-54)',
        percentage: Math.round((encroachment / total) * 100),
        valueLabel: `${encroachment.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} (${Math.round((encroachment / total) * 100)}%)`,
        icon: Landmark,
        iconColor: 'text-rose-600',
      },
    ];
  }, [analytics, isMarathi]);

  // Strongest Topics equivalent: Land Tenure Classification
  const tenureProgressItems = useMemo(() => {
    const total = analytics.totalParcels || 41984;
    const class1 = (analytics.tenureDistribution || []).find((t) => t.tenure === 'BHOGVATDAR_CLASS_1')?.count || 29399;
    const class2 = (analytics.tenureDistribution || []).find((t) => t.tenure === 'BHOGVATDAR_CLASS_2')?.count || 7175;
    const sarkar = (analytics.tenureDistribution || []).find((t) => t.tenure === 'SARKAR_SHASAN')?.count || 4300;
    const forest = (analytics.tenureDistribution || []).find((t) => t.tenure === 'FOREST_JANGAL')?.count || 1108;

    return [
      {
        title: isMarathi ? 'भोगवटादार वर्ग-१ (अप्रतिबंधित सत्ताप्रकार)' : 'Bhogvatdar Class 1 (Unrestricted Freehold)',
        percentage: Math.round((class1 / total) * 100),
        valueLabel: `${class1.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} (${Math.round((class1 / total) * 100)}%)`,
        icon: ShieldCheck,
        iconColor: 'text-emerald-600',
      },
      {
        title: isMarathi ? 'भोगवटादार वर्ग-२ (शर्तयुक्त / रूपांतरणक्षम)' : 'Bhogvatdar Class 2 (Conditional / Restricted)',
        percentage: Math.round((class2 / total) * 100),
        valueLabel: `${class2.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} (${Math.round((class2 / total) * 100)}%)`,
        icon: Layers,
        iconColor: 'text-teal-600',
      },
      {
        title: isMarathi ? 'शासकीय / महसूल जमीन (कलम ५०)' : 'Government / Revenue Land (Sec 50)',
        percentage: Math.round((sarkar / total) * 100),
        valueLabel: `${sarkar.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} (${Math.round((sarkar / total) * 100)}%)`,
        icon: Building2,
        iconColor: 'text-cyan-600',
      },
      {
        title: isMarathi ? 'वन / जंगल जमीन' : 'Forest Land Reserve',
        percentage: Math.round((forest / total) * 100),
        valueLabel: `${forest.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')} (${Math.round((forest / total) * 100)}%)`,
        icon: Trees,
        iconColor: 'text-green-700',
      },
    ];
  }, [analytics, isMarathi]);

  // Leaderboard 1: Taluka Revenue Leaderboard
  const talukaLeaderboardItems = useMemo(() => {
    return [
      {
        name: isMarathi ? 'ब्रह्मपुरी तालुका (Brahmapuri)' : 'Brahmapuri Taluka',
        subtitle: isMarathi ? '१६,७४३ भूखंड • ४८ गावे • १०२,५७७ हे.' : '16,743 Parcels • 48 Villages • 102,577 Ha',
        rank: 1,
        trend: 'up',
        avatarBg: 'bg-blue-600',
        avatarChar: 'B',
      },
      {
        name: isMarathi ? 'बल्लारपूर तालुका (Ballarpur)' : 'Ballarpur Taluka',
        subtitle: isMarathi ? '१२,४९९ भूखंड • ३४ गावे • २३,८०६ हे.' : '12,499 Parcels • 34 Villages • 23,806 Ha',
        rank: 2,
        trend: 'up',
        avatarBg: 'bg-indigo-600',
        avatarChar: 'B',
      },
      {
        name: isMarathi ? 'चंद्रपूर तालुका (Chandrapur)' : 'Chandrapur Taluka',
        subtitle: isMarathi ? '९,८४४ भूखंड • ५० गावे • ५८,२०९ हे.' : '9,844 Parcels • 50 Villages • 58,209 Ha',
        rank: 3,
        trend: 'up',
        avatarBg: 'bg-violet-600',
        avatarChar: 'C',
      },
      {
        name: isMarathi ? 'भद्रावती तालुका (Bhadravati)' : 'Bhadravati Taluka',
        subtitle: isMarathi ? '२,८९८ भूखंड • ५६ गावे • ६५,५९५ हे.' : '2,898 Parcels • 56 Villages • 65,595 Ha',
        rank: 4,
        trend: 'down',
        avatarBg: 'bg-amber-600',
        avatarChar: 'B',
      },
    ];
  }, [isMarathi]);

  // Leaderboard 2: Enforcement Status & Hearings
  const enforcementLeaderboardItems = useMemo(() => {
    return [
      {
        name: isMarathi ? 'नोटीस बजावण्यात आली (Notice Issued)' : 'Show Cause Notice Issued',
        subtitle: isMarathi ? '५,१०७ प्रकरणे • SDO व तहसीलदार न्यायालय • ६२%' : '5,107 Cases • SDO & Tehsildar Court • 62%',
        rank: 1,
        trend: 'up',
      },
      {
        name: isMarathi ? 'लेखापरीक्षणात ध्वजांकित (Flagged in Audit)' : 'Flagged in Statutory Audit',
        subtitle: isMarathi ? '३,०९६ प्रकरणे • प्राथमिक महसूल तपासणी कक्ष • ३८%' : '3,096 Cases • Preliminary Audit Chamber • 38%',
        rank: 2,
        trend: 'up',
      },
      {
        name: isMarathi ? 'शासन जमा आदेश (Govt Vested / Repossessed)' : 'Govt Vested Repossession Orders',
        subtitle: isMarathi ? '० प्रकरणे • निर्गमित आदेश • अंतिम अंमलबजावणी' : '0 Cases • Final Orders Issued • Enforced',
        rank: 3,
        trend: 'neutral',
      },
    ];
  }, [isMarathi]);

  // Construct target URLs
  const parcelsUrl = `/parcels${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`;
  const casesUrl = `/cases${taluka ? `?taluka=${encodeURIComponent(taluka)}` : ''}`;
  const villagesReportUrl = `/reports?tab=prapatra5&prapatra=1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`;
  const conversionsUrl = `/parcels?tenureClass=BHOGVATDAR_CLASS_1${taluka ? `&taluka=${encodeURIComponent(taluka)}` : ''}`;

  return (
    <div className="space-y-5 w-full max-w-full min-w-0 font-sans pb-8">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP FILTER ROW - Exact Clean Pill Style matching Reference
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: 3 Rounded Pill Dropdowns matching Reference Image */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Filter 1: Timeframe: All-time v */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-slate-700 bg-white border border-slate-200/90 hover:border-slate-300 px-4 py-2 rounded-full shadow-2xs transition"
            >
              <span className="text-slate-400 font-normal">
                {isMarathi ? 'कालावधी:' : 'Timeframe:'}
              </span>
              <span>{isMarathi ? 'सर्व नोंदी (All-time)' : 'All-time'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Filter 2: People: All v -> Taluka: All 15 v */}
          <div className="w-[200px] sm:w-[220px]">
            <SearchableSelect
              options={talukaSelectOptions}
              value={draftTaluka}
              onChange={(val) => setDraftTaluka(val || '')}
              placeholder={isMarathi ? 'तालुका: सर्व निवडा' : 'Taluka: All 15'}
              searchPlaceholder={isMarathi ? 'शोधा...' : 'Search...'}
              icon={Filter}
              showCount={false}
              align="left"
            />
          </div>

          {/* Filter 3: Topic: All v */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-slate-700 bg-white border border-slate-200/90 hover:border-slate-300 px-4 py-2 rounded-full shadow-2xs transition"
            >
              <span className="text-slate-400 font-normal">
                {isMarathi ? 'प्रवर्ग:' : 'Topic:'}
              </span>
              <span>{isMarathi ? 'सर्व महसूल प्रवर्ग' : 'All'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right: Apply & Reset Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className={clsx(
              'h-9 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer shadow-xs',
              isFilterPending
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
            title={isMarathi ? 'फिल्टर लागू करा' : 'Apply'}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-9 px-3 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-xs font-semibold transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
            title={isMarathi ? 'रीसेट' : 'Reset'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>

          <button
            onClick={() => loadData(taluka, true)}
            disabled={loading}
            className="h-9 w-9 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            title={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP SECTION: 6 KPI METRIC CARDS (3x2) + ACTIVITY BAR CHART
             Exact composition matching reference image
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Side: 6 Metric Cards in 3x2 Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Active Users -> नोंदणीकृत भूखंड */}
          <ReferenceKpiCard
            title={isMarathi ? 'नोंदणीकृत भूखंड' : 'Registered Land'}
            value={analytics.totalParcels.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
            subtext={isMarathi ? '/ १,४८,१२६ एकूण गट' : '/ 148,126 Total Parcels'}
            isActive={activeKpi === 'parcels'}
            onClick={() => handleKpiToggle('parcels')}
          />

          {/* Card 2: Questions Answered -> समाविष्ट महसूल गावे */}
          <ReferenceKpiCard
            title={isMarathi ? 'समाविष्ट महसूल गावे' : 'Covered Villages'}
            value={analytics.totalVillages.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
            subtext={isMarathi ? '१५ तालुके' : '15 Talukas'}
            isActive={activeKpi === 'villages'}
            onClick={() => handleKpiToggle('villages')}
          />

          {/* Card 3: Av. Session Length -> शर्तभंग व चौकशी */}
          <ReferenceKpiCard
            title={isMarathi ? 'शर्तभंग व चौकशी' : 'Breaches & Inquiries'}
            value={analytics.totalViolations.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
            subtext={isMarathi ? 'कलम ३६, ५०-५४' : 'Sec 36, 50-54'}
            isActive={activeKpi === 'violations'}
            onClick={() => handleKpiToggle('violations')}
          />

          {/* Card 4 (with blue sparkline): Starting Knowledge -> वर्ग २ ते १ रूपांतर */}
          <ReferenceKpiCard
            title={isMarathi ? 'वर्ग २ ते १ रूपांतर' : 'Class 2 to 1'}
            value={(analytics.totalClass2To1Conversions || 6467).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
            subtext={`${Number(analytics.totalClass2To1AreaHa || 6145).toFixed(0)} Ha`}
            hasInfo={true}
            showSparkline={true}
            sparklineVariant="wave1"
            isActive={activeKpi === 'conversions'}
            onClick={() => handleKpiToggle('conversions')}
          />

          {/* Card 5 (with blue sparkline): Current Knowledge -> आदिवासी जमीन संरक्षण */}
          <ReferenceKpiCard
            title={isMarathi ? 'आदिवासी जमीन संरक्षण' : 'Tribal Land (Sec 36)'}
            value={tribalCount.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
            subtext={isMarathi ? 'कलम ३६ व ३६अ' : 'Sec 36, 36A'}
            showSparkline={true}
            sparklineVariant="wave2"
          />

          {/* Card 6 (with blue sparkline): Knowledge Gain -> शासकीय जमीन अतिक्रमण */}
          <ReferenceKpiCard
            title={isMarathi ? 'शासकीय अतिक्रमण' : 'Govt Encroachment'}
            value={`+${encroachmentCount.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}`}
            subtext={isMarathi ? 'कलम ५०-५४' : 'Sec 50-54'}
            showSparkline={true}
            sparklineVariant="wave3"
          />
        </div>

        {/* Right Side: Activity Bar Chart Card (12 Vertical Pill Bars) */}
        <div className="lg:col-span-5 h-full min-h-[280px]">
          <ActivityBarChartCard />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE KPI FOCUS BAR (Shows when a metric card is clicked)
         ───────────────────────────────────────────────────────────── */}
      {activeKpi && (
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-blue-200/90 shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {activeKpi === 'parcels' && (isMarathi ? 'सक्रिय दृश्य: नोंदणीकृत भूखंड व धारणाधिकार' : 'Active View: Land Parcels & Tenure')}
              {activeKpi === 'violations' && (isMarathi ? 'सक्रिय दृश्य: शर्तभंग व महसूल चौकशी' : 'Active View: Breaches & Inquiries')}
              {activeKpi === 'villages' && (isMarathi ? 'सक्रिय दृश्य: समाविष्ट महसूल गावे' : 'Active View: Covered Villages')}
              {activeKpi === 'conversions' && (isMarathi ? 'सक्रिय दृश्य: भोगवटादार वर्ग-२ ते वर्ग-१ रूपांतरण' : 'Active View: Class-2 to 1 Conversions')}
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
              className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>{isMarathi ? 'नोंदवहीत उघडा' : 'Open Register'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setActiveKpi(null)}
              className="px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition border border-slate-200 active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'बंद करा' : 'Clear'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MIDDLE SECTION: WEAKEST / STRONGEST TOPICS EQUIVALENTS
             (Statutory Breach Breakdown vs Land Tenure Classification)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Weakest Topics -> शर्तभंग व महसूल वाद */}
        <TopicProgressBarCard
          title={isMarathi ? 'शर्तभंग प्रकारनिहाय वर्गीकरण' : 'Weakest Topics'}
          subtitle={isMarathi ? 'महाराष्ट्र जमीन महसूल संहिता १९६६ अंतर्गत दाखल प्रकरणे' : 'Statutory Violations & Inquiries'}
          items={breachProgressItems}
          variant="coral"
        />

        {/* Right: Strongest Topics -> धारणाधिकार वर्गनिहाय वितरण */}
        <TopicProgressBarCard
          title={isMarathi ? 'धारणाधिकार वर्गनिहाय वितरण' : 'Strongest Topics'}
          subtitle={isMarathi ? 'जिल्ह्यातील एकूण जमीन वर्गवारी व महसूल स्थिती' : 'Land Tenure Classification Breakdown'}
          items={tenureProgressItems}
          variant="emerald"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM SECTION: USER & GROUPS LEADERBOARD EQUIVALENTS
             (Taluka Leaderboard vs Hearing / Enforcement Status)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: User Leaderboard -> तालुकानिहाय महसूल अहवाल */}
        <LeaderboardCard
          title={isMarathi ? 'तालुकानिहाय महसूल अहवाल' : 'User Leaderboard'}
          subtitle={isMarathi ? 'जिल्ह्यातील १५ तालुक्यांची क्रमवारी व सद्यस्थिती' : 'Taluka Performance & Revenue Records'}
          items={talukaLeaderboardItems}
          showAvatar={true}
        />

        {/* Right: Groups Leaderboard -> न्यायालयीन सुनावणी व कारवाई सद्यस्थिती */}
        <LeaderboardCard
          title={isMarathi ? 'न्यायालयीन सुनावणी व कारवाई सद्यस्थिती' : 'Groups Leaderboard'}
          subtitle={isMarathi ? 'SDO व तहसीलदार न्यायालयातील सुनावण्या' : 'Court Hearings & Quasi-Judicial Status'}
          items={enforcementLeaderboardItems}
          showAvatar={false}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. STATUTORY GOVERNANCE STRIP - Minimalist Clean Footer
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-slate-700 font-medium truncate">
            {isMarathi
              ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर • MLRC १९६६ वैधानिक तरतुदी: आदिवासी जमीन संरक्षण (कलम ३६, ३६अ) व शासकीय अतिक्रमण (कलम ५०-५४) • SDO / तहसीलदार न्यायालय'
              : 'Collectorate, Chandrapur • MLRC 1966 Statutory Governance: Tribal Land Protection (Sec 36, 36A) & Govt Encroachment (Sec 50-54) • SDO / Tahsildar Court'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Link
            href="/reports"
            className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition"
          >
            {isMarathi ? 'प्रपत्र १ ते ६ अहवाल' : 'Prapatra 1-6 Reports'}
          </Link>
          <Link
            href="/documents"
            className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition"
          >
            {isMarathi ? 'जिल्हा अभिलेखागार' : 'District Archives'}
          </Link>
        </div>
      </div>
    </div>
  );
}
