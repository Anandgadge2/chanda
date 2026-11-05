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
  RotateCcw,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS, TENURE_CLASSES } from '../../lib/constants';

const ParcelTraceDrawer = dynamic(() => import('../../components/ParcelTraceDrawer'), { ssr: false });
const DocUploadModal = dynamic(() => import('../../components/DocUploadModal'), { ssr: false });
const RevenueShortcutGuideModal = dynamic(() => import('../../components/RevenueShortcutGuideModal'), { ssr: false });

import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import { useTranslation } from '../../components/LanguageContext';
import { formatVillageName, formatTalukaName } from '../../lib/villageUtils';
import clsx from 'clsx';


// 17 Statutory Subject Booklets (प्रपत्र / विषय १७ पुस्तिका)
export const BOOKLET_17_CATEGORIES = [
  { id: 1, nameMr: '१. सरकारी जमीन (गायरान, वन, पहाड, खडक)', nameEn: '1. Govt Land (Gairan, Forest, Hill)', shortMr: '१. सरकारी जमीन', shortEn: '1. Govt Land' },
  { id: 2, nameMr: '२. कुळ वहिवाट व शेतजमीन कायदा', nameEn: '2. Tenancy & Agrl Land Act', shortMr: '२. कुळ वहिवाट', shortEn: '2. Tenancy' },
  { id: 3, nameMr: '३. जमिन इनाम व वतन जमिनी', nameEn: '3. Inam & Watan Lands', shortMr: '३. इनाम व वतन', shortEn: '3. Inam & Watan' },
  { id: 4, nameMr: '४. म.ज.म.अधि. १९६६ भूमिहीन वाटप', nameEn: '4. MLRC 1966 Landless Grants', shortMr: '४. भूमिहीन वाटप', shortEn: '4. Landless Grants' },
  { id: 5, nameMr: '५. म.ज.म.अधि. १९६६ संस्था/उद्योग', nameEn: '5. MLRC 1966 Institutions/Industries', shortMr: '५. संस्था/उद्योग वाटप', shortEn: '5. Institutions' },
  { id: 6, nameMr: '६. महाराष्ट्र शेतजमीन कमाल धारणा १९६१', nameEn: '6. Land Ceiling Surplus Allotment', shortMr: '६. कमाल धारणा (सिलिंग)', shortEn: '6. Ceiling Surplus' },
  { id: 7, nameMr: '७. विकास आराखडा व गुरचरण जमिनी', nameEn: '7. Development Plan & Gurcharan', shortMr: '७. विकास व गुरचरण', shortEn: '7. DP & Gurcharan' },
  { id: 8, nameMr: '८. जमीन देवस्थान इनाम जमिनी', nameEn: '8. Devasthan Inam Lands', shortMr: '८. देवस्थान इनाम', shortEn: '8. Devasthan Inam' },
  { id: 9, nameMr: '९. आदिवासी खातेदारांचे जमिनी', nameEn: '9. Tribal Khatedar Lands (Sec 36)', shortMr: '९. आदिवासी जमिनी', shortEn: '9. Tribal Lands' },
  { id: 10, nameMr: '१०. पुनर्वसन अधिनियम १९९९ कलम १६', nameEn: '10. Rehabilitation Act 1999 Sec 16', shortMr: '१०. पुनर्वसन प्रदान', shortEn: '10. Rehabilitation' },
  { id: 11, nameMr: '११. भाडेपट्ट्याने दिलेली शासकीय जमीन', nameEn: '11. Government Leased Lands', shortMr: '११. शासकीय भाडेपट्टा', shortEn: '11. Leased Lands' },
  { id: 12, nameMr: '१२. भूदान व ग्रामदान प्रदान जमिनी', nameEn: '12. Bhoodan & Gramdan Lands', shortMr: '१२. भूदान व ग्रामदान', shortEn: '12. Bhoodan' },
  { id: 13, nameMr: '१३. खाजगी वने संपादन अधिनियम १९७५', nameEn: '13. Private Forest Acquisition Act', shortMr: '१३. खाजगी वने', shortEn: '13. Private Forests' },
  { id: 14, nameMr: '१४. भूमीधारी हक्क प्राप्त जमिनी', nameEn: '14. Bhumidhari Rights Lands', shortMr: '१४. भूमीधारी हक्क', shortEn: '14. Bhumidhari' },
  { id: 15, nameMr: '१५. कमाल जमीन धारणा सूट जमीन', nameEn: '15. Ceiling Exemption Holdings', shortMr: '१५. कमाल धारणा सूट', shortEn: '15. Ceiling Exemption' },
  { id: 16, nameMr: '१६. वक्फ बोर्डाचे मालकीची जमीन', nameEn: '16. Waqf Board Registered Lands', shortMr: '१६. वक्फ बोर्ड जमीन', shortEn: '16. Waqf Board' },
  { id: 17, nameMr: '१७. भूसंपादन अधिग्रहित / राखीव जमीन', nameEn: '17. Land Acquisition Reserved Lands', shortMr: '१७. भूसंपादन / राखीव', shortEn: '17. Land Acquisition' },
  { id: 18, nameMr: '१८. कुळ कायद्याचे कलम 89 व 89-अ/47 व 47 प्रमाणे धारण केलेली जमीन', nameEn: '18. Tenancy Act Sec 89/89-A/47 Holdings', shortMr: '१८. कलम ८९ व ४७ जमीन', shortEn: '18. Sec 89/47 Holdings' }
];

export const BOOKLET_18_CATEGORIES = BOOKLET_17_CATEGORIES;

export default function ParcelsPage() {
  const { isMarathi } = useTranslation();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(25);

  // Draft Filter Inputs
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [villageOptions, setVillageOptions] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [bookletCategory, setBookletCategory] = useState('');
  const [tenureClass, setTenureClass] = useState('');
  const [hasActiveDispute, setHasActiveDispute] = useState('');
  const [search, setSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState('cards'); // 'cards' | 'table'

  // Applied Filters (used for backend queries and active badge display)
  const [appliedFilters, setAppliedFilters] = useState({
    taluka: '',
    village: '',
    bookletCategory: '',
    tenureClass: '',
    hasActiveDispute: '',
    search: '',
  });

  // Sorting
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Copy Feedback
  const [copiedUpi, setCopiedUpi] = useState(null);

  // Drawers & Modals
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [uploadModalParcelId, setUploadModalParcelId] = useState(null);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);

  // Fetch Parcels with specified target page, filters and limit
  const fetchParcels = async (
    targetPage = page,
    filtersToUse = appliedFilters,
    targetLimit = limit
  ) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit: targetLimit };
      if (filtersToUse.taluka) params.taluka = filtersToUse.taluka;
      if (filtersToUse.village && filtersToUse.village !== 'all') params.village = filtersToUse.village;
      if (filtersToUse.bookletCategory) params.bookletCategory = filtersToUse.bookletCategory;
      if (filtersToUse.tenureClass) params.tenureClass = filtersToUse.tenureClass;
      if (filtersToUse.hasActiveDispute !== '') params.hasActiveDispute = filtersToUse.hasActiveDispute;
      if (filtersToUse.search && filtersToUse.search.trim()) params.search = filtersToUse.search.trim();

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

  // Read query params from URL on mount
  useEffect(() => {
    let initialFilters = {
      taluka: '',
      village: '',
      bookletCategory: '',
      tenureClass: '',
      hasActiveDispute: '',
      search: '',
    };
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qTaluka = urlParams.get('taluka') || '';
      const qVillage = urlParams.get('village') || '';
      const qBooklet = urlParams.get('booklet') || urlParams.get('category') || '';
      const qTenureClass = urlParams.get('tenureClass') || urlParams.get('tenure') || '';
      const qDispute = urlParams.get('hasActiveDispute') || urlParams.get('dispute') || '';
      const qSearch = urlParams.get('search') || '';

      if (qTaluka) setTaluka(qTaluka);
      if (qVillage) setVillage(qVillage);
      if (qBooklet) setBookletCategory(qBooklet);
      if (qTenureClass) setTenureClass(qTenureClass);
      if (qDispute) setHasActiveDispute(qDispute);
      if (qSearch) setSearch(qSearch);

      initialFilters = {
        ...initialFilters,
        taluka: qTaluka,
        village: qVillage,
        bookletCategory: qBooklet,
        tenureClass: qTenureClass,
        hasActiveDispute: qDispute,
        search: qSearch,
      };
    }
    setAppliedFilters(initialFilters);
    fetchParcels(1, initialFilters, limit);
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

  // Check if draft filters have unapplied changes
  const isFilterPending = useMemo(() => {
    return (
      taluka !== appliedFilters.taluka ||
      village !== appliedFilters.village ||
      bookletCategory !== appliedFilters.bookletCategory ||
      tenureClass !== appliedFilters.tenureClass ||
      hasActiveDispute !== appliedFilters.hasActiveDispute ||
      search.trim() !== appliedFilters.search.trim()
    );
  }, [taluka, village, bookletCategory, tenureClass, hasActiveDispute, search, appliedFilters]);

  // Apply filters button handler
  const handleApplyFilters = () => {
    const nextFilters = {
      taluka,
      village,
      bookletCategory,
      tenureClass,
      hasActiveDispute,
      search: search.trim(),
    };
    setAppliedFilters(nextFilters);
    setPage(1);
    fetchParcels(1, nextFilters, limit);
  };

  // Search input change handler
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  const handleResetFilters = () => {
    const cleanFilters = {
      taluka: '',
      village: '',
      bookletCategory: '',
      tenureClass: '',
      hasActiveDispute: '',
      search: '',
    };
    setTaluka('');
    setVillage('');
    setBookletCategory('');
    setTenureClass('');
    setHasActiveDispute('');
    setSearch('');
    setAppliedFilters(cleanFilters);
    setPage(1);
    fetchParcels(1, cleanFilters, limit);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchParcels(newPage, appliedFilters, limit, sortColumn, sortDirection);
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    fetchParcels(1, appliedFilters, newLimit, sortColumn, sortDirection);
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

  // Natural alphanumeric comparator for Gat & Survey numbers (properly orders 1, 2, 3... 10, 11/1, 101, 112)
  const compareGatNumbers = (aGatRaw, bGatRaw, aHissaRaw, bHissaRaw) => {
    const toAscii = (s) => String(s || '').replace(/[०-९]/g, (d) => '०१२३४५६७८९'.indexOf(d)).trim();
    const aGat = toAscii(aGatRaw);
    const bGat = toAscii(bGatRaw);

    const gatResult = aGat.localeCompare(bGat, undefined, {
      numeric: true,
      sensitivity: 'base',
    });

    if (gatResult !== 0) return gatResult;

    const aHissa = toAscii(aHissaRaw || '0');
    const bHissa = toAscii(bHissaRaw || '0');
    return aHissa.localeCompare(bHissa, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  };

  const getParcelOwnerName = (p) =>
    p.currentOwner ||
    p.metadata?.currentOwner ||
    p.metadata?.ownerName ||
    (p.tenureClass === 'SARKAR_SHASAN'
      ? (isMarathi ? 'महाराष्ट्र शासन' : 'Government of Maharashtra')
      : (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available'));

  // Column Sorting Handler (Instant In-Memory Sorting, Zero Network Overhead)
  const handleSort = (column) => {
    let nextColumn = sortColumn;
    let nextDirection = 'asc';

    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        nextDirection = 'desc';
      } else {
        nextColumn = null;
        nextDirection = 'asc';
      }
    } else {
      nextColumn = column;
      // Default mutationCount to descending first so parcels with most mutations appear first
      nextDirection = column === 'mutationCount' ? 'desc' : 'asc';
    }

    setSortColumn(nextColumn);
    setSortDirection(nextDirection);
  };

  // Sorted Parcels List (Instant Client-Side Sorting)
  const sortedParcels = useMemo(() => {
    if (!sortColumn) {
      // By default, if records on the page belong to the same village, sort naturally by Gat Number
      const isSingleVillage = parcels.length > 0 && parcels.every((p) => p.villageName === parcels[0].villageName);
      if (isSingleVillage) {
        return [...parcels].sort((a, b) =>
          compareGatNumbers(a.gatNumber, b.gatNumber, a.hissaNumber, b.hissaNumber)
        );
      }
      return parcels;
    }

    return [...parcels].sort((a, b) => {
      if (sortColumn === 'gatNumber') {
        const res = compareGatNumbers(a.gatNumber, b.gatNumber, a.hissaNumber, b.hissaNumber);
        return sortDirection === 'asc' ? res : -res;
      }

      if (sortColumn === 'mutationCount') {
        const aCount = a._count?.backwardHistories ?? a.backwardHistories?.length ?? 0;
        const bCount = b._count?.backwardHistories ?? b.backwardHistories?.length ?? 0;
        return sortDirection === 'asc' ? aCount - bCount : bCount - aCount;
      }

      if (sortColumn === 'currentOwner') {
        const aOwner = getParcelOwnerName(a);
        const bOwner = getParcelOwnerName(b);
        const res = aOwner.localeCompare(bOwner, isMarathi ? 'mr' : 'en', { sensitivity: 'base' });
        return sortDirection === 'asc' ? res : -res;
      }

      if (sortColumn === 'totalAreaHa') {
        const aVal = Number(a.totalAreaHa || 0);
        const bVal = Number(b.totalAreaHa || 0);
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (sortColumn === 'villageName') {
        const aVal = formatVillageName(a.villageName, isMarathi);
        const bVal = formatVillageName(b.villageName, isMarathi);
        const res = aVal.localeCompare(bVal, isMarathi ? 'mr' : 'en', { sensitivity: 'base' });
        return sortDirection === 'asc' ? res : -res;
      }

      if (sortColumn === 'tenureClass') {
        const aLabel = getTenureDetails(a.tenureClass)?.label || '';
        const bLabel = getTenureDetails(b.tenureClass)?.label || '';
        const res = aLabel.localeCompare(bLabel, isMarathi ? 'mr' : 'en', { sensitivity: 'base' });
        return sortDirection === 'asc' ? res : -res;
      }

      let aVal = a[sortColumn] || '';
      let bVal = b[sortColumn] || '';
      const res = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'asc' ? res : -res;
    });
  }, [parcels, sortColumn, sortDirection, isMarathi]);

  // Summary counts for compact header pills
  const stats = useMemo(() => {
    const class2Count = parcels.filter((p) => p.tenureClass === 'BHOGVATDAR_CLASS_2').length;
    const disputeCount = parcels.filter((p) => p.hasActiveDispute).length;
    return { class2Count, disputeCount };
  }, [parcels]);

  const activeFiltersCount =
    (appliedFilters.search ? 1 : 0) +
    (appliedFilters.taluka ? 1 : 0) +
    (appliedFilters.village ? 1 : 0) +
    (appliedFilters.bookletCategory ? 1 : 0) +
    (appliedFilters.tenureClass ? 1 : 0) +
    (appliedFilters.hasActiveDispute !== '' ? 1 : 0);

  const bookletSelectOptions = useMemo(() => [
    {
      value: '',
      label: isMarathi ? 'सर्व प्रपत्र / विषय (१-१८)' : 'All Booklets (1-18)',
      
    },
    ...BOOKLET_17_CATEGORIES.map((cat) => ({
      value: String(cat.id),
      label: isMarathi ? cat.nameMr : cat.nameEn,
      subtext: isMarathi ? `पुस्तिका क्र. ${cat.id}` : `Booklet #${cat.id}`
    }))
  ], [isMarathi]);

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
          icon: <AlertTriangle className="w-3 h-3 text-indigo-600 shrink-0" />,
          label: isEn ? (config?.labelEn || 'Occupant Class-2') : (config?.labelMr || 'भोगवटादार वर्ग-२'),
          hint: isEn ? 'Collector prior sanction mandatory' : 'कलेक्टर पूर्वपरवानगी अनिवार्य',
          badgeClass: 'bg-indigo-50/50 text-indigo-700 border-indigo-100/70',
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
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-2 sm:space-y-2.5">
      {/* Executive Command Header - Pro Compact */}
      <div className="bg-white text-slate-900 rounded-xl px-3.5 py-2 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              {isMarathi ? 'भूखंड नोंदवही (७/१२ अभिलेख)' : 'Land Parcel Register (7/12 Records)'}
            </h1>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              {isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District'}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {isMarathi ? `एकूण ${totalCount} अभिलेख` : `Total ${totalCount} Records`}
            </span>
            <span className="hidden xl:inline text-[11px] text-slate-400 font-medium">
              {isMarathi
                ? '• ऐतिहासिक १९५० मूळ मालकी, फेरफार नोंदी व चालू स्थिती'
                : '• Historical 1950 Provenance, Mutation Entries & Current Status'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setGlossaryModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={isMarathi ? '७/१२ संक्षिप्त रूपे मदत' : '7/12 Abbreviations Guide'}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isMarathi ? '७/१२ संक्षिप्त रूपे' : '7/12 Abbreviations'}</span>
          </button>

          <button
            onClick={() => fetchParcels(page, appliedFilters, limit)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-800 hover:text-slate-950 border border-slate-300 text-xs transition-all active:scale-95 shadow-2xs cursor-pointer"
            title={isMarathi ? 'तक्ता रीफ्रेश करा' : 'Refresh Table'}
            aria-label={isMarathi ? 'तक्ता रीफ्रेश करा' : 'Refresh Table'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : 'text-slate-800'}`} />
          </button>
        </div>
      </div>

      {/* Modern Compact Filter & Search Command Toolbar */}
      <div className="relative z-30 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-xl p-2.5 shadow-xs space-y-2">
        {/* Mobile Header / Quick Search Toggle on Small Screens */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilters();
                }
              }}
              placeholder={
                isMarathi
                  ? 'गट क्र., जुना स.नं., किंवा UPI...'
                  : 'Search Gat, Survey or UPI...'
              }
              className="w-full h-9 pl-8 pr-7 text-xs bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 p-0.5 cursor-pointer"
                title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters((p) => !p)}
            className={clsx(
              'h-9 px-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-2xs cursor-pointer',
              showMobileFilters || activeFiltersCount > 0
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'फिल्टर्स' : 'Filters'}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', showMobileFilters && 'rotate-180')} />
          </button>
        </div>

        {/* Filter Dropdowns Suite: Single compact row on desktop */}
        <div
          className={clsx(
            'gap-2 items-center',
            showMobileFilters
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.1fr_1.3fr_1fr_0.9fr_auto_auto] pt-2 border-t border-slate-100 lg:border-t-0 lg:pt-0'
              : 'hidden lg:grid lg:grid-cols-[1.4fr_1fr_1.1fr_1.3fr_1fr_0.9fr_auto_auto]'
          )}
        >
          {/* Desktop Search Input */}
          <div className="relative min-w-0 hidden lg:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilters();
                }
              }}
              placeholder={
                isMarathi
                  ? 'गट क्र., जुना स.नं., किंवा UPI...'
                  : 'Search Gat, Survey or UPI...'
              }
              className="w-full h-9 pl-8 pr-7 text-xs bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 p-0.5 cursor-pointer"
                title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Taluka Dropdown */}
          <div className="min-w-0">
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
              compact={true}
            />
          </div>

          {/* Village Dropdown */}
          <div className="min-w-0">
            <SearchableSelect
              options={villageSelectOptions}
              value={village}
              onChange={(val) => setVillage(val)}
              placeholder={loadingVillages ? (isMarathi ? 'लोड होत आहे...' : 'Loading...') : (isMarathi ? 'सर्व गावे' : 'All Villages')}
              searchPlaceholder={isMarathi ? 'गाव शोधा...' : 'Search village...'}
              icon={LandPlot}
              showCount={true}
              compact={true}
            />
          </div>

          {/* प्रपत्र / विषय १७ पुस्तिका Dropdown */}
          <div className="min-w-0">
            <SearchableSelect
              options={bookletSelectOptions}
              value={bookletCategory}
              onChange={(val) => setBookletCategory(val)}
              placeholder={isMarathi ? 'सर्व प्रपत्र (१-१८)' : 'All Booklets (1-18)'}
              searchPlaceholder={isMarathi ? 'प्रपत्र शोधा...' : 'Search booklets...'}
              icon={BookOpen}
              showCount={false}
              compact={true}
            />
          </div>

          {/* Tenure Class Dropdown */}
          <div className="min-w-0">
            <SearchableSelect
              options={tenureSelectOptions}
              value={tenureClass}
              onChange={(val) => setTenureClass(val)}
              placeholder={isMarathi ? 'सर्व धारणा' : 'All Tenure'}
              searchPlaceholder={isMarathi ? 'धारणा शोधा...' : 'Search tenure...'}
              icon={Layers}
              showCount={false}
              compact={true}
            />
          </div>

          {/* Dispute Status Dropdown */}
          <div className="min-w-0">
            <SearchableSelect
              options={disputeSelectOptions}
              value={hasActiveDispute}
              onChange={(val) => setHasActiveDispute(val)}
              placeholder={isMarathi ? 'सर्व स्थिती' : 'All Dispute'}
              searchPlaceholder={isMarathi ? 'वाद स्थिती शोधा...' : 'Search dispute...'}
              icon={AlertTriangle}
              showCount={false}
              compact={true}
            />
          </div>

          {/* Apply Button ("लागू करा" / "Apply") */}
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className={clsx(
              'h-9 px-3.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer select-none w-full sm:w-auto',
              isFilterPending
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/60 ring-offset-1 shadow-emerald-700/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            )}
            title={isMarathi ? 'निवडलेले फिल्टर्स लागू करा (Enter)' : 'Apply Selected Filters (Enter)'}
          >
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
            {isFilterPending && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse shrink-0" />
            )}
          </button>

          {/* Reset Filters Button ("रीसेट" / "Reset") */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-9 px-3 text-slate-800 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 rounded-lg border border-slate-300 hover:border-rose-300 transition-all active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-2xs"
            title={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
            aria-label={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Enhanced Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-100/80 flex items-center justify-center text-indigo-600 shrink-0">
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
              {appliedFilters.village && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    <LandPlot className="w-3 h-3 text-emerald-600" />
                    {isMarathi ? `गाव: ${formatVillageName(appliedFilters.village, true)}` : `Village: ${formatVillageName(appliedFilters.village, false)}`}
                  </span>
                </>
              )}
              {appliedFilters.bookletCategory && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                    <BookOpen className="w-3 h-3 text-indigo-600" />
                    {(() => {
                      const cat = BOOKLET_17_CATEGORIES.find((c) => String(c.id) === String(appliedFilters.bookletCategory));
                      return isMarathi ? (cat?.shortMr || `पुस्तिका क्र. ${appliedFilters.bookletCategory}`) : (cat?.shortEn || `Booklet #${appliedFilters.bookletCategory}`);
                    })()}
                  </span>
                </>
              )}
              {appliedFilters.tenureClass && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50/50 text-indigo-900 border border-indigo-100/80 px-2 py-0.5 rounded-full">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    <span>
                      {TENURE_CLASSES[appliedFilters.tenureClass]
                        ? (isMarathi ? TENURE_CLASSES[appliedFilters.tenureClass].labelMr : TENURE_CLASSES[appliedFilters.tenureClass].labelEn)
                        : appliedFilters.tenureClass}
                    </span>
                  </span>
                </>
              )}
              {appliedFilters.hasActiveDispute === 'true' && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>{isMarathi ? 'सक्रिय शर्तभंग / वाद' : 'Active Breach / Dispute'}</span>
                  </span>
                </>
              )}
              {stats.class2Count > 0 && !appliedFilters.tenureClass && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-indigo-700 font-medium">
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

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* View Mode Switcher on Mobile/Tablet */}
            <div className="inline-flex md:hidden p-0.5 rounded-lg bg-slate-200/80 border border-slate-300">
              <button
                type="button"
                onClick={() => setMobileViewMode('cards')}
                className={clsx(
                  'px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer',
                  mobileViewMode === 'cards' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                )}
                title={isMarathi ? 'कार्ड दृश्य' : 'Card View'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'कार्ड' : 'Cards'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('table')}
                className={clsx(
                  'px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer',
                  mobileViewMode === 'table' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                )}
                title={isMarathi ? 'तक्ता दृश्य' : 'Table View'}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'तक्ता' : 'Table'}</span>
              </button>
            </div>

            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              <span>{isMarathi ? 'ओळीवर क्लिक करून ३६०° साखळी पहा' : 'Click a row to view 360° Provenance Chain'}</span>
            </span>
            {mobileViewMode === 'table' && (
              <span className="md:hidden text-[10px] text-indigo-800 bg-indigo-50/50 px-2 py-0.5 rounded-full border border-indigo-100 font-semibold">
                {isMarathi ? 'तक्ता आडवा स्क्रोल करा ↔' : 'Scroll table horizontally ↔'}
              </span>
            )}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2.5" />
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'सर्व फिल्टर्स साफ करा' : 'Clear all filters'}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Shown on screens < md when mobileViewMode === 'cards') */}
            {mobileViewMode === 'cards' && (
              <div className="md:hidden p-3 sm:p-4 space-y-3 bg-slate-50/70 divide-y divide-slate-100">
                {sortedParcels.map((parcel, index) => {
                  const tenure = getTenureDetails(parcel.tenureClass);
                  const hasDispute = parcel.hasActiveDispute;
                  const isCopied = copiedUpi === parcel.upi;
                  const areaHa = Number(parcel.totalAreaHa || 0);
                  const areaAcres = (areaHa * 2.47105).toFixed(2);
                  const activeCase = parcel.forwardCases && parcel.forwardCases[0];
                  const ownerName =
                    parcel.currentOwner ||
                    parcel.metadata?.currentOwner ||
                    parcel.metadata?.ownerName ||
                    (parcel.tenureClass === 'SARKAR_SHASAN'
                      ? (isMarathi ? 'महाराष्ट्र शासन' : 'Government of Maharashtra')
                      : (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available'));

                  return (
                    <div
                      key={`mob-${parcel.id}`}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md p-4 space-y-3 transition active:scale-[0.99]"
                    >
                      {/* Top Row: Gat Badge, Old Survey, Copy UPI */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 font-black text-sm">
                            {isMarathi ? 'गट क्र.' : 'Gat'} {parcel.gatNumber}
                          </span>
                          {parcel.hissaNumber && parcel.hissaNumber !== '0' && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                              {isMarathi ? 'हि.' : 'H.'} {parcel.hissaNumber}
                            </span>
                          )}
                          {parcel.oldSurveyNo && (
                            <span className="text-xs text-slate-600 font-semibold">
                              ({isMarathi ? 'जुना स.नं.' : 'Old S.'} {parcel.oldSurveyNo})
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyUpi(parcel.upi)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
                          title={isMarathi ? 'UPI कॉपी करा' : 'Copy UPI'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                          <span className="truncate max-w-[100px]">{parcel.upi?.slice(-10) || 'UPI'}</span>
                        </button>
                      </div>

                      {/* Location: Village & Taluka */}
                      <div className="flex items-center gap-1.5 text-sm text-slate-800 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-900">{formatVillageName(parcel.villageName, isMarathi)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-slate-600">{formatTalukaName(parcel.taluka, isMarathi)}</span>
                      </div>

                      {/* Owner / Khatedar Card */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs text-slate-600 font-bold uppercase tracking-wider block mb-1">
                          {isMarathi ? 'खातेदार / भोगवटदार' : 'Khatedar / Occupant'}
                        </span>
                        <p className="text-sm font-bold text-slate-950 leading-snug whitespace-normal break-words">
                          {ownerName}
                        </p>
                      </div>

                      {/* Metrics: Area & Tenure */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-xs text-slate-600 font-semibold block mb-0.5">
                            {isMarathi ? 'एकूण क्षेत्र' : 'Total Area'}
                          </span>
                          <span className="font-black text-slate-950 font-mono text-sm">
                            {areaHa.toFixed(2)} {isMarathi ? 'हे.' : 'Ha'}
                          </span>
                          <span className="text-xs text-slate-600 font-medium ml-1">
                            ({areaAcres} {isMarathi ? 'एकर' : 'Ac'})
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <span className="text-xs text-slate-600 font-semibold block mb-0.5">
                            {isMarathi ? 'धारणा प्रकार' : 'Tenure'}
                          </span>
                          <span className={clsx('inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg border mt-0.5 w-fit', tenure.badgeClass)}>
                            {tenure.icon}
                            <span className="whitespace-normal">{tenure.label}</span>
                          </span>
                          {tenure.hint && (
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">{tenure.hint}</p>
                          )}
                        </div>
                      </div>

                      {/* Dispute Status Bar */}
                      {hasDispute ? (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{isMarathi ? 'शर्तभंग / सक्रिय वाद' : 'Breach / Dispute Flagged'}</span>
                          </div>
                          {activeCase && (
                            <span className="text-xs font-mono text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md font-bold">
                              {activeCase.caseNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold px-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{isMarathi ? 'निर्वैध नोंद (Clear Record)' : 'Clear Record'}</span>
                        </div>
                      )}

                      {/* Quick Action CTAs */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUpi(parcel.upi)}
                          className="flex-1 h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-white shrink-0" />
                          <span>{isMarathi ? '३६०° साखळी पहा' : 'View 360° Trace'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUploadModalParcelId(parcel.id)}
                          className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                          title={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                          aria-label={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Desktop Table (and mobile when mobileViewMode === 'table') */}
            <div
              className={clsx(
                'w-full overflow-x-auto touch-scroll',
                mobileViewMode === 'cards' ? 'hidden md:block' : 'block'
              )}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <table className="w-full border-collapse text-sm min-w-[1150px]">
              {/* Native Table Head with Balanced Proportions */}
              <thead className="bg-slate-800 text-white text-xs font-black uppercase tracking-wider border-b-2 border-slate-900 select-none sticky top-0 z-10 shadow-xs">
                <tr>
                  {/* Col 1: # */}
                  <th scope="col" className="py-2 px-2 w-[4%] min-w-[36px] text-center">
                    #
                  </th>

                  {/* Col 2: UPI */}
                  <th
                    scope="col"
                    onClick={() => handleSort('upi')}
                    className="py-2 px-2.5 w-[16%] text-left cursor-pointer hover:bg-slate-700 transition-colors duration-150 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'UPI / भूखंड ओळख' : 'UPI / Parcel ID'}</span>
                      {sortColumn === 'upi' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 3: Village & Taluka */}
                  <th
                    scope="col"
                    onClick={() => handleSort('villageName')}
                    className="py-2 px-2.5 w-[14%] text-left cursor-pointer hover:bg-slate-700 transition-colors duration-150 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'तालुका व गाव' : 'Taluka & Village'}</span>
                      {sortColumn === 'villageName' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 4: Gat No & Survey No */}
                  <th
                    scope="col"
                    onClick={() => handleSort('gatNumber')}
                    className="py-2 px-2.5 w-[11%] text-left cursor-pointer hover:bg-slate-700 transition-colors duration-150 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'गट व सर्व्हे क्र.' : 'Gat & Survey No.'}</span>
                      {sortColumn === 'gatNumber' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 5: Current Owner / Khatedar & Ferfar */}
                  <th
                    scope="col"
                    className="py-2.5 px-3 min-w-[280px] text-left"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSort('currentOwner')}
                        className="inline-flex items-center gap-1.5 hover:text-indigo-400 transition text-left group/owner cursor-pointer"
                        title={isMarathi ? 'खातेदारानुसार क्रमवारी लावा' : 'Sort by Khatedar'}
                      >
                        <span className="font-bold text-xs sm:text-[13px]">
                          {isMarathi ? 'खातेदार / भोगवटदार' : 'Khatedar / Occupant'}
                        </span>
                        {sortColumn === 'currentOwner' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover/owner:text-slate-200" />
                        )}
                      </button>
                    </div>
                  </th>

                  {/* Col 6: Total Area & Potkharaba */}
                  <th
                    scope="col"
                    onClick={() => handleSort('totalAreaHa')}
                    className="py-2 px-2.5 w-[11%] text-left cursor-pointer hover:bg-slate-700 transition-colors duration-150 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'एकूण क्षेत्र' : 'Total Area'}</span>
                      {sortColumn === 'totalAreaHa' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 7: Tenure Class */}
                  <th
                    scope="col"
                    onClick={() => handleSort('tenureClass')}
                    className="py-2.5 px-3 min-w-[170px] text-left cursor-pointer hover:bg-slate-700 transition-colors duration-150 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs sm:text-[13px]">{isMarathi ? 'धारणा प्रकार (भोगवटादार वर्ग)' : 'Tenure / Class'}</span>
                      {sortColumn === 'tenureClass' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                      )}
                    </div>
                  </th>

                  {/* Col 8: Dispute Status */}
                  <th scope="col" className="py-2 px-2 w-[7%] text-center">
                    {isMarathi ? 'वाद स्थिती' : 'Dispute'}
                  </th>

                  {/* Col 9: Actions (Kruti) */}
                  <th scope="col" className="py-2 px-2.5 w-[8%] min-w-[95px] text-right">
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
                  const numericLimit = limit === 'all' ? (totalCount || 1) : (Number(limit) || 25);
                  const rowNumber = limit === 'all' ? index + 1 : (page - 1) * numericLimit + index + 1;
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
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      } hover:bg-indigo-50/50`}
                      onClick={() => setSelectedUpi(parcel.upi)}
                    >
                      {/* Col 1: Sr No */}
                      <td className="py-1.5 px-2 text-center align-middle">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {rowNumber}
                        </span>
                      </td>

                      {/* Col 2: UPI / भूखंड ओळख */}
                      <td className="py-1.5 px-2.5 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-sm font-bold text-slate-900 select-all whitespace-nowrap transition group-hover:text-indigo-600"
                            title={isMarathi ? '३६०° शीर्षक साखळी पाहण्यासाठी क्लिक करा' : 'Click to view 360° title trace'}
                          >
                            {parcel.upi}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(parcel.upi, e)}
                            className="text-slate-400 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100 transition shrink-0 cursor-pointer"
                            title={isCopied ? (isMarathi ? 'UPI कॉपी झाले!' : 'UPI copied!') : (isMarathi ? 'UPI कॉपी करा' : 'Copy UPI')}
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Col 3: Village & Taluka */}
                      <td className="py-1.5 px-2.5 align-middle">
                        <div>
                          <div className="font-bold text-slate-900 text-xs truncate max-w-[130px]" title={formatVillageName(parcel.villageName, isMarathi)}>
                            {formatVillageName(parcel.villageName, isMarathi)}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{formatTalukaName(parcel.taluka, isMarathi)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Col 4: Gat No, Survey No & Hissa */}
                      <td className="py-1.5 px-2.5 align-middle">
                        <div>
                          <div className="text-sm flex items-center gap-1.5">
                            <span className="font-black text-emerald-950 bg-emerald-100 border border-emerald-300 rounded px-1.5 py-0.5 text-xs">
                              {isMarathi ? `गट ${parcel.gatNumber}` : `Gat ${parcel.gatNumber}`}
                            </span>
                            {parcel.hissaNumber && parcel.hissaNumber !== '0' && parcel.hissaNumber !== '०' && (
                              <span className="text-slate-800 font-bold text-xs">
                                {isMarathi ? `/ हि. ${parcel.hissaNumber}` : `/ Hissa ${parcel.hissaNumber}`}
                              </span>
                            )}
                          </div>
                          {parcel.oldSurveyNo && (
                            <p className="text-xs text-slate-600 mt-0.5 font-mono text-[10px]">
                              {isMarathi ? `जुना स.नं. ${parcel.oldSurveyNo}` : `Old S.No. ${parcel.oldSurveyNo}`}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Col 5: Current Owner / Khatedar */}
                      <td className="py-2.5 px-3 align-top min-w-[280px]">
                        <div className="space-y-1.5">
                          <div
                            className="font-bold text-slate-950 text-xs sm:text-[13px] leading-snug whitespace-normal break-words"
                            title={ownerName}
                          >
                            {ownerName}
                          </div>
                          <div className="flex items-center gap-2">
                            {mutationCount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                <History className="w-3 h-3 shrink-0" />
                                <span>{mutationCount} {isMarathi ? 'फेरफार' : 'Mutations'}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium">
                                {isMarathi ? 'मूळ नोंद' : 'Original Record'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 6: Total & Potkharaba Area */}
                      <td className="py-1.5 px-2.5 align-middle">
                        <div>
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            {areaHa.toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            ~{areaAcres} {isMarathi ? 'एकर' : 'Acres'}{potkharabaHa > 0 ? ` • ${isMarathi ? 'पो.ख.' : 'Potkharaba'} ${potkharabaHa.toFixed(2)}` : ''}
                          </div>
                        </div>
                      </td>

                      {/* Col 7: Tenure Class */}
                      <td className="py-2.5 px-3 align-top min-w-[170px]">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border whitespace-nowrap shadow-2xs ${tenure.badgeClass}`}
                            title={tenure.hint}
                          >
                            {tenure.icon}
                            <span>{tenure.label}</span>
                          </span>
                          {tenure.hint && (
                            <p className="text-[10px] text-slate-600 font-medium leading-tight whitespace-normal break-words max-w-[200px]">
                              {tenure.hint}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Col 8: Dispute Status */}
                      <td className="py-1.5 px-2 text-center align-middle">
                        {hasDispute ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-300 whitespace-nowrap"
                            title={activeCase ? (isMarathi ? `सक्रिय केस क्र: ${activeCase.caseNumber}` : `Active Case No: ${activeCase.caseNumber}`) : (isMarathi ? 'शर्तभंग चौकशी प्रलंबित' : 'Breach inquiry pending')}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{isMarathi ? 'शर्तभंग' : 'Breach'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 whitespace-nowrap">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isMarathi ? 'निर्वेध' : 'Clear'}</span>
                          </span>
                        )}
                      </td>

                      {/* Col 9: Action Buttons */}
                      <td className="py-1.5 px-2.5 text-right align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedUpi(parcel.upi)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow-2xs"
                            title={isMarathi ? '१९५० शीर्षक साखळी व संपूर्ण इतिहास पहा' : 'View 1950 title chain and complete history'}
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            <span>{isMarathi ? '३६०° साखळी' : '360° Trace'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUploadModalParcelId(parcel.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition active:scale-95 cursor-pointer"
                            title={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                            aria-label={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>

    {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        pageSize={limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[25, 50, 100, 'all']}
      />

      {/* 360 Trace Drawer */}
      {selectedUpi && (
        <ParcelTraceDrawer
          upi={selectedUpi}
          onClose={() => setSelectedUpi(null)}
          onRefresh={() => fetchParcels(page, appliedFilters, limit)}
        />
      )}

      {/* Doc Upload Modal */}
      {uploadModalParcelId && (
        <DocUploadModal
          isOpen={Boolean(uploadModalParcelId)}
          onClose={() => setUploadModalParcelId(null)}
          parcelId={uploadModalParcelId}
          onUploadSuccess={() => fetchParcels(page, appliedFilters, limit)}
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
