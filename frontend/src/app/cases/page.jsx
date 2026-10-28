'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Upload,
  User,
  Eye,
  BookOpen,
  Copy,
  Check,
  MapPin,
  Landmark,
  X,
  Clock,
  ChevronDown,
  ChevronRight,
  FolderArchive,
  ArrowRight,
  FileText,
  Filter,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  CHANDRAPUR_TALUKAS,
  VIOLATION_TYPES,
  ENFORCEMENT_STATUSES,
} from '../../lib/constants';
import AddHearingModal from '../../components/AddHearingModal';
import DocUploadModal from '../../components/DocUploadModal';
import ParcelTraceDrawer from '../../components/ParcelTraceDrawer';
import ShasanJamaModal from '../../components/ShasanJamaModal';
import RevenueShortcutGuideModal from '../../components/RevenueShortcutGuideModal';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../components/AuthContext';
import { useTranslation } from '../../components/LanguageContext';
import { formatVillageName } from '../../lib/villageUtils';
import SearchableSelect from '../../components/SearchableSelect';
import clsx from 'clsx';

export default function CasesPage() {
  const { hasRole } = useAuth();
  const { t, locale, isMarathi } = useTranslation();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Search & Filters (in a single row)
  const [search, setSearch] = useState('');
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [villageOptions, setVillageOptions] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [violationType, setViolationType] = useState('');
  const [status, setStatus] = useState('');
  const [isRepossessedToGovt, setIsRepossessedToGovt] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Summary Stats for KPI cards
  const [stats, setStats] = useState({
    totalCases: 0,
    activeHearings: 0,
    noticesIssued: 0,
    shasanJama: 0,
    totalDisputedAreaHa: 0,
  });

  // Expanded Rows State
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Modals & Drawers
  const [selectedCaseForHearing, setSelectedCaseForHearing] = useState(null);
  const [uploadDocCaseId, setUploadDocCaseId] = useState(null);
  const [traceUpi, setTraceUpi] = useState(null);
  const [shasanJamaCase, setShasanJamaCase] = useState(null);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);

  // Copy Feedback State
  const [copiedCaseNumber, setCopiedCaseNumber] = useState(null);

  // Search debounce ref
  const searchTimeoutRef = useRef(null);

  // Read query params from URL on mount if navigated with ?taluka=...&village=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qTaluka = urlParams.get('taluka');
      const qVillage = urlParams.get('village');
      if (qTaluka) setTaluka(qTaluka);
      if (qVillage) setVillage(qVillage);
    }
  }, []);

  // Dynamically load villages for selected taluka
  useEffect(() => {
    let isMounted = true;
    async function loadVillages() {
      setLoadingVillages(true);
      try {
        const res = await api.getTalukaVillages(taluka || 'all');
        if (isMounted) {
          setVillageOptions(res.villages || []);
        }
      } catch (err) {
        console.error('Failed to load villages list:', err);
        if (isMounted) {
          setVillageOptions([]);
        }
      } finally {
        if (isMounted) {
          setLoadingVillages(false);
        }
      }
    }
    loadVillages();
    return () => {
      isMounted = false;
    };
  }, [taluka]);

  const handleTalukaChange = (newTaluka) => {
    setTaluka(newTaluka);
    setVillage('');
  };

  const fetchCases = async (targetPage = page, customSearch = search) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit };
      if (customSearch && customSearch.trim()) params.search = customSearch.trim();
      if (taluka) params.taluka = taluka;
      if (village && village !== 'all') params.village = village;
      if (violationType) params.violationType = violationType;
      if (status) params.status = status;
      if (isRepossessedToGovt !== '') params.isRepossessedToGovt = isRepossessedToGovt;

      const data = await api.getCases(params);
      setCases(data.cases || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);

      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats((prev) => ({
          ...prev,
          totalCases: data.pagination?.total || 0,
        }));
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchCases(1, search);
  }, [taluka, village, violationType, status, isRepossessedToGovt]);

  // Handle live search with debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchCases(1, val);
    }, 300);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    fetchCases(1, '');
  };

  const handleResetFilters = () => {
    setSearch('');
    setTaluka('');
    setVillage('');
    setViolationType('');
    setStatus('');
    setIsRepossessedToGovt('');
    setPage(1);
    fetchCases(1, '');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCases(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleRowExpansion = (id) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (text) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedCaseNumber(text);
    setTimeout(() => {
      setCopiedCaseNumber(null);
    }, 2000);
  };

  const activeFiltersCount =
    (taluka ? 1 : 0) +
    (village ? 1 : 0) +
    (violationType ? 1 : 0) +
    (status ? 1 : 0) +
    (isRepossessedToGovt !== '' ? 1 : 0) +
    (search ? 1 : 0);

  const talukaSelectOptions = useMemo(() => [
    {
      value: '',
      label: isMarathi
        ? `सर्व तालुके (${CHANDRAPUR_TALUKAS.length})`
        : `All Talukas (${CHANDRAPUR_TALUKAS.length})`,
    },
    ...CHANDRAPUR_TALUKAS.map((t) => ({
      value: t.id,
      label: isMarathi ? `तालुका ${t.nameMr}` : `${t.nameEn} Taluka`,
    })),
  ], [isMarathi]);

  const villageSelectOptions = useMemo(() => [
    {
      value: '',
      label: villageOptions.length > 0
        ? (isMarathi ? `सर्व गावे (${villageOptions.length})` : `All Villages (${villageOptions.length})`)
        : (isMarathi ? 'सर्व गावे' : 'All Villages'),
    },
    ...villageOptions.map((v) => {
      const vName = typeof v === 'object' ? (v.villageName || v.name) : v;
      const count = typeof v === 'object' && v.total712Count ? `${v.total712Count}` : undefined;
      return {
        value: vName,
        label: formatVillageName(vName, isMarathi),
        count,
      };
    }),
  ], [villageOptions, isMarathi]);

  const violationSelectOptions = useMemo(() => [
    { value: '', label: isMarathi ? 'सर्व उल्लंघन प्रकार' : 'All Violation Types' },
    ...Object.entries(VIOLATION_TYPES).map(([k, v]) => ({
      value: k,
      label: isMarathi ? v.labelMr : (v.labelEn || v.labelMr),
    })),
  ], [isMarathi]);

  const statusSelectOptions = useMemo(() => [
    { value: '', label: isMarathi ? 'सर्व सद्यस्थिती' : 'All Statuses' },
    ...Object.entries(ENFORCEMENT_STATUSES).map(([k, v]) => ({
      value: k,
      label: isMarathi ? v.labelMr : (v.labelEn || v.labelMr),
    })),
  ], [isMarathi]);

  const shasanJamaSelectOptions = useMemo(() => [
    { value: '', label: isMarathi ? 'शासन जमा स्थिती' : 'Govt Repossession' },
    { value: 'true', label: isMarathi ? 'शासन जमा' : 'Govt Vested' },
    { value: 'false', label: isMarathi ? 'प्रलंबित' : 'Pending' },
  ], [isMarathi]);

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Executive Command Hero Header - Pro Compact */}
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-amber-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                {isMarathi ? 'शर्तभंग व अर्ध-न्यायिक सुनावणी कक्ष' : 'Breach & Quasi-Judicial Hearing Chamber'}
              </h1>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                {isMarathi ? 'MLRC १९६६' : 'MLRC 1966'}
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-medium">
                {isMarathi
                  ? '• SDO व तहसीलदार न्यायालयातील सुनावण्या, पंचनामे व शासन जमा आदेश (कलम ३६, ३६अ, ४४, ४५)'
                  : '• SDO & Tehsildar court hearings, panchnamas & govt repossession orders (Sec 36, 36A, 44, 45)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 md:hidden truncate font-medium">
              {isMarathi
                ? 'SDO व तहसीलदार न्यायालयातील सुनावण्या, पंचनामे व शासन जमा आदेश'
                : 'SDO & Tehsildar court hearings, panchnamas & repossession orders'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setGlossaryModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={isMarathi ? 'शर्तभंग व महसूल शब्दावली मदत' : 'Breach & Revenue Glossary Help'}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>{isMarathi ? 'शर्तभंग शब्दावली' : 'Breach Glossary'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchCases(page)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-slate-950 border border-slate-300 text-xs transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={isMarathi ? 'प्रकरणे रीफ्रेश करा' : 'Refresh cases'}
            aria-label={isMarathi ? 'प्रकरणे रीफ्रेश करा' : 'Refresh cases'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : 'text-slate-700'}`} />
          </button>
        </div>
      </div>

      {/* 5 Dedicated Executive KPI Cards with Compact Pro Styling */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {/* Metric 1: Total Cases */}
        <button
          type="button"
          onClick={() => {
            setStatus('');
            setIsRepossessedToGovt('');
          }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-98 relative overflow-hidden group cursor-pointer ${
            status === '' && isRepossessedToGovt === ''
              ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
              {isMarathi ? 'एकूण प्रकरणे' : 'Total Cases'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-900 transition-transform group-hover:scale-105">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">
            {stats.totalCases}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">
            {isMarathi ? 'नोंदवलेली सर्व प्रकरणे' : 'All registered cases'}
          </p>
        </button>

        {/* Metric 2: Active Hearings */}
        <button
          type="button"
          onClick={() => {
            setStatus('HEARING_SCHEDULED');
            setIsRepossessedToGovt('');
          }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-98 relative overflow-hidden group cursor-pointer ${
            status === 'HEARING_SCHEDULED'
              ? 'bg-indigo-50/90 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 group-hover:text-indigo-950 transition-colors">
              {isMarathi ? 'सक्रिय सुनावण्या' : 'Active Hearings'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-700 transition-transform group-hover:scale-105">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-950 mt-1 tracking-tight font-mono">
            {stats.activeHearings}
          </p>
          <p className="text-[10px] text-indigo-600 mt-0.5 font-medium truncate">
            {isMarathi ? 'बोर्डावरील सुनावण्या' : 'Hearings on daily board'}
          </p>
        </button>

        {/* Metric 3: Show Cause Notices */}
        <button
          type="button"
          onClick={() => {
            setStatus('NOTICE_ISSUED');
            setIsRepossessedToGovt('');
          }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-98 relative overflow-hidden group cursor-pointer ${
            status === 'NOTICE_ISSUED'
              ? 'bg-amber-50/90 border-amber-500 shadow-xs ring-1 ring-amber-500/30'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 group-hover:text-amber-950 transition-colors">
              {isMarathi ? 'कारणे दाखवा नोटीस' : 'Show Cause Notices'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 transition-transform group-hover:scale-105">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-950 mt-1 tracking-tight font-mono">
            {stats.noticesIssued}
          </p>
          <p className="text-[10px] text-amber-700 mt-0.5 font-medium truncate">
            {isMarathi ? 'जबाब / खुलासा प्रलंबित' : 'Reply / statement pending'}
          </p>
        </button>

        {/* Metric 4: Shasan Jama */}
        <button
          type="button"
          onClick={() => {
            setStatus('');
            setIsRepossessedToGovt('true');
          }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-98 relative overflow-hidden group cursor-pointer ${
            isRepossessedToGovt === 'true'
              ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
              : 'bg-white/95 backdrop-blur-md border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 group-hover:text-emerald-950 transition-colors">
              {isMarathi ? 'शासन जमा आदेश' : 'Govt Repossessed'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 transition-transform group-hover:scale-105">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 tracking-tight font-mono">
            {stats.shasanJama}
          </p>
          <p className="text-[10px] text-emerald-700 mt-0.5 font-medium truncate">
            {isMarathi ? 'शासकीय सदरी दाखल' : 'Vested in Govt records'}
          </p>
        </button>

        {/* Metric 5: Total Disputed Area */}
        <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs col-span-2 sm:col-span-1 relative overflow-hidden hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5 group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
              {isMarathi ? 'एकूण शर्तभंग क्षेत्र' : 'Total Breach Area'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 transition-transform group-hover:scale-105">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">
            {Number(stats.totalDisputedAreaHa || 0).toFixed(2)}{' '}
            <span className="text-xs font-bold text-slate-500">{isMarathi ? 'हेक्टर' : 'Ha'}</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">
            {isMarathi ? 'अतिक्रमित / वादग्रस्त क्षेत्र' : 'Encroached / disputed area'}
          </p>
        </div>
      </div>

      {/* Modern Filter & Search Command Toolbar */}
      <div className="relative z-20 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-2.5">
        {/* Live Search Input & Mobile Filter Toggle Button */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={
                isMarathi
                  ? 'केस क्र., गट क्र., गाव किंवा कब्जेदार शोधा...'
                  : 'Search Case No, Gat No, Village or Occupant...'
              }
              className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
                title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileFilters((p) => !p)}
            className={clsx(
              'md:hidden px-2.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-2xs cursor-pointer',
              showMobileFilters || activeFiltersCount > 0
                ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'फिल्टर्स' : 'Filters'}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', showMobileFilters && 'rotate-180')} />
          </button>
        </div>

        {/* Filter Dropdowns Suite: Collapsible on mobile, clean row on desktop */}
        <div
          className={clsx(
            'items-center gap-2 sm:gap-2.5',
            showMobileFilters
              ? 'grid grid-cols-1 sm:grid-cols-2 pt-2 border-t border-slate-100 md:border-t-0 md:pt-0 md:flex md:flex-wrap lg:flex-nowrap'
              : 'hidden md:flex md:flex-wrap lg:flex-nowrap'
          )}
        >
          {/* Taluka Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[140px] sm:max-w-[190px]">
            <SearchableSelect
              options={talukaSelectOptions}
              value={taluka}
              onChange={(val) => handleTalukaChange(val)}
              placeholder={isMarathi ? 'सर्व तालुके' : 'All Talukas'}
              searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
              showCount={false}
            />
          </div>

          {/* Village Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[140px] sm:max-w-[190px]">
            <SearchableSelect
              options={villageSelectOptions}
              value={village}
              onChange={(val) => setVillage(val)}
              placeholder={isMarathi ? 'सर्व गावे' : 'All Villages'}
              searchPlaceholder={isMarathi ? 'गाव शोधा...' : 'Search village...'}
              disabled={loadingVillages}
              showCount={false}
            />
          </div>

          {/* Violation Type Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[160px] sm:max-w-[210px]">
            <SearchableSelect
              options={violationSelectOptions}
              value={violationType}
              onChange={(val) => setViolationType(val)}
              placeholder={isMarathi ? 'सर्व उल्लंघन प्रकार' : 'All Violation Types'}
              searchPlaceholder={isMarathi ? 'उल्लंघन शोधा...' : 'Search violation...'}
              showCount={false}
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[145px] sm:max-w-[185px]">
            <SearchableSelect
              options={statusSelectOptions}
              value={status}
              onChange={(val) => setStatus(val)}
              placeholder={isMarathi ? 'सर्व सद्यस्थिती' : 'All Statuses'}
              searchPlaceholder={isMarathi ? 'स्थिती शोधा...' : 'Search status...'}
              showCount={false}
            />
          </div>

          {/* Shasan Jama Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[140px] sm:max-w-[175px]">
            <SearchableSelect
              options={shasanJamaSelectOptions}
              value={isRepossessedToGovt}
              onChange={(val) => setIsRepossessedToGovt(val)}
              placeholder={isMarathi ? 'शासन जमा स्थिती' : 'Govt Repossession'}
              searchPlaceholder={isMarathi ? 'शोधा...' : 'Search...'}
              showCount={false}
            />
          </div>

          {/* Reset Filter Button if active */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition shrink-0 flex items-center justify-center gap-1 text-xs font-bold w-full sm:w-auto cursor-pointer"
              title={isMarathi ? 'सर्व फिल्टर्स साफ करा' : 'Clear all filters'}
              aria-label={isMarathi ? 'सर्व फिल्टर्स साफ करा' : 'Clear all filters'}
            >
              <X className="w-3.5 h-3.5" />
              <span className="md:hidden">{isMarathi ? 'फिल्टर्स साफ करा' : 'Clear filters'}</span>
              <span className="hidden xl:inline">{isMarathi ? 'साफ करा' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Table Card (Modern Executive Grid) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 border border-blue-200/80 flex items-center justify-center text-blue-900 shrink-0 shadow-2xs">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                {isMarathi ? 'प्रकरण नोंदवही व सुनावणी तक्ता' : 'Case Register & Hearing Table'}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                {totalCount} {isMarathi ? 'नोंदणी' : 'Records'}
              </span>
              {village && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {isMarathi ? `गाव: ${formatVillageName(village, true)}` : `Village: ${formatVillageName(village, false)}`}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {isMarathi ? 'MLRC १९६६ अर्ध-न्यायिक प्रकरणे' : 'MLRC 1966 Quasi-Judicial Cases'}
            </span>
            <span className="text-[10px] text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 sm:hidden font-bold">
              {isMarathi ? 'स्मार्ट कार्ड सूची' : 'Smart Case Cards'}
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-blue-900 border-t-amber-500 rounded-full animate-spin mx-auto mb-2.5" />
            <p className="text-xs font-bold text-slate-600">
              {isMarathi
                ? 'प्रकरणे व सुनावणी नोंदी लोड होत आहेत...'
                : 'Loading cases and hearing records...'}
            </p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isMarathi ? 'कोणतीही प्रकरणे आढळली नाहीत' : 'No cases found'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                {isMarathi
                  ? 'आपण निवडलेल्या शोध किंवा फिल्टर निकषांनुसार कोणतेही प्रकरण सापडले नाही.'
                  : 'No case matches your selected search or filter criteria.'}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'फिल्टर्स साफ करा' : 'Clear filters'}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Native Card List (md:hidden) - Zero Action Button Overlap */}
            <div className="md:hidden divide-y divide-slate-100">
              {cases.map((c, index) => {
                const viol = VIOLATION_TYPES[c.violationType];
                const stat = ENFORCEMENT_STATUSES[c.status];
                const latestHearing = c.hearings && c.hearings[0];
                const isCopied = copiedCaseNumber === c.caseNumber;
                const hasProceedings = Boolean((c.hearings && c.hearings.length > 0) || c.finalOrderDetails);
                const isExpanded = hasProceedings && expandedRowIds.has(c.id);
                const rowNumber = (page - 1) * limit + index + 1;

                return (
                  <div key={c.id} className="p-3.5 bg-white space-y-2.5">
                    {/* Card Header: Case No & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-400">#{rowNumber}</span>
                        <span className="font-mono text-xs font-black text-slate-900 tracking-tight select-all truncate max-w-[210px]">
                          {c.caseNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(c.caseNumber)}
                          className="text-slate-400 hover:text-blue-900 p-0.5 rounded-md shrink-0 cursor-pointer"
                          title={isMarathi ? 'कॉपी करा' : 'Copy'}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          stat?.color || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.isRepossessedToGovt
                              ? 'bg-emerald-500 animate-pulse'
                              : c.status === 'HEARING_SCHEDULED'
                              ? 'bg-indigo-500'
                              : c.status === 'NOTICE_ISSUED'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>{isMarathi ? (stat?.labelMr || c.status) : (stat?.labelEn || stat?.labelMr || c.status)}</span>
                      </span>
                    </div>

                    {/* Violations & Govt Vested Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight border ${
                          viol?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isMarathi ? (viol?.labelMr || c.violationType) : (viol?.labelEn || viol?.labelMr || c.violationType)}
                      </span>
                      {c.isRepossessedToGovt && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{isMarathi ? 'शासन जमा' : 'Govt Vested'}</span>
                        </span>
                      )}
                    </div>

                    {/* 2-Column Info Grid */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/90 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">{isMarathi ? 'गाव व गट क्र.' : 'Village & Gat'}</div>
                        <div className="font-bold text-slate-900 truncate mt-0.5">{c.parcel?.villageName ? formatVillageName(c.parcel.villageName, isMarathi) : '—'}</div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600 mt-0.5">
                          <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded font-bold text-slate-800">
                            {isMarathi ? `गट ${c.parcel?.gatNumber || '—'}` : `Gat ${c.parcel?.gatNumber || '—'}`}
                          </span>
                          {c.parcel?.taluka && <span className="text-slate-400 text-[10px]">• {c.parcel.taluka}</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">{isMarathi ? 'कब्जेदार व क्षेत्र' : 'Occupant & Area'}</div>
                        <div className="font-bold text-slate-900 truncate mt-0.5" title={c.occupantName}>
                          {c.occupantName || (isMarathi ? 'तपासणी सुरू' : 'Inquiry ongoing')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {isMarathi ? 'शर्तभंग: ' : 'Breach: '}
                          <span className="font-mono font-bold text-rose-700">
                            {Number(c.encroachedAreaHa || 0).toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Next Hearing / Order Date banner if scheduled */}
                    {latestHearing?.nextHearingDate ? (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-800 bg-indigo-50/80 border border-indigo-200/80 px-2.5 py-1.5 rounded-xl font-bold">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          {isMarathi ? 'पुढील सुनावणी: ' : 'Next Hearing: '}
                          {new Date(latestHearing.nextHearingDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                        </span>
                      </div>
                    ) : c.orderDate ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl font-bold">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {isMarathi ? 'आदेश दिनांक: ' : 'Order Date: '}
                          {new Date(c.orderDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                        </span>
                      </div>
                    ) : null}

                    {/* Clean Action Row (ZERO OVERLAP) */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCaseForHearing(c)}
                        className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                        title={isMarathi ? 'सुनावणी / रोजनामा नोंदवा' : 'Record Hearing'}
                      >
                        <Scale className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="truncate">{isMarathi ? 'सुनावणी नोंदवा' : 'Record Hearing'}</span>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setTraceUpi(c.parcel?.upi)}
                          className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
                          title={isMarathi ? 'इतिहास व फेरफार पहा' : 'View History'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setUploadDocCaseId(c.id)}
                          className="relative w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
                          title={isMarathi ? 'कागदपत्रे अपलोड' : 'Upload Documents'}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {c.documents?.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </button>

                        {!c.isRepossessedToGovt && hasRole('COLLECTOR', 'SDO') && (
                          <button
                            type="button"
                            onClick={() => setShasanJamaCase(c)}
                            className="w-8 h-8 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
                            title={isMarathi ? 'शासन जमा आदेश पारित करा' : 'Repossess'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {hasProceedings && (
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(c.id)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                              isExpanded
                                ? 'bg-blue-900 text-white'
                                : 'bg-blue-50 text-blue-900 border border-blue-200'
                            }`}
                            title={isMarathi ? 'रोजनामा तपशील पहा' : 'View roznama'}
                          >
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Expandable Dossier */}
                    {isExpanded && hasProceedings && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center gap-1 text-blue-900">
                            <Scale className="w-3.5 h-3.5" />
                            <span>{isMarathi ? 'न्यायालयीन रोजनामा' : 'Hearing Roznama'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {c.investigatingOfficer || (isMarathi ? 'नायब तहसीलदार' : 'Naib Tehsildar')}
                          </span>
                        </div>

                        {c.hearings?.length > 0 && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                            {c.hearings.map((h, hIdx) => (
                              <div
                                key={h.id || hIdx}
                                className="p-2 bg-blue-50/40 rounded-xl border border-blue-100 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-800">{h.authority}</span>
                                  <span className="font-mono text-slate-500">
                                    {new Date(h.hearingDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                  </span>
                                </div>
                                {h.proceedingsSummary && (
                                  <p className="text-[11px] text-slate-600 leading-snug">{h.proceedingsSummary}</p>
                                )}
                                {h.nextHearingDate && (
                                  <div className="text-[10px] text-indigo-700 font-bold flex items-center gap-1 pt-0.5">
                                    <Clock className="w-3 h-3 text-indigo-500" />
                                    <span>
                                      {isMarathi ? 'पुढील तारीख: ' : 'Next: '}
                                      {new Date(h.nextHearingDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {c.finalOrderDetails && (
                          <div className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-emerald-900">{isMarathi ? 'अंतिम आदेश' : 'Final Order'}</span>
                              {c.orderDate && (
                                <span className="font-mono text-emerald-700">
                                  {new Date(c.orderDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-700 leading-snug">{c.finalOrderDetails}</p>
                          </div>
                        )}

                        {c.documents?.length > 0 && (
                          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-500">{isMarathi ? 'कागदपत्रे:' : 'Docs:'}</span>
                            {c.documents.map((d, dIdx) => (
                              <a
                                key={d.id || dIdx}
                                href={d.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-medium"
                              >
                                <FileText className="w-2.5 h-2.5 text-blue-700" />
                                <span className="truncate max-w-[120px]">{d.title}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Full Table (hidden md:block) with Generous Action Column */}
            <div className="hidden md:block w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full border-collapse text-xs min-w-[960px]">
                {/* Native Table Head with Balanced Proportions */}
                <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200/90 select-none">
                  <tr>
                    <th scope="col" className="py-3 px-2 w-[4%] min-w-[42px] text-center">
                      #
                    </th>
                    <th scope="col" className="py-3 px-3.5 w-[22%] text-left">
                      {isMarathi ? 'केस क्र. व प्रकार' : 'Case No. & Type'}
                    </th>
                    <th scope="col" className="py-3 px-3.5 w-[16%] text-left">
                      {isMarathi ? 'गाव व गट क्र.' : 'Village & Gat No.'}
                    </th>
                    <th scope="col" className="py-3 px-3.5 w-[20%] text-left">
                      {isMarathi ? 'कब्जेदार व क्षेत्र' : 'Occupant & Area'}
                    </th>
                    <th scope="col" className="py-3 px-3.5 w-[18%] text-left">
                      {isMarathi ? 'सद्यस्थिती व सुनावणी' : 'Status & Hearing'}
                    </th>
                    <th scope="col" className="py-3 px-3.5 w-[20%] min-w-[195px] text-right pr-4">
                      {isMarathi ? 'कारवाई' : 'Actions'}
                    </th>
                  </tr>
                </thead>

              {/* Native Table Body */}
              <tbody className="divide-y divide-slate-100">
                {cases.map((c, index) => {
                  const viol = VIOLATION_TYPES[c.violationType];
                  const stat = ENFORCEMENT_STATUSES[c.status];
                  const latestHearing = c.hearings && c.hearings[0];
                  const isCopied = copiedCaseNumber === c.caseNumber;
                  const hasProceedings = Boolean((c.hearings && c.hearings.length > 0) || c.finalOrderDetails);
                  const isExpanded = hasProceedings && expandedRowIds.has(c.id);
                  const rowNumber = (page - 1) * limit + index + 1;

                  return (
                    <React.Fragment key={c.id}>
                      {/* Main Table Row */}
                      <tr
                        className={`transition-colors duration-150 ${
                          isExpanded
                            ? 'bg-blue-50/50 border-l-4 border-l-blue-900'
                            : index % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/40'
                        } hover:bg-blue-50/30`}
                      >
                        {/* Col 1: Sr No & Expand Button (Only for cases with hearings/orders) */}
                        <td className="py-3 px-2 text-center align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                            {hasProceedings ? (
                              <button
                                type="button"
                                onClick={() => toggleRowExpansion(c.id)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                  isExpanded
                                    ? 'bg-blue-900 text-white shadow-2xs'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/70'
                                }`}
                                title={
                                  isExpanded
                                    ? isMarathi
                                      ? 'सुनावणी बंद करा'
                                      : 'Collapse hearings'
                                    : isMarathi
                                    ? `सुनावणी रोजनामा पहा (${c.hearings?.length || 0})`
                                    : `View hearing log (${c.hearings?.length || 0})`
                                }
                              >
                                <ChevronRight
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>
                            ) : null}
                            <span className="font-mono text-[11px] font-bold text-slate-400">
                              {rowNumber}
                            </span>
                          </div>
                        </td>

                        {/* Col 2: Case No & Violation */}
                        <td className="py-3 px-3.5 align-middle">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-black text-slate-900 select-all tracking-tight hover:text-blue-900 transition">
                                {c.caseNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(c.caseNumber)}
                                className="text-slate-400 hover:text-blue-900 p-0.5 rounded-md transition shrink-0 cursor-pointer"
                                title={
                                  isCopied
                                    ? isMarathi
                                      ? 'कॉपी झाले!'
                                      : 'Copied!'
                                    : isMarathi
                                    ? 'केस क्र. कॉपी करा'
                                    : 'Copy Case No.'
                                }
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full leading-tight border shadow-2xs ${
                                  viol?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {isMarathi ? (viol?.labelMr || c.violationType) : (viol?.labelEn || viol?.labelMr || c.violationType)}
                              </span>
                              {c.isRepossessedToGovt && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0 shadow-2xs">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>{isMarathi ? 'शासन जमा' : 'Govt Vested'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Col 3: Village, Gat & Taluka */}
                        <td className="py-3 px-3.5 align-middle">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 text-xs">
                              {c.parcel?.villageName ? formatVillageName(c.parcel.villageName, isMarathi) : '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200/80 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
                                {isMarathi ? `गट ${c.parcel?.gatNumber || '—'}` : `Gat ${c.parcel?.gatNumber || '—'}`}
                              </span>
                              {c.parcel?.taluka && (
                                <span className="text-slate-400 font-medium">• {c.parcel.taluka}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Col 4: Occupant & Disputed Area */}
                        <td className="py-3 px-3.5 align-middle">
                          <div className="space-y-1">
                            <p
                              className="font-bold text-slate-900 text-xs leading-snug truncate"
                              title={c.occupantName || (isMarathi ? 'तपासणी सुरू' : 'Inquiry ongoing')}
                            >
                              {c.occupantName || (isMarathi ? 'अज्ञात (नोंद अपूर्ण)' : 'Unknown (Incomplete record)')}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {isMarathi ? 'शर्तभंग: ' : 'Breach: '}
                              <span className="font-mono font-bold text-slate-900">
                                {Number(c.encroachedAreaHa || 0).toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}
                              </span>
                            </p>
                          </div>
                        </td>

                        {/* Col 5: Status & Next Hearing Date */}
                        <td className="py-3 px-3.5 align-middle">
                          <div className="space-y-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                                stat?.color || 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  c.isRepossessedToGovt
                                    ? 'bg-emerald-500 animate-pulse'
                                    : c.status === 'HEARING_SCHEDULED'
                                    ? 'bg-indigo-500'
                                    : c.status === 'NOTICE_ISSUED'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400'
                                }`}
                              ></span>
                              <span>{isMarathi ? (stat?.labelMr || c.status) : (stat?.labelEn || stat?.labelMr || c.status)}</span>
                            </span>
                            {latestHearing?.nextHearingDate ? (
                              <div className="flex items-center gap-1 text-[10px] text-indigo-700 font-bold">
                                <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span>
                                  {isMarathi ? 'पुढील: ' : 'Next: '}
                                  {new Date(latestHearing.nextHearingDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                </span>
                              </div>
                            ) : c.orderDate ? (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>
                                  {isMarathi ? 'आदेश: ' : 'Order: '}
                                  {new Date(c.orderDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* Col 6: Actions */}
                        <td className="py-3 px-3.5 text-right align-middle pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCaseForHearing(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 shrink-0 cursor-pointer"
                              title={isMarathi ? 'सुनावणी / रोजनामा नोंदवा' : 'Record Hearing / Roznama'}
                            >
                              <Scale className="w-3.5 h-3.5 text-amber-300" />
                              <span>{isMarathi ? 'सुनावणी' : 'Hearing'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTraceUpi(c.parcel?.upi)}
                              className="w-8 h-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100/90 text-slate-500 hover:text-slate-900 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                              title={isMarathi ? '१९५० जुना इतिहास व फेरफार' : '1950 Title History & Mutations'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setUploadDocCaseId(c.id)}
                              className="relative w-8 h-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100/90 text-slate-500 hover:text-slate-900 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                              title={
                                isMarathi
                                  ? `कागदपत्रे / पुरावे अपलोड (${c.documents?.length || 0} उपलब्ध)`
                                  : `Upload Documents / Evidence (${c.documents?.length || 0} available)`
                              }
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {c.documents?.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </button>

                            {!c.isRepossessedToGovt && hasRole('COLLECTOR', 'SDO') && (
                              <button
                                type="button"
                                onClick={() => setShasanJamaCase(c)}
                                className="w-8 h-8 rounded-xl border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 hover:text-rose-800 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                                title={isMarathi ? 'शासन जमा आदेश पारित करा' : 'Issue Govt Repossession Order'}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Judicial Proceedings Dossier: Rendered ONLY when hearings or final orders exist */}
                      {isExpanded && hasProceedings && (
                        <tr className="bg-blue-50/20 border-b border-slate-200">
                          <td colSpan={6} className="px-3 sm:px-6 py-3">
                            <div className="bg-white border border-blue-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                              {/* Dossier Header Strip */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                  <Scale className="w-4 h-4 text-blue-700" />
                                  <span>
                                    {isMarathi
                                      ? `न्यायालयीन रोजनामा व आदेश तपशील (${c.caseNumber})`
                                      : `Judicial Proceedings & Order Dossier (${c.caseNumber})`}
                                  </span>
                                </span>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                  <span>
                                    {isMarathi ? 'तपास अधिकारी: ' : 'Investigating Officer: '}
                                    <strong className="text-slate-800 font-semibold">
                                      {c.investigatingOfficer || (isMarathi ? 'नायब तहसीलदार' : 'Naib Tehsildar')}
                                    </strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {isMarathi ? 'प्रवर्ग: ' : 'Category: '}
                                    <strong className="text-slate-800 font-semibold">
                                      {c.prapatraCategory || (isMarathi ? 'प्रपत्र ३/४' : 'Prapatra 3/4')}
                                    </strong>
                                  </span>
                                </div>
                              </div>

                              {/* Active Hearings / Final Orders Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {/* Hearings Section */}
                                {c.hearings?.length > 0 && (
                                  <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200/50">
                                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                        <Scale className="w-3.5 h-3.5 text-blue-700" />
                                        <span>
                                          {isMarathi
                                            ? `सुनावणी रोजनामा (${c.hearings.length})`
                                            : `Hearing Roznama (${c.hearings.length})`}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                      {c.hearings.map((h, hIdx) => (
                                        <div key={h.id || hIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                                          <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-bold text-slate-800">{h.authority}</span>
                                            <span className="font-mono text-slate-500">
                                              {isMarathi ? 'दि.: ' : 'Date: '}
                                              {new Date(h.hearingDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                            </span>
                                          </div>
                                          <p className="text-slate-700 text-[11px] leading-relaxed">{h.proceedingsLog}</p>
                                          {h.nextHearingDate && (
                                            <span className="text-[10px] text-indigo-700 font-semibold inline-block">
                                              {isMarathi ? 'पुढील सुनावणी: ' : 'Next Hearing: '}
                                              {new Date(h.nextHearingDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Final Order Section */}
                                {c.finalOrderDetails && (
                                  <div className="p-3 bg-amber-50/40 border border-amber-200/70 rounded-xl">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/50">
                                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                                        <span>
                                          {isMarathi ? 'न्यायालयीन अंतिम आदेश व निर्णय' : 'Judicial Final Order & Judgment'}
                                        </span>
                                      </span>
                                      {c.orderDate && (
                                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                                          {isMarathi ? 'दि.: ' : 'Date: '}
                                          {new Date(c.orderDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-medium text-slate-800 text-[11px] leading-relaxed">
                                      {c.finalOrderDetails}
                                    </p>
                                    {c.isRepossessedToGovt && (
                                      <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] mt-2 border border-emerald-200">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                        {isMarathi
                                          ? 'जमीन शासकीय कब्जात प्रत्यार्पित (शासन जमा)'
                                          : 'Land vested in Government custody (Govt Repossessed)'}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Attached Evidence & Documents */}
                              {c.documents?.length > 0 && (
                                <div className="flex items-center gap-2 text-[11px] pt-2 border-t border-slate-100 flex-wrap">
                                  <span className="font-bold text-slate-600">
                                    {isMarathi ? 'संलग्न पुरावे व दस्तऐवज:' : 'Attached Evidence & Documents:'}
                                  </span>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {c.documents.map((d, dIdx) => (
                                      <a
                                        key={d.id || dIdx}
                                        href={d.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 font-medium text-[11px] transition"
                                      >
                                        <FileText className="w-3 h-3 text-blue-700" />
                                        <span className="truncate max-w-[140px]">{d.title}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Table Footer with Pagination */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-500">
            {isMarathi ? (
              <>
                एकूण <strong className="text-slate-800">{totalCount}</strong> पैकी{' '}
                <strong className="text-slate-800">
                  {cases.length > 0 ? (page - 1) * limit + 1 : 0}
                </strong>{' '}
                ते{' '}
                <strong className="text-slate-800">
                  {Math.min(page * limit, totalCount)}
                </strong>{' '}
                प्रकरणे
              </>
            ) : (
              <>
                Showing{' '}
                <strong className="text-slate-800">
                  {cases.length > 0 ? (page - 1) * limit + 1 : 0}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-800">
                  {Math.min(page * limit, totalCount)}
                </strong>{' '}
                of <strong className="text-slate-800">{totalCount}</strong> cases
              </>
            )}
          </p>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Formal Shasan Jama Order Modal */}
      {shasanJamaCase && (
        <ShasanJamaModal
          isOpen={Boolean(shasanJamaCase)}
          onClose={() => setShasanJamaCase(null)}
          caseItem={shasanJamaCase}
          onSuccess={() => fetchCases(page)}
        />
      )}

      {/* Add Hearing Modal */}
      {selectedCaseForHearing && (
        <AddHearingModal
          isOpen={Boolean(selectedCaseForHearing)}
          onClose={() => setSelectedCaseForHearing(null)}
          caseItem={selectedCaseForHearing}
          onHearingAdded={() => fetchCases(page)}
        />
      )}

      {/* Doc Upload Modal for Case */}
      {uploadDocCaseId && (
        <DocUploadModal
          isOpen={Boolean(uploadDocCaseId)}
          onClose={() => setUploadDocCaseId(null)}
          caseId={uploadDocCaseId}
          onUploadSuccess={() => fetchCases(page)}
        />
      )}

      {/* 360 Trace Drawer */}
      {traceUpi && (
        <ParcelTraceDrawer
          upi={traceUpi}
          onClose={() => setTraceUpi(null)}
          onRefresh={() => fetchCases(page)}
        />
      )}

      {/* Revenue Glossary Modal */}
      <RevenueShortcutGuideModal
        isOpen={glossaryModalOpen}
        onClose={() => setGlossaryModalOpen(false)}
        initialCategory="VIOLATION"
      />
    </div>
  );
}
