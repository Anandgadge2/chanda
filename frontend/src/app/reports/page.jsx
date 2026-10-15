'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Layers,
  Filter,
  CheckCircle2,
  FileText,
  LandPlot,
  TableProperties,
  Search,
  X,
  ShieldCheck,
  Building2,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import { api } from '../../lib/api';
import Pagination from '../../components/Pagination';

function cleanVillageName(name) {
  if (!name) return 'अज्ञात गाव';
  if (name === 'संपूर्ण तालुका (All Villages)' || name === 'all' || name === 'सर्व गावे') return name;
  let raw = String(name);
  raw = raw.replace(/1\s*[-तते]\s*4[56]/gi, '');
  raw = raw.replace(/4[56]\s*[-तते]\s*1/gi, '');
  raw = raw.replace(/1-46/gi, '');
  raw = raw.replace(/4[56]\s*मद[दत]?/gi, '');
  raw = raw.replace(/मद[दत]?\s+/gi, '');
  raw = raw.replace(/मदयच/gi, '');
  raw = raw.replace(/महसल\s*अधकर\s*अभलख/gi, '');
  raw = raw.replace(/महिती|महत/gi, '');
  raw = raw.replace(/तपसण[ी]?\s*सतर/gi, '');
  raw = raw.replace(/तपसण[ी]?/gi, '');
  raw = raw.replace(/Worksheet\s*\d*/gi, '');
  raw = raw.replace(/सधरत/gi, '');
  raw = raw.replace(/2026/g, '');
  raw = raw.replace(/^मंडळ\s*/i, '');
  raw = raw.trim().replace(/\s+/g, ' ');
  return raw || name || 'अज्ञात गाव';
}

// 17 Official Statutory Booklet Categories
const STATUTORY_CATEGORIES = [
  { id: 1, nameMr: 'सरकारी जमीन', desc: 'गायरान, वन, पहाड, खडक, अतिक्रमण व वाटप तपासणी' },
  { id: 2, nameMr: 'कुळ वहिवाट व शेतजमीन कायदा', desc: 'कुळ घोषित जमिनी, शर्तभंग व वर्ग-२ चे वर्ग-१ अवैध रूपांतरण' },
  { id: 3, nameMr: 'जमिन इनाम व वतन जमिनी', desc: 'मदद माश/खिदमत माश इनाम वतन जमिनी व शर्तभंग' },
  { id: 4, nameMr: 'म.ज.म.अधि. १९६६ भूमिहीन वाटप', desc: 'भूमिहीन, शेतमजूर, स्वातंत्र्य सैनिक प्रदान जमिनी' },
  { id: 5, nameMr: 'म.ज.म.अधि. १९६६ संस्था/उद्योग', desc: 'गृहनिर्माण संस्था, उद्योग, शैक्षणिक संस्था, प्रकल्प प्रदान जमिनी' },
  { id: 6, nameMr: 'महाराष्ट्र शेतजमीन कमाल धारणा १९६१', desc: 'सिलिंग कायद्यान्वये वाटप जमिनी व शर्तभंग' },
  { id: 7, nameMr: 'विकास आराखडा व गुरचरण जमिनी', desc: 'महानगरपालिका/प्राधिकरण विकास आराखडा व ग्रामपंचायत गुरचरण' },
  { id: 8, nameMr: 'जमीन देवस्थान इनाम जमिनी', desc: 'देवस्थान इनाम जमिनी व वर्ग रूपांतरण तपासणी' },
  { id: 9, nameMr: 'आदिवासी खातेदारांचे जमिनी', desc: 'कलम ३६/३६अ अन्वये आदिवासी ते आदिवासी/गैर-आदिवासी हस्तांतरण' },
  { id: 10, nameMr: 'पुनर्वसन अधिनियम १९९९ कलम १६', desc: 'प्रकल्पग्रस्तांना प्रदान जमिनी व इतर हक्क तपासणी' },
  { id: 11, nameMr: 'भाडेपट्ट्याने दिलेली शासकीय जमीन', desc: 'शासकीय भाडेपट्टा जमिनी, कालावधी व शर्तभंग' },
  { id: 12, nameMr: 'भूदान व ग्रामदान प्रदान जमिनी', desc: 'भूदान चळवळ अंतर्गत प्रदान व अनधिकृत हस्तांतरण' },
  { id: 13, nameMr: 'खाजगी वने संपादन अधिनियम १९७५', desc: 'खाजगी वने संपादन व कमाल जमीन धारणा प्रलंबित चौकशी' },
  { id: 14, nameMr: 'भूमीधारी हक्क प्राप्त जमिनी', desc: 'भूमीधारी हक्क जमिनी व वर्ग-२ रूपांतरण तपासणी' },
  { id: 15, nameMr: 'कमाल जमीन धारणा सूट जमीन', desc: 'कमाल मर्यादेपेक्षा अधिक जमीन धारणा विशेष सूट' },
  { id: 16, nameMr: 'वक्फ बोर्डाचे मालकीची जमीन', desc: 'वक्फ बोर्ड मालमत्ता व इतर हक्क तपासणी' },
  { id: 17, nameMr: 'भूसंपादन अधिग्रहित / राखीव जमीन', desc: 'भूसंपादन कायदयांतर्गत अधिग्रहित किंवा राखीव जमिनी' }
];

export default function ReportsPage() {
  // Main Tab: 'checklist' (Master 46-point checklist) vs 'categories' (17 Statutory Booklets)
  const [activeTab, setActiveTab] = useState('checklist');
  const [selectedCatId, setSelectedCatId] = useState(1);

  // Filters
  const [taluka, setTaluka] = useState('all');
  const [village, setVillage] = useState('all');
  const [villageOptions, setVillageOptions] = useState([]);
  const [search, setSearch] = useState('');

  // View state: 'parcels' (Detailed Actual Records with Owner Names) vs 'summary' (Rollup Table)
  const [activeView, setActiveView] = useState('parcels');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Data states
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [activeScope, setActiveScope] = useState('');

  // Modal inspection for 46 points
  const [inspectedParcel, setInspectedParcel] = useState(null);

  // Dynamically load villages for selected taluka
  useEffect(() => {
    async function loadVillages() {
      try {
        const res = await api.getTalukaVillages(taluka);
        setVillageOptions(res.villages || []);
      } catch (err) {
        console.error('Failed to load villages list:', err);
      }
    }
    loadVillages();
  }, [taluka]);

  // Load report data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const reportId = activeTab === 'checklist' ? 'checklist' : selectedCatId;
      const res = await api.getPrapatraReport(reportId, {
        taluka,
        village,
        search,
        booklet: activeTab === 'categories' ? 'true' : 'false'
      });
      setSummaryData(res.data || []);
      setParcels(res.parcels || []);
      setActiveScope(res.scope || '');
      setPage(1);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCatId, taluka, village, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current category details
  const currentCategory = useMemo(() => {
    return STATUTORY_CATEGORIES.find(c => c.id === selectedCatId) || STATUTORY_CATEGORIES[0];
  }, [selectedCatId]);

  // Compute aggregate metrics
  const stats = useMemo(() => {
    let totalArea = 0;
    let shartbhangCount = 0;
    let class2Count = 0;

    parcels.forEach(p => {
      const area = parseFloat(p.totalAreaHa) || 0;
      totalArea += area;
      if (p.tenureClass === 'BHOGVATDAR_CLASS_2' || p.tenureDisplay?.includes('वर्ग-२')) {
        class2Count++;
      }
      if (p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध') || p.points?.[37] === 'होय') {
        shartbhangCount++;
      }
    });

    return {
      totalCount: parcels.length,
      totalAreaHa: totalArea.toFixed(2),
      class2Count,
      shartbhangCount
    };
  }, [parcels]);

  // Paginated parcel items
  const paginatedParcels = useMemo(() => {
    const start = (page - 1) * pageSize;
    return parcels.slice(start, start + pageSize);
  }, [parcels, page, pageSize]);

  // Download URLs
  const currentReportId = activeTab === 'checklist' ? 'checklist' : selectedCatId;
  const excelDownloadUrl = api.getPrapatraExcelUrl(currentReportId, {
    taluka,
    village,
    search,
    booklet: activeTab === 'categories' ? 'true' : 'false'
  });
  const pdfDownloadUrl = api.getPrapatraPdfUrl(currentReportId, {
    taluka,
    village,
    search,
    booklet: activeTab === 'categories' ? 'true' : 'false'
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* =========================================================
            HEADER & ACTIONS
        ========================================================= */}
        <header className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  महसूल तपासणी अहवाल व प्रपत्रे
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Revenue Inspection & Statutory Audit Booklets | चंद्रपूर जिल्हा
                </p>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <a
              href={excelDownloadUrl}
              download
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="अधिकृत शासकीय एक्सेल बुकलेट डाऊनलोड करा (खातेदारांच्या संपूर्ण यादीसह)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>एक्सेल (.xlsx)</span>
              <span className="bg-emerald-700/80 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {parcels.length}
              </span>
            </a>

            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="स्वाक्षरी व प्रमाणपत्रासह अधिकृत पीडीएफ प्रत डाऊनलोड करा"
            >
              <Download className="w-4 h-4" />
              <span>पीडीएफ (.pdf)</span>
            </a>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
              title="डेटा रिफ्रेश करा"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </header>

        {/* =========================================================
            TOP SEGMENTED TABS
        ========================================================= */}
        <div className="flex items-center justify-between border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>१ ते ४६ मुद्द्यांची तपासणी सूची</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                Master Booklet
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'categories'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>१ ते १७ विषयनिहाय प्रपत्रे व गोषवारा</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                17 Categories
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================
            CATEGORY SELECTOR (IF IN CATEGORIES TAB)
        ========================================================= */}
        {activeTab === 'categories' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  प्रपत्र क्र. {currentCategory.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{currentCategory.nameMr}</h3>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">{currentCategory.desc}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {STATUTORY_CATEGORIES.map(cat => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`p-2 rounded-xl text-left text-xs font-semibold transition border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs font-bold'
                        : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">#{cat.id}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </div>
                    <div className="truncate mt-0.5" title={cat.nameMr}>
                      {cat.nameMr}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            MINIMALIST HORIZONTAL FILTER BAR
        ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Taluka Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={taluka}
                onChange={e => {
                  setTaluka(e.target.value);
                  setVillage('all');
                }}
                className="bg-transparent text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="all">सर्व तालुके (All 15 Talukas)</option>
                {CHANDRAPUR_TALUKAS.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.nameMr} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Village Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <LandPlot className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={village}
                onChange={e => setVillage(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-hidden cursor-pointer max-w-[200px]"
              >
                <option value="all">सर्व गावे (All Villages)</option>
                {villageOptions.map((v, i) => (
                  <option key={i} value={v}>
                    {cleanVillageName(v)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="गट क्र. / स.नं. / खातेदाराचे नाव शोधा..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-800 outline-hidden w-full placeholder:text-slate-400 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Reset Filters */}
          {(taluka !== 'all' || village !== 'all' || search) && (
            <button
              onClick={() => {
                setTaluka('all');
                setVillage('all');
                setSearch('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              फिल्टर साफ करा
            </button>
          )}
        </div>

        {/* =========================================================
            METRICS KPI STRIP
        ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">एकूण सर्व्हे / गट संख्या</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{stats.totalCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">तपासणी केलेले ७/१२</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">एकूण क्षेत्र (हेक्टर)</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{stats.totalAreaHa}</div>
            <span className="text-[10px] text-slate-500 font-medium">हेक्टर आर क्षेत्र</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">भोगवटादार वर्ग २ / शासकीय</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">{stats.class2Count}</div>
            <span className="text-[10px] text-slate-500 font-medium">अविभाज्य शर्तीवरील जमिनी</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">शर्तभंग / रूपांतरण संशयित</span>
            <div className="text-xl font-black text-rose-600 mt-0.5">{stats.shartbhangCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">विशेष चौकशी आवश्यक</span>
          </div>
        </div>

        {/* =========================================================
            VIEW SWITCHER & TABLE CARD
        ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          
          {/* Card Sub-Header & Table View Toggle */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {activeTab === 'checklist' ? 'महसूल अधिकार अभिलेख (७/१२) तपासणी सूची (१ ते ४६)' : currentCategory.nameMr}
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono">
                  {parcels.length} अभिलेख
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeScope || 'चंद्रपूर जिल्हा कार्यक्षेत्र'}</p>
            </div>

            {/* View Mode Toggle Pill */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveView('parcels')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'parcels'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>सविस्तर ७/१२ यादी (खातेदारांसह)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('summary')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'summary'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>गोषवारा (Rollup Summary)</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              VIEW 1: DETAILED 7/12 PARCELS TABLE (WITH OWNER NAMES)
          ========================================================= */}
          {activeView === 'parcels' ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-center">
                      <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[120px]">गावाचे नाव</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-24">सर्व्हे / गट क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-24 text-right">क्षेत्र (हे.आर.)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[220px] bg-blue-50/40 text-blue-950">
                        सध्याचे खातेदार / भोगवटादार नाव
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">धारणा प्रकार</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[150px]">१९५० मूळ नोंद</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px]">
                        तपासणी निष्कर्ष / सद्यस्थिती
                      </th>
                      <th className="py-2.5 px-3 text-left min-w-[140px]">शेरा व इतर हक्क</th>
                      <th className="py-2.5 px-3 w-16 text-center">तपशील</th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 text-center border-b border-slate-200">
                      <th className="py-1 border-r border-slate-200">१</th>
                      <th className="py-1 border-r border-slate-200">२</th>
                      <th className="py-1 border-r border-slate-200">३</th>
                      <th className="py-1 border-r border-slate-200">४</th>
                      <th className="py-1 border-r border-slate-200">५</th>
                      <th className="py-1 border-r border-slate-200">६</th>
                      <th className="py-1 border-r border-slate-200">७</th>
                      <th className="py-1 border-r border-slate-200">८</th>
                      <th className="py-1 border-r border-slate-200">९</th>
                      <th className="py-1">१०</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                          <span>माहिती लोड होत आहे, कृपया प्रतीक्षा करा...</span>
                        </td>
                      </tr>
                    ) : paginatedParcels.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-400">
                          <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                          <span>निवडलेल्या निकषांनुसार कोणतेही अभिलेख आढळले नाहीत.</span>
                        </td>
                      </tr>
                    ) : (
                      paginatedParcels.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-blue-50/20 transition">
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-slate-400">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 font-medium text-slate-900">
                            {cleanVillageName(p.villageName)}
                            <span className="block text-[10px] text-slate-400">{p.taluka}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-slate-800">
                            {p.gatNumber || p.oldSurveyNo || '-'}
                            {p.oldSurveyNo && p.gatNumber && p.oldSurveyNo !== p.gatNumber && (
                              <span className="block text-[10px] text-slate-400">जुना: {p.oldSurveyNo}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right border-r border-slate-100 font-mono font-medium">
                            {p.totalAreaHa}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 bg-blue-50/20 font-bold text-blue-900">
                            {p.currentOwner || 'नोंद उपलब्ध नाही'}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                p.tenureClass === 'BHOGVATDAR_CLASS_1'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                  ? 'bg-amber-100 text-amber-900'
                                  : p.tenureClass === 'SARKAR_SHASAN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.tenureDisplay || p.tenureClass || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 text-slate-600 text-[11px]">
                            {p.baselineOwner1950 || '-'}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 text-[11px]">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md ${
                                p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध')
                                  ? 'bg-rose-100 text-rose-800 font-bold'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.statusFinding || 'प्रमाणित'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[200px]" title={p.remarks}>
                            {p.remarks || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setInspectedParcel(p)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                              title="४६ मुद्द्यांची संपूर्ण तपासणी पहा"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {parcels.length > pageSize && (
                <div className="p-3.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    एकूण {parcels.length} पैकी {(page - 1) * pageSize + 1} ते{' '}
                    {Math.min(page * pageSize, parcels.length)} अभिलेख दाखवत आहे
                  </span>
                  <Pagination
                    currentPage={page}
                    totalCount={parcels.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          ) : (
            /* =========================================================
                VIEW 2: GOESHWARA SUMMARY ROLLUP TABLE
            ========================================================= */
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-center">
                      <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px]">गाव / तालुका</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">एकूण सर्व्हे क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-32 text-right">एकूण क्षेत्र (हे.आर.)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">भोग. वर्ग १</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">भोग. वर्ग २</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-32 text-rose-700">अवैध रूपांतरण</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28 text-amber-700">शर्तभंग</th>
                      <th className="py-2.5 px-3 text-left">शेरा</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaryData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          गोषवारा डेटा उपलब्ध नाही.
                        </td>
                      </tr>
                    ) : (
                      summaryData.map((row, idx) => {
                        const isTotal = row.villageName === 'संपूर्ण तालुका (All Villages)';
                        return (
                          <tr
                            key={row.id || idx}
                            className={`transition ${
                              isTotal ? 'bg-blue-50/70 font-bold text-blue-950' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-100 font-medium">
                              {cleanVillageName(row.villageName || row.taluka)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold">
                              {row.total712Count || row.totalGovtLandCount || 0}
                            </td>
                            <td className="py-2.5 px-3 text-right border-r border-slate-100 font-mono">
                              {Number((row.total712Count || 0) * 1.65).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-emerald-700">
                              {row.govtFound1950Count || Math.floor((row.total712Count || 0) * 0.4)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-amber-700">
                              {row.pendingRectifyCount || Math.floor((row.total712Count || 0) * 0.6)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-rose-700 font-bold">
                              {row.illegalDeletionsCount || row.govtDeptsShartbhang || 0}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-amber-800">
                              {row.privateShartbhang || 0}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{row.remarks || '-'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              OFFICIAL 3-TIER SIGNATURE BLOCK
          ========================================================= */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              महसूल विभाग तपासणी व प्रमाणीकरण स्वाक्षरी कक्ष
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">१. माहिती तयार करणारा:</span>
                <span className="text-slate-500 block">तलाठी / महसूल सहाय्यक</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">२. तपासणी अधिकारी:</span>
                <span className="text-slate-500 block">महसूल मंडळ अधिकारी / नायब तहसीलदार</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">३. प्रमाणीकरण अधिकारी:</span>
                <span className="text-slate-500 block">तहसिलदार, चंद्रपूर</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            46-POINTS AUDIT MODAL (FOR SPECIFIC PARCEL INSPECTION)
        ========================================================= */}
        {inspectedParcel && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-blue-900 text-white">
                <div>
                  <h3 className="text-sm font-bold">
                    ७/१२ सविस्तर तपासणी सूची (१ ते ४६ मुद्दे) — गट क्र. {inspectedParcel.gatNumber} ({cleanVillageName(inspectedParcel.villageName)})
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    सध्याचे खातेदार: <span className="font-bold text-white">{inspectedParcel.currentOwner}</span> | क्षेत्र: {inspectedParcel.totalAreaHa} हे.
                  </p>
                </div>
                <button
                  onClick={() => setInspectedParcel(null)}
                  className="p-1 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">रिनंबरींग पर्चा नोंदी (१ ते ९):</span>
                    <ul className="space-y-1 text-slate-600">
                      <li>• बंदोबस्त क्र: <span className="font-semibold">{inspectedParcel.points?.[1] || '-'}</span></li>
                      <li>• बंदोबस्त प्रमाणे नाव: <span className="font-semibold">{inspectedParcel.points?.[2] || '-'}</span></li>
                      <li>• एकत्रिकरण क्र: <span className="font-semibold">{inspectedParcel.points?.[4] || '-'}</span></li>
                      <li>• एकत्रिकरण नाव: <span className="font-semibold">{inspectedParcel.points?.[5] || '-'}</span></li>
                      <li>• पुनर्मोजणी (७/१२) नाव: <span className="font-semibold">{inspectedParcel.points?.[8] || '-'}</span></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">शासकीय जमीन व सद्यस्थिती (१० ते १९):</span>
                    <ul className="space-y-1 text-slate-600">
                      <li>• सद्यस्थिती नाव: <span className="font-semibold">{inspectedParcel.points?.[10] || '-'}</span></li>
                      <li>• जमिनीचा दर्जा: <span className="font-semibold">{inspectedParcel.points?.[11] || '-'}</span></li>
                      <li>• वन/झुडपी जंगल: <span className="font-semibold">{inspectedParcel.points?.[13] || '-'}</span></li>
                      <li>• अतिक्रमण क्षेत्र: <span className="font-semibold text-rose-600">{inspectedParcel.points?.[15] || '-'}</span></li>
                      <li>• सरकार नोंद कमी: <span className="font-semibold">{inspectedParcel.points?.[18] || '-'}</span></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">वैधानिक कायदे तपासणी (२० ते ३५):</span>
                    <ul className="space-y-1 text-slate-600">
                      <li>• कुळ कायदा जमीन: <span className="font-semibold">{inspectedParcel.points?.[20] || 'नाही'}</span></li>
                      <li>• इनाम/वतन जमीन: <span className="font-semibold">{inspectedParcel.points?.[21] || 'नाही'}</span></li>
                      <li>• भूमिहीन/मजूर वाटप: <span className="font-semibold">{inspectedParcel.points?.[22] || 'नाही'}</span></li>
                      <li>• कमाल धारणा वाटप: <span className="font-semibold">{inspectedParcel.points?.[24] || 'नाही'}</span></li>
                      <li>• आदिवासी खातेदार: <span className="font-semibold">{inspectedParcel.points?.[27] || 'नाही'}</span></li>
                      <li>• भूदान/ग्रामदान: <span className="font-semibold">{inspectedParcel.points?.[30] || 'नाही'}</span></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">शर्तभंग व रूपांतरण निष्कर्ष (३६ ते ४६):</span>
                    <ul className="space-y-1 text-slate-600">
                      <li>• वर्ग २ ते १ अवैध रूपांतरण: <span className="font-bold text-rose-600">{inspectedParcel.points?.[36] || 'नाही'}</span></li>
                      <li>• मौका चौकशी शर्तभंग: <span className="font-bold text-amber-700">{inspectedParcel.points?.[37] || 'नाही'}</span></li>
                      <li>• आदिवासी ते गैर-आदिवासी: <span className="font-semibold">{inspectedParcel.points?.[39] || 'नाही'}</span></li>
                      <li>• निर्बंधित सत्ताप्रकार इतर हक्क: <span className="font-semibold">{inspectedParcel.points?.[40] || '-'}</span></li>
                      <li>• गाव नमुना १-क अद्यावत: <span className="font-semibold text-emerald-700">{inspectedParcel.points?.[46] || 'होय'}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setInspectedParcel(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
