'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock,
  Scale,
  FolderArchive,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Building,
  User,
  ShieldAlert,
  FileText,
  Calendar,
  Eye,
  Maximize2,
  Minimize2,
  Columns,
  ChevronRight,
  BookOpen,
  Info,
  Printer,
  Archive,
  Edit3,
} from 'lucide-react';
import EditParcelModal from './EditParcelModal';
import { api } from '../lib/api';
import { TENURE_CLASSES, VIOLATION_TYPES, ENFORCEMENT_STATUSES } from '../lib/constants';
import DocUploadModal from './DocUploadModal';
import ArchivalDocumentViewer from './ArchivalDocumentViewer';
import RevenueShortcutGuideModal from './RevenueShortcutGuideModal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useTranslation } from './LanguageContext';
import { formatVillageName } from '../lib/villageUtils';

export default function ParcelTraceDrawer({ upi, onClose, onRefresh }) {
  const { locale, isMarathi } = useTranslation();
  const trapRef = useFocusTrap(Boolean(upi));
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (upi) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [upi]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('backward');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Split-view & Interactive Document Selection State
  const [selectedEpoch, setSelectedEpoch] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [glossaryInitialQuery, setGlossaryInitialQuery] = useState('');

  // Open Document Handler: switches to Right-Side Split View and loads document
  const handleOpenDocument = (epochOrItem, type = 'backward') => {
    if (type === 'backward') {
      setSelectedEpoch(epochOrItem);
    } else if (type === 'forward') {
      setSelectedCase(epochOrItem);
    } else if (type === 'documents') {
      setSelectedDoc(epochOrItem);
    }
    setIsSplitView(true);
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && upi) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [upi, isFullscreen, onClose]);

  useEffect(() => {
    if (!upi) return;
    setLoading(true);
    setError(null);
    api.getParcelTrace(upi)
      .then((res) => {
        setData(res);
        setLoading(false);

        // Auto-select baseline 1950 epoch or first available epoch
        const p = res?.parcel;
        if (p) {
          const baseline = p.backwardHistories?.find((b) => b.epochYear === 1950) || p.backwardHistories?.[0];
          setSelectedEpoch(baseline || null);
          setSelectedCase(p.forwardCases?.[0] || null);
          setSelectedDoc(p.documents?.[0] || null);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [upi]);

  if (!upi || !mounted) return null;

  const parcel = data?.parcel;
  const summary = data?.intelligenceSummary;
  const tenureConfig = parcel?.tenureClass ? TENURE_CLASSES[parcel.tenureClass] : null;

  // Active document resolution for right-side viewer
  const getActiveDocument = () => {
    if (activeTab === 'documents') {
      return selectedDoc || parcel?.documents?.[0] || null;
    }
    if (activeTab === 'forward') {
      return selectedCase?.documents?.[0] || parcel?.documents?.find((d) => d.caseId === selectedCase?.id) || null;
    }
    // Backward tab
    if (selectedEpoch?.documents?.length > 0) {
      return selectedEpoch.documents[0];
    }
    // Match document by title/type or fall back to baseline 7/12
    if (selectedEpoch?.epochYear === 1950) {
      return parcel?.documents?.find((d) => d.docType === 'OLD_7_12_ARCHIVE') || parcel?.documents?.[0] || null;
    }
    return parcel?.documents?.[0] || null;
  };

  const activeDocument = getActiveDocument();

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-all duration-150 ${
        isFullscreen ? 'p-0' : 'p-0 sm:p-5'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcel-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modern Minimalist Modal Dialog */}
      <div
        ref={trapRef}
        className={`relative z-10 w-full bg-white flex flex-col overflow-hidden animate-dialog-in duration-150 ${
          isFullscreen
            ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none border-0 shadow-none my-0'
            : 'rounded-none sm:rounded-2xl shadow-xl border-0 sm:border border-slate-200/80 max-w-6xl h-full sm:h-[88vh] max-h-full sm:max-h-[92vh] my-auto'
        }`}
      >
        {/* Executive Header */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-white text-slate-900 flex justify-between items-center border-b border-slate-200/80 shrink-0 gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="parcel-drawer-title" className="text-base font-semibold text-slate-900 truncate tracking-tight">
                {formatVillageName(parcel?.villageName, isMarathi)} <span className="text-slate-300 font-normal">|</span> {isMarathi ? 'गट क्र.' : 'Gat No.'} {parcel?.gatNumber}
                {parcel?.hissaNumber && parcel.hissaNumber !== '0' && ` (${isMarathi ? 'हिस्सा' : 'Hissa'} ${parcel.hissaNumber})`}
              </h2>
              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70 font-medium">
                UPI: {upi}
              </span>
              {parcel?.hasActiveDispute ? (
                <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-medium border border-rose-200/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {isMarathi ? 'सक्रिय वाद' : 'Active Dispute'}
                </span>
              ) : (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/70 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isMarathi ? 'निर्वैध नोंद' : 'Clear Record'}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 truncate flex items-center gap-2 mt-1">
              <span>{isMarathi ? 'तालुका:' : 'Taluka:'} <span className="text-slate-700 font-medium">{parcel?.taluka}</span></span>
              <span className="text-slate-300">•</span>
              <span>{isMarathi ? 'महसूल मंडळ:' : 'Revenue Circle:'} <span className="text-slate-700 font-medium">{parcel?.revenueCircle || '-'}</span></span>
              <span className="text-slate-300">•</span>
              <span>{isMarathi ? 'क्षेत्र:' : 'Area:'} <span className="text-slate-700 font-mono font-medium">{Number(parcel?.totalAreaHa || 0).toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}</span></span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Revenue Glossary Trigger */}
            <button
              type="button"
              onClick={() => {
                setGlossaryInitialQuery('');
                setGlossaryModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition flex items-center gap-1.5 cursor-pointer"
              title={isMarathi ? '७/१२ संक्षिप्त रूपे मार्गदर्शक (Glossary)' : '7/12 Abbreviations Glossary'}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{isMarathi ? 'संक्षिप्त रूपे मदत' : 'Glossary Help'}</span>
            </button>

            {/* Edit / Rectification Button */}
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
              title={isMarathi ? 'अभिलेख दुरुस्ती करा (Edit Parcel & Timeline)' : 'Edit Parcel & Timeline'}
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMarathi ? 'दुरुस्ती करा' : 'Edit Parcel'}</span>
            </button>

            {/* Print / Export */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition flex items-center gap-1.5 cursor-pointer"
              title={isMarathi ? 'अहवाल प्रिंट करा (Print Dossier)' : 'Print Dossier'}
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{isMarathi ? 'अहवाल प्रिंट' : 'Print Report'}</span>
            </button>

            {/* Split View Toggle */}
            <button
              type="button"
              onClick={() => setIsSplitView((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border cursor-pointer hidden md:flex ${
                isSplitView
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isSplitView ? (isMarathi ? 'केवळ माहिती दृश्य' : 'Details View Only') : (isMarathi ? 'बाजू-बाजूने स्कॅन दृश्य' : 'Side-by-Side Scan View')}
            >
              <Columns className="w-3.5 h-3.5 text-blue-600" />
              <span>{isSplitView ? (isMarathi ? 'बाजू-बाजूने दृश्य' : 'Split View') : (isMarathi ? 'केवळ माहिती' : 'Details Only')}</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Fullscreen Modal Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title={isFullscreen ? (isMarathi ? 'पूर्ण स्क्रीन बंद करा' : 'Exit Fullscreen') : (isMarathi ? 'पूर्ण स्क्रीन करा' : 'Enter Fullscreen')}
              aria-label={isFullscreen ? (isMarathi ? 'पूर्ण स्क्रीन बंद करा' : 'Exit Fullscreen') : (isMarathi ? 'पूर्ण स्क्रीन करा' : 'Enter Fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label={isMarathi ? 'संवाद बंद करा (Close dialog)' : 'Close dialog'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white">
          {loading ? (
            <div className="py-24 text-center space-y-3 my-auto">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                {isMarathi ? 'अभिलेख इतिहास व दस्तऐवज लोड होत आहेत...' : 'Loading records history & documents...'}
              </p>
            </div>
          ) : error ? (
            <div className="m-6 p-4 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{isMarathi ? 'त्रुटी:' : 'Error:'} {error}</span>
            </div>
          ) : parcel ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
              {/* Optional Alert Banners */}
              {summary?.potentialIllegalAlienation && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <span>{isMarathi ? 'संभाव्य बेकायदेशीर हस्तांतरण (MLRC Sec 36/36A Alert)' : 'Suspected Illegal Alienation (MLRC Sec 36/36A Alert)'}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                        {isMarathi ? 'वैधानिक इशारा' : 'Statutory Alert'}
                      </span>
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      {isMarathi ? 'हा भूखंड सन १९५० च्या अभिलेखात मूळ आदिवासी खातेदार/शासकीय सदरी नोंदवला होता, परंतु नंतर अनधिकृतपणे खाजगी धारणेवर वर्ग करण्यात आला आहे.' : 'This parcel was originally recorded under Tribal Holder / Govt vesting in 1950 records, but later transferred without authorization to private tenure.'}
                    </p>
                  </div>
                </div>
              )}

              {summary?.isRepossessedToGovt && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-emerald-950">{isMarathi ? 'शासन जमा आदेश पारित (Resumed to Government)' : 'Government Vesting Order Issued (Resumed to Government)'}</p>
                    <p className="text-emerald-800 leading-relaxed">
                      {isMarathi ? 'जिल्हाधिकारी कार्यालयाच्या अंतिम आदेशानुसार हा भूखंड अनधिकृत कब्जेदारामधून काढून पुन्हा शासकीय सदरी वर्ग करण्यात आला आहे.' : 'By final Collectorate order, this parcel was resumed from unauthorized holding back into Government vesting.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Minimalist Key Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 transition">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{isMarathi ? 'धारणा प्रकार (Tenure)' : 'Tenure Class'}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                    {isMarathi ? (tenureConfig?.labelMr || parcel.tenureClass) : (tenureConfig?.labelEn || parcel.tenureClass)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {parcel.tenureClass === 'BHOGVATDAR_CLASS_2' ? (isMarathi ? 'हस्तांतरणास जिल्हाधिकारी पूर्वपरवानगी आवश्यक' : 'Collector prior sanction required for transfer') : (isMarathi ? 'मुक्त धारणा' : 'Freehold')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 transition">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{isMarathi ? '१९५० मूळ खातेदार (Baseline Owner)' : '1950 Baseline Owner'}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 truncate" title={summary?.baseline1950Epoch?.ownerName}>
                    {summary?.baseline1950Epoch?.ownerName || (isMarathi ? 'नोंद प्रलंबित' : 'Pending Record')}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {isMarathi ? 'खाते क्र.:' : 'Khata No.:'} {summary?.baseline1950Epoch?.khataNumber || '-'} <span className="text-slate-300">•</span> {isMarathi ? 'फेरफार:' : 'Ferfar:'} {summary?.baseline1950Epoch?.ferfarNumber || '-'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{isMarathi ? 'अभिलेख दस्तऐवज (Collectorate DMS)' : 'Archival Records (Collectorate DMS)'}</p>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-medium border border-indigo-200/50">
                      {isMarathi ? 'डिजिटाईज्ड' : 'Digitized'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {parcel.documents?.length || 0} {isMarathi ? 'फायली संलग्न' : 'Files Attached'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isMarathi ? 'भौतिक कपाट रॅक व ई-अभिलेख प्रणाली' : 'Physical room rack and e-records system'}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 gap-3 shrink-0 overflow-x-auto scrollbar-none">
                <div className="flex gap-3 sm:gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('backward')}
                    className={`pb-2.5 text-xs flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'backward'
                        ? 'border-blue-600 text-blue-700 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isMarathi ? '१९५० शीर्षक साखळी' : '1950 Title Chain'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                      activeTab === 'backward' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {parcel.backwardHistories?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('forward')}
                    className={`pb-2.5 text-xs flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'forward'
                        ? 'border-blue-600 text-blue-700 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isMarathi ? 'शर्तभंग व सुनावणी' : 'Violations & Hearings'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                      activeTab === 'forward' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {parcel.forwardCases?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={`pb-2.5 text-xs flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'documents'
                        ? 'border-blue-600 text-blue-700 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>{isMarathi ? 'DMS दस्तऐवज' : 'DMS Documents'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                      activeTab === 'documents' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {parcel.documents?.length || 0}
                    </span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 pb-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isMarathi ? 'दस्तऐवज पाहण्यासाठी नोंदीवर क्लिक करा' : 'Click record to inspect scanned document'}</span>
                </div>
              </div>

              {/* Split-View Body: Left Column (Data) & Right Column (Scanned Document) */}
              <div className={`grid gap-5 ${isSplitView ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
                {/* LEFT COLUMN: Data Timeline / Cases / DMS List */}
                <div className={`${isSplitView ? 'lg:col-span-6 xl:col-span-6' : 'w-full'} space-y-3`}>
                  {/* TAB 1: BACKWARD TITLE CHAIN (१९५० साखळी) */}
                  {activeTab === 'backward' && (
                    <div className="space-y-3">
                      {/* Clean Minimalist Timeline */}
                      <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-slate-200">
                        {parcel.backwardHistories?.map((epoch, index) => {
                          const isSelected = selectedEpoch?.id === epoch.id || (!selectedEpoch && epoch.epochYear === 1950);
                          const is1950 = epoch.epochYear === 1950;

                          return (
                            <div key={epoch.id} className="relative">
                              {/* Clean Minimalist Timeline Node */}
                              <div className="absolute -left-6 top-3.5 flex items-center justify-center">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all bg-white ${
                                    isSelected
                                      ? 'border-blue-600 ring-3 ring-blue-100'
                                      : is1950
                                      ? 'border-amber-500'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isSelected
                                        ? 'bg-blue-600'
                                        : is1950
                                        ? 'bg-amber-500'
                                        : 'bg-slate-300'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Clean Modern Epoch Card */}
                              <div
                                onClick={() => setSelectedEpoch(epoch)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-3 ${
                                  isSelected
                                    ? 'bg-white border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                                }`}
                              >
                                {/* Top Line: Year Pill, Active Indicator, Ferfar */}
                                <div className="flex justify-between items-start gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                          is1950
                                            ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200/70'
                                        }`}
                                      >
                                        {is1950 ? (isMarathi ? 'सन १९५० मूळ नोंद (Baseline)' : '1950 Baseline Record') : (isMarathi ? `सन ${epoch.epochYear}` : `Year ${epoch.epochYear}`)}
                                      </span>

                                      {isSelected && (
                                        <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                                          {isMarathi ? 'निवडलेले' : 'Selected'}
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="text-sm font-semibold text-slate-900 pt-0.5">
                                      {epoch.ownerName}
                                    </h4>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                                      {isMarathi ? 'फेरफार:' : 'Ferfar:'} {epoch.ferfarNumber || 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                {/* Clean Key Attributes Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-t border-b border-slate-100 text-[11px]">
                                  <div>
                                    <span className="text-slate-400 block">{isMarathi ? 'खाते क्र.' : 'Khata No.'}</span>
                                    <span className="text-slate-800 font-medium">{epoch.khataNumber || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">{isMarathi ? 'क्षेत्र' : 'Area'}</span>
                                    <span className="text-slate-800 font-mono font-medium">{Number(epoch.areaHa).toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">{isMarathi ? 'हस्तांतरण' : 'Transfer'}</span>
                                    <span className="text-slate-800 font-medium truncate block">{epoch.mutationType || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">{isMarathi ? 'शासकीय जमीन' : 'Govt Land'}</span>
                                    <span className="text-slate-800 font-medium">{epoch.wasGovtLand ? (isMarathi ? 'होय' : 'Yes') : (isMarathi ? 'नाही' : 'No')}</span>
                                  </div>
                                </div>

                                {/* Remarks Callout (if present) */}
                                {epoch.remarks && (
                                  <div className="text-[11px] text-slate-600 bg-amber-50/50 border-l-2 border-amber-400 px-3 py-1.5 rounded-r">
                                    <span className="font-medium text-amber-900">{isMarathi ? 'शेरा: ' : 'Remark: '}</span>
                                    <span>{epoch.remarks}</span>
                                  </div>
                                )}

                                {/* Card Footer: Archival Location & Action Button */}
                                <div className="flex items-center justify-between text-xs pt-0.5">
                                  <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1.5">
                                    <Archive className="w-3.5 h-3.5 text-slate-400" />
                                    <span>
                                      {is1950 ? (isMarathi ? 'कपाट: R-01 • गठ्ठा: B-01' : 'Rack: R-01 • Bundle: B-01') : epoch.epochYear === 1988 ? (isMarathi ? 'कपाट: R-02 • गठ्ठा: B-04' : 'Rack: R-02 • Bundle: B-04') : (isMarathi ? 'कपाट: R-03 • गठ्ठा: B-09' : 'Rack: R-03 • Bundle: B-09')}
                                    </span>
                                  </span>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDocument(epoch, 'backward');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer"
                                    title={isMarathi ? 'स्कॅन दस्तऐवज उघडा' : 'Open Scanned Document'}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{isMarathi ? 'स्कॅन दस्तऐवज पहा' : 'View Scanned Document'}</span>
                                    <ExternalLink className="w-3 h-3 opacity-60" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: FORWARD CASES (शर्तभंग व सुनावणी) */}
                  {activeTab === 'forward' && (
                    <div className="space-y-3">
                      {parcel.forwardCases?.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                          {isMarathi ? 'या भूखंडावर कोणतेही सक्रिय वाद किंवा शर्तभंग प्रकरण प्रलंबित नाही.' : 'No active disputes or violation cases pending for this parcel.'}
                        </div>
                      ) : (
                        parcel.forwardCases?.map((item) => {
                          const viol = VIOLATION_TYPES[item.violationType];
                          const stat = ENFORCEMENT_STATUSES[item.status];
                          const isSelected = selectedCase?.id === item.id;

                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedCase(item)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-3 ${
                                isSelected
                                  ? 'bg-white border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
                                  : 'bg-white border-slate-200/80 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
                                      {isMarathi ? 'केस क्र.' : 'Case No.'} {item.caseNumber}
                                    </span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium border inline-flex items-center gap-1 ${viol?.badgeClass}`}>
                                      <span>{isMarathi ? (viol?.labelMr || item.violationType) : (viol?.labelEn || item.violationType)}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setGlossaryInitialQuery(viol?.labelMr || item.violationType);
                                          setGlossaryModalOpen(true);
                                        }}
                                        className="opacity-70 hover:opacity-100 transition p-0.5"
                                        title={isMarathi ? 'या उल्लंघनाची महसूल व्याख्या पहा' : 'View revenue definition for this violation'}
                                      >
                                        <Info className="w-3 h-3" />
                                      </button>
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    {isMarathi ? 'अनधिकृत कब्जेदार:' : 'Unauthorized Occupant:'} <span className="text-slate-900 font-medium">{item.occupantName || '-'}</span>
                                  </p>
                                </div>
                                <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${stat?.color}`}>
                                  {isMarathi ? (stat?.labelMr || item.status) : (stat?.labelEn || item.status)}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-t border-b border-slate-100 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block">{isMarathi ? 'अतिक्रमीत क्षेत्र' : 'Encroached Area'}</span>
                                  <span className="text-slate-800 font-medium">{Number(item.encroachedAreaHa).toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">{isMarathi ? 'तपास अधिकारी' : 'Enquiry Officer'}</span>
                                  <span className="text-slate-800 font-medium">{item.investigatingOfficer || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">{isMarathi ? 'नोटीस दिनांक' : 'Notice Date'}</span>
                                  <span className="text-slate-800 font-medium">{item.showCauseNoticeDate ? new Date(item.showCauseNoticeDate).toLocaleDateString('mr-IN') : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">{isMarathi ? 'शासन जमा' : 'Govt Vested'}</span>
                                  <span className="text-emerald-700 font-medium">{item.isRepossessedToGovt ? (isMarathi ? 'होय' : 'Yes') : (isMarathi ? 'नाही' : 'No')}</span>
                                </div>
                              </div>

                              {item.finalOrderDetails && (
                                <div className="text-[11px] text-slate-600 bg-amber-50/50 border-l-2 border-amber-400 px-3 py-1.5 rounded-r">
                                  <span className="font-medium text-amber-900">{isMarathi ? 'अंतिम आदेश शेरा: ' : 'Final Order Remark: '}</span>
                                  <span>{item.finalOrderDetails}</span>
                                </div>
                              )}

                              {/* Hearings Summary */}
                              {item.hearings?.length > 0 && (
                                <div className="pt-1 space-y-1.5">
                                  <p className="text-[11px] font-medium text-slate-500">{isMarathi ? 'सुनावणी इतिवृत्त' : 'Hearing Minutes'} ({item.hearings.length}):</p>
                                  {item.hearings.map((h) => (
                                    <div key={h.id} className="p-2 bg-slate-50/70 rounded-lg border border-slate-200/60 text-[11px] space-y-0.5">
                                      <div className="flex justify-between items-center text-slate-500">
                                        <span className="font-semibold text-slate-800">{h.authority}</span>
                                        <span>{new Date(h.hearingDate).toLocaleDateString('mr-IN')}</span>
                                      </div>
                                      <p className="text-slate-700">{h.proceedingsLog}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="pt-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDocument(item, 'forward');
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isMarathi ? 'नोटीस व आदेश दस्तऐवज उघडा' : 'Open Notice & Order Document'}</span>
                                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* TAB 3: DMS DOCUMENTS (अभिलेख फायली) */}
                  {activeTab === 'documents' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {isMarathi ? 'अभिलेखागारातील प्रमाणित स्कॅन फायली' : 'Certified Archive Scanned Files'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {isMarathi ? 'डिजिटल स्कॅन व भौतिक कपाट संदर्भ' : 'Digital scans & physical room bundle reference'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadModalOpen(true)}
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isMarathi ? 'नवीन जोडा' : 'Attach New'}</span>
                        </button>
                      </div>

                      {parcel.documents?.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                          {isMarathi ? 'या भूखंडाशी संलग्न कोणतेही दस्तऐवज अजून जोडलेले नाहीत.' : 'No archival documents attached to this parcel yet.'}
                        </div>
                      ) : (
                        parcel.documents?.map((doc) => {
                          const isSelected = selectedDoc?.id === doc.id;

                          return (
                            <div
                              key={doc.id}
                              onClick={() => setSelectedDoc(doc)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2.5 ${
                                isSelected
                                  ? 'bg-white border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
                                  : 'bg-white border-slate-200/80 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                                    {doc.docType}
                                  </span>
                                  <h4 className="text-xs font-semibold text-slate-900 mt-1">
                                    {doc.title}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDocument(doc, 'documents');
                                  }}
                                  className="text-xs font-medium inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-lg transition cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>{isMarathi ? 'पहा' : 'View'}</span>
                                  <ChevronRight className="w-3 h-3 opacity-60" />
                                </button>
                              </div>

                              <div className="grid grid-cols-3 gap-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600 font-mono">
                                <div>
                                  {isMarathi ? 'रॅक:' : 'Rack:'} <span className="text-slate-800 font-medium">{doc.recordRoomRackNo || '-'}</span>
                                </div>
                                <div>
                                  {isMarathi ? 'गठ्ठा:' : 'Bundle:'} <span className="text-slate-800 font-medium">{doc.recordRoomBundleNo || '-'}</span>
                                </div>
                                <div>
                                  {isMarathi ? 'फाईल:' : 'File:'} <span className="text-slate-800 font-medium">{doc.fileNumber || '-'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Interactive Scanned Document Viewer */}
                {isSplitView && (
                  <div className="lg:col-span-6 xl:col-span-6 flex flex-col h-[calc(88vh-200px)] min-h-[540px] sticky top-0 animate-in fade-in duration-200">
                    <ArchivalDocumentViewer
                      document={activeDocument}
                      selectedEpoch={activeTab === 'backward' ? selectedEpoch : null}
                      selectedCase={activeTab === 'forward' ? selectedCase : null}
                      parcel={parcel}
                      className="h-full flex-1 rounded-xl border border-slate-200/80 shadow-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Minimalist Footer Bar */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'दस्तऐवज संलग्न करा (Attach Document)' : 'Attach Archival Document'}</span>
            </button>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="text-xs text-slate-400 hidden md:inline">
              {isMarathi ? 'जिल्हाधिकारी कार्यालय चंद्रपूर • ई-अभिलेख कक्ष' : 'Collectorate Chandrapur • e-Records Cell'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300/80 rounded-lg text-xs font-medium text-slate-700 transition cursor-pointer shadow-2xs"
            >
              {isMarathi ? 'बंद करा (Close)' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Parcel & Timeline Modal */}
      {editModalOpen && (
        <EditParcelModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          parcel={parcel}
          onUpdateSuccess={() => {
            if (upi) {
              api.getParcelTrace(upi).then(setData);
            }
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Embedded Doc Upload Modal */}
      {uploadModalOpen && (
        <DocUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          parcelId={parcel?.id}
          caseId={selectedCase?.id}
          onUploadSuccess={() => {
            if (upi) {
              api.getParcelTrace(upi).then(setData);
            }
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Revenue Glossary Modal */}
      <RevenueShortcutGuideModal
        isOpen={glossaryModalOpen}
        onClose={() => setGlossaryModalOpen(false)}
        initialQuery={glossaryInitialQuery}
      />
    </div>,
    document.body
  );
}