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
import SearchableSelect from '../../components/SearchableSelect';

export default function CasesPage() {
  const { hasRole } = useAuth();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Search & Filters (in a single row)
  const [search, setSearch] = useState('');
  const [taluka, setTaluka] = useState('');
  const [violationType, setViolationType] = useState('');
  const [status, setStatus] = useState('');
  const [isRepossessedToGovt, setIsRepossessedToGovt] = useState('');

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

  const fetchCases = async (targetPage = page, customSearch = search) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit };
      if (customSearch && customSearch.trim()) params.search = customSearch.trim();
      if (taluka) params.taluka = taluka;
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
  }, [taluka, violationType, status, isRepossessedToGovt]);

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
    (violationType ? 1 : 0) +
    (status ? 1 : 0) +
    (isRepossessedToGovt !== '' ? 1 : 0) +
    (search ? 1 : 0);

  const talukaSelectOptions = useMemo(() => [
    { value: '', label: `सर्व तालुके (${CHANDRAPUR_TALUKAS.length})` },
    ...CHANDRAPUR_TALUKAS.map((t) => ({
      value: t.id,
      label: `${t.nameMr} (${t.nameEn})`
    }))
  ], []);

  const violationSelectOptions = useMemo(() => [
    { value: '', label: 'सर्व उल्लंघन प्रकार' },
    ...Object.entries(VIOLATION_TYPES).map(([k, v]) => ({
      value: k,
      label: v.labelMr
    }))
  ], []);

  const statusSelectOptions = useMemo(() => [
    { value: '', label: 'सर्व सद्यस्थिती' },
    ...Object.entries(ENFORCEMENT_STATUSES).map(([k, v]) => ({
      value: k,
      label: v.labelMr
    }))
  ], []);

  const shasanJamaSelectOptions = useMemo(() => [
    { value: '', label: 'शासन जमा स्थिती' },
    { value: 'true', label: 'शासन जमा' },
    { value: 'false', label: 'प्रलंबित' }
  ], []);

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
                शर्तभंग व अर्ध-न्यायिक सुनावणी कक्ष
              </h1>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                MLRC १९६६
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-medium">
                • SDO व तहसीलदार न्यायालयातील सुनावण्या, पंचनामे व शासन जमा आदेश (कलम ३६, ३६अ, ४४, ४५)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 md:hidden truncate font-medium">
              SDO व तहसीलदार न्यायालयातील सुनावण्या, पंचनामे व शासन जमा आदेश
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setGlossaryModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title="शर्तभंग व महसूल शब्दावली मदत"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>शर्तभंग शब्दावली</span>
          </button>

          <button
            type="button"
            onClick={() => fetchCases(page)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-slate-950 border border-slate-300 text-xs transition-all active:scale-95 shadow-2xs cursor-pointer"
            title="प्रकरणे रीफ्रेश करा"
            aria-label="प्रकरणे रीफ्रेश करा"
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
            <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">एकूण प्रकरणे</span>
            <div className="w-6 h-6 rounded-lg bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-900 transition-transform group-hover:scale-105">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">
            {stats.totalCases}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">नोंदवलेली सर्व प्रकरणे</p>
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
            <span className="text-[11px] font-bold text-indigo-900 group-hover:text-indigo-950 transition-colors">सक्रिय सुनावण्या</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-700 transition-transform group-hover:scale-105">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-950 mt-1 tracking-tight font-mono">
            {stats.activeHearings}
          </p>
          <p className="text-[10px] text-indigo-600 mt-0.5 font-medium truncate">बोर्डावरील सुनावण्या</p>
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
            <span className="text-[11px] font-bold text-amber-900 group-hover:text-amber-950 transition-colors">कारणे दाखवा नोटीस</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 transition-transform group-hover:scale-105">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-950 mt-1 tracking-tight font-mono">
            {stats.noticesIssued}
          </p>
          <p className="text-[10px] text-amber-700 mt-0.5 font-medium truncate">जबाब / खुलासा प्रलंबित</p>
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
            <span className="text-[11px] font-bold text-emerald-900 group-hover:text-emerald-950 transition-colors">शासन जमा आदेश</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 transition-transform group-hover:scale-105">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 tracking-tight font-mono">
            {stats.shasanJama}
          </p>
          <p className="text-[10px] text-emerald-700 mt-0.5 font-medium truncate">शासकीय सदरी दाखल</p>
        </button>

        {/* Metric 5: Total Disputed Area */}
        <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs col-span-2 sm:col-span-1 relative overflow-hidden hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5 group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-600" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">एकूण शर्तभंग क्षेत्र</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 transition-transform group-hover:scale-105">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">
            {Number(stats.totalDisputedAreaHa || 0).toFixed(2)}{' '}
            <span className="text-xs font-bold text-slate-500">हेक्टर</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">अतिक्रमित / वादग्रस्त क्षेत्र</p>
        </div>
      </div>

      {/* Modern Filter & Search Command Toolbar */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-xl p-2.5 shadow-xs flex items-center gap-2.5 flex-wrap lg:flex-nowrap">
        {/* Live Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="केस क्र., गट क्र., गाव किंवा कब्जेदार शोधा..."
            className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
              title="शोध साफ करा"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Taluka Dropdown */}
        <div className="w-full sm:w-auto min-w-[155px] max-w-[195px]">
          <SearchableSelect
            options={talukaSelectOptions}
            value={taluka}
            onChange={(val) => setTaluka(val)}
            placeholder="सर्व तालुके"
            searchPlaceholder="तालुका शोधा..."
            showCount={false}
          />
        </div>

        {/* Violation Type Dropdown */}
        <div className="w-full sm:w-auto min-w-[165px] max-w-[205px]">
          <SearchableSelect
            options={violationSelectOptions}
            value={violationType}
            onChange={(val) => setViolationType(val)}
            placeholder="सर्व उल्लंघन प्रकार"
            searchPlaceholder="उल्लंघन शोधा..."
            showCount={false}
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-auto min-w-[145px] max-w-[185px]">
          <SearchableSelect
            options={statusSelectOptions}
            value={status}
            onChange={(val) => setStatus(val)}
            placeholder="सर्व सद्यस्थिती"
            searchPlaceholder="स्थिती शोधा..."
            showCount={false}
          />
        </div>

        {/* Shasan Jama Dropdown */}
        <div className="w-full sm:w-auto min-w-[145px] max-w-[175px]">
          <SearchableSelect
            options={shasanJamaSelectOptions}
            value={isRepossessedToGovt}
            onChange={(val) => setIsRepossessedToGovt(val)}
            placeholder="शासन जमा स्थिती"
            searchPlaceholder="शोधा..."
            showCount={false}
          />
        </div>

        {/* Reset Filter Button if active */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition shrink-0 flex items-center gap-1 text-xs font-bold"
            title="सर्व फिल्टर्स साफ करा"
            aria-label="सर्व फिल्टर्स साफ करा"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">साफ करा</span>
          </button>
        )}
      </div>

      {/* Enhanced Table Card (Modern Executive Grid) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 border border-blue-200/80 flex items-center justify-center text-blue-900 shrink-0 shadow-2xs">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                प्रकरण नोंदवही व सुनावणी तक्ता
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                {totalCount} नोंदणी
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            MLRC १९६६ अर्ध-न्यायिक प्रकरणे
          </span>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-blue-900 border-t-amber-500 rounded-full animate-spin mx-auto mb-2.5" />
            <p className="text-xs font-bold text-slate-600">
              प्रकरणे व सुनावणी नोंदी लोड होत आहेत...
            </p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">कोणतीही प्रकरणे आढळली नाहीत</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                आपण निवडलेल्या शोध किंवा फिल्टर निकषांनुसार कोणतेही प्रकरण सापडले नाही.
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>फिल्टर्स साफ करा</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse table-fixed text-xs">
              {/* Native Table Head with Balanced Proportions */}
              <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200/90 select-none">
                <tr>
                  <th scope="col" className="py-3 px-2 w-[4%] min-w-[42px] text-center">
                    #
                  </th>
                  <th scope="col" className="py-3 px-3.5 w-[24%] text-left">
                    केस क्र. व प्रकार
                  </th>
                  <th scope="col" className="py-3 px-3.5 w-[18%] text-left">
                    गाव व गट क्र.
                  </th>
                  <th scope="col" className="py-3 px-3.5 w-[22%] text-left">
                    कब्जेदार व क्षेत्र
                  </th>
                  <th scope="col" className="py-3 px-3.5 w-[18%] text-left">
                    सद्यस्थिती व सुनावणी
                  </th>
                  <th scope="col" className="py-3 px-3.5 w-[14%] text-right pr-4">
                    कारवाई
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
                                title={isExpanded ? 'सुनावणी बंद करा' : `सुनावणी रोजनामा पहा (${c.hearings?.length || 1})`}
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
                                title={isCopied ? 'कॉपी झाले!' : 'केस क्र. कॉपी करा'}
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
                                {viol?.labelMr || c.violationType}
                              </span>
                              {c.isRepossessedToGovt && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0 shadow-2xs">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>शासन जमा</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Col 3: Village, Gat & Taluka */}
                        <td className="py-3 px-3.5 align-middle">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 text-xs">
                              {c.parcel?.villageName || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200/80 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
                                गट {c.parcel?.gatNumber || '—'}
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
                              title={c.occupantName || 'तपासणी सुरू'}
                            >
                              {c.occupantName || 'अज्ञात (नोंद अपूर्ण)'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              शर्तभंग: <span className="font-mono font-bold text-slate-900">{Number(c.encroachedAreaHa || 0).toFixed(4)} हे.</span>
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
                              <span className={`w-1.5 h-1.5 rounded-full ${c.isRepossessedToGovt ? 'bg-emerald-500 animate-pulse' : c.status === 'HEARING_SCHEDULED' ? 'bg-indigo-500' : c.status === 'NOTICE_ISSUED' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                              <span>{stat?.labelMr || c.status}</span>
                            </span>
                            {latestHearing?.nextHearingDate ? (
                              <div className="flex items-center gap-1 text-[10px] text-indigo-700 font-bold">
                                <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span>
                                  पुढील: {new Date(latestHearing.nextHearingDate).toLocaleDateString('mr-IN')}
                                </span>
                              </div>
                            ) : c.orderDate ? (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>
                                  आदेश: {new Date(c.orderDate).toLocaleDateString('mr-IN')}
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
                              title="सुनावणी / रोजनामा नोंदवा"
                            >
                              <Scale className="w-3.5 h-3.5 text-amber-300" />
                              <span>सुनावणी</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTraceUpi(c.parcel?.upi)}
                              className="w-8 h-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100/90 text-slate-500 hover:text-slate-900 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                              title="१९५० जुना इतिहास व फेरफार"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setUploadDocCaseId(c.id)}
                              className="relative w-8 h-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100/90 text-slate-500 hover:text-slate-900 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                              title={`कागदपत्रे / पुरावे अपलोड (${c.documents?.length || 0} उपलब्ध)`}
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
                                title="शासन जमा आदेश पारित करा"
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
                                  <span>न्यायालयीन रोजनामा व आदेश तपशील ({c.caseNumber})</span>
                                </span>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                  <span>तपास अधिकारी: <strong className="text-slate-800 font-semibold">{c.investigatingOfficer || 'नायब तहसीलदार'}</strong></span>
                                  <span>•</span>
                                  <span>प्रवर्ग: <strong className="text-slate-800 font-semibold">{c.prapatraCategory || 'प्रपत्र ३/४'}</strong></span>
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
                                        <span>सुनावणी रोजनामा ({c.hearings.length})</span>
                                      </span>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                      {c.hearings.map((h, hIdx) => (
                                        <div key={h.id || hIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                                          <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-bold text-slate-800">{h.authority}</span>
                                            <span className="font-mono text-slate-500">
                                              दि.: {new Date(h.hearingDate).toLocaleDateString('mr-IN')}
                                            </span>
                                          </div>
                                          <p className="text-slate-700 text-[11px] leading-relaxed">{h.proceedingsLog}</p>
                                          {h.nextHearingDate && (
                                            <span className="text-[10px] text-indigo-700 font-semibold inline-block">
                                              पुढील सुनावणी: {new Date(h.nextHearingDate).toLocaleDateString('mr-IN')}
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
                                        <span>न्यायालयीन अंतिम आदेश व निर्णय</span>
                                      </span>
                                      {c.orderDate && (
                                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                                          दि.: {new Date(c.orderDate).toLocaleDateString('mr-IN')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-medium text-slate-800 text-[11px] leading-relaxed">
                                      {c.finalOrderDetails}
                                    </p>
                                    {c.isRepossessedToGovt && (
                                      <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] mt-2 border border-emerald-200">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                        जमीन शासकीय कब्जात प्रत्यार्पित (शासन जमा)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Attached Evidence & Documents */}
                              {c.documents?.length > 0 && (
                                <div className="flex items-center gap-2 text-[11px] pt-2 border-t border-slate-100 flex-wrap">
                                  <span className="font-bold text-slate-600">संलग्न पुरावे व दस्तऐवज:</span>
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
        )}

        {/* Table Footer with Pagination */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-500">
            एकूण <strong className="text-slate-800">{totalCount}</strong> पैकी{' '}
            <strong className="text-slate-800">
              {cases.length > 0 ? (page - 1) * limit + 1 : 0}
            </strong>{' '}
            ते{' '}
            <strong className="text-slate-800">
              {Math.min(page * limit, totalCount)}
            </strong>{' '}
            प्रकरणे
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
