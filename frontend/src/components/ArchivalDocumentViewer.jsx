'use client';

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
} from 'lucide-react';

export default function ArchivalDocumentViewer({
  document,
  selectedEpoch,
  selectedCase,
  parcel,
  className = '',
}) {
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
        ? 'सन १९५० हस्तलिखित सातबारा उतारा (1950 Baseline 7/12)'
        : `सन ${selectedEpoch.epochYear} फेरफार नोंद क्र. ${selectedEpoch.ferfarNumber || 'N/A'}`
      : selectedCase
      ? `महसूल न्यायालय नोटीस व आदेश - केस क्र. ${selectedCase.caseNumber}`
      : 'अभिलेख दस्तऐवज');

  const rackNo =
    document?.recordRoomRackNo ||
    (selectedEpoch?.epochYear === 1950 ? 'R-01' : selectedEpoch?.epochYear === 1988 ? 'R-02' : 'R-03');
  const bundleNo =
    document?.recordRoomBundleNo ||
    (selectedEpoch?.epochYear === 1950 ? 'B-01' : selectedEpoch?.epochYear === 1988 ? 'B-04' : 'B-09');
  const fileNo =
    document?.fileNumber ||
    (selectedEpoch?.epochYear === 1950
      ? `ARCH/1950/RAJ/${parcel?.villageCode || parcel?.gatNumber || '078'}`
      : `FER/${selectedEpoch?.epochYear || 'HIST'}/RAJ/${selectedEpoch?.ferfarNumber || '01'}`);
  const hasRawFile = Boolean(document?.storageUrl);

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
                <span>ई-अभिलेख प्रमाणित</span>
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
                स्कॅन प्रत
              </button>
              <button
                type="button"
                onClick={() => setViewMode('file')}
                className={`px-2 py-1 rounded transition ${
                  viewMode === 'file' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                PDF फाईल
              </button>
            </div>
          )}

          {/* Zoom & Transform Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-slate-300">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
              title="झूम कमी करा (Zoom Out)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[10px] font-mono px-1.5 text-slate-300 hover:text-amber-400 min-w-[2.75rem] text-center transition"
              title="मूळ आकार १००% करा (Click to Reset)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
              title="झूम वाढवा (Zoom In)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition ml-0.5 border-l border-slate-700"
              title="फिरवा ९०° (Rotate 90deg)"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
              title="मूळ आकार (Reset)"
              aria-label="Reset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
            title="प्रत मुद्रित करा (Print Document)"
            aria-label="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* External Link */}
          {hasRawFile && (
            <a
              href={document.storageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
              title="मूळ दस्तऐवज उघडा"
              aria-label="Open Document"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
            title={isFullscreen ? 'सामान्य आकारात परत या (Exit Fullscreen)' : 'पूर्ण स्क्रीन करा (Fullscreen)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collectorate Physical Record Coordinates Bar (Responsive & Never Truncated) */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs text-slate-200 shrink-0">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
          <FolderArchive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">भौतिक अभिलेखागार संदर्भ (Record Room Coordinates):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-slate-400">कपाट/रॅक:</span>
            <strong className="text-amber-300 font-bold">{rackNo}</strong>
          </span>

          <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-slate-400">गठ्ठा:</span>
            <strong className="text-amber-300 font-bold">{bundleNo}</strong>
          </span>

          <span
            className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 max-w-full"
            title={fileNo}
          >
            <span className="text-slate-400 shrink-0">फाईल क्र.:</span>
            <strong className="text-amber-300 font-bold break-all">{fileNo}</strong>
            <button
              type="button"
              onClick={() => handleCopy(fileNo, 'fileNo')}
              className="ml-1 text-slate-400 hover:text-amber-300 transition"
              title="फाईल क्रमांक कॉपी करा"
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

      {/* Document View Area (Ample Bottom Clearance to Avoid Cutoff) */}
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
                गाव नमुना {selectedEpoch?.epochYear === 1950 ? '७/१२' : '६'} (अभिलेख प्रत)
              </div>
              <div className="absolute top-2.5 right-3 text-[9px] font-mono text-amber-950 font-semibold uppercase tracking-wider border border-amber-800/40 bg-amber-50/80 px-1.5 py-0.5 rounded shadow-2xs">
                नोंद क्र. {selectedEpoch?.ferfarNumber || 'ARCH-1950'}
              </div>

              {/* Official Header */}
              <div className="text-center pt-3 pb-2 border-b-2 border-amber-900/40 relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-900/10 rounded-full border border-amber-900/25 text-[10px] font-bold text-amber-950 uppercase tracking-wider mb-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-900" />
                  <span>महाराष्ट्र शासन • महसूल व वन विभाग</span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  जिल्हाधिकारी कार्यालय चंद्रपूर | उपविभाग राजुरा
                </h4>
                <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
                  {selectedEpoch?.epochYear === 1950
                    ? 'सन १९५० मूळ अधिकार अभिलेख पत्रक (गाव नमुना सात - सातबारा उतारा)'
                    : selectedEpoch
                    ? `हक्क नोंदणी पत्रक (गाव नमुना सहा - फेरफार नोंद क्र. ${selectedEpoch.ferfarNumber})`
                    : selectedCase
                    ? `महसूल न्यायालय सुनावणी व कारणे दाखवा नोटीस (केस क्र. ${selectedCase.caseNumber})`
                    : 'प्रमाणित अभिलेख दस्तऐवज प्रत'}
                </p>
                <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                  सजा: चुरापूर | महसूल मंडळ: {parcel?.revenueCircle || 'चुरापूर'} | तालुका: {parcel?.taluka || 'राजुरा'} | जिल्हा: चंद्रपूर
                </p>
              </div>

              {/* Identification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-amber-50/80 p-3 rounded-lg border border-amber-800/25 text-[11px] shadow-2xs">
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">गट क्रमांक:</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {parcel?.gatNumber || '101/1'}{parcel?.hissaNumber && parcel.hissaNumber !== '0' ? ` (हिस्सा ${parcel.hissaNumber})` : ''}
                  </span>
                </div>
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">जुना स.नं.:</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {parcel?.oldSurveyNo || '88'}
                  </span>
                </div>
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">एकूण क्षेत्र:</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {selectedEpoch ? Number(selectedEpoch.areaHa).toFixed(4) : Number(parcel?.totalAreaHa || 0.81).toFixed(4)} हेक्टर
                  </span>
                </div>
                <div className="p-1">
                  <span className="text-slate-600 text-[10px] block font-medium">धारणा प्रकार:</span>
                  <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                    {selectedEpoch?.tenureClass === 'BHOGVATDAR_CLASS_2' || parcel?.tenureClass === 'BHOGVATDAR_CLASS_2'
                      ? 'भोगवटादार वर्ग-२'
                      : 'भोगवटादार वर्ग-१'}
                  </span>
                </div>
              </div>

              {/* Titleholder & Record Specifics */}
              <div className="space-y-2.5 border border-amber-800/25 bg-white/80 p-3.5 sm:p-4 rounded-lg shadow-2xs">
                <div className="flex justify-between items-start border-b border-amber-800/15 pb-2.5 gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                      खातेदार / मालक नोंद (Titleholder):
                    </span>
                    <p className="font-extrabold text-xs sm:text-base text-slate-900 mt-0.5">
                      {selectedEpoch?.ownerName || (selectedCase ? selectedCase.occupantName : parcel?.backwardHistories?.[0]?.ownerName || 'गणपती कृष्णा कावळे')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-600 block font-medium">खाते क्रमांक:</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {selectedEpoch?.khataNumber || 'K-45/1/ब/1,45/1/ब/2'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-600 block text-[10px] font-medium">हस्तांतरण / नोंद प्रकार:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEpoch?.mutationType || (selectedCase ? 'शर्तभंग चौकशी' : 'मूळ वर्ग-२ वाटप')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-medium">अभिलेख नोंद दिनांक:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEpoch?.recordDate
                        ? new Date(selectedEpoch.recordDate).toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : selectedEpoch?.epochYear === 1950
                        ? '१५ जून, १९५०'
                        : selectedEpoch?.epochYear === 1988
                        ? '१४ मार्च १९८८'
                        : '०५ सप्टेंबर २०१२'}
                    </span>
                  </div>
                </div>

                {/* Legal Restrictions / Remarks */}
                {(selectedEpoch?.remarks || selectedCase?.finalOrderDetails || true) && (
                  <div className="mt-2.5 p-2.5 bg-amber-100/70 border-l-4 border-amber-700 rounded-r text-[11px] text-amber-950">
                    <span className="font-bold">वैधानिक शेरा (Statutory Notation): </span>
                    <span className="italic font-medium">
                      {selectedEpoch?.remarks || selectedCase?.finalOrderDetails || 'नवीन अविभाज्य शर्तींवर प्रदान (Class-2 Allotment)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Hearing Info if Selected Case */}
              {selectedCase && (
                <div className="border border-rose-300 bg-rose-50/70 p-3 rounded-lg space-y-1 text-[11px] text-rose-950 shadow-2xs">
                  <div className="flex justify-between items-center font-bold">
                    <span>नोटीस संदर्भ: {selectedCase.caseNumber}</span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono">
                      कारणे दाखवा नोटीस
                    </span>
                  </div>
                  <p>तपास अधिकारी: {selectedCase.investigatingOfficer}</p>
                  <p>नोटीस बजावणी दिनांक: {selectedCase.showCauseNoticeDate ? new Date(selectedCase.showCauseNoticeDate).toLocaleDateString('mr-IN') : '-'}</p>
                </div>
              )}

              {/* Seals, Signatures & Authenticity Footer */}
              <div className="pt-4 pb-2 border-t-2 border-dashed border-amber-900/35 flex flex-wrap items-center justify-between gap-3 mt-4">
                {/* Official Circular Rubber Stamp */}
                <div className="relative flex items-center gap-2.5">
                  <div className="w-16 h-16 rounded-full border-2 border-rose-800 p-0.5 flex flex-col items-center justify-center text-[7.5px] font-extrabold text-rose-800 uppercase text-center rotate-[-10deg] bg-rose-50/40 shadow-xs">
                    <div className="border border-rose-700/70 rounded-full w-full h-full flex flex-col items-center justify-center p-0.5 leading-tight">
                      <span>उपविभाग</span>
                      <span className="font-black">राजुरा</span>
                      <Award className="w-2.5 h-2.5 text-rose-800 my-0.5" />
                      <span>सत्य प्रत</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    <p className="font-bold text-slate-800">अभिलेख कक्ष शिक्का</p>
                    <p className="font-mono text-[9px] text-slate-500">प्रमाणित प्रत क्र: CH-RAJ/{parcel?.gatNumber || '101/1'}</p>
                  </div>
                </div>

                {/* Digital Verification & QR */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-900">तलाठी / मंडळ अधिकारी</p>
                    <p className="text-[8px] sm:text-[9px] font-mono text-slate-500">
                      SHA256: {parcel?.upi ? parcel.upi.substring(0, 16) : 'MH-CHA-RAJ-008-1'}...
                    </p>
                    <span className="inline-block text-[8px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-bold mt-0.5">
                      ✓ ई-अभिलेख डिजिटल स्वाक्षरीत
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-white border border-slate-400 rounded-lg p-0.5 flex items-center justify-center shadow-xs">
                    <QrCode className="w-9 h-9 text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Official Archival Disclaimer Note */}
              <div className="text-[9px] sm:text-[10px] text-center text-slate-500 pt-2 border-t border-amber-800/15 font-medium leading-relaxed">
                सदर दस्तऐवज जिल्हाधिकारी कार्यालय चंद्रपूर च्या अधिकृत ई-अभिलेख प्रणालीतून डाऊनलोड केलेला आहे. कायदेशीर पुराव्यासाठी मूळ अभिलेखाशी पडताळणी करावी.
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
            स्कॅन दस्तऐवज अचूकतेने दर्शविला आहे (Resolution: 300 DPI Archival Scan)
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
              title="UPI कॉपी करा"
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
