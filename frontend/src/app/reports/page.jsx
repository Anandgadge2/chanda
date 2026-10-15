'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Layers,
  Filter,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  LandPlot,
  Landmark,
  ShieldAlert,
  TableProperties,
  UploadCloud,
  Edit3,
  Search,
  X,
  Check,
  ShieldCheck,
  Sparkles,
  AlertTriangle
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

const APEX_PRAPATRA_LIST = [
  {
    id: 1,
    tag: 'प्रपत्र क्र. १',
    nameMr: '१९५० पासून सरकार नाव व दुरुस्ती',
    nameEn: '1950 Baseline & Illegal Deletions',
    pdfFile: 'docs/1.pdf',
    desc: 'शासकीय जमिनींचे सन १९५० पासूनचे सर्व मूळ ७/१२ तपासणी करून त्यानुसार ७/१२ अभिलेख अद्यावत करणे',
    color: 'border-blue-500 text-blue-900 bg-blue-50/60'
  },
  {
    id: 2,
    tag: 'प्रपत्र क्र. २',
    nameMr: 'पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे.) कमी करणे',
    nameEn: 'Pokalist Nondi Removal',
    pdfFile: 'docs/2.pdf',
    desc: 'शासकीय जमिनीचे ७/१२ अभिलेखावरील पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे./सं.कु.) कमी करण्याबाबत',
    color: 'border-amber-500 text-amber-900 bg-amber-50/60'
  },
  {
    id: 3,
    tag: 'प्रपत्र क्र. ३',
    nameMr: 'शासकीय महामंडळे जमीन शर्तभंग व शासन जमा',
    nameEn: 'Govt Depts & Corporations Shartbhang',
    pdfFile: 'docs/3 (1).pdf',
    desc: 'शासकीय विभाग/महामंडळे/स्थानिक स्वराज्य संस्था यांना प्रदान जमिनींचे अनधिकृत हस्तांतरण, शर्तभंग व शासन जमा',
    color: 'border-emerald-500 text-emerald-900 bg-emerald-50/60'
  },
  {
    id: 4,
    tag: 'प्रपत्र क्र. ४',
    nameMr: 'खाजगी संस्था/ट्रस्ट शर्तभंग व शासन जमा',
    nameEn: 'Private Trusts & Entities Shartbhang',
    pdfFile: 'docs/4.pdf',
    desc: 'शैक्षणिक/सामाजिक संस्था, ट्रस्ट, सोसायट्यांना प्रदान शासकीय जमिनींचे अनधिकृत हस्तांतरण व शासन जमा',
    color: 'border-purple-500 text-purple-900 bg-purple-50/60'
  },
  {
    id: 5,
    tag: 'प्रपत्र क्र. ५',
    nameMr: 'शासकीय जमिनींची सर्वंकष महा-आकडेवारी',
    nameEn: 'Comprehensive Govt Lands Status',
    pdfFile: 'docs/5.pdf',
    desc: 'एकूण शासकीय जमिनी, वाटप केलेल्या, शर्तभंग झालेल्या, अतिक्रमण असलेल्या व मोजणी झालेल्या जमिनी',
    color: 'border-rose-500 text-rose-900 bg-rose-50/60'
  }
];

const THEMATIC_BOOKLETS = [
  {
    id: 'ceiling',
    prapatra: 'प्रपत्र - १',
    nameMr: 'सिलिंग कायद्यान्वये वाटप',
    nameEn: 'Ceiling Act Allotment',
    color: 'border-blue-500 text-blue-800 bg-blue-50/50',
    desc: 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार सिलींग कायद्यानूसार वाटप जमिनींचे बुकलेट',
  },
  {
    id: 'bhudan',
    prapatra: 'प्रपत्र - २',
    nameMr: 'भुदान कायद्यान्वये वाटप',
    nameEn: 'Bhudan Act Allotment',
    color: 'border-amber-500 text-amber-800 bg-amber-50/50',
    desc: 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार भुदान कायद्यानूसार वाटप जमिनींचे बुकलेट',
  },
  {
    id: 'tribal',
    prapatra: 'प्रपत्र - ३',
    nameMr: 'आदिवासी जमीन संरक्षण',
    nameEn: 'Tribal Land Protection',
    color: 'border-emerald-500 text-emerald-800 bg-emerald-50/50',
    desc: 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार आदिवासी जमीन बाबत वाटप बुकलेट (कलम ३६/३६अ)',
  },
  {
    id: 'tenancy89a',
    prapatra: 'प्रपत्र - ४',
    nameMr: 'कुळवहिवाट कलम ८९-अ मॅपिंग',
    nameEn: 'Tenancy Sec 89-A Industrial Mapping',
    color: 'border-purple-500 text-purple-800 bg-purple-50/50',
    desc: 'महाराष्ट्र कुळवहिवाट व शेतजमीन अधिनियम १९५८ चे कलम ८९-अ जमीन मॅपिंग बुकलेट',
  },
];

export default function ReportsPage() {
  // Main mode toggle: 'apex' (Prapatra 1-5 from PDFs) or 'thematic' (Village Booklets 1-4)
  const [reportMode, setReportMode] = useState('apex');

  // Prapatra 1-5 states
  const [selectedPrapatra, setSelectedPrapatra] = useState(1);
  const [prapatraTaluka, setPrapatraTaluka] = useState('all');
  const [prapatraVillage, setPrapatraVillage] = useState('all');
  const [villageOptions, setVillageOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [prapatraData, setPrapatraData] = useState([]);
  const [prapatraParcels, setPrapatraParcels] = useState([]);
  const [activeTableView, setActiveTableView] = useState('parcels'); // 'parcels' (actual data) | 'summary' (rollups)
  const [parcelPage, setParcelPage] = useState(1);
  const [parcelPageSize] = useState(25);
  const [prapatraLoading, setPrapatraLoading] = useState(false);

  // Admin / Collector editing mode
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Upload Excel states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTaluka, setUploadTaluka] = useState('Warora');
  const [uploadVillage, setUploadVillage] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // Thematic Booklet states
  const [bookletType, setBookletType] = useState('ceiling');
  const [thematicTaluka, setThematicTaluka] = useState('');
  const [thematicVillage, setThematicVillage] = useState('');
  const [thematicPreview, setThematicPreview] = useState([]);
  const [thematicSummary, setThematicSummary] = useState({ totalCount: 0, totalAreaHa: '0.0000', breachesCount: 0 });
  const [thematicLoading, setThematicLoading] = useState(false);

  const [notification, setNotification] = useState({ type: '', message: '' });

  // Load Village options dynamically whenever taluka changes
  useEffect(() => {
    async function fetchVillages() {
      try {
        const res = await api.getTalukaVillages(prapatraTaluka);
        setVillageOptions(res.villages || []);
      } catch (err) {
        console.error('Failed to load villages list:', err);
      }
    }
    fetchVillages();
  }, [prapatraTaluka]);

  // Fetch Prapatra 1 to 5 data
  const loadPrapatraData = useCallback(async () => {
    setPrapatraLoading(true);
    setNotification({ type: '', message: '' });
    try {
      const res = await api.getPrapatraReport(selectedPrapatra, {
        taluka: prapatraTaluka,
        village: prapatraVillage,
        search: searchQuery,
        filterType
      });
      setPrapatraData(res.data || []);
      setPrapatraParcels(res.parcels || []);
      setParcelPage(1);
    } catch (err) {
      console.error('Error loading Prapatra report:', err);
      setNotification({ type: 'error', message: err.message || 'प्रपत्र डेटा आणण्यात अडचण आली.' });
    } finally {
      setPrapatraLoading(false);
    }
  }, [selectedPrapatra, prapatraTaluka, prapatraVillage, searchQuery, filterType]);

  // Fetch Thematic Booklets
  const loadThematicData = useCallback(async () => {
    setThematicLoading(true);
    try {
      const data = await api.getBookletPreview({
        type: bookletType,
        taluka: thematicTaluka,
        village: thematicVillage
      });
      setThematicPreview(data.rows || []);
      if (data.summary) {
        setThematicSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load thematic preview:', err);
      setNotification({ type: 'error', message: err.message || 'बुकलेट डेटा आणण्यात अडचण आली.' });
    } finally {
      setThematicLoading(false);
    }
  }, [bookletType, thematicTaluka, thematicVillage]);

  useEffect(() => {
    if (reportMode === 'apex') {
      loadPrapatraData();
    } else {
      loadThematicData();
    }
  }, [reportMode, loadPrapatraData, loadThematicData]);

  // Handle Editing
  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditForm({
      villageName: record.villageName || '',
      total712Count: record.total712Count || 0,
      inspected1950Count: record.inspected1950Count || 0,
      govtFound1950Count: record.govtFound1950Count || 0,
      illegalDeletionsCount: record.illegalDeletionsCount || 0,
      rectifiedCount: record.rectifiedCount || 0,
      pendingRectifyCount: record.pendingRectifyCount || 0,
      pokalistCount: record.pokalistCount || 0,
      pokalistRemovedCount: record.pokalistRemovedCount || 0,
      pokalistPendingCount: record.pokalistPendingCount || 0,
      govtDeptsAllottedCount: record.govtDeptsAllottedCount || 0,
      govtDeptsShartbhang: record.govtDeptsShartbhang || 0,
      privateAllottedCount: record.privateAllottedCount || 0,
      privateShartbhang: record.privateShartbhang || 0,
      govtEncroachedCount: record.govtEncroachedCount || 0,
      govtMojaniDoneCount: record.govtMojaniDoneCount || 0,
      remarks: record.remarks || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      await api.updatePrapatraRollup(editingRecord.id, editForm);
      setNotification({ type: 'success', message: `अभिलेख "${editForm.villageName || editingRecord.villageName}" यशस्वीरीत्या दुरुस्त व अद्ययावत केला.` });
      setEditingRecord(null);
      await loadPrapatraData();
    } catch (err) {
      console.error('Failed to save edit:', err);
      setNotification({ type: 'error', message: err.message || 'दुरुस्ती जतन करता आली नाही.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Excel Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setNotification({ type: 'error', message: 'कृपया एक्सेल (.xlsx) फाईल निवडा.' });
      return;
    }
    setIsUploading(true);
    setUploadFeedback(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('taluka', uploadTaluka);
      if (uploadVillage) formData.append('villageName', uploadVillage);

      const res = await api.uploadPrapatraExcel(formData);
      setUploadFeedback(res);
      setNotification({ type: 'success', message: res.message || 'एक्सेल डेटा यशस्वीरीत्या विश्लेषित व जतन केला.' });
      setUploadFile(null);
      // Auto-set the current taluka to the uploaded one
      setPrapatraTaluka(uploadTaluka);
      await loadPrapatraData();
    } catch (err) {
      console.error('Upload error:', err);
      setNotification({ type: 'error', message: err.message || 'एक्सेल अपलोड अयशस्वी.' });
    } finally {
      setIsUploading(false);
    }
  };

  const activeApex = APEX_PRAPATRA_LIST.find(p => p.id === selectedPrapatra) || APEX_PRAPATRA_LIST[0];

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 border border-amber-400 flex items-center justify-center shrink-0 text-amber-400 shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                जिल्हा महसूल बुकलेट व अहवाल प्रणाली (Land Records Official Booklets)
              </h1>
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full">
                चंद्रपूर जिल्हा
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              शासकीय व वर्ग-२ जमिनींची १ ते ४५ मुद्देनिहाय तपासणी | सर्व १५ तालुके व ६६३ गावांचे मूळ महसूल अभिलेख
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              isAdminMode
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="जिल्हाधिकारी किंवा सुपरॲडमिन अभिलेख संपादन मोड"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAdminMode ? 'जिल्हाधिकारी संपादन मोड (Active)' : 'संपादन मोड सक्षम करा'}</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
            <span>एक्सेल डेटा अपलोड करा</span>
          </button>

          <button
            onClick={loadPrapatraData}
            disabled={prapatraLoading}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="रिफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${prapatraLoading ? 'animate-spin text-blue-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications Toast Banner */}
      {notification.message && (
        <div
          className={`px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Mode Toggle: Apex Statutory vs Thematic Booklets */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setReportMode('apex')}
          className={`pb-2.5 flex items-center gap-2 cursor-pointer transition-all ${
            reportMode === 'apex'
              ? 'border-b-2 border-blue-900 text-blue-900 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>१ ते ४५ मुद्दे तपासणी - प्रपत्र क्र. १ ते ५ (Apex District Booklets)</span>
        </button>

        <button
          onClick={() => setReportMode('thematic')}
          className={`pb-2.5 flex items-center gap-2 cursor-pointer transition-all ${
            reportMode === 'thematic'
              ? 'border-b-2 border-blue-900 text-blue-900 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>विशेष वाटप व संरक्षण बुकलेट्स (सिलिंग, भुदान, आदिवासी, कुळवहिवाट)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: APEX PRAPATRA 1 TO 5 (Real Data Across All 15 Talukas) */}
      {/* ============================================================== */}
      {reportMode === 'apex' && (
        <div className="space-y-4">
          {/* Prapatra 1 to 5 Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {APEX_PRAPATRA_LIST.map((p) => {
              const isSelected = selectedPrapatra === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrapatra(p.id)}
                  className={`text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? `${p.color} border-2 shadow-sm font-semibold scale-[1.01]`
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white shadow-2xs' : 'bg-slate-100 text-slate-600'}`}>
                      {p.tag}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-current" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-snug">{p.nameMr}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{p.pdfFile}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ADVANCED MULTI-LEVEL FILTER & ACTION BAR */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              {/* Dropdowns & Search */}
              <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
                {/* 1. Taluka Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    तालुका:
                  </span>
                  <select
                    value={prapatraTaluka}
                    onChange={(e) => {
                      setPrapatraTaluka(e.target.value);
                      setPrapatraVillage('all');
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="all">सर्व १५ तालुके (चंद्रपूर जिल्हा)</option>
                    {CHANDRAPUR_TALUKAS.map((t) => (
                      <option key={t.id} value={t.nameEn}>
                        {t.nameMr} ({t.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Village Filter (Dynamic) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    गाव निवडा:
                  </span>
                  <select
                    value={prapatraVillage}
                    onChange={(e) => setPrapatraVillage(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 max-w-[190px]"
                  >
                    <option value="all">सर्व गावे ({villageOptions.length > 0 ? `${villageOptions.length} गावे` : 'सर्व'})</option>
                    {villageOptions.map((v) => (
                      <option key={v.id || v.villageName} value={v.originalVillageName || v.villageName}>
                        {cleanVillageName(v.villageName)} ({v.total712Count} ७/१२)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Text Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="गावाचे नाव शोधा..."
                    className="bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 w-44"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Download Buttons: Excel & PDF */}
              <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 flex-wrap">
                <a
                  href={api.getPrapatraExcelUrl(selectedPrapatra, {
                    taluka: prapatraTaluka,
                    village: prapatraVillage,
                    search: searchQuery,
                    filterType
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition active:scale-95"
                  title="सध्याच्या फिल्टरनुसार अधिकृत शासकीय एक्सेल बुकलेट डाऊनलोड करा"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>एक्सेल डाऊनलोड</span>
                </a>

                <a
                  href={api.getPrapatraPdfUrl(selectedPrapatra, {
                    taluka: prapatraTaluka,
                    village: prapatraVillage,
                    search: searchQuery,
                    filterType
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition active:scale-95"
                  title="शासकीय फॉरमॅटनुसार (docs/1.pdf-5.pdf) अधिकृत स्वाक्षरीयुक्त पीडीएफ डाऊनलोड करा"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>पीडीएफ डाऊनलोड (शासनमान्य)</span>
                </a>
              </div>
            </div>

            {/* Quick Violation & Alert Filter Chips */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                तपासणी निकष फिल्टर:
              </span>
              {[
                { id: 'all', label: 'सर्व नोंदी' },
                { id: 'illegalDeletions', label: 'अवैध सरकार नोंद कमी (>0)' },
                { id: 'pokalist', label: 'पोकळीस्त नोंदी (>0)' },
                { id: 'shartbhang', label: 'शर्तभंग (>0)' },
                { id: 'encroachment', label: 'गायरान/शासकीय अतिक्रमण (>0)' },
                { id: 'allotted', label: 'प्रदान शासकीय जमीन (>0)' },
                { id: 'mojani', label: 'मोजणी झालेली (>0)' }
              ].map((chip) => {
                const isActive = filterType === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setFilterType(chip.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prapatra Description Banner & View Switcher */}
          <div className="bg-blue-900 text-white p-3 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-amber-400 text-slate-900 px-2 py-0.5 rounded">
                {activeApex.tag}
              </span>
              <h2 className="text-xs sm:text-sm font-bold">{activeApex.desc}</h2>
            </div>

            {/* View Mode Switcher: Actual Parcel Records vs Summary Rollup */}
            <div className="flex items-center gap-1.5 bg-blue-950/80 p-1 rounded-lg border border-blue-800/60 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTableView('parcels')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTableView === 'parcels'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
                }`}
                title="प्रत्येक ७/१२ ची सविस्तर यादी, गाव, गट क्र., क्षेत्र व खातेदाराचे नाव पहा"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>सविस्तर ७/१२ यादी (खातेदारांसह)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTableView === 'parcels' ? 'bg-slate-900 text-amber-300' : 'bg-blue-900 text-blue-200'
                }`}>
                  {prapatraParcels.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTableView('summary')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTableView === 'summary'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
                }`}
                title="तालुका व गाव निहाय अधिकृत गोषवारा आकडेवारी पहा"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>गोषवारा (Summary)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTableView === 'summary' ? 'bg-slate-900 text-amber-300' : 'bg-blue-900 text-blue-200'
                }`}>
                  {prapatraData.length}
                </span>
              </button>
            </div>
          </div>

          {/* VIEW 1: DETAILED ACTUAL 7/12 PARCELS TABLE (WITH OWNER NAMES) */}
          {activeTableView === 'parcels' && (
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto max-h-[640px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                        <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left">तालुका / गाव</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 w-24">गट क्र.</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 w-24">जुना स.नं.</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 w-24 text-right">क्षेत्र (हे.)</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[200px] text-blue-950 bg-blue-50/50">
                          सध्याचे खातेदार / भोगवटादार नाव
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[150px]">
                          सन १९५० मूळ नोंद / मालक
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 w-28">धारणा प्रकार</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px]">
                          तपासणी निष्कर्ष / सद्यस्थिती
                        </th>
                        <th className="py-2.5 px-3 text-left min-w-[160px]">शेरा व इतर हक्क</th>
                      </tr>
                      <tr className="bg-slate-50 text-[10px] text-slate-500 text-center border-b border-slate-200">
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
                    <tbody className="divide-y divide-slate-200">
                      {prapatraLoading ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-500">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-900 mb-2" />
                            <span>सविस्तर ७/१२ अभिलेख व खातेदार यादी लोड होत आहे...</span>
                          </td>
                        </tr>
                      ) : prapatraParcels.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-10 text-center text-slate-500">
                            <LandPlot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700">या फिल्टरनुसार कोणतेही सविस्तर ७/१२ अभिलेख सापडले नाहीत.</p>
                            <p className="text-[11px] text-slate-400 mt-1">गाव किंवा फिल्टर बदलून पहा किंवा सर्व गावे निवडा.</p>
                          </td>
                        </tr>
                      ) : (
                        prapatraParcels
                          .slice((parcelPage - 1) * parcelPageSize, parcelPage * parcelPageSize)
                          .map((p, idx) => {
                            const realIdx = (parcelPage - 1) * parcelPageSize + idx + 1;
                            return (
                              <tr key={p.id || p.upi || idx} className="hover:bg-blue-50/40 transition">
                                <td className="py-2.5 px-3 text-center text-slate-400 border-r border-slate-100 font-mono">
                                  {realIdx}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-100">
                                  <div>{p.taluka}</div>
                                  <div className="text-[11px] text-blue-900 font-normal">{cleanVillageName(p.villageName)}</div>
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 border-r border-slate-100">
                                  {p.gatNumber || '-'}
                                </td>
                                <td className="py-2.5 px-3 text-center text-slate-600 border-r border-slate-100">
                                  {p.oldSurveyNo || '-'}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 border-r border-slate-100">
                                  {p.totalAreaHa}
                                </td>
                                <td className="py-2.5 px-3 text-slate-900 font-bold border-r border-slate-100 bg-blue-50/30">
                                  <div className="line-clamp-2" title={p.currentOwner}>
                                    {p.currentOwner || 'नोंद उपलब्ध नाही'}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 border-r border-slate-100">
                                  <div className="line-clamp-2" title={p.baselineOwner1950}>
                                    {p.baselineOwner1950 || 'नोंद उपलब्ध नाही'}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-center border-r border-slate-100">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.tenureClass === 'SARKAR_SHASAN'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {p.tenureDisplay || p.tenureClass || '-'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 border-r border-slate-100">
                                  <span className={`text-[11px] font-semibold ${
                                    p.statusFinding?.includes('अवैध') || p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अतिक्रमण')
                                      ? 'text-rose-700 font-bold'
                                      : 'text-slate-800'
                                  }`}>
                                    {p.statusFinding || '-'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 italic">
                                  <div className="line-clamp-2" title={p.remarks}>
                                    {p.remarks || '-'}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination for Detailed Parcels */}
              {prapatraParcels.length > parcelPageSize && (
                <Pagination
                  currentPage={parcelPage}
                  totalPages={Math.ceil(prapatraParcels.length / parcelPageSize)}
                  totalCount={prapatraParcels.length}
                  limit={parcelPageSize}
                  onPageChange={(newPage) => setParcelPage(newPage)}
                />
              )}
            </div>
          )}

          {/* VIEW 2: SUMMARY ROLLUP TABLE (गोषवारा) */}
          {activeTableView === 'summary' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto max-h-[620px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    {/* PRAPATRA 1 HEADERS */}
                    {selectedPrapatra === 1 && (
                      <>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                          <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-left">जिल्हा / तालुका / गाव</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">एकूण ७/१२ ची संख्या<br/><span className="text-[10px] text-slate-500 font-normal">[२(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200">१९५० पासून तपासणी केलेले ७/१२<br/><span className="text-[10px] text-slate-500 font-normal">[३(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-blue-800">सरकार/शासन नोंद असलेले ७/१२<br/><span className="text-[10px] text-blue-600 font-normal">[४(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-rose-700">अवैधरीत्या सरकार नोंद कमी केलेले ७/१२<br/><span className="text-[10px] text-rose-500 font-normal">[५(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-emerald-700">यापैकी दुरुस्ती केलेले ७/१२<br/><span className="text-[10px] text-emerald-500 font-normal">[६(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-amber-700">दुरुस्ती करण्यास शिल्लक ७/१२<br/><span className="text-[10px] text-amber-500 font-normal">[७(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200">शेरा</th>
                          {isAdminMode && <th className="py-2.5 px-3 text-center w-20">कृती</th>}
                        </tr>
                        <tr className="bg-slate-50 text-[10px] text-slate-500 text-center border-b border-slate-200">
                          <th className="py-1 border-r border-slate-200">१</th>
                          <th className="py-1 border-r border-slate-200">२</th>
                          <th className="py-1 border-r border-slate-200">३</th>
                          <th className="py-1 border-r border-slate-200">४</th>
                          <th className="py-1 border-r border-slate-200">५</th>
                          <th className="py-1 border-r border-slate-200">६</th>
                          <th className="py-1 border-r border-slate-200">७</th>
                          <th className="py-1 border-r border-slate-200">८</th>
                          <th className="py-1 border-r border-slate-200">९</th>
                          {isAdminMode && <th className="py-1">१०</th>}
                        </tr>
                      </>
                    )}

                    {/* PRAPATRA 2 HEADERS */}
                    {selectedPrapatra === 2 && (
                      <>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                          <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-left">जिल्हा / तालुका / गाव</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-amber-800">पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे./सं.कु.) संख्या<br/><span className="text-[10px] text-slate-500 font-normal">[२(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-emerald-700">कमी करण्यात आलेल्या नोंदींची संख्या<br/><span className="text-[10px] text-emerald-500 font-normal">[३(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-rose-700">कमी करण्यास शिल्लक नोंदींची संख्या<br/><span className="text-[10px] text-rose-500 font-normal">[४(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200">शेरा</th>
                          {isAdminMode && <th className="py-2.5 px-3 text-center w-20">कृती</th>}
                        </tr>
                        <tr className="bg-slate-50 text-[10px] text-slate-500 text-center border-b border-slate-200">
                          <th className="py-1 border-r border-slate-200">१</th>
                          <th className="py-1 border-r border-slate-200">२</th>
                          <th className="py-1 border-r border-slate-200">३</th>
                          <th className="py-1 border-r border-slate-200">४</th>
                          <th className="py-1 border-r border-slate-200">५</th>
                          <th className="py-1 border-r border-slate-200">६</th>
                          {isAdminMode && <th className="py-1">७</th>}
                        </tr>
                      </>
                    )}

                    {/* PRAPATRA 3 HEADERS */}
                    {selectedPrapatra === 3 && (
                      <>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                          <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-left">जिल्हा / तालुका / गाव</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">शासकीय मंडळे/स्थानिक संस्थांना प्रदान ७/१२<br/><span className="text-[10px] text-slate-500 font-normal">[२(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-rose-700">अनधिकृत हस्तांतरण / शर्तभंग ७/१२<br/><span className="text-[10px] text-rose-500 font-normal">[३(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-emerald-700">मालकी पूर्ववत / शासन जमा केलेले<br/><span className="text-[10px] text-emerald-500 font-normal">[४(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200">शेरा</th>
                          {isAdminMode && <th className="py-2.5 px-3 text-center w-20">कृती</th>}
                        </tr>
                        <tr className="bg-slate-50 text-[10px] text-slate-500 text-center border-b border-slate-200">
                          <th className="py-1 border-r border-slate-200">१</th>
                          <th className="py-1 border-r border-slate-200">२</th>
                          <th className="py-1 border-r border-slate-200">३</th>
                          <th className="py-1 border-r border-slate-200">४</th>
                          <th className="py-1 border-r border-slate-200">५</th>
                          <th className="py-1 border-r border-slate-200">६</th>
                          {isAdminMode && <th className="py-1">७</th>}
                        </tr>
                      </>
                    )}

                    {/* PRAPATRA 4 HEADERS */}
                    {selectedPrapatra === 4 && (
                      <>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                          <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-left">जिल्हा / तालुका / गाव</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">शैक्षणिक/ट्रस्ट/सोसायट्यांना प्रदान ७/१२<br/><span className="text-[10px] text-slate-500 font-normal">[२(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-rose-700">अनधिकृत हस्तांतरण / शर्तभंग ७/१२<br/><span className="text-[10px] text-rose-500 font-normal">[३(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-emerald-700">मालकी पूर्ववत / शासन जमा केलेले<br/><span className="text-[10px] text-emerald-500 font-normal">[४(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200">शेरा</th>
                          {isAdminMode && <th className="py-2.5 px-3 text-center w-20">कृती</th>}
                        </tr>
                        <tr className="bg-slate-50 text-[10px] text-slate-500 text-center border-b border-slate-200">
                          <th className="py-1 border-r border-slate-200">१</th>
                          <th className="py-1 border-r border-slate-200">२</th>
                          <th className="py-1 border-r border-slate-200">३</th>
                          <th className="py-1 border-r border-slate-200">४</th>
                          <th className="py-1 border-r border-slate-200">५</th>
                          <th className="py-1 border-r border-slate-200">६</th>
                          {isAdminMode && <th className="py-1">७</th>}
                        </tr>
                      </>
                    )}

                    {/* PRAPATRA 5 HEADERS */}
                    {selectedPrapatra === 5 && (
                      <>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                          <th className="py-2.5 px-3 border-r border-slate-200 w-12" rowSpan={2}>अ.क्र.</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-left" rowSpan={2}>जिल्हा / तालुका / गाव</th>
                          <th className="py-2.5 px-3 border-r border-slate-200" rowSpan={2}>शासकीय जमिनी ७/१२ संख्या<br/><span className="text-[10px] text-slate-500 font-normal">[२(अ)]</span></th>
                          <th className="py-2.5 px-3 border-r border-slate-200" rowSpan={2}>वाटप केलेल्या जमिनी संख्या<br/><span className="text-[10px] text-slate-500 font-normal">[३(अ)]</span></th>
                          <th className="py-1.5 px-3 border-b border-slate-200 bg-slate-200" colSpan={3}>शासकीय जमिनींची सद्यस्थिती</th>
                          <th className="py-2.5 px-3 border-r border-slate-200" rowSpan={2}>शेरा</th>
                          {isAdminMode && <th className="py-2.5 px-3 text-center w-20" rowSpan={2}>कृती</th>}
                        </tr>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                          <th className="py-1.5 px-3 border-r border-slate-200 text-rose-700">शर्तभंग झालेल्या<br/><span className="text-[10px] font-normal">[४(अ)]</span></th>
                          <th className="py-1.5 px-3 border-r border-slate-200 text-amber-700">अतिक्रमण असलेल्या<br/><span className="text-[10px] font-normal">[५(अ)]</span></th>
                          <th className="py-1.5 px-3 border-r border-slate-200 text-emerald-700">मोजणी झालेल्या<br/><span className="text-[10px] font-normal">[६(अ)]</span></th>
                        </tr>
                        <tr className="bg-slate-50 text-[10px] text-slate-500 text-center border-b border-slate-200">
                          <th className="py-1 border-r border-slate-200">१</th>
                          <th className="py-1 border-r border-slate-200">२</th>
                          <th className="py-1 border-r border-slate-200">३</th>
                          <th className="py-1 border-r border-slate-200">४</th>
                          <th className="py-1 border-r border-slate-200">५</th>
                          <th className="py-1 border-r border-slate-200">६</th>
                          <th className="py-1 border-r border-slate-200">७</th>
                          <th className="py-1 border-r border-slate-200">८</th>
                          {isAdminMode && <th className="py-1">९</th>}
                        </tr>
                      </>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {prapatraLoading ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-500">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-900 mb-2" />
                          <span>प्रपत्र डेटा लोड होत आहे...</span>
                        </td>
                      </tr>
                    ) : prapatraData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-slate-400">
                          कोणतीही नोंद उपलब्ध नाही. (निवडलेले फिल्टर तपासा किंवा रीसेट करा)
                        </td>
                      </tr>
                    ) : (
                      prapatraData.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-blue-50/40 transition">
                          <td className="py-2.5 px-3 text-center text-slate-400 border-r border-slate-100">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-100">
                            {row.villageName === 'संपूर्ण तालुका (All Villages)' ? (
                              <span className="font-extrabold text-blue-950 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-900" />
                                तालुका: {row.taluka} (एकूण गोषवारा)
                              </span>
                            ) : (
                              cleanVillageName(row.villageName) || row.taluka
                            )}
                          </td>

                          {/* Prapatra 1 Body */}
                          {selectedPrapatra === 1 && (
                            <>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono">{row.total712Count?.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono">{row.inspected1950Count?.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-blue-900">{row.govtFound1950Count?.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-rose-700">{row.illegalDeletionsCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-emerald-700">{row.rectifiedCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-amber-700">{row.pendingRectifyCount}</td>
                            </>
                          )}

                          {/* Prapatra 2 Body */}
                          {selectedPrapatra === 2 && (
                            <>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-amber-800">{row.pokalistCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-emerald-700">{row.pokalistRemovedCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-rose-700">{row.pokalistPendingCount}</td>
                            </>
                          )}

                          {/* Prapatra 3 Body */}
                          {selectedPrapatra === 3 && (
                            <>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono">{row.govtDeptsAllottedCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-rose-700">{row.govtDeptsShartbhang}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-emerald-700">{row.govtDeptsRestoredGovt}</td>
                            </>
                          )}

                          {/* Prapatra 4 Body */}
                          {selectedPrapatra === 4 && (
                            <>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono">{row.privateAllottedCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-rose-700">{row.privateShartbhang}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-emerald-700">{row.privateRestoredGovt}</td>
                            </>
                          )}

                          {/* Prapatra 5 Body */}
                          {selectedPrapatra === 5 && (
                            <>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-blue-900">{row.totalGovtLandCount?.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono">{row.govtAllottedCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-rose-700">{row.govtShartbhangCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-amber-700">{row.govtEncroachedCount}</td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-emerald-700">{row.govtMojaniDoneCount}</td>
                            </>
                          )}

                          <td className="py-2.5 px-3 text-slate-500 italic border-r border-slate-100">{row.remarks || '-'}</td>

                          {/* Action Column for SuperAdmin / Collector */}
                          {isAdminMode && (
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => openEditModal(row)}
                                className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2 py-1 rounded text-[11px] shadow-2xs transition cursor-pointer"
                                title="या गावाचे अभिलेख आकडे दुरुस्त करा"
                              >
                                <Edit3 className="w-3 h-3 text-amber-700" />
                                <span>संपादन</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: THEMATIC BOOKLETS (Ceiling, Bhudan, Tribal, Tenancy 89A) */}
      {/* ============================================================== */}
      {reportMode === 'thematic' && (
        <div className="space-y-4">
          {/* Thematic Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {THEMATIC_BOOKLETS.map((b) => {
              const isSelected = bookletType === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setBookletType(b.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? `${b.color} border-2 shadow-sm font-semibold scale-[1.01]`
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white/80 shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
                      {b.prapatra}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-current" />}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold leading-snug">{b.nameMr}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{b.nameEn}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                फिल्टर:
              </span>
              <select
                value={thematicTaluka}
                onChange={(e) => setThematicTaluka(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="">सर्व तालुके</option>
                {CHANDRAPUR_TALUKAS.map((t) => (
                  <option key={t.id} value={t.nameEn}>{t.nameMr} ({t.nameEn})</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="गाव शोधा..."
                value={thematicVillage}
                onChange={(e) => setThematicVillage(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 w-36"
              />
            </div>

            <div className="flex items-center gap-2">
              <a
                href={api.getBookletDownloadUrl({ type: bookletType, taluka: thematicTaluka, village: thematicVillage, format: 'excel' })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>एक्सेल डाऊनलोड</span>
              </a>

              <a
                href={api.getBookletDownloadUrl({ type: bookletType, taluka: thematicTaluka, village: thematicVillage, format: 'pdf' })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>पीडीएफ डाऊनलोड</span>
              </a>
            </div>
          </div>

          {/* Thematic Data Preview Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-3 border-r border-slate-200 w-12 text-center">अ.क्र.</th>
                    <th className="py-2 px-3 border-r border-slate-200">तालुका</th>
                    <th className="py-2 px-3 border-r border-slate-200">गाव</th>
                    <th className="py-2 px-3 border-r border-slate-200">गट क्र.</th>
                    <th className="py-2 px-3 border-r border-slate-200">क्षेत्र (हे.आर)</th>
                    <th className="py-2 px-3 border-r border-slate-200">मूळ वाटपदार</th>
                    <th className="py-2 px-3 border-r border-slate-200">सद्यस्थिती / शेरा</th>
                    <th className="py-2 px-3 text-center">शर्तभंग</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {thematicLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        लोड होत आहे...
                      </td>
                    </tr>
                  ) : thematicPreview.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        या निकषांनुसार रेकॉर्ड उपलब्ध नाहीत.
                      </td>
                    </tr>
                  ) : (
                    thematicPreview.map((r, i) => (
                      <tr key={r.id || i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center text-slate-400 border-r border-slate-100">{i + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-100 font-semibold">{r.taluka}</td>
                        <td className="py-2 px-3 border-r border-slate-100">{r.villageName}</td>
                        <td className="py-2 px-3 border-r border-slate-100 font-mono">{r.gatNumber}</td>
                        <td className="py-2 px-3 border-r border-slate-100 font-mono">{r.allottedAreaHa || r.totalAreaHa}</td>
                        <td className="py-2 px-3 border-r border-slate-100">{r.allotteeName || r.ownerName}</td>
                        <td className="py-2 px-3 border-r border-slate-100">{r.remarks || r.orderRef || '-'}</td>
                        <td className="py-2 px-3 text-center">
                          {r.isBreached || r.hasActiveDispute ? (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">होय</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">नाही</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: SUPERADMIN / COLLECTOR EDIT RECORD MODAL */}
      {/* ============================================================== */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">७/१२ अभिलेख दुरुस्ती खिडकी (Record Rectification Window)</h3>
                  <p className="text-[11px] text-blue-200">
                    तालुका: {editingRecord.taluka} | गाव: {editingRecord.villageName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-blue-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>जिल्हाधिकारी सूचना:</strong> येथे केलेले बदल थेट शासकीय डेटाबेसमध्ये साठवले जातील आणि तालुक्याची एकूण गोषवारा आकडेवारी आपोआप पुन्हा मोजली जाईल.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">गावाचे नाव (Village Name):</label>
                  <input
                    type="text"
                    value={editForm.villageName || ''}
                    onChange={(e) => setEditForm({ ...editForm, villageName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">एकूण ७/१२ संख्या [२(अ)]:</label>
                  <input
                    type="number"
                    value={editForm.total712Count || 0}
                    onChange={(e) => setEditForm({ ...editForm, total712Count: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">१९५० पासून तपासलेले [३(अ)]:</label>
                  <input
                    type="number"
                    value={editForm.inspected1950Count || 0}
                    onChange={(e) => setEditForm({ ...editForm, inspected1950Count: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">सरकार नोंद आढळून आलेले [४(अ)]:</label>
                  <input
                    type="number"
                    value={editForm.govtFound1950Count || 0}
                    onChange={(e) => setEditForm({ ...editForm, govtFound1950Count: e.target.value })}
                    className="w-full bg-blue-50/60 border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 mb-1">अवैध सरकार नोंद कमी केलेले [५(अ)]:</label>
                  <input
                    type="number"
                    value={editForm.illegalDeletionsCount || 0}
                    onChange={(e) => setEditForm({ ...editForm, illegalDeletionsCount: e.target.value })}
                    className="w-full bg-rose-50/60 border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-700 mb-1">दुरुस्ती केलेले [६(अ)]:</label>
                  <input
                    type="number"
                    value={editForm.rectifiedCount || 0}
                    onChange={(e) => setEditForm({ ...editForm, rectifiedCount: e.target.value })}
                    className="w-full bg-emerald-50/60 border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-700 mb-1">दुरुस्ती करण्यास शिल्लक [७(अ)]:</label>
                  <input
                    type="number"
                    value={editForm.pendingRectifyCount || 0}
                    onChange={(e) => setEditForm({ ...editForm, pendingRectifyCount: e.target.value })}
                    className="w-full bg-amber-50/60 border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">पोकळीस्त नोंदी संख्या [प्रपत्र २]:</label>
                  <input
                    type="number"
                    value={editForm.pokalistCount || 0}
                    onChange={(e) => setEditForm({ ...editForm, pokalistCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 mb-1">गायरान / शासकीय अतिक्रमण संख्या:</label>
                  <input
                    type="number"
                    value={editForm.govtEncroachedCount || 0}
                    onChange={(e) => setEditForm({ ...editForm, govtEncroachedCount: e.target.value })}
                    className="w-full bg-rose-50/40 border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">शेरा / आदेश संदर्भ:</label>
                  <input
                    type="text"
                    value={editForm.remarks || ''}
                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    placeholder="उदा. SDO आदेश क्र. १२४/२०२६ नुसार दुरुस्ती"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-amber-400" />}
                <span>बदल जतन करा (Save Changes)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: UPLOAD OFFICIAL EXCEL INSPECTION WORKBOOK */}
      {/* ============================================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="bg-blue-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">१ ते ४५ मुद्देनिहाय एक्सेल डेटा अपलोड (Upload Inspection Sheet)</h3>
                  <p className="text-[11px] text-blue-200">
                    शासकीय महसूल नमुन्यातील ५३-स्तंभ एक्सेल थेट डेटाबेसमध्ये समाविष्ट करा
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">तालुका निवडा (Select Taluka):</label>
                  <select
                    value={uploadTaluka}
                    onChange={(e) => setUploadTaluka(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  >
                    {CHANDRAPUR_TALUKAS.map((t) => (
                      <option key={t.id} value={t.nameEn}>{t.nameMr} ({t.nameEn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">गावाचे नाव (ऐच्छिक / Optional Override):</label>
                  <input
                    type="text"
                    value={uploadVillage}
                    onChange={(e) => setUploadVillage(e.target.value)}
                    placeholder="फाईलमधील नाव आपोआप शोधले जाईल"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">एक्सेल फाईल निवडा (.xlsx):</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-blue-700 transition cursor-pointer bg-slate-50">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-xs font-bold text-emerald-800">
                      निवडलेली फाईल: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              {uploadFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-emerald-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{uploadFeedback.message}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="bg-white p-1.5 rounded border border-emerald-200 text-center">
                      <span className="block text-slate-500 text-[10px]">एकूण ७/१२</span>
                      <strong className="text-sm font-mono">{uploadFeedback.stats.total712}</strong>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-emerald-200 text-center">
                      <span className="block text-slate-500 text-[10px]">शासकीय नोंद</span>
                      <strong className="text-sm font-mono text-blue-800">{uploadFeedback.stats.govt1950}</strong>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-emerald-200 text-center">
                      <span className="block text-slate-500 text-[10px]">अवैध नाव कमी</span>
                      <strong className="text-sm font-mono text-rose-700">{uploadFeedback.stats.illegalDel}</strong>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-emerald-200 text-center">
                      <span className="block text-slate-500 text-[10px]">पोकळीस्त नोंदी</span>
                      <strong className="text-sm font-mono text-amber-800">{uploadFeedback.stats.pokalist}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-100 -mx-5 -mb-5 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  बंद करा
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition disabled:opacity-50"
                >
                  {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isUploading ? 'फाईल तपासत आहे...' : 'अपलोड व डेटा समाविष्ट करा'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
