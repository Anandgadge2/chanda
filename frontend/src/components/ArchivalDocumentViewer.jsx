'use client';

import { useTranslation } from './LanguageContext';
import { formatVillageName } from '../lib/villageUtils';
import { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Download,
  FileText,
  ShieldCheck,
  Building,
  FolderArchive,
  Eye,
  RefreshCw,
  QrCode,
  Award,
  Printer,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function ArchivalDocumentViewer({
  document,
  selectedEpoch,
  selectedCase,
  parcel,
  className = '',
}) {
  const { locale, isMarathi } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState('scan'); // 'scan' (authentic digitized canvas) or 'file' (raw storageUrl)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.65));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Derive active document metadata
  const docTitle =
    document?.title ||
    (selectedEpoch
      ? selectedEpoch.epochYear === 1950
        ? (isMarathi ? 'सन १९५० हस्तलिखित सातबारा उतारा (1950 Baseline 7/12)' : '1950 Handwritten 7/12 Record (Baseline)')
        : (isMarathi ? `सन ${selectedEpoch.epochYear} फेरफार नोंद क्र. ${selectedEpoch.ferfarNumber || 'नोंद प्रलंबित'}` : `Year ${selectedEpoch.epochYear} Ferfar No. ${selectedEpoch.ferfarNumber || 'Pending'}`)
      : selectedCase
      ? (isMarathi ? `महसूल चौकशी नोटीस - केस क्र. ${selectedCase.caseNumber}` : `Revenue Notice - Case No. ${selectedCase.caseNumber}`)
      : (isMarathi ? 'अभिलेख दस्तऐवज' : 'Archival Document'));

  const rackNo = document?.recordRoomRackNo || (isMarathi ? 'नोंद प्रलंबित' : 'Pending');
  const bundleNo = document?.recordRoomBundleNo || (isMarathi ? 'नोंद प्रलंबित' : 'Pending');
  const fileNo =
    document?.fileNumber ||
    (selectedEpoch
      ? `ARCH/${selectedEpoch.epochYear || 'HIST'}/${parcel?.taluka?.slice(0, 3)?.toUpperCase() || 'CHA'}/${selectedEpoch.ferfarNumber || parcel?.gatNumber || 'REC'}`
      : selectedCase
      ? `CASE/${selectedCase.caseNumber}`
      : parcel?.upi
      ? `DOC/${parcel.upi}`
      : (isMarathi ? 'नोंद प्रलंबित' : 'Pending'));

  const hasRawFile = Boolean(document?.storageUrl && !document.storageUrl.includes('sample'));

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-950 border border-slate-700/80 shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-[150] w-screen h-screen rounded-none'
          : `rounded-2xl ${className}`
      }`}
    >
      {/* Viewer Header & Controls Bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 shrink-0">
        <div className="min-w-0 flex-1 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono tracking-wide">
                {document?.docType || (selectedEpoch?.epochYear === 1950 ? 'OLD_7_12_ARCHIVE' : 'FERFAR_REGISTER_COPY')}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'ई-अभिलेख प्रमाणित' : 'e-Records Certified'}</span>
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5" title={docTitle}>
              {docTitle}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {/* Mode Switcher */}
          {hasRawFile && (
            <div className="bg-slate-800 p-0.5 rounded-lg flex text-[10px] font-semibold mr-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('scan')}
                className={`px-2 py-1 rounded transition ${
                  viewMode === 'scan' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isMarathi ? 'स्कॅन प्रत' : 'Scanned Copy'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('file')}
                className={`px-2 py-1 rounded transition ${
                  viewMode === 'file' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isMarathi ? 'PDF फाईल' : 'PDF File'}
              </button>
            </div>
          )}

          {/* Zoom & Transform Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-slate-300">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
              title={isMarathi ? 'झूम कमी करा (Zoom Out)' : 'Zoom Out'}
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[10px] font-mono px-1.5 text-slate-300 hover:text-amber-400 min-w-[2.75rem] text-center transition"
              title={isMarathi ? 'मूळ आकार १००% करा (Click to Reset)' : 'Reset to 100%'}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
              title={isMarathi ? 'झूम वाढवा (Zoom In)' : 'Zoom In'}
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition ml-0.5 border-l border-slate-700"
              title={isMarathi ? 'फिरवा ९०° (Rotate 90deg)' : 'Rotate 90°'}
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
              title={isMarathi ? 'मूळ आकार (Reset)' : 'Reset'}
              aria-label="Reset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            title={isMarathi ? 'प्रिंट करा (Print Record)' : 'Print Record'}
            aria-label="Print"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            title={isFullscreen ? (isMarathi ? 'पूर्ण पडदा बंद करा (Exit Fullscreen)' : 'Exit Fullscreen') : (isMarathi ? 'पूर्ण पडदा (Fullscreen)' : 'Fullscreen')}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Raw File Direct Download/Link */}
          {hasRawFile && (
            <a
              href={document.storageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-xs"
              title={isMarathi ? 'मूळ PDF डाऊनलोड करा' : 'Download Original PDF'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMarathi ? 'डाऊनलोड' : 'Download'}</span>
            </a>
          )}
        </div>
      </div>

      {/* Record Room Coordinates Bar */}
      <div className="bg-slate-900/90 text-slate-300 px-3 sm:px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <FolderArchive className="w-3.5 h-3.5" />
          <span className="text-[11px] sm:text-xs">{isMarathi ? 'भौतिक अभिलेखागार संदर्भ (Record Room Coordinates):' : 'Physical Archive Room Coordinates:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-slate-400">{isMarathi ? 'कपाट/रॅक:' : 'Rack:'}</span>
            <strong className="text-amber-300 font-bold">{rackNo}</strong>
          </span>

          <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-slate-400">{isMarathi ? 'गठ्ठा:' : 'Bundle:'}</span>
            <strong className="text-amber-300 font-bold">{bundleNo}</strong>
          </span>

          <span
            className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 max-w-full"
            title={fileNo}
          >
            <span className="text-slate-400 shrink-0">{isMarathi ? 'फाईल क्र.:' : 'File No.:'}</span>
            <strong className="text-amber-300 font-bold break-all">{fileNo}</strong>
            <button
              type="button"
              onClick={() => handleCopy(fileNo, 'fileNo')}
              className="ml-1 text-slate-400 hover:text-amber-300 transition"
              title={isMarathi ? 'फाईल क्रमांक कॉपी करा' : 'Copy File Number'}
            >
              {copiedField === 'fileNo' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </span>
        </div>
      </div>

      {/* Document View Area */}
      <div className="flex-1 min-h-[500px] overflow-y-auto overflow-x-auto p-3 sm:p-6 md:p-8 pb-20 sm:pb-28 bg-[#121620] flex items-start justify-center relative select-text">
        <div
          key={`${selectedEpoch?.id || selectedCase?.id || document?.id || 'default'}-${viewMode}`}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full max-w-3xl animate-doc-fade my-2"
        >
          {viewMode === 'file' && hasRawFile ? (
            /* Raw Embedded PDF/File View */
            <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden min-h-[520px]">
              <iframe
                src={`${document.storageUrl}#toolbar=0&navpanes=0`}
                title={docTitle}
                className="w-full h-[620px] border-0"
              />
            </div>
          ) : (
            /* High-Fidelity Authentic Maharashtra Revenue Scan Canvas */
            <div className="archival-parchment watermark-maha-shasan rounded-xl shadow-2xl shadow-black/60 border border-amber-900/40 p-4 sm:p-7 md:p-8 text-slate-900 relative space-y-4 font-sans text-xs">
              {/* Corner Vintage Stamp Accents */}
              <div className="absolute top-2.5 left-3 text-[9px] font-mono text-amber-950 font-semibold uppercase tracking-wider border border-amber-800/40 bg-amber-50/80 px-1.5 py-0.5 rounded shadow-2xs">
                {isMarathi ? `गाव नमुना ${selectedEpoch?.epochYear === 1950 ? '७/१२' : '६'} (अभिलेख प्रत)` : `Village Form ${selectedEpoch?.epochYear === 1950 ? '7/12' : '6'} (Record Copy)`}
              </div>
              <div className="absolute top-2.5 right-3 text-[9px] font-mono text-amber-950 font-semibold uppercase tracking-wider border border-amber-800/40 bg-amber-50/80 px-1.5 py-0.5 rounded shadow-2xs">
                {isMarathi ? `नोंद क्र. ${selectedEpoch?.ferfarNumber || 'मूळ सनद'}` : `Entry No. ${selectedEpoch?.ferfarNumber || 'Original Sanad'}`}
              </div>

              {/* Official Header */}
              <div className="text-center pt-3 pb-2 border-b-2 border-amber-900/40 relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-900/10 rounded-full border border-amber-900/25 text-[10px] font-bold text-amber-950 uppercase tracking-wider mb-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-900" />
                  <span>{isMarathi ? 'महाराष्ट्र शासन • महसूल व वन विभाग' : 'Government of Maharashtra • Revenue & Forest Dept'}</span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {isMarathi ? `जिल्हाधिकारी कार्यालय चंद्रपूर | ${parcel?.taluka ? 'तालुका ' + parcel.taluka : 'चंद्रपूर जिल्हा'}` : `Collectorate Chandrapur | ${parcel?.taluka ? 'Taluka ' + parcel.taluka : 'Chandrapur District'}`}
                </h4>
                <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
                  {selectedEpoch?.epochYear === 1950
                    ? (isMarathi ? 'सन १९५० मूळ अधिकार अभिलेख पत्रक (गाव नमुना सात - सातबारा उतारा)' : '1950 Baseline Record of Rights (Village Form VII-XII)')
                    : selectedEpoch
                    ? (isMarathi ? `हक्क नोंदणी पत्रक (गाव नमुना सहा - फेरफार नोंद क्र. ${selectedEpoch.ferfarNumber || '—'})` : `Register of Mutations (Village Form VI - Ferfar No. ${selectedEpoch.ferfarNumber || '—'})`)
                    : selectedCase
                    ? (isMarathi ? `महसूल न्यायालय चौकशी नोटीस (केस क्र. ${selectedCase.caseNumber})` : `Revenue Court Enquiry Notice (Case No. ${selectedCase.caseNumber})`)
                    : (isMarathi ? 'प्रमाणित अभिलेख दस्तऐवज प्रत' : 'Certified Archival Document Copy')}
                </p>
                <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                  {isMarathi ? 'गाव:' : 'Village:'} {parcel?.villageName ? formatVillageName(parcel.villageName, isMarathi) : '—'} | {isMarathi ? 'महसूल मंडळ:' : 'Circle:'} {parcel?.revenueCircle || '—'} | {isMarathi ? 'तालुका:' : 'Taluka:'} {parcel?.taluka || '—'} | {isMarathi ? 'जिल्हा: चंद्रपूर' : 'District: Chandrapur'}
                </p>
              </div>

              {/* Identification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-amber-50/80 p-3 rounded-lg border border-amber-800/25 text-[11px] shadow-2xs">
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">{isMarathi ? 'गट क्रमांक:' : 'Gat Number:'}</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {parcel?.gatNumber || '—'}{parcel?.hissaNumber && parcel.hissaNumber !== '0' ? ` (${isMarathi ? 'हिस्सा' : 'Hissa'} ${parcel.hissaNumber})` : ''}
                  </span>
                </div>
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">{isMarathi ? 'जुना स.नं.:' : 'Old Survey No.:'}</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {parcel?.oldSurveyNo || '—'}
                  </span>
                </div>
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">{isMarathi ? 'एकूण क्षेत्र:' : 'Total Area:'}</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {selectedEpoch ? Number(selectedEpoch.areaHa).toFixed(4) : (parcel?.totalAreaHa ? Number(parcel.totalAreaHa).toFixed(4) : '—')} {isMarathi ? 'हेक्टर' : 'Ha'}
                  </span>
                </div>
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">{isMarathi ? 'धारणा प्रकार:' : 'Tenure Class:'}</span>
                  <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                    {selectedEpoch?.tenureClass === 'BHOGVATDAR_CLASS_2' || parcel?.tenureClass === 'BHOGVATDAR_CLASS_2'
                      ? (isMarathi ? 'भोगवटादार वर्ग-२' : 'Occupant Class-2')
                      : selectedEpoch?.tenureClass === 'SARKAR_SHASAN' || parcel?.tenureClass === 'SARKAR_SHASAN'
                      ? (isMarathi ? 'महाराष्ट्र शासन' : 'Govt of Maharashtra')
                      : selectedEpoch?.tenureClass === 'FOREST_JANGAL' || parcel?.tenureClass === 'FOREST_JANGAL'
                      ? (isMarathi ? 'वन जमीन' : 'Forest Land')
                      : (isMarathi ? 'भोगवटादार वर्ग-१' : 'Occupant Class-1')}
                  </span>
                </div>
              </div>

              {/* Titleholder & Record Specifics */}
              <div className="space-y-2.5 border border-amber-800/25 bg-white/80 p-3.5 sm:p-4 rounded-lg shadow-2xs">
                <div className="flex justify-between items-start border-b border-amber-800/15 pb-2.5 gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                      {isMarathi ? 'खातेदार / मालक नोंद (Titleholder):' : 'Titleholder / Owner Entry:'}
                    </span>
                    <p className="font-extrabold text-xs sm:text-base text-slate-900 mt-0.5">
                      {selectedEpoch?.ownerName || (selectedCase ? selectedCase.occupantName : parcel?.backwardHistories?.[0]?.ownerName || parcel?.metadata?.ownerName || (isMarathi ? 'नोंदणीकृत खातेदार' : 'Registered Holder'))}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-600 block font-medium">{isMarathi ? 'खाते क्रमांक:' : 'Khata Number:'}</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {selectedEpoch?.khataNumber || '—'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-600 block text-[10px] font-medium">{isMarathi ? 'हस्तांतरण / नोंद प्रकार:' : 'Transfer / Mutation Type:'}</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEpoch?.mutationType || (selectedCase ? (isMarathi ? 'शर्तभंग चौकशी' : 'Violation Enquiry') : (isMarathi ? 'अधिकार अभिलेख नोंद' : 'Record of Rights Entry'))}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-medium">{isMarathi ? 'अभिलेख नोंद दिनांक:' : 'Record Registration Date:'}</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEpoch?.recordDate
                        ? new Date(selectedEpoch.recordDate).toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : selectedEpoch?.epochYear
                        ? (isMarathi ? `वर्ष ${selectedEpoch.epochYear}` : `Year ${selectedEpoch.epochYear}`)
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Legal Restrictions / Remarks */}
                {(selectedEpoch?.remarks || selectedCase?.finalOrderDetails) && (
                  <div className="mt-2.5 p-2.5 bg-amber-100/70 border-l-4 border-amber-700 rounded-r text-[11px] text-amber-950">
                    <span className="font-bold">{isMarathi ? 'वैधानिक शेरा (Statutory Notation): ' : 'Statutory Notation: '}</span>
                    <span className="italic font-medium">
                      {selectedEpoch?.remarks || selectedCase?.finalOrderDetails}
                    </span>
                  </div>
                )}
              </div>

              {/* Hearing Info if Selected Case */}
              {selectedCase && (
                <div className="border border-rose-300 bg-rose-50/70 p-3 rounded-lg space-y-1 text-[11px] text-rose-950 shadow-2xs">
                  <div className="flex justify-between items-center font-bold">
                    <span>{isMarathi ? 'नोटीस संदर्भ:' : 'Notice Reference:'} {selectedCase.caseNumber}</span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono">
                      {isMarathi ? 'महसूल चौकशी' : 'Revenue Enquiry'}
                    </span>
                  </div>
                  {selectedCase.investigatingOfficer && <p>{isMarathi ? 'तपास अधिकारी:' : 'Enquiry Officer:'} {selectedCase.investigatingOfficer}</p>}
                  {selectedCase.showCauseNoticeDate && (
                    <p>{isMarathi ? 'नोटीस बजावणी दिनांक:' : 'Notice Served Date:'} {new Date(selectedCase.showCauseNoticeDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}</p>
                  )}
                </div>
              )}

              {/* Seals, Signatures & Authenticity Footer */}
              <div className="pt-4 pb-2 border-t-2 border-dashed border-amber-900/35 flex flex-wrap items-center justify-between gap-3 mt-4">
                {/* Official Circular Rubber Stamp */}
                <div className="relative flex items-center gap-2.5">
                  <div className="w-16 h-16 rounded-full border-2 border-rose-800 p-0.5 flex flex-col items-center justify-center text-[7.5px] font-extrabold text-rose-800 uppercase text-center rotate-[-10deg] bg-rose-50/40 shadow-xs">
                    <div className="border border-rose-700/70 rounded-full w-full h-full flex flex-col items-center justify-center p-0.5 leading-tight">
                      <span>{isMarathi ? 'तालुका' : 'Taluka'}</span>
                      <span className="font-black">{parcel?.taluka || (isMarathi ? 'चंद्रपूर' : 'Chandrapur')}</span>
                      <Award className="w-2.5 h-2.5 text-rose-800 my-0.5" />
                      <span>{isMarathi ? 'सत्य प्रत' : 'True Copy'}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    <p className="font-bold text-slate-800">{isMarathi ? 'अभिलेख कक्ष शिक्का' : 'Record Room Seal'}</p>
                    <p className="font-mono text-[9px] text-slate-500">
                      {isMarathi ? 'प्रमाणित प्रत क्र:' : 'Certified Copy No:'} CH-{parcel?.taluka?.slice(0, 3)?.toUpperCase() || 'CHA'}/{parcel?.gatNumber || '—'}
                    </p>
                  </div>
                </div>

                {/* Digital Verification & QR */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-900">{isMarathi ? 'तलाठी / मंडळ अधिकारी' : 'Talathi / Circle Officer'}</p>
                    <p className="text-[8px] sm:text-[9px] font-mono text-slate-500">
                      {isMarathi ? 'अभिलेख कोड:' : 'Record Code:'} {parcel?.upi ? parcel.upi.substring(0, 18) : 'MH-CHA-REC'}
                    </p>
                    <span className="inline-block text-[8px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-bold mt-0.5">
                      {isMarathi ? '✓ ई-अभिलेख प्रमाणित' : '✓ e-Records Certified'}
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-white border border-slate-400 rounded-lg p-0.5 flex items-center justify-center shadow-xs">
                    <QrCode className="w-9 h-9 text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Official Archival Disclaimer Note */}
              <div className="text-[9px] sm:text-[10px] text-center text-slate-500 pt-2 border-t border-amber-800/15 font-medium leading-relaxed">
                {isMarathi ? 'सदर दस्तऐवज जिल्हाधिकारी कार्यालय चंद्रपूर च्या अधिकृत ई-अभिलेख प्रणालीतून संकलित केला आहे.' : 'This document is compiled from the official e-Records system of District Collectorate, Chandrapur.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Viewer Footer Status (Fixed Pinned Bar) */}
      <div className="bg-slate-900 text-slate-400 px-3 sm:px-4 py-2 text-[11px] flex flex-wrap justify-between items-center gap-2 border-t border-slate-800 shrink-0 z-10">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-medium">
            {isMarathi ? 'डिजिटल अभिलेख कक्ष (Resolution: 300 DPI Archival Quality)' : 'Digital Record Room (Resolution: 300 DPI Archival Quality)'}
          </span>
        </span>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-slate-400">UPI:</span>
          <span className="text-amber-300 font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {parcel?.upi || 'N/A'}
          </span>
          {parcel?.upi && (
            <button
              type="button"
              onClick={() => handleCopy(parcel.upi, 'upi')}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition"
              title={isMarathi ? 'UPI कॉपी करा' : 'Copy UPI'}
            >
              {copiedField === 'upi' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
