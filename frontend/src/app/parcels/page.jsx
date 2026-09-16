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
  FileSpreadsheet,
  RefreshCw,
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Scale,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS, TENURE_CLASSES, VIOLATION_TYPES } from '../../lib/constants';
import ParcelTraceDrawer from '../../components/ParcelTraceDrawer';
import DocUploadModal from '../../components/DocUploadModal';
import RevenueShortcutGuideModal from '../../components/RevenueShortcutGuideModal';
import Pagination from '../../components/Pagination';

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

  // Expandable Rows (collapsed by default)
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

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

  // Toggle Row Expansion
  const toggleRowExpansion = (id, e) => {
    if (e) e.stopPropagation();
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
    if (expandedRowIds.size === parcels.length && parcels.length > 0) {
      setExpandedRowIds(new Set());
    } else {
      setExpandedRowIds(new Set(parcels.map((p) => p.id)));
    }
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

  // Export Table to CSV
  const handleExportCSV = () => {
    if (!parcels || parcels.length === 0) return;

    const headers = [
      'अ.क्र.',
      'UPI / भूखंड ओळख',
      'तालुका',
      'गाव',
      'गाव कोड',
      'गट क्र.',
      'जुना स.नं.',
      'हिस्सा क्र.',
      'एकूण क्षेत्र (हेक्टर)',
      'अंदाजे क्षेत्र (एकर)',
      'पोटखराबा क्षेत्र (हेक्टर)',
      'धारणा प्रकार',
      'वाद स्थिती',
      'सक्रिय केस क्र.',
    ];

    const rows = sortedParcels.map((p, idx) => {
      const tenure = TENURE_CLASSES[p.tenureClass]?.labelMr || p.tenureClass;
      const dispute = p.hasActiveDispute ? 'सक्रिय वाद / शर्तभंग' : 'निर्वेध';
      const caseNo = p.forwardCases?.[0]?.caseNumber || '-';
      const areaHa = Number(p.totalAreaHa || 0).toFixed(4);
      const areaAcre = (Number(p.totalAreaHa || 0) * 2.47105).toFixed(2);
      const potkharaba = Number(p.potkharabaAreaHa || 0).toFixed(4);

      return [
        idx + 1,
        `"${p.upi}"`,
        `"${p.taluka}"`,
        `"${p.villageName}"`,
        `"${p.villageCode || ''}"`,
        `"${p.gatNumber}"`,
        `"${p.oldSurveyNo || ''}"`,
        `"${p.hissaNumber || '०'}"`,
        areaHa,
        areaAcre,
        potkharaba,
        `"${tenure}"`,
        `"${dispute}"`,
        `"${caseNo}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chandrapur_Land_Parcels_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper for tenure badge styling
  const getTenureDetails = (tenureKey) => {
    const config = TENURE_CLASSES[tenureKey];
    switch (tenureKey) {
      case 'BHOGVATDAR_CLASS_1':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />,
          label: config?.labelMr || 'भोगवटादार वर्ग-१',
          hint: 'विनापरवानगी हस्तांतरण अनुज्ञेय',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
      case 'BHOGVATDAR_CLASS_2':
        return {
          icon: <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />,
          label: config?.labelMr || 'भोगवटादार वर्ग-२',
          hint: 'कलेक्टर पूर्वपरवानगी अनिवार्य',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
        };
      case 'SARKAR_SHASAN':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-blue-700 inline-block shrink-0" />,
          label: config?.labelMr || 'शासकीय / शासन',
          hint: 'महाराष्ट्र शासनाकडे निहित',
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
        };
      case 'DEVASTHAN_INAM':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-purple-700 inline-block shrink-0" />,
          label: config?.labelMr || 'देवस्थान / इनाम',
          hint: 'धार्मिक न्यास / अहस्तांतरणीय',
          badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
        };
      case 'FOREST_JANGAL':
        return {
          icon: <span className="w-1.5 h-1.5 rounded-full bg-green-800 inline-block shrink-0" />,
          label: config?.labelMr || 'वन जमीन',
          hint: 'राखीव / संरक्षित वनक्षेत्र',
          badgeClass: 'bg-green-50 text-green-900 border-green-300',
        };
      default:
        return {
          icon: null,
          label: config?.labelMr || tenureKey,
          hint: '',
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Sleek Low-Profile Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-900 shadow-2xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                भूखंड नोंदवही व १९५० शीर्षक साखळी
              </h1>
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-300">
                ७/१२ अभिलेख
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ऐतिहासिक १९५० मूळ मालकी, फेरफार नोंदी व चालू शर्तभंग चौकशी
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setGlossaryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs"
            title="७/१२ संक्षिप्त रूपे मदत"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>७/१२ संक्षिप्त रूपे मदत</span>
          </button>

          <a
            href={api.getSampleTemplateUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition active:scale-95 shadow-2xs"
            title="एक्सेल टेम्पलेट"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>एक्सेल टेम्पलेट</span>
          </a>

          <button
            onClick={() => fetchParcels(page, search)}
            disabled={loading}
            className="p-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs transition active:scale-95 shadow-2xs"
            title="तक्ता रीफ्रेश करा"
            aria-label="तक्ता रीफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Streamlined Clean Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex items-center gap-2.5 flex-wrap lg:flex-nowrap">
        {/* Live Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="गट क्र., जुना स.नं., गाव किंवा UPI शोधा..."
            className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
        <select
          value={taluka}
          onChange={(e) => setTaluka(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shrink-0 max-w-[145px]"
        >
          <option value="">सर्व तालुके ({CHANDRAPUR_TALUKAS.length})</option>
          {CHANDRAPUR_TALUKAS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameMr}
            </option>
          ))}
        </select>

        {/* Tenure Class Dropdown */}
        <select
          value={tenureClass}
          onChange={(e) => setTenureClass(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shrink-0 max-w-[155px]"
        >
          <option value="">सर्व धारणा प्रकार</option>
          {Object.entries(TENURE_CLASSES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.labelMr}
            </option>
          ))}
        </select>

        {/* Dispute Status Dropdown */}
        <select
          value={hasActiveDispute}
          onChange={(e) => setHasActiveDispute(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shrink-0 max-w-[145px]"
        >
          <option value="">सर्व वाद स्थिती</option>
          <option value="true">सक्रिय वाद / शर्तभंग</option>
          <option value="false">विवादरहित (निर्वेध)</option>
        </select>

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

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs active:scale-95 shrink-0"
          title="सध्याचा तक्ता CSV मध्ये डाउनलोड करा"
        >
          <Download className="w-3.5 h-3.5 text-blue-700" />
          <span>तक्ता CSV</span>
        </button>
      </div>

      {/* Enhanced Table Card (Precision table-fixed, 8 balanced columns, No DMS column) */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900 shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                चंद्रपूर भूखंड मास्टर नोंदवही
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                {totalCount} भूखंड नोंदणी
              </span>
              {stats.class2Count > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  वर्ग-२: {stats.class2Count}
                </span>
              )}
              {stats.disputeCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  शर्तभंग: {stats.disputeCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={toggleAllRows}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition shadow-2xs active:scale-95"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  expandedRowIds.size === sortedParcels.length && sortedParcels.length > 0
                    ? 'rotate-180 text-blue-900'
                    : 'text-slate-500'
                }`}
              />
              <span>
                {expandedRowIds.size === sortedParcels.length && sortedParcels.length > 0
                  ? 'सर्व संक्षिप्त करा'
                  : 'सर्व तपशील उघडा'}
              </span>
            </button>
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
            <table className="w-full border-collapse table-fixed text-xs min-w-[860px]">
              {/* Native Table Head with Balanced 8-Column Proportions */}
              <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 select-none">
                <tr>
                  {/* # & Expand */}
                  <th scope="col" className="py-3 px-2 w-[5%] min-w-[46px] text-center border-r border-slate-200/60">
                    #
                  </th>

                  {/* UPI */}
                  <th
                    scope="col"
                    onClick={() => handleSort('upi')}
                    className="py-3 px-3 w-[22%] text-left border-r border-slate-200/60 cursor-pointer hover:bg-slate-200/60 transition group"
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

                  {/* Village & Taluka */}
                  <th
                    scope="col"
                    onClick={() => handleSort('villageName')}
                    className="py-3 px-3 w-[17%] text-left border-r border-slate-200/60 cursor-pointer hover:bg-slate-200/60 transition group"
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

                  {/* Gat No & Survey No */}
                  <th
                    scope="col"
                    onClick={() => handleSort('gatNumber')}
                    className="py-3 px-3 w-[13%] text-left border-r border-slate-200/60 cursor-pointer hover:bg-slate-200/60 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>स.नं. / गट व हिस्सा</span>
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

                  {/* Area */}
                  <th
                    scope="col"
                    onClick={() => handleSort('totalAreaHa')}
                    className="py-3 px-3 w-[12%] text-left border-r border-slate-200/60 cursor-pointer hover:bg-slate-200/60 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>क्षेत्र (हेक्टर व एकर)</span>
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

                  {/* Tenure */}
                  <th
                    scope="col"
                    onClick={() => handleSort('tenureClass')}
                    className="py-3 px-3 w-[13%] text-left border-r border-slate-200/60 cursor-pointer hover:bg-slate-200/60 transition group"
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

                  {/* Dispute Status */}
                  <th scope="col" className="py-3 px-2 w-[9%] text-center border-r border-slate-200/60">
                    वाद स्थिती
                  </th>

                  {/* Actions (Kruti) */}
                  <th scope="col" className="py-3 px-3 w-[15%] min-w-[130px] text-right">
                    कृती
                  </th>
                </tr>
              </thead>

              {/* Native Table Body */}
              <tbody className="divide-y divide-slate-200/80">
                {sortedParcels.map((parcel, index) => {
                  const tenure = getTenureDetails(parcel.tenureClass);
                  const hasDispute = parcel.hasActiveDispute;
                  const isCopied = copiedUpi === parcel.upi;
                  const isExpanded = expandedRowIds.has(parcel.id);
                  const rowNumber = (page - 1) * limit + index + 1;
                  const areaHa = Number(parcel.totalAreaHa || 0);
                  const areaAcres = (areaHa * 2.47105).toFixed(2);
                  const potkharabaHa = Number(parcel.potkharabaAreaHa || 0);
                  const activeCase = parcel.forwardCases && parcel.forwardCases[0];

                  return (
                    <React.Fragment key={parcel.id}>
                      {/* Main Table Row */}
                      <tr
                        className={`transition-colors cursor-pointer ${
                          isExpanded
                            ? 'bg-blue-50/50 border-l-4 border-l-blue-900'
                            : index % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/30'
                        } hover:bg-blue-50/40`}
                        onClick={() => setSelectedUpi(parcel.upi)}
                      >
                        {/* Col 1: Sr No & Expand Toggle */}
                        <td
                          className="py-2.5 px-1.5 text-center align-middle border-r border-slate-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => toggleRowExpansion(parcel.id, e)}
                              className={`w-5 h-5 rounded flex items-center justify-center transition ${
                                isExpanded
                                  ? 'bg-blue-900 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                              }`}
                              title={isExpanded ? 'तपशील बंद करा' : 'तपशील व प्रकरणे उघडा'}
                            >
                              <ChevronRight
                                className={`w-3 h-3 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            <span className="font-mono text-[11px] font-bold text-slate-500">
                              {rowNumber}
                            </span>
                          </div>
                        </td>

                        {/* Col 2: UPI / भूखंड ओळख (Full visibility, no truncation) */}
                        <td className="py-2.5 px-3 align-middle border-r border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono text-xs font-black text-blue-950 bg-blue-50/90 hover:bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 select-all whitespace-nowrap transition"
                              title="३६०° शीर्षक साखळी पाहण्यासाठी क्लिक करा"
                            >
                              {parcel.upi}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(parcel.upi, e)}
                              className="text-slate-400 hover:text-blue-900 p-0.5 rounded transition shrink-0"
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
                        <td className="py-2.5 px-3 align-middle border-r border-slate-100">
                          <div>
                            <div className="font-bold text-slate-900 text-xs truncate">
                              {parcel.villageName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>तालुका:</span>
                              <span className="font-semibold text-slate-700">{parcel.taluka}</span>
                            </div>
                          </div>
                        </td>

                        {/* Col 4: Gat No, Survey No & Hissa */}
                        <td className="py-2.5 px-3 align-middle border-r border-slate-100">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                गट {parcel.gatNumber}
                              </span>
                              <span className="text-[10px] font-semibold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                                हि. {parcel.hissaNumber || '०'}
                              </span>
                            </div>
                            {parcel.oldSurveyNo && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                जुना स.नं. <span className="font-medium text-slate-700">{parcel.oldSurveyNo}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Col 5: Total & Potkharaba Area */}
                        <td className="py-2.5 px-3 align-middle border-r border-slate-100">
                          <div>
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {areaHa.toFixed(4)} हे.
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              ~{areaAcres} एकर
                              {potkharabaHa > 0 && ` • पो.ख. ${potkharabaHa.toFixed(2)} हे.`}
                            </div>
                          </div>
                        </td>

                        {/* Col 6: Tenure Class */}
                        <td className="py-2.5 px-3 align-middle border-r border-slate-100">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${tenure.badgeClass}`}
                            title={tenure.hint}
                          >
                            {tenure.icon}
                            <span>{tenure.label}</span>
                          </span>
                        </td>

                        {/* Col 7: Dispute Status */}
                        <td className="py-2.5 px-2 text-center align-middle border-r border-slate-100">
                          {hasDispute ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-200 whitespace-nowrap"
                              title={activeCase ? `सक्रिय केस क्र: ${activeCase.caseNumber}` : 'शर्तभंग चौकशी प्रलंबित'}
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>शर्तभंग चौकशी</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                              <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>निर्वेध</span>
                            </span>
                          )}
                        </td>

                        {/* Col 8: Action Buttons (Kruti - Horizontal side-by-side) */}
                        <td
                          className="py-2.5 px-3 text-right align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedUpi(parcel.upi)}
                              className="inline-flex items-center gap-1 text-xs bg-blue-900 hover:bg-blue-800 text-white font-bold px-2.5 py-1.5 rounded-lg transition shadow-2xs active:scale-95 whitespace-nowrap"
                              title="१९५० शीर्षक साखळी व संपूर्ण इतिहास पहा"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>१९५० साखळी</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadModalParcelId(parcel.id)}
                              className="p-1.5 border border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-blue-900 rounded-lg transition active:scale-95 shadow-2xs shrink-0"
                              title="कागदपत्रे अपलोड करा (DMS)"
                              aria-label="कागदपत्रे अपलोड करा"
                            >
                              <Upload className="w-4 h-4 text-blue-700" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Modern Sleek Telemetry Ribbon (Zero-Bloat, Clean, High-Tech) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200/90 animate-in fade-in duration-150">
                          <td colSpan={8} className="py-2.5 px-4 bg-gradient-to-r from-blue-50/40 via-slate-50/60 to-white border-l-4 border-l-blue-900">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                              {/* 1. 1950 Provenance */}
                              <div className="flex items-center gap-2.5 min-w-[200px]">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 shadow-2xs">
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800">१९५० शीर्षक साखळी:</span>
                                    <span className="font-bold text-blue-900 bg-blue-100/70 px-1.5 py-0.2 rounded border border-blue-200 text-[10px]">
                                      {parcel._count?.backwardHistories || 0} ऐतिहासिक फेरफार नोंदी
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    मूळ १९५० मालकी, फेरफार नोंदी व कायदेशीर पुरावे
                                  </p>
                                </div>
                              </div>

                              {/* Vertical Divider */}
                              <div className="hidden lg:block w-px h-7 bg-slate-200/80 shrink-0" />

                              {/* 2. Legal / Dispute Status */}
                              <div className="flex items-center gap-2.5 min-w-[240px]">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                                    hasDispute
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  <Scale className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800">कायदेशीर स्थिती:</span>
                                    {hasDispute && activeCase ? (
                                      <span className="font-mono font-bold text-rose-900 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 text-[10px]">
                                        {activeCase.caseNumber}
                                      </span>
                                    ) : hasDispute ? (
                                      <span className="text-rose-700 font-bold text-[11px]">शर्तभंग चौकशी चालू</span>
                                    ) : (
                                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>७/१२ निर्वेध (विवादरहित)</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {hasDispute && activeCase
                                      ? `${VIOLATION_TYPES[activeCase.violationType]?.labelMr || activeCase.violationType} चौकशी`
                                      : hasDispute
                                      ? 'सक्रिय वाद नोंदवलेला आहे'
                                      : 'कोणतीही शर्तभंग अथवा अतिक्रमण चौकशी नाही'}
                                  </p>
                                </div>
                              </div>

                              {/* Vertical Divider */}
                              <div className="hidden lg:block w-px h-7 bg-slate-200/80 shrink-0" />

                              {/* 3. Survey & Potkharaba Specs */}
                              <div className="flex items-center gap-2.5 min-w-[190px]">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                                  <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                                    <span className="font-bold">गाव कोड:</span>{' '}
                                    <span className="font-mono font-semibold">{parcel.villageCode || 'N/A'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-bold">पोटखराब:</span>{' '}
                                    <span className="font-mono font-semibold">
                                      {potkharabaHa > 0 ? `${potkharabaHa.toFixed(4)} हे.` : 'निरंक'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {parcel.district || 'चंद्रपूर'} • {parcel.taluka}
                                  </p>
                                </div>
                              </div>

                              {/* Vertical Divider */}
                              <div className="hidden lg:block w-px h-7 bg-slate-200/80 shrink-0" />

                              {/* 4. Quick Action Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-auto">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUpi(parcel.upi)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 px-2.5 py-1.5 rounded-lg transition shadow-2xs active:scale-95"
                                >
                                  <Eye className="w-3 h-3 text-blue-700" />
                                  <span>३६०° साखळी</span>
                                </button>
                                {hasDispute && activeCase && (
                                  <Link
                                    href={`/cases?search=${encodeURIComponent(activeCase.caseNumber)}`}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 px-2.5 py-1.5 rounded-lg transition shadow-2xs active:scale-95"
                                  >
                                    <span>केस तपशील</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </Link>
                                )}
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
