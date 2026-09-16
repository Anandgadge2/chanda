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
  Sparkles,
  MapPin,
  Check,
  BookOpen,
  Info,
} from 'lucide-react';
import { api } from '../lib/api';
import { TENURE_CLASSES, VIOLATION_TYPES, ENFORCEMENT_STATUSES } from '../lib/constants';
import DocUploadModal from './DocUploadModal';
import ArchivalDocumentViewer from './ArchivalDocumentViewer';
import RevenueShortcutGuideModal from './RevenueShortcutGuideModal';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function ParcelTraceDrawer({ upi, onClose, onRefresh }) {
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

  // Split-view & Interactive Document Selection State
  // Default to false ("केवळ माहिती" mode on by default as requested)
  const [selectedEpoch, setSelectedEpoch] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [glossaryInitialQuery, setGlossaryInitialQuery] = useState('');

  // Open Document Handler: switches to Right-Side Split View ("बाजू-बाजूने दृश्य") and loads document
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
        isFullscreen ? 'p-0' : 'p-2 sm:p-3 md:p-4'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcel-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Enhanced Modal Dialog */}
      <div
        ref={trapRef}
        className={`relative z-10 w-full bg-white flex flex-col overflow-hidden animate-dialog-in duration-150 ${
          isFullscreen
            ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none border-0 shadow-none my-0'
            : 'rounded-2xl shadow-2xl border border-slate-700/40 max-w-7xl max-h-[95vh] h-[92vh] my-auto'
        }`}
      >
        {/* Executive Government Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-slate-900 flex justify-between items-center border-b border-slate-200 shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="parcel-drawer-title" className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
                {parcel?.villageName} | गट क्र. {parcel?.gatNumber}
                {parcel?.hissaNumber && parcel.hissaNumber !== '0' && ` (हिस्सा ${parcel.hissaNumber})`}
              </h2>
              <span className="font-mono text-[10px] sm:text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200">
                UPI: {upi}
              </span>
              {parcel?.hasActiveDispute ? (
                <span className="text-[10px] sm:text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-semibold border border-rose-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  सक्रिय वाद
                </span>
              ) : (
                <span className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  निर्वैध नोंद
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 truncate flex items-center gap-2 mt-0.5">
              <span>तालुका: <strong className="text-slate-700 font-semibold">{parcel?.taluka}</strong></span>
              <span>•</span>
              <span>महसूल मंडळ: <strong className="text-slate-700 font-semibold">{parcel?.revenueCircle || '-'}</strong></span>
              <span>•</span>
              <span>क्षेत्र: <strong className="text-amber-700 font-mono font-semibold">{Number(parcel?.totalAreaHa || 0).toFixed(4)} हे.</strong></span>
            </p>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Revenue Glossary Trigger */}
            <button
              type="button"
              onClick={() => {
                setGlossaryInitialQuery('');
                setGlossaryModalOpen(true);
              }}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="७/१२ संक्षिप्त रूपे मार्गदर्शक (Glossary)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">संक्षिप्त रूपे मदत</span>
            </button>

            {/* Split View Toggle */}
            <button
              type="button"
              onClick={() => setIsSplitView((prev) => !prev)}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSplitView
                  ? 'bg-blue-50 text-blue-900 border-blue-600 ring-1 ring-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              } hidden md:flex`}
              title={isSplitView ? 'केवळ माहिती दृश्य टॉगल करा' : 'बाजू-बाजूने स्कॅन दृश्य टॉगल करा'}
            >
              <Columns className="w-3.5 h-3.5 text-blue-700" />
              <span>{isSplitView ? 'बाजू-बाजूने दृश्य' : 'केवळ माहिती'}</span>
            </button>

            {/* Fullscreen Modal Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              title={isFullscreen ? 'पूर्ण स्क्रीन बंद करा (Exit Fullscreen)' : 'पूर्ण स्क्रीन करा (Fullscreen)'}
              aria-label={isFullscreen ? 'पूर्ण स्क्रीन बंद करा' : 'पूर्ण स्क्रीन करा'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-blue-900" /> : <Maximize2 className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="संवाद बंद करा (Close dialog)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Main Split-View Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {loading ? (
            <div className="py-24 text-center space-y-3 my-auto">
              <div className="w-9 h-9 border-3 border-blue-900 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-semibold">
                अभिलेख इतिहास, १९५० शीर्षक साखळी व स्कॅन दस्तऐवज लोड होत आहेत...
              </p>
            </div>
          ) : error ? (
            <div className="m-6 p-4 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>त्रुटी: {error}</span>
            </div>
          ) : parcel ? (
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-4">
              {/* Top Intelligence Banner if Alert */}
              {summary?.potentialIllegalAlienation && (
                <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <span>संभाव्य बेकायदेशीर हस्तांतरण (MLRC Sec 36/36A Alert)</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                        Statutory Alert
                      </span>
                    </p>
                    <p className="mt-0.5 text-amber-900">
                      हा भूखंड सन १९५० च्या अभिलेखात मूळ आदिवासी खातेदार/शासकीय सदरी नोंदवला होता, परंतु नंतर अनधिकृतपणे खाजगी धारणेवर वर्ग करण्यात आला आहे.
                    </p>
                  </div>
                </div>
              )}

              {summary?.isRepossessedToGovt && (
                <div className="p-3 sm:p-3.5 bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-950">शासन जमा आदेश पारित (Resumed to Government)</p>
                    <p className="mt-0.5 text-emerald-800">
                      जिल्हाधिकारी कार्यालयाच्या अंतिम आदेशानुसार हा भूखंड अनधिकृत कब्जेदारामधून काढून पुन्हा शासकीय सदरी वर्ग करण्यात आला आहे.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-xs hover:border-slate-300 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] text-slate-500 font-semibold">धारणा प्रकार (Tenure)</p>
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 truncate">
                    {tenureConfig?.labelMr || parcel.tenureClass}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {parcel.tenureClass === 'BHOGVATDAR_CLASS_2' ? 'हस्तांतरणास जिल्हाधिकारी पूर्वपरवानगी आवश्यक' : 'मुक्त धारणा'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50/50 to-white border border-amber-200/80 shadow-xs hover:border-amber-300 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] text-amber-900 font-semibold">१९५० मूळ खातेदार (Baseline Owner)</p>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 truncate" title={summary?.baseline1950Epoch?.ownerName}>
                    {summary?.baseline1950Epoch?.ownerName || 'नोंद प्रलंबित'}
                  </p>
                  <p className="text-[10px] text-amber-800 font-mono mt-0.5">
                    खाते क्र.: {summary?.baseline1950Epoch?.khataNumber || 'K-15'} | फेरफार: {summary?.baseline1950Epoch?.ferfarNumber || 'F-04'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/40 to-white border border-indigo-200/80 shadow-xs hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] text-indigo-900 font-semibold">अभिलेख दस्तऐवज (Collectorate DMS)</p>
                    <FolderArchive className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <span>{parcel.documents?.length || 1} फायली उपलब्ध</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                      डिजिटाईज्ड
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    भौतिक कपाट रॅक व क्लाउडिनरी संलग्न
                  </p>
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto pb-0.5 shrink-0">
                <div className="flex gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('backward')}
                    className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'backward'
                        ? 'border-blue-900 text-blue-900 bg-blue-50/40 rounded-t-lg'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>१९५० शीर्षक साखळी</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === 'backward' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {parcel.backwardHistories?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('forward')}
                    className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'forward'
                        ? 'border-blue-900 text-blue-900 bg-blue-50/40 rounded-t-lg'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>शर्तभंग व सुनावणी</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === 'forward' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {parcel.forwardCases?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap flex-shrink-0 ${
                      activeTab === 'documents'
                        ? 'border-blue-900 text-blue-900 bg-blue-50/40 rounded-t-lg'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>DMS दस्तऐवज</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === 'documents' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {parcel.documents?.length || 0}
                    </span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 pb-1">
                  <Eye className="w-3.5 h-3.5 text-blue-700" />
                  <span>दस्तऐवज पाहण्यासाठी नोंदीवर क्लिक करा</span>
                </div>
              </div>

              {/* Split-View Body: Left Column (Data) & Right Column (Scanned Document) */}
              <div className={`grid gap-4 sm:gap-5 ${isSplitView ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
                {/* LEFT COLUMN: Data Timeline / Cases / DMS List */}
                <div className={`${isSplitView ? 'lg:col-span-6 xl:col-span-6' : 'w-full'} space-y-4`}>
                  {/* TAB 1: BACKWARD TITLE CHAIN (१९५० साखळी) */}
                  {activeTab === 'backward' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            ऐतिहासिक मालकी क्रमविकास (सन १९५० ते सद्यस्थिती)
                          </p>
                          <p className="text-[10px] text-slate-500">
                            प्रत्येक नोंदीचे स्कॅन दस्तऐवज उजव्या बाजूला थेट पहा
                          </p>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded border border-blue-200">
                          {parcel.backwardHistories?.length || 0} टप्पे नोंदणीकृत
                        </span>
                      </div>

                      {/* Enhanced Animated Timeline Container */}
                      <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-amber-500 before:via-blue-600 before:to-emerald-500 before:shadow-xs">
                        {parcel.backwardHistories?.map((epoch, index) => {
                          const isSelected = selectedEpoch?.id === epoch.id || (!selectedEpoch && epoch.epochYear === 1950);
                          const is1950 = epoch.epochYear === 1950;

                          return (
                            <div
                              key={epoch.id}
                              className="relative group animate-in fade-in slide-in-from-left-4 duration-300 fill-mode-backwards"
                              style={{ animationDelay: `${index * 120}ms` }}
                            >
                              {/* Glowing Interactive Milestone Node */}
                              <div className="absolute -left-7 top-4 flex items-center justify-center">
                                {isSelected && (
                                  <span
                                    className={`absolute w-7 h-7 rounded-full animate-ping opacity-60 ${
                                      is1950 ? 'bg-amber-400' : 'bg-blue-400'
                                    }`}
                                  />
                                )}
                                <div
                                  className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    isSelected
                                      ? is1950
                                        ? 'border-amber-600 bg-amber-500 ring-4 ring-amber-300/60 scale-125 shadow-md'
                                        : 'border-blue-700 bg-blue-600 ring-4 ring-blue-300/60 scale-125 shadow-md'
                                      : is1950
                                      ? 'border-amber-500 bg-amber-100 group-hover:scale-110 group-hover:border-amber-600 shadow-xs'
                                      : 'border-slate-300 bg-white group-hover:border-blue-600 group-hover:scale-110 shadow-xs'
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isSelected
                                        ? 'bg-white'
                                        : is1950
                                        ? 'bg-amber-600'
                                        : 'bg-slate-400'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Interactive Epoch Card with Smooth Hover & Focus States */}
                              <div
                                onClick={() => setSelectedEpoch(epoch)}
                                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer text-xs space-y-2.5 relative ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-blue-50/60 via-white to-amber-50/30 border-blue-600 shadow-md ring-2 ring-blue-500/30 -translate-y-0.5'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:bg-slate-50/50 hover:-translate-y-0.5'
                                }`}
                              >
                                {/* Card Top Row */}
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded shadow-2xs ${
                                          is1950
                                            ? 'bg-amber-500 text-slate-950 border border-amber-600'
                                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                                        }`}
                                      >
                                        {is1950 ? 'सन १९५० मूळ सनद/नोंद (Baseline)' : `सन ${epoch.epochYear}`}
                                      </span>

                                      {isSelected && (
                                        <span className="text-[9px] bg-blue-900 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                          सध्या पाहत आहात
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">
                                      {epoch.ownerName}
                                    </h4>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 block shadow-2xs">
                                      फेरफार: {epoch.ferfarNumber || 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                {/* Detailed Fields Grid */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 bg-slate-50/90 p-2.5 rounded-lg border border-slate-100">
                                  <div>
                                    खाते क्र.: <strong className="text-slate-900">{epoch.khataNumber || '-'}</strong>
                                  </div>
                                  <div>
                                    क्षेत्र: <strong className="text-slate-900 font-mono">{Number(epoch.areaHa).toFixed(4)} हे.</strong>
                                  </div>
                                  <div className="truncate">
                                    हस्तांतरण: <strong className="text-slate-900">{epoch.mutationType || '-'}</strong>
                                  </div>
                                  <div>
                                    शासकीय जमीन: <strong className="text-slate-900">{epoch.wasGovtLand ? 'होय' : 'नाही'}</strong>
                                  </div>
                                </div>

                                {/* Remarks / Statutory Restriction */}
                                {epoch.remarks && (
                                  <p className="text-[11px] text-amber-950 bg-amber-50/80 p-2 rounded-lg border border-amber-200/80 italic">
                                    शेरा: {epoch.remarks}
                                  </p>
                                )}

                                {/* Card Footer: Scanned Document Link Button */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500 font-mono text-[10px]">
                                    {is1950 ? '🏛️ कपाट: R-01 | गठ्ठा: B-01' : epoch.epochYear === 1988 ? '🏛️ कपाट: R-02 | गठ्ठा: B-04' : '🏛️ कपाट: R-03 | गठ्ठा: B-09'}
                                  </span>

                                  {/* Prominent View Document Action Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDocument(epoch, 'backward');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-all active:scale-95 hover:shadow-md hover:ring-2 hover:ring-blue-400/40"
                                    title="स्कॅन दस्तऐवज उघडा"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                    <span>स्कॅन दस्तऐवज पहा</span>
                                    <ExternalLink className="w-3 h-3 text-blue-200" />
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
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            शर्तभंग चौकशी व महसूल न्यायालय सुनावणी प्रकरणे
                          </p>
                          <p className="text-[10px] text-slate-500">
                            संबंधित कारणे दाखवा नोटीस व आदेश उजव्या बाजूला पहा
                          </p>
                        </div>
                      </div>

                      {parcel.forwardCases?.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                          या भूखंडावर कोणतेही सक्रिय वाद किंवा शर्तभंग प्रकरण प्रलंबित नाही.
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
                                  ? 'bg-gradient-to-br from-rose-50/40 via-white to-slate-50 border-rose-500 shadow-md ring-2 ring-rose-400/30'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      केस क्र. {item.caseNumber}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border inline-flex items-center gap-1 ${viol?.badgeClass}`}>
                                      <span>{viol?.labelMr || item.violationType}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setGlossaryInitialQuery(viol?.labelMr || item.violationType);
                                          setGlossaryModalOpen(true);
                                        }}
                                        className="opacity-70 hover:opacity-100 hover:text-slate-950 transition p-0.5"
                                        title="या उल्लंघनाची महसूल व्याख्या व वैधानिक कलमे पहा"
                                      >
                                        <Info className="w-3 h-3" />
                                      </button>
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1">
                                    अनधिकृत कब्जेदार: <strong className="text-slate-900">{item.occupantName || '-'}</strong>
                                  </p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${stat?.color}`}>
                                  {stat?.labelMr || item.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <div>
                                  अतिक्रमीत क्षेत्र: <strong className="text-slate-900">{Number(item.encroachedAreaHa).toFixed(4)} हे.</strong>
                                </div>
                                <div>
                                  तपास अधिकारी: <strong className="text-slate-900">{item.investigatingOfficer || '-'}</strong>
                                </div>
                                <div>
                                  नोटीस दिनांक: <strong>{item.showCauseNoticeDate ? new Date(item.showCauseNoticeDate).toLocaleDateString('mr-IN') : '-'}</strong>
                                </div>
                                <div>
                                  शासन जमा: <strong className="text-emerald-700">{item.isRepossessedToGovt ? 'होय' : 'नाही'}</strong>
                                </div>
                              </div>

                              {item.finalOrderDetails && (
                                <div className="p-2.5 rounded bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                                  <strong className="text-amber-900">अंतिम आदेश शेरा: </strong>
                                  {item.finalOrderDetails}
                                </div>
                              )}

                              {/* Hearings Accordion Summary */}
                              {item.hearings?.length > 0 && (
                                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                                  <p className="text-[11px] font-bold text-slate-700">सुनावणी इतिवृत्त ({item.hearings.length}):</p>
                                  {item.hearings.map((h) => (
                                    <div key={h.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-0.5">
                                      <div className="flex justify-between items-center text-slate-500">
                                        <strong className="text-blue-900">{h.authority}</strong>
                                        <span>{new Date(h.hearingDate).toLocaleDateString('mr-IN')}</span>
                                      </div>
                                      <p className="text-slate-800">{h.proceedingsLog}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="pt-2 border-t border-slate-100 flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDocument(item, 'forward');
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition active:scale-95 shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-700" />
                                  <span>नोटीस व आदेश दस्तऐवज उघडा</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
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
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            क्लाउडिनरी डिजिटल स्कॅन व भौतिक कपाट संदर्भ
                          </p>
                          <p className="text-[10px] text-slate-500">
                            अभिलेखागारातील प्रमाणित स्कॅन फायली
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadModalOpen(true)}
                          className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>नवीन जोडा</span>
                        </button>
                      </div>

                      {parcel.documents?.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          या भूखंडाशी संलग्न कोणतेही दस्तऐवज अजून जोडलेले नाहीत.
                        </div>
                      ) : (
                        parcel.documents?.map((doc) => {
                          const isSelected = selectedDoc?.id === doc.id;

                          return (
                            <div
                              key={doc.id}
                              onClick={() => setSelectedDoc(doc)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                                isSelected
                                  ? 'bg-blue-50/40 border-blue-600 shadow-md ring-2 ring-blue-500/30'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                    {doc.docType}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                                    {doc.title}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDocument(doc, 'documents');
                                  }}
                                  className="text-[10px] font-bold inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-2 py-1 rounded-lg transition"
                                >
                                  <Eye className="w-3 h-3 text-blue-700" />
                                  <span>पहा</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600 font-mono">
                                <div>
                                  रॅक: <strong className="text-slate-800">{doc.recordRoomRackNo || '-'}</strong>
                                </div>
                                <div>
                                  गठ्ठा: <strong className="text-slate-800">{doc.recordRoomBundleNo || '-'}</strong>
                                </div>
                                <div>
                                  फाईल: <strong className="text-slate-800">{doc.fileNumber || '-'}</strong>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Interactive Scanned Document Viewer (Displayed right beside each data) */}
                {isSplitView && (
                  <div className="lg:col-span-6 xl:col-span-6 flex flex-col min-h-[460px] sticky top-0 animate-in fade-in slide-in-from-right-4 duration-300">
                    <ArchivalDocumentViewer
                      document={activeDocument}
                      selectedEpoch={activeTab === 'backward' ? selectedEpoch : null}
                      selectedCase={activeTab === 'forward' ? selectedCase : null}
                      parcel={parcel}
                      className="h-full flex-1"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Enhanced Footer Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-blue-900 hover:text-blue-700 font-bold transition"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>दस्तऐवज संलग्न करा (Attach Document)</span>
            </button>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <span className="text-[11px] text-slate-500 hidden md:inline">
              जिल्हाधिकारी कार्यालय चंद्रपूर • ई-अभिलेख कक्ष
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition shadow-2xs"
            >
              बंद करा (Close)
            </button>
          </div>
        </div>
      </div>

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
