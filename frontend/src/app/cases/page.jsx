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

  const toggleAllRows = () => {
    if (expandedRowIds.size === cases.length && cases.length > 0) {
      setExpandedRowIds(new Set());
    } else {
      setExpandedRowIds(new Set(cases.map((c) => c.id)));
    }
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
    <div className="space-y-3.5 sm:space-y-4">
      {/* Sleek, Low-Profile Compact Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-900">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                शर्तभंग व अर्ध-न्यायिक सुनावणी कक्ष
              </h1>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                MLRC १९६६
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              SDO व तहसीलदार न्यायालयातील सुनावण्या, पंचनामे व शासन जमा आदेश (कलम ३६, ३६अ, ४४, ४५, ५०, ५४)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setGlossaryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs"
            title="शर्तभंग व महसूल शब्दावली मदत"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>शर्तभंग व शब्दावली मदत</span>
          </button>

          <button
            type="button"
            onClick={() => fetchCases(page)}
            disabled={loading}
            className="p-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs transition active:scale-95 shadow-2xs"
            title="प्रकरणे रीफ्रेश करा"
            aria-label="प्रकरणे रीफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Dedicated Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Metric 1: Total Cases */}
        <button
          type="button"
          onClick={() => {
            setStatus('');
            setIsRepossessedToGovt('');
          }}
          className={`p-3 rounded-xl border text-left transition active:scale-98 ${
            status === '' && isRepossessedToGovt === ''
              ? 'bg-blue-50/70 border-blue-600 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">एकूण प्रकरणे</span>
            <Scale className="w-4 h-4 text-blue-900" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {stats.totalCases}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">नोंदवलेली सर्व प्रकरणे</p>
        </button>

        {/* Metric 2: Active Hearings */}
        <button
          type="button"
          onClick={() => {
            setStatus('HEARING_SCHEDULED');
            setIsRepossessedToGovt('');
          }}
          className={`p-3 rounded-xl border text-left transition active:scale-98 ${
            status === 'HEARING_SCHEDULED'
              ? 'bg-indigo-50/70 border-indigo-600 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">सक्रिय सुनावण्या</span>
            <Calendar className="w-4 h-4 text-indigo-700" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-indigo-950 mt-1">
            {stats.activeHearings}
          </p>
          <p className="text-[10px] text-indigo-600/80 mt-0.5 font-medium">बोर्डावरील सुनावण्या</p>
        </button>

        {/* Metric 3: Show Cause Notices */}
        <button
          type="button"
          onClick={() => {
            setStatus('NOTICE_ISSUED');
            setIsRepossessedToGovt('');
          }}
          className={`p-3 rounded-xl border text-left transition active:scale-98 ${
            status === 'NOTICE_ISSUED'
              ? 'bg-amber-50/70 border-amber-600 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">कारणे दाखवा नोटीस</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-amber-950 mt-1">
            {stats.noticesIssued}
          </p>
          <p className="text-[10px] text-amber-700/80 mt-0.5 font-medium">जबाब / खुलासा प्रलंबित</p>
        </button>

        {/* Metric 4: Shasan Jama */}
        <button
          type="button"
          onClick={() => {
            setStatus('');
            setIsRepossessedToGovt('true');
          }}
          className={`p-3 rounded-xl border text-left transition active:scale-98 ${
            isRepossessedToGovt === 'true'
              ? 'bg-emerald-50/70 border-emerald-600 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">शासन जमा आदेश</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-950 mt-1">
            {stats.shasanJama}
          </p>
          <p className="text-[10px] text-emerald-700/80 mt-0.5 font-medium">शासकीय सदरी दाखल</p>
        </button>

        {/* Metric 5: Total Disputed Area */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">एकूण शर्तभंग क्षेत्र</span>
            <Landmark className="w-4 h-4 text-rose-700" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {Number(stats.totalDisputedAreaHa || 0).toFixed(2)}{' '}
            <span className="text-xs font-semibold text-slate-500">हेक्टर</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">अतिक्रमित / वादग्रस्त क्षेत्र</p>
        </div>
      </div>

      {/* Search Box & Filters in a STRICT SINGLE ROW */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs flex items-center gap-2 flex-wrap lg:flex-nowrap">
        {/* Live Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="केस क्र., गट क्र., गाव किंवा कब्जेदार शोधा..."
            className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="शोध साफ करा"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Taluka Dropdown */}
        <div className="w-full sm:w-auto min-w-[150px] max-w-[190px]">
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
        <div className="w-full sm:w-auto min-w-[160px] max-w-[200px]">
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
        <div className="w-full sm:w-auto min-w-[140px] max-w-[180px]">
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
        <div className="w-full sm:w-auto min-w-[145px] max-w-[170px]">
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
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition shrink-0"
            title="सर्व फिल्टर्स साफ करा"
            aria-label="सर्व फिल्टर्स साफ करा"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Enhanced Table Card (100% Page Fit, Zero Horizontal Scroll, Precision Column Alignment) */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900 shrink-0">
              <FolderArchive className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  प्रकरण नोंदवही व सुनावणी तक्ता
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {totalCount} नोंदणी
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAllRows}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition shadow-2xs active:scale-95"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                expandedRowIds.size === cases.length && cases.length > 0 ? 'rotate-180 text-blue-900' : 'text-slate-500'
              }`}
            />
            <span>
              {expandedRowIds.size === cases.length && cases.length > 0
                ? 'सर्व संक्षिप्त करा'
                : 'सर्व शेरे उघडा'}
            </span>
          </button>
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
          <div className="w-full">
            <table className="w-full border-collapse table-fixed text-xs">
              {/* Native Table Head with Balanced Proportions */}
              <thead className="bg-slate-50/90 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 select-none">
                <tr>
                  <th scope="col" className="py-2.5 px-2 w-[4%] min-w-[40px] text-center">
                    #
                  </th>
                  <th scope="col" className="py-2.5 px-3 w-[24%] text-left">
                    केस क्र. व प्रकार
                  </th>
                  <th scope="col" className="py-2.5 px-3 w-[18%] text-left">
                    गाव व गट क्र.
                  </th>
                  <th scope="col" className="py-2.5 px-3 w-[22%] text-left">
                    कब्जेदार व क्षेत्र
                  </th>
                  <th scope="col" className="py-2.5 px-3 w-[18%] text-left">
                    सद्यस्थिती व सुनावणी
                  </th>
                  <th scope="col" className="py-2.5 px-3 w-[14%] text-right pr-4">
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
                  const isExpanded = expandedRowIds.has(c.id);
                  const rowNumber = (page - 1) * limit + index + 1;

                  return (
                    <React.Fragment key={c.id}>
                      {/* Main Table Row */}
                      <tr
                        className={`transition-colors ${
                          isExpanded
                            ? 'bg-blue-50/40 border-l-3 border-l-blue-900'
                            : index % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/30'
                        } hover:bg-slate-50/80`}
                      >
                        {/* Col 1: Sr No & Expand Button */}
                        <td className="py-2.5 px-1.5 text-center align-middle">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleRowExpansion(c.id)}
                              className={`w-5 h-5 rounded flex items-center justify-center transition ${
                                isExpanded
                                  ? 'bg-blue-900 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                              }`}
                              title={isExpanded ? 'तपशील बंद करा' : 'रोजनामा व आदेश शेरा उघडा'}
                            >
                              <ChevronRight
                                className={`w-3 h-3 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            <span className="font-mono text-[11px] font-medium text-slate-400">
                              {rowNumber}
                            </span>
                          </div>
                        </td>

                        {/* Col 2: Case No & Violation */}
                        <td className="py-2.5 px-3 align-middle">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-slate-900 select-all tracking-tight hover:text-blue-900 transition">
                                {c.caseNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(c.caseNumber)}
                                className="text-slate-400 hover:text-blue-900 p-0.5 rounded transition shrink-0"
                                title={isCopied ? 'कॉपी झाले!' : 'केस क्र. कॉपी करा'}
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full leading-tight border ${
                                  viol?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {viol?.labelMr || c.violationType}
                              </span>
                              {c.isRepossessedToGovt && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5 shrink-0">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>शासन जमा</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Col 3: Village, Gat & Taluka */}
                        <td className="py-2.5 px-3 align-middle">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 text-xs">
                              {c.parcel?.villageName || '—'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              गट क्र. <span className="font-mono font-semibold text-slate-700">{c.parcel?.gatNumber || '—'}</span>
                              {c.parcel?.taluka && (
                                <span className="text-slate-400 ml-1.5">• {c.parcel.taluka}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Col 4: Occupant & Disputed Area */}
                        <td className="py-2.5 px-3 align-middle">
                          <div className="space-y-0.5">
                            <p
                              className="font-medium text-slate-900 text-xs leading-snug truncate"
                              title={c.occupantName || 'तपासणी सुरू'}
                            >
                              {c.occupantName || 'अज्ञात (नोंद अपूर्ण)'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              शर्तभंग: <span className="font-mono font-semibold text-slate-700">{Number(c.encroachedAreaHa || 0).toFixed(4)} हे.</span>
                            </p>
                          </div>
                        </td>

                        {/* Col 5: Status & Next Hearing Date */}
                        <td className="py-2.5 px-3 align-middle">
                          <div className="space-y-1">
                            <span
                              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                stat?.color || 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {stat?.labelMr || c.status}
                            </span>
                            {latestHearing?.nextHearingDate ? (
                              <div className="flex items-center gap-1 text-[10px] text-indigo-700 font-medium">
                                <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span>
                                  पुढील: {new Date(latestHearing.nextHearingDate).toLocaleDateString('mr-IN')}
                                </span>
                              </div>
                            ) : c.orderDate ? (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>
                                  आदेश: {new Date(c.orderDate).toLocaleDateString('mr-IN')}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* Col 6: Actions */}
                        <td className="py-2.5 px-3 text-right align-middle pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedCaseForHearing(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition active:scale-95 shrink-0"
                              title="सुनावणी / रोजनामा नोंदवा"
                            >
                              <Scale className="w-3 h-3 text-amber-300" />
                              <span>सुनावणी</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTraceUpi(c.parcel?.upi)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title="१९५० जुना इतिहास व फेरफार"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setUploadDocCaseId(c.id)}
                              className="relative p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title={`कागदपत्रे / पुरावे अपलोड (${c.documents?.length || 0} उपलब्ध)`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {c.documents?.length > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-900 rounded-full" />
                              )}
                            </button>

                            {!c.isRepossessedToGovt && hasRole('COLLECTOR', 'SDO') && (
                              <button
                                type="button"
                                onClick={() => setShasanJamaCase(c)}
                                className="p-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition"
                                title="शासन जमा आदेश पारित करा"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Dossier Sub-Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2">
                                  <FolderArchive className="w-4 h-4 text-blue-900" />
                                  <span className="font-extrabold text-xs text-slate-900">
                                    प्रकरण संचिका व न्यायालयीन इतिवृत्त: {c.caseNumber}
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono text-slate-500">
                                  UPI: {c.parcel?.upi || 'N/A'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {/* Left: Hearing Log */}
                                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                                      <Scale className="w-3.5 h-3.5 text-indigo-700" />
                                      <span>
                                        सुनावणी प्राधिकारी:{' '}
                                        {latestHearing?.authority || 'SDO / तहसीलदार न्यायालय'}
                                      </span>
                                    </span>
                                    {latestHearing && (
                                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                                        दि.: {new Date(latestHearing.hearingDate).toLocaleDateString('mr-IN')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-indigo-950 leading-relaxed">
                                    <strong className="text-indigo-900">रोजनामा / इतिवृत्त: </strong>
                                    {latestHearing?.proceedingsLog || 'अद्याप सुनावणी इतिवृत्त नोंदवलेली नाही.'}
                                  </p>
                                </div>

                                {/* Right: Final Order or Status Remark */}
                                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                                      <span>सक्षम प्राधिकारी अंतिम आदेश व शेरा:</span>
                                    </span>
                                    {c.orderDate && (
                                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                                        दि.: {new Date(c.orderDate).toLocaleDateString('mr-IN')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-amber-950 leading-relaxed">
                                    {c.finalOrderDetails || 'अंतिम आदेश अद्याप पारित झालेला नाही (प्रकरण सुनावणी / चौकशी टप्प्यावर आहे).'}
                                  </p>
                                </div>
                              </div>

                              {/* Footer Metadata & Quick Action Shortcuts */}
                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
                                <div className="flex items-center gap-4 flex-wrap">
                                  <span>
                                    तपास अधिकारी:{' '}
                                    <strong className="text-slate-800">
                                      {c.investigatingOfficer || 'नायब तहसीलदार (महसूल)'}
                                    </strong>
                                  </span>
                                  {c.showCauseNoticeDate && (
                                    <span>
                                      नोटीस दिनांक:{' '}
                                      <strong className="text-slate-800">
                                        {new Date(c.showCauseNoticeDate).toLocaleDateString('mr-IN')}
                                      </strong>
                                    </span>
                                  )}
                                  <span>
                                    प्रवर्ग:{' '}
                                    <strong className="text-slate-800">
                                      {c.prapatraCategory || 'प्रपत्र-३'}
                                    </strong>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCaseForHearing(c)}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition"
                                  >
                                    + नवीन सुनावणी नोंदवा
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setUploadDocCaseId(c.id)}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition"
                                  >
                                    + पुरावा जोडा
                                  </button>
                                </div>
                              </div>
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
