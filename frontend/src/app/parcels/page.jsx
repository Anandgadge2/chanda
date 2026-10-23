'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Eye,
  Upload,
  Layers,
  MapPin,
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
} from 'lucide-react';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS, TENURE_CLASSES } from '../../lib/constants';
import ParcelTraceDrawer from '../../components/ParcelTraceDrawer';
import DocUploadModal from '../../components/DocUploadModal';
import RevenueShortcutGuideModal from '../../components/RevenueShortcutGuideModal';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function ParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filters
  const [taluka, setTaluka] = useState('');
  const [tenureClass, setTenureClass] = useState('');
  const [hasActiveDispute, setHasActiveDispute] = useState('');
  const [search, setSearch] = useState('');

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

  const fetchParcels = async (targetPage = page, customSearch = search) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit };
      if (taluka) params.taluka = taluka;
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
  }, [taluka, tenureClass, hasActiveDispute]);

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
    (search ? 1 : 0) + (taluka ? 1 : 0) + (tenureClass ? 1 : 0) + (hasActiveDispute !== '' ? 1 : 0);

  const talukaSelectOptions = useMemo(() => [
    { value: '', label: `सर्व तालुके (${CHANDRAPUR_TALUKAS.length})` },
    ...CHANDRAPUR_TALUKAS.map((t) => ({
      value: t.id,
      label: `${t.nameMr} (${t.nameEn})`
    }))
  ], []);

  const tenureSelectOptions = useMemo(() => [
    { value: '', label: 'सर्व धारणा प्रकार' },
    ...Object.entries(TENURE_CLASSES).map(([k, v]) => ({
      value: k,
      label: v.labelMr
    }))
  ], []);

  const disputeSelectOptions = useMemo(() => [
    { value: '', label: 'सर्व वाद स्थिती' },
    { value: 'true', label: 'सक्रिय वाद / शर्तभंग' },
    { value: 'false', label: 'विवादरहित (निर्वेध)' }
  ], []);



  // Helper for tenure badge styling
  const getTenureDetails = (tenureKey) => {
    const config = TENURE_CLASSES[tenureKey];
    switch (tenureKey) {
      case 'BHOGVATDAR_CLASS_1':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
          label: config?.labelMr || 'भोगवटादार वर्ग-१',
          hint: 'विनापरवानगी हस्तांतरण अनुज्ञेय',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
        };
      case 'BHOGVATDAR_CLASS_2':
        return {
          icon: <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />,
          label: config?.labelMr || 'भोगवटादार वर्ग-२',
          hint: 'कलेक्टर पूर्वपरवानगी अनिवार्य',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/70',
        };
      case 'SARKAR_SHASAN':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block shrink-0" />,
          label: config?.labelMr || 'शासकीय / शासन',
          hint: 'महाराष्ट्र शासनाकडे निहित',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/70',
        };
      case 'DEVASTHAN_INAM':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block shrink-0" />,
          label: config?.labelMr || 'देवस्थान / इनाम',
          hint: 'धार्मिक न्यास / अहस्तांतरणीय',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/70',
        };
      case 'FOREST_JANGAL':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-green-700 inline-block shrink-0" />,
          label: config?.labelMr || 'वन जमीन',
          hint: 'राखीव / संरक्षित वनक्षेत्र',
          badgeClass: 'bg-green-50 text-green-800 border-green-200/70',
        };
      default:
        return {
          icon: null,
          label: config?.labelMr || tenureKey,
          hint: '',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Sleek Low-Profile Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 text-blue-900 shadow-2xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                भूखंड नोंदवही (७/१२ अभिलेख)
              </h1>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                चंद्रपूर जिल्हा
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              ऐतिहासिक १९५० मूळ मालकी, फेरफार नोंदी व चालू स्थिती
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setGlossaryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition active:scale-95 shadow-2xs"
            title="७/१२ संक्षिप्त रूपे मदत"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>७/१२ संक्षिप्त रूपे</span>
          </button>

          <button
            onClick={() => fetchParcels(page, search)}
            disabled={loading}
            className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs transition active:scale-95 shadow-2xs"
            title="तक्ता रीफ्रेश करा"
            aria-label="तक्ता रीफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Streamlined Clean Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs flex items-center gap-2.5 flex-wrap lg:flex-nowrap">
        {/* Live Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="गट क्र., जुना स.नं., गाव किंवा UPI शोधा..."
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
            icon={MapPin}
            showCount={false}
          />
        </div>

        {/* Tenure Class Dropdown */}
        <div className="w-full sm:w-auto min-w-[155px] max-w-[190px]">
          <SearchableSelect
            options={tenureSelectOptions}
            value={tenureClass}
            onChange={(val) => setTenureClass(val)}
            placeholder="सर्व धारणा प्रकार"
            searchPlaceholder="धारणा प्रकार शोधा..."
            showCount={false}
          />
        </div>

        {/* Dispute Status Dropdown */}
        <div className="w-full sm:w-auto min-w-[145px] max-w-[180px]">
          <SearchableSelect
            options={disputeSelectOptions}
            value={hasActiveDispute}
            onChange={(val) => setHasActiveDispute(val)}
            placeholder="सर्व वाद स्थिती"
            searchPlaceholder="वाद स्थिती शोधा..."
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
                नोंदवही तक्ता
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {totalCount} नोंदणीकृत भूखंड (गट क्र.)
              </span>
              {stats.class2Count > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-amber-700 font-medium">
                    वर्ग-२: {stats.class2Count}
                  </span>
                </>
              )}
              {stats.disputeCount > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-rose-700 font-medium">
                    शर्तभंग: {stats.disputeCount}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              <span>ओळीवर क्लिक करून ३६०° साखळी पहा</span>
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-blue-900 border-t-amber-500 rounded-full animate-spin mx-auto mb-2.5" />
            <p className="text-xs font-bold text-slate-600">
              भूखंड नोंदवही व शीर्षक साखळी डेटा लोड होत आहे...
            </p>
          </div>
        ) : sortedParcels.length === 0 ? (
          <div className="py-20 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">कोणतेही भूखंड सापडले नाहीत</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                आपण निवडलेल्या शोध किंवा फिल्टर निकषांनुसार कोणताही भूखंड उपलब्ध नाही.
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>सर्व फिल्टर्स साफ करा</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full border-collapse text-xs">
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
                      <span>UPI / भूखंड ओळख</span>
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
                      <span>तालुका व गाव</span>
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
                      <span>गट व सर्व्हे क्र.</span>
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
                    <span>सध्याचे खातेदार / भोगवटदार</span>
                  </th>

                  {/* Col 6: Area */}
                  <th
                    scope="col"
                    onClick={() => handleSort('totalAreaHa')}
                    className="py-2.5 px-3 w-[11%] text-left cursor-pointer hover:bg-slate-100 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>क्षेत्र (हे. / एकर)</span>
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
                      <span>धारणा प्रकार</span>
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
                    वाद स्थिती
                  </th>

                  {/* Col 9: Actions (Kruti) */}
                  <th scope="col" className="py-2.5 px-3 w-[7%] min-w-[90px] text-right">
                    कृती
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
                    (parcel.tenureClass === 'SARKAR_SHASAN' ? 'महाराष्ट्र शासन' : 'नोंद उपलब्ध नाही');
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
                            title="३६०° शीर्षक साखळी पाहण्यासाठी क्लिक करा"
                          >
                            {parcel.upi}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(parcel.upi, e)}
                            className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition shrink-0"
                            title={isCopied ? 'UPI कॉपी झाले!' : 'UPI कॉपी करा'}
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
                          <div className="font-semibold text-slate-900 text-xs truncate" title={parcel.villageName}>
                            {parcel.villageName}
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
                              गट {parcel.gatNumber}
                            </span>
                            {parcel.hissaNumber && parcel.hissaNumber !== '0' && parcel.hissaNumber !== '०' && (
                              <span className="text-slate-500 font-medium text-[11px]">/ हि. {parcel.hissaNumber}</span>
                            )}
                          </div>
                          {parcel.oldSurveyNo && (
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">
                              जुना स.नं. {parcel.oldSurveyNo}
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
                                <span>{mutationCount} फेरफार</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                मूळ नोंद
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 6: Total & Potkharaba Area */}
                      <td className="py-2.5 px-3 align-middle">
                        <div>
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            {areaHa.toFixed(4)} हे.
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            ~{areaAcres} एकर{potkharabaHa > 0 ? ` • पो.ख. ${potkharabaHa.toFixed(2)}` : ''}
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
                            title={activeCase ? `सक्रिय केस क्र: ${activeCase.caseNumber}` : 'शर्तभंग चौकशी प्रलंबित'}
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>शर्तभंग</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/80 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>निर्वेध</span>
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
                            title="१९५० शीर्षक साखळी व संपूर्ण इतिहास पहा"
                          >
                            <span>३६०°</span>
                            <Eye className="w-3 h-3 text-blue-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadModalParcelId(parcel.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition active:scale-95 shrink-0"
                            title="कागदपत्रे अपलोड करा (DMS)"
                            aria-label="कागदपत्रे अपलोड करा"
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
