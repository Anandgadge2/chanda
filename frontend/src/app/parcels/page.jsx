'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Eye,
  Upload,
  Layers,
  MapPin,
  LandPlot,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  History,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS, TENURE_CLASSES } from '../../lib/constants';
import ParcelTraceDrawer from '../../components/ParcelTraceDrawer';
import DocUploadModal from '../../components/DocUploadModal';
import RevenueShortcutGuideModal from '../../components/RevenueShortcutGuideModal';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import { useTranslation } from '../../components/LanguageContext';
import { formatVillageName } from '../../lib/villageUtils';
import clsx from 'clsx';

export default function ParcelsPage() {
  const { isMarathi } = useTranslation();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filters
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [villageOptions, setVillageOptions] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [tenureClass, setTenureClass] = useState('');
  const [hasActiveDispute, setHasActiveDispute] = useState('');
  const [search, setSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounced search ref
  const searchTimeoutRef = useRef(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Copy Feedback
  const [copiedUpi, setCopiedUpi] = useState(null);

  // Drawers & Modals
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [uploadModalParcelId, setUploadModalParcelId] = useState(null);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);

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

  const fetchParcels = async (targetPage = page, customSearch = search) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit };
      if (taluka) params.taluka = taluka;
      if (village && village !== 'all') params.village = village;
      if (tenureClass) params.tenureClass = tenureClass;
      if (hasActiveDispute !== '') params.hasActiveDispute = hasActiveDispute;
      if (customSearch && customSearch.trim()) params.search = customSearch.trim();

      const data = await api.getParcels(params);
      setParcels(data.parcels || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes
  useEffect(() => {
    setPage(1);
    fetchParcels(1, search);
  }, [taluka, village, tenureClass, hasActiveDispute]);

  // Live search debounced
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchParcels(1, val);
    }, 300);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    fetchParcels(1, '');
  };

  const handleResetFilters = () => {
    setSearch('');
    setTaluka('');
    setVillage('');
    setTenureClass('');
    setHasActiveDispute('');
    setPage(1);
    fetchParcels(1, '');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchParcels(newPage, search);
  };

  // Copy to clipboard
  const copyToClipboard = (text, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedUpi(text);
    setTimeout(() => {
      setCopiedUpi((prev) => (prev === text ? null : prev));
    }, 2000);
  };

  // Column Sorting Handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sorted Parcels List
  const sortedParcels = useMemo(() => {
    if (!sortColumn) return parcels;

    return [...parcels].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (sortColumn === 'totalAreaHa') {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [parcels, sortColumn, sortDirection]);

  // Summary counts for compact header pills
  const stats = useMemo(() => {
    const class2Count = parcels.filter((p) => p.tenureClass === 'BHOGVATDAR_CLASS_2').length;
    const disputeCount = parcels.filter((p) => p.hasActiveDispute).length;
    return { class2Count, disputeCount };
  }, [parcels]);

  const activeFiltersCount =
    (search ? 1 : 0) + (taluka ? 1 : 0) + (village ? 1 : 0) + (tenureClass ? 1 : 0) + (hasActiveDispute !== '' ? 1 : 0);

  const talukaSelectOptions = useMemo(() => [
    { value: '', label: isMarathi ? `सर्व तालुके (${CHANDRAPUR_TALUKAS.length})` : `All Talukas (${CHANDRAPUR_TALUKAS.length})` },
    ...CHANDRAPUR_TALUKAS.map((t) => ({
      value: t.id,
      label: isMarathi ? t.nameMr : t.nameEn
    }))
  ], [isMarathi]);

  const villageSelectOptions = useMemo(() => [
    {
      value: '',
      label: villageOptions.length > 0
        ? (isMarathi ? `सर्व गावे (${villageOptions.length})` : `All Villages (${villageOptions.length})`)
        : (isMarathi ? 'सर्व गावे' : 'All Villages')
    },
    ...villageOptions.map((v) => {
      const vName = typeof v === 'object' ? (v.villageName || v.name) : v;
      const count = typeof v === 'object' && v.total712Count ? `${v.total712Count}` : undefined;
      return {
        value: vName,
        label: formatVillageName(vName, isMarathi),
        count
      };
    })
  ], [villageOptions, taluka, isMarathi]);

  const tenureSelectOptions = useMemo(() => [
    { value: '', label: isMarathi ? 'सर्व धारणा प्रकार' : 'All Tenure Types' },
    ...Object.entries(TENURE_CLASSES).map(([k, v]) => ({
      value: k,
      label: isMarathi ? v.labelMr : (v.labelEn || v.labelMr)
    }))
  ], [isMarathi]);

  const disputeSelectOptions = useMemo(() => [
    { value: '', label: isMarathi ? 'सर्व वाद स्थिती' : 'All Dispute Statuses' },
    { value: 'true', label: isMarathi ? 'सक्रिय वाद / शर्तभंग' : 'Active Dispute / Breach' },
    { value: 'false', label: isMarathi ? 'विवादरहित (निर्वेध)' : 'Clear (No Disputes)' }
  ], [isMarathi]);

  // Helper for tenure badge styling
  const getTenureDetails = (tenureKey) => {
    const config = TENURE_CLASSES[tenureKey];
    const isEn = !isMarathi;
    switch (tenureKey) {
      case 'BHOGVATDAR_CLASS_1':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
          label: isEn ? (config?.labelEn || 'Occupant Class-1') : (config?.labelMr || 'भोगवटादार वर्ग-१'),
          hint: isEn ? 'Transferable without prior permission' : 'विनापरवानगी हस्तांतरण अनुज्ञेय',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
        };
      case 'BHOGVATDAR_CLASS_2':
        return {
          icon: <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />,
          label: isEn ? (config?.labelEn || 'Occupant Class-2') : (config?.labelMr || 'भोगवटादार वर्ग-२'),
          hint: isEn ? 'Collector prior sanction mandatory' : 'कलेक्टर पूर्वपरवानगी अनिवार्य',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/70',
        };
      case 'SARKAR_SHASAN':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block shrink-0" />,
          label: isEn ? (config?.labelEn || 'Government / State') : (config?.labelMr || 'शासकीय / शासन'),
          hint: isEn ? 'Vested in Maharashtra State Govt' : 'महाराष्ट्र शासनाकडे निहित',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/70',
        };
      case 'DEVASTHAN_INAM':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block shrink-0" />,
          label: isEn ? (config?.labelEn || 'Devasthan / Inam') : (config?.labelMr || 'देवस्थान / इनाम'),
          hint: isEn ? 'Religious Trust / Non-transferable' : 'धार्मिक न्यास / अहस्तांतरणीय',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/70',
        };
      case 'FOREST_JANGAL':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-green-700 inline-block shrink-0" />,
          label: isEn ? (config?.labelEn || 'Forest Land') : (config?.labelMr || 'वन जमीन'),
          hint: isEn ? 'Reserved / Protected Forest' : 'राखीव / संरक्षित वनक्षेत्र',
          badgeClass: 'bg-green-50 text-green-800 border-green-200/70',
        };
      default:
        return {
          icon: null,
          label: isEn ? (config?.labelEn || tenureKey) : (config?.labelMr || tenureKey),
          hint: '',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Executive Command Header - Pro Compact */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-emerald-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                {isMarathi ? 'भूखंड नोंदवही (७/१२ अभिलेख)' : 'Land Parcel Register (7/12 Records)'}
              </h1>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                {isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District'}
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-medium">
                {isMarathi
                  ? '• ऐतिहासिक १९५० मूळ मालकी, फेरफार नोंदी व चालू स्थिती'
                  : '• Historical 1950 Provenance, Mutation Entries & Current Status'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 md:hidden truncate font-medium">
              {isMarathi
                ? 'ऐतिहासिक १९५० मूळ मालकी, फेरफार नोंदी व चालू स्थिती'
                : 'Historical 1950 Provenance, Mutation Entries & Current Status'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setGlossaryModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={isMarathi ? '७/१२ संक्षिप्त रूपे मदत' : '7/12 Abbreviations Guide'}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isMarathi ? '७/१२ संक्षिप्त रूपे' : '7/12 Abbreviations'}</span>
          </button>

          <button
            onClick={() => fetchParcels(page, search)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-slate-950 border border-slate-300 text-xs transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={isMarathi ? 'तक्ता रीफ्रेश करा' : 'Refresh Table'}
            aria-label={isMarathi ? 'तक्ता रीफ्रेश करा' : 'Refresh Table'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : 'text-slate-700'}`} />
          </button>
        </div>
      </div>

      {/* Modern Filter & Search Command Toolbar */}
      <div className="relative z-30 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-2.5">
        {/* Live Search Input & Mobile Filters Toggle Button */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={
                isMarathi
                  ? 'गट क्र., जुना स.नं., गाव किंवा UPI शोधा...'
                  : 'Search Gat No., Old Survey No., Village or UPI...'
              }
              className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
              'lg:hidden px-2.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-2xs cursor-pointer',
              showMobileFilters || activeFiltersCount > 0
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
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
              ? 'grid grid-cols-1 sm:grid-cols-2 pt-2 border-t border-slate-100 lg:border-t-0 lg:pt-0 lg:flex lg:flex-nowrap'
              : 'hidden lg:flex lg:flex-nowrap'
          )}
        >
          {/* Taluka Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[150px] sm:max-w-[190px]">
            <SearchableSelect
              options={talukaSelectOptions}
              value={taluka}
              onChange={(val) => {
                setTaluka(val);
                setVillage('');
              }}
              placeholder={isMarathi ? 'सर्व तालुके' : 'All Talukas'}
              searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
              icon={MapPin}
              showCount={false}
            />
          </div>

          {/* Village Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[155px] sm:max-w-[210px]">
            <SearchableSelect
              options={villageSelectOptions}
              value={village}
              onChange={(val) => setVillage(val)}
              placeholder={loadingVillages ? (isMarathi ? 'लोड होत आहे...' : 'Loading...') : (isMarathi ? 'सर्व गावे' : 'All Villages')}
              searchPlaceholder={isMarathi ? 'गाव शोधा...' : 'Search village...'}
              icon={LandPlot}
              showCount={true}
            />
          </div>

          {/* Tenure Class Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[155px] sm:max-w-[190px]">
            <SearchableSelect
              options={tenureSelectOptions}
              value={tenureClass}
              onChange={(val) => setTenureClass(val)}
              placeholder={isMarathi ? 'सर्व धारणा प्रकार' : 'All Tenure Types'}
              searchPlaceholder={isMarathi ? 'धारणा प्रकार शोधा...' : 'Search tenure...'}
              showCount={false}
            />
          </div>

          {/* Dispute Status Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[145px] sm:max-w-[180px]">
            <SearchableSelect
              options={disputeSelectOptions}
              value={hasActiveDispute}
              onChange={(val) => setHasActiveDispute(val)}
              placeholder={isMarathi ? 'सर्व वाद स्थिती' : 'All Dispute Statuses'}
              searchPlaceholder={isMarathi ? 'वाद स्थिती शोधा...' : 'Search dispute...'}
              showCount={false}
            />
          </div>

          {/* Reset Filter Button if active */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 sm:p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition shrink-0 cursor-pointer flex items-center justify-center gap-1 text-xs font-bold w-full sm:w-auto"
              title={isMarathi ? 'सर्व फिल्टर्स साफ करा' : 'Clear all filters'}
              aria-label={isMarathi ? 'सर्व फिल्टर्स साफ करा' : 'Clear all filters'}
            >
              <X className="w-3.5 h-3.5" />
              <span className="lg:hidden">{isMarathi ? 'फिल्टर्स साफ करा' : 'Clear filters'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-100/80 flex items-center justify-center text-blue-900 shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {isMarathi ? 'नोंदवही तक्ता' : 'Register Table'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {totalCount} {isMarathi ? 'नोंदणीकृत भूखंड (गट क्र.)' : 'Registered Parcels (Gat No.)'}
              </span>
              {village && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    <LandPlot className="w-3 h-3 text-emerald-600" />
                    {isMarathi ? `गाव: ${formatVillageName(village, true)}` : `Village: ${formatVillageName(village, false)}`}
                  </span>
                </>
              )}
              {stats.class2Count > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-amber-700 font-medium">
                    {isMarathi ? `वर्ग-२: ${stats.class2Count}` : `Class-2: ${stats.class2Count}`}
                  </span>
                </>
              )}
              {stats.disputeCount > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-rose-700 font-medium">
                    {isMarathi ? `शर्तभंग: ${stats.disputeCount}` : `Breach: ${stats.disputeCount}`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              <span>{isMarathi ? 'ओळीवर क्लिक करून ३६०° साखळी पहा' : 'Click a row to view 360° Provenance Chain'}</span>
            </span>
            <span className="md:hidden text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
              {isMarathi ? 'तक्ता आडवा स्क्रोल करा ↔' : 'Scroll table horizontally ↔'}
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-blue-900 border-t-amber-500 rounded-full animate-spin mx-auto mb-2.5" />
            <p className="text-xs font-bold text-slate-600">
              {isMarathi
                ? 'भूखंड नोंदवही व शीर्षक साखळी डेटा लोड होत आहे...'
                : 'Loading parcel register and title chain data...'}
            </p>
          </div>
        ) : sortedParcels.length === 0 ? (
          <div className="py-20 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isMarathi ? 'कोणतेही भूखंड सापडले नाहीत' : 'No parcels found'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                {isMarathi
                  ? 'आपण निवडलेल्या शोध किंवा फिल्टर निकषांनुसार कोणताही भूखंड उपलब्ध नाही.'
                  : 'No land parcel matches your current search or filter criteria.'}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'सर्व फिल्टर्स साफ करा' : 'Clear all filters'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full border-collapse text-xs min-w-[840px]">
              {/* Native Table Head with Balanced Proportions */}
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 select-none">
                <tr>
                  {/* Col 1: # */}
                  <th scope="col" className="py-2.5 px-2 w-[4%] min-w-[36px] text-center">
                    #
                  </th>

                  {/* Col 2: UPI */}
                  <th
                    scope="col"
                    onClick={() => handleSort('upi')}
                    className="py-2.5 px-3 w-[16%] text-left cursor-pointer hover:bg-slate-100 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'UPI / भूखंड ओळख' : 'UPI / Parcel ID'}</span>
                      {sortColumn === 'upi' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-900" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-900" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 3: Village & Taluka */}
                  <th
                    scope="col"
                    onClick={() => handleSort('villageName')}
                    className="py-2.5 px-3 w-[14%] text-left cursor-pointer hover:bg-slate-100 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'तालुका व गाव' : 'Taluka & Village'}</span>
                      {sortColumn === 'villageName' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-900" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-900" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 4: Gat No & Survey No */}
                  <th
                    scope="col"
                    onClick={() => handleSort('gatNumber')}
                    className="py-2.5 px-3 w-[11%] text-left cursor-pointer hover:bg-slate-100 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'गट व सर्व्हे क्र.' : 'Gat & Survey No.'}</span>
                      {sortColumn === 'gatNumber' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-900" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-900" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 5: Current Owner / Khatedar */}
                  <th
                    scope="col"
                    className="py-2.5 px-3 w-[20%] text-left"
                  >
                    <span>{isMarathi ? 'सध्याचे खातेदार / भोगवटदार' : 'Current Khatedar / Occupant'}</span>
                  </th>

                  {/* Col 6: Area */}
                  <th
                    scope="col"
                    onClick={() => handleSort('totalAreaHa')}
                    className="py-2.5 px-3 w-[11%] text-left cursor-pointer hover:bg-slate-100 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'क्षेत्र (हे. / एकर)' : 'Area (Ha / Acre)'}</span>
                      {sortColumn === 'totalAreaHa' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-900" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-900" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 7: Tenure */}
                  <th
                    scope="col"
                    onClick={() => handleSort('tenureClass')}
                    className="py-2.5 px-3 w-[11%] text-left cursor-pointer hover:bg-slate-100 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'धारणा प्रकार' : 'Tenure Type'}</span>
                      {sortColumn === 'tenureClass' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-900" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-900" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 8: Dispute Status */}
                  <th scope="col" className="py-2.5 px-2 w-[6%] text-center">
                    {isMarathi ? 'वाद स्थिती' : 'Dispute Status'}
                  </th>

                  {/* Col 9: Actions (Kruti) */}
                  <th scope="col" className="py-2.5 px-3 w-[7%] min-w-[90px] text-right">
                    {isMarathi ? 'कृती' : 'Actions'}
                  </th>
                </tr>
              </thead>

              {/* Native Table Body */}
              <tbody className="divide-y divide-slate-100">
                {sortedParcels.map((parcel, index) => {
                  const tenure = getTenureDetails(parcel.tenureClass);
                  const hasDispute = parcel.hasActiveDispute;
                  const isCopied = copiedUpi === parcel.upi;
                  const rowNumber = (page - 1) * limit + index + 1;
                  const areaHa = Number(parcel.totalAreaHa || 0);
                  const areaAcres = (areaHa * 2.47105).toFixed(2);
                  const potkharabaHa = Number(parcel.potkharabaAreaHa || 0);
                  const activeCase = parcel.forwardCases && parcel.forwardCases[0];
                  const ownerName =
                    parcel.currentOwner ||
                    parcel.metadata?.currentOwner ||
                    parcel.metadata?.ownerName ||
                    (parcel.tenureClass === 'SARKAR_SHASAN'
                      ? (isMarathi ? 'महाराष्ट्र शासन' : 'Government of Maharashtra')
                      : (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available'));
                  const mutationCount = parcel._count?.backwardHistories || 0;

                  return (
                    <tr
                      key={parcel.id}
                      className={`transition-colors cursor-pointer ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-blue-50/40`}
                      onClick={() => setSelectedUpi(parcel.upi)}
                    >
                      {/* Col 1: Sr No */}
                      <td className="py-2.5 px-1.5 text-center align-middle">
                        <span className="font-mono text-[11px] font-medium text-slate-400">
                          {rowNumber}
                        </span>
                      </td>

                      {/* Col 2: UPI / भूखंड ओळख */}
                      <td className="py-2.5 px-3 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-xs font-semibold text-slate-800 select-all whitespace-nowrap transition group-hover:text-blue-900"
                            title={isMarathi ? '३६०° शीर्षक साखळी पाहण्यासाठी क्लिक करा' : 'Click to view 360° title trace'}
                          >
                            {parcel.upi}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(parcel.upi, e)}
                            className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition shrink-0"
                            title={isCopied ? (isMarathi ? 'UPI कॉपी झाले!' : 'UPI copied!') : (isMarathi ? 'UPI कॉपी करा' : 'Copy UPI')}
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Col 3: Village & Taluka */}
                      <td className="py-2.5 px-3 align-middle">
                        <div>
                          <div className="font-semibold text-slate-900 text-xs truncate" title={formatVillageName(parcel.villageName, isMarathi)}>
                            {formatVillageName(parcel.villageName, isMarathi)}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{parcel.taluka}</span>
                          </div>
                        </div>
                      </td>

                      {/* Col 4: Gat No, Survey No & Hissa */}
                      <td className="py-2.5 px-3 align-middle">
                        <div>
                          <div className="text-xs flex items-center gap-1">
                            <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded px-1.5 py-0.5">
                              {isMarathi ? `गट ${parcel.gatNumber}` : `Gat ${parcel.gatNumber}`}
                            </span>
                            {parcel.hissaNumber && parcel.hissaNumber !== '0' && parcel.hissaNumber !== '०' && (
                              <span className="text-slate-500 font-medium text-[11px]">
                                {isMarathi ? `/ हि. ${parcel.hissaNumber}` : `/ Hissa ${parcel.hissaNumber}`}
                              </span>
                            )}
                          </div>
                          {parcel.oldSurveyNo && (
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">
                              {isMarathi ? `जुना स.नं. ${parcel.oldSurveyNo}` : `Old S.No. ${parcel.oldSurveyNo}`}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Col 5: Current Owner / Khatedar */}
                      <td className="py-2.5 px-3 align-middle">
                        <div>
                          <div
                            className="font-semibold text-slate-900 text-xs truncate max-w-[210px]"
                            title={ownerName}
                          >
                            {ownerName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {mutationCount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-medium">
                                <History className="w-2.5 h-2.5 shrink-0" />
                                <span>{mutationCount} {isMarathi ? 'फेरफार' : 'Mutations'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                {isMarathi ? 'मूळ नोंद' : 'Original Record'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 6: Total & Potkharaba Area */}
                      <td className="py-2.5 px-3 align-middle">
                        <div>
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            {areaHa.toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            ~{areaAcres} {isMarathi ? 'एकर' : 'Acres'}{potkharabaHa > 0 ? ` • ${isMarathi ? 'पो.ख.' : 'Potkharaba'} ${potkharabaHa.toFixed(2)}` : ''}
                          </div>
                        </div>
                      </td>

                      {/* Col 7: Tenure Class */}
                      <td className="py-2.5 px-3 align-middle">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${tenure.badgeClass}`}
                          title={tenure.hint}
                        >
                          {tenure.icon}
                          <span>{tenure.label}</span>
                        </span>
                      </td>

                      {/* Col 8: Dispute Status */}
                      <td className="py-2.5 px-2 text-center align-middle">
                        {hasDispute ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200/80 whitespace-nowrap"
                            title={activeCase ? (isMarathi ? `सक्रिय केस क्र: ${activeCase.caseNumber}` : `Active Case No: ${activeCase.caseNumber}`) : (isMarathi ? 'शर्तभंग चौकशी प्रलंबित' : 'Breach inquiry pending')}
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{isMarathi ? 'शर्तभंग' : 'Breach'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/80 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{isMarathi ? 'निर्वेध' : 'Clear'}</span>
                          </span>
                        )}
                      </td>

                      {/* Col 9: Action Buttons */}
                      <td
                        className="py-2.5 px-3 text-right align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedUpi(parcel.upi)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition active:scale-95 whitespace-nowrap"
                            title={isMarathi ? '१९५० शीर्षक साखळी व संपूर्ण इतिहास पहा' : 'View 1950 title chain and complete history'}
                          >
                            <span>{isMarathi ? '३६०°' : '360°'}</span>
                            <Eye className="w-3 h-3 text-blue-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadModalParcelId(parcel.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition active:scale-95 shrink-0"
                            title={isMarathi ? 'कागदपत्रे अपलोड करा (DMS)' : 'Upload Documents (DMS)'}
                            aria-label={isMarathi ? 'कागदपत्रे अपलोड करा' : 'Upload Documents'}
                          >
                            <Upload className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        onPageChange={handlePageChange}
      />

      {/* 360 Trace Drawer */}
      {selectedUpi && (
        <ParcelTraceDrawer
          upi={selectedUpi}
          onClose={() => setSelectedUpi(null)}
          onRefresh={() => fetchParcels(page, search)}
        />
      )}

      {/* Doc Upload Modal */}
      {uploadModalParcelId && (
        <DocUploadModal
          isOpen={Boolean(uploadModalParcelId)}
          onClose={() => setUploadModalParcelId(null)}
          parcelId={uploadModalParcelId}
          onUploadSuccess={() => fetchParcels(page, search)}
        />
      )}

      {/* Revenue Glossary Modal */}
      <RevenueShortcutGuideModal
        isOpen={glossaryModalOpen}
        onClose={() => setGlossaryModalOpen(false)}
      />
    </div>
  );
}
