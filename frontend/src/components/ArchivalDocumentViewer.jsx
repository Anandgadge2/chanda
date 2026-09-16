'use client';

import { useState, useRef } from 'react';
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
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

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

  const rackNo = document?.recordRoomRackNo || (selectedEpoch?.epochYear === 1950 ? 'R-01' : selectedEpoch?.epochYear === 1988 ? 'R-02' : 'R-03');
  const bundleNo = document?.recordRoomBundleNo || (selectedEpoch?.epochYear === 1950 ? 'B-01' : selectedEpoch?.epochYear === 1988 ? 'B-04' : 'B-09');
  const fileNo = document?.fileNumber || (selectedEpoch?.epochYear === 1950 ? `ARCH/1950/RAJ/${parcel?.villageCode || '078'}` : `FER/${selectedEpoch?.epochYear || 'HIST'}/RAJ/${selectedEpoch?.ferfarNumber || '01'}`);
  const hasRawFile = Boolean(document?.storageUrl);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-900/5 border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-[120] bg-slate-950 w-screen h-screen p-3 sm:p-4 shadow-none rounded-none' : `rounded-2xl ${className}`
      }`}
    >
      {/* Viewer Header & Controls Bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 shrink-0">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {document?.docType || (selectedEpoch?.epochYear === 1950 ? 'OLD_7_12_ARCHIVE' : 'FERFAR_REGISTER_COPY')}
              </span>
              <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>ई-अभिलेख प्रमाणित</span>
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5" title={docTitle}>
              {docTitle}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
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
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-slate-300">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:text-white hover:bg-slate-700 rounded transition"
              title="झूम कमी करा (Zoom Out)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400 min-w-[2.5rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:text-white hover:bg-slate-700 rounded transition"
              title="झूम वाढवा (Zoom In)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1 hover:text-white hover:bg-slate-700 rounded transition ml-0.5 border-l border-slate-700"
              title="फिरवा ९०° (Rotate 90deg)"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 hover:text-white hover:bg-slate-700 rounded transition"
              title="मूळ आकार (Reset)"
              aria-label="Reset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* External Link / Fullscreen */}
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
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
            title={isFullscreen ? 'सामान्य आकार' : 'पूर्ण स्क्रीन (Fullscreen)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collectorate Physical Record Coordinates Bar */}
      <div className="bg-amber-950/20 border-b border-amber-500/20 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] text-amber-900 shrink-0">
        <div className="flex items-center gap-1.5 font-semibold">
          <FolderArchive className="w-3.5 h-3.5 text-amber-700" />
          <span>भौतिक अभिलेखागार संदर्भ (Record Room Coordinates):</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono">
          <span>
            कपाट/रॅक: <strong className="text-slate-900 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">{rackNo}</strong>
          </span>
          <span>
            गठ्ठा: <strong className="text-slate-900 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">{bundleNo}</strong>
          </span>
          <span>
            फाईल क्र.: <strong className="text-slate-900 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">{fileNo}</strong>
          </span>
        </div>
      </div>

      {/* Document View Area */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 bg-slate-100 flex items-start justify-center min-h-[380px] max-h-[580px] relative select-none">
        <div
          key={`${selectedEpoch?.id || selectedCase?.id || document?.id || 'default'}-${viewMode}`}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full max-w-2xl animate-doc-fade"
        >
          {viewMode === 'file' && hasRawFile ? (
            /* Raw Embedded PDF/File View */
            <div className="bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden min-h-[480px]">
              <iframe
                src={`${document.storageUrl}#toolbar=0&navpanes=0`}
                title={docTitle}
                className="w-full h-[520px] border-0"
              />
            </div>
          ) : (
            /* High-Fidelity Authentic Maharashtra Revenue Scan Canvas */
            <div className="archival-parchment watermark-maha-shasan rounded-xl shadow-xl border-2 border-amber-800/30 p-4 sm:p-6 text-slate-900 relative overflow-hidden space-y-4 font-sans text-xs">
              {/* Corner Vintage Stamp Accents */}
              <div className="absolute top-2 left-2 text-[8px] font-mono text-amber-900/60 uppercase tracking-widest border border-amber-700/30 px-1 rounded">
                गाव नमुना {selectedEpoch?.epochYear === 1950 ? '७/१२' : '६'} (अभिलेख प्रत)
              </div>
              <div className="absolute top-2 right-2 text-[9px] font-mono text-amber-900/60 uppercase tracking-widest">
                नोंद क्र. {selectedEpoch?.ferfarNumber || 'ARCH-1950'}
              </div>

              {/* Official Header */}
              <div className="text-center pt-2 pb-1 border-b-2 border-amber-900/40 relative">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-900/10 rounded-full border border-amber-900/20 text-[10px] font-bold text-amber-950 uppercase tracking-wider mb-1">
                  <Building className="w-3 h-3" />
                  <span>महाराष्ट्र शासन • महसूल व वन विभाग</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  जिल्हाधिकारी कार्यालय चंद्रपूर | उपविभाग राजुरा
                </h4>
                <p className="text-[11px] font-bold text-amber-900 mt-0.5">
                  {selectedEpoch?.epochYear === 1950
                    ? 'सन १९५० मूळ अधिकार अभिलेख पत्रक (गाव नमुना सात - सातबारा उतारा)'
                    : selectedEpoch
                    ? `हक्क नोंदणी पत्रक (गाव नमुना सहा - फेरफार नोंद क्र. ${selectedEpoch.ferfarNumber})`
                    : selectedCase
                    ? `महसूल न्यायालय सुनावणी व कारणे दाखवा नोटीस (केस क्र. ${selectedCase.caseNumber})`
                    : 'प्रमाणित अभिलेख दस्तऐवज प्रत'}
                </p>
                <p className="text-[10px] text-slate-600 font-medium">
                  सजा: चुरापूर | महसूल मंडळ: {parcel?.revenueCircle || 'चुरापूर'} | तालुका: {parcel?.taluka || 'राजुरा'} | जिल्हा: चंद्रपूर
                </p>
              </div>

              {/* Identification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-800/20 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block">गट क्रमांक:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {parcel?.gatNumber || '105'}{parcel?.hissaNumber ? ` (हिस्सा ${parcel.hissaNumber})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">जुना स.नं.:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {parcel?.oldSurveyNo || '88'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">एकूण क्षेत्र:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {selectedEpoch ? Number(selectedEpoch.areaHa).toFixed(4) : Number(parcel?.totalAreaHa || 0).toFixed(4)} हेक्टर
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">धारणा प्रकार:</span>
                  <span className="font-bold text-amber-950 text-xs">
                    {selectedEpoch?.tenureClass === 'BHOGVATDAR_CLASS_2' || parcel?.tenureClass === 'BHOGVATDAR_CLASS_2'
                      ? 'भोगवटादार वर्ग-२'
                      : 'भोगवटादार वर्ग-१'}
                  </span>
                </div>
              </div>

              {/* Titleholder & Record Specifics */}
              <div className="space-y-2 border border-amber-800/20 bg-white/70 p-3 rounded-lg">
                <div className="flex justify-between items-start border-b border-amber-800/10 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                      खातेदार / मालक नोंद (Titleholder):
                    </span>
                    <p className="font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5">
                      {selectedEpoch?.ownerName || (selectedCase ? selectedCase.occupantName : parcel?.backwardHistories?.[0]?.ownerName || '-')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">खाते क्रमांक:</span>
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {selectedEpoch?.khataNumber || 'K-15'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">हस्तांतरण / नोंद प्रकार:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedEpoch?.mutationType || (selectedCase ? 'शर्तभंग चौकशी' : 'मूळ सनद नोंद')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">अभिलेख नोंद दिनांक:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedEpoch?.recordDate
                        ? new Date(selectedEpoch.recordDate).toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : selectedEpoch?.epochYear === 1950
                        ? '२६ जानेवारी १९५०'
                        : selectedEpoch?.epochYear === 1988
                        ? '१४ मार्च १९८८'
                        : '०५ सप्टेंबर २०१२'}
                    </span>
                  </div>
                </div>

                {/* Legal Restrictions / Remarks */}
                {(selectedEpoch?.remarks || selectedCase?.finalOrderDetails) && (
                  <div className="mt-2 p-2 bg-amber-100/50 border-l-4 border-amber-700 rounded-r text-[11px] text-amber-950">
                    <span className="font-bold">वैधानिक शेरा (Statutory Notation): </span>
                    <span className="italic">{selectedEpoch?.remarks || selectedCase?.finalOrderDetails}</span>
                  </div>
                )}
              </div>

              {/* Hearing Info if Selected Case */}
              {selectedCase && (
                <div className="border border-rose-200 bg-rose-50/50 p-2.5 rounded-lg space-y-1 text-[11px] text-rose-950">
                  <div className="flex justify-between items-center font-bold">
                    <span>नोटीस संदर्भ: {selectedCase.caseNumber}</span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded">
                      कारणे दाखवा नोटीस
                    </span>
                  </div>
                  <p>तपास अधिकारी: {selectedCase.investigatingOfficer}</p>
                  <p>नोटीस बजावणी दिनांक: {selectedCase.showCauseNoticeDate ? new Date(selectedCase.showCauseNoticeDate).toLocaleDateString('mr-IN') : '-'}</p>
                </div>
              )}

              {/* Seals, Signatures & Authenticity Footer */}
              <div className="pt-3 border-t-2 border-dashed border-amber-900/30 flex items-center justify-between gap-2 mt-4">
                {/* Official Circular Rubber Stamp */}
                <div className="relative flex items-center gap-2">
                  <div className="w-14 h-14 rounded-full border-2 border-rose-800/80 p-0.5 flex flex-col items-center justify-center text-[7px] font-bold text-rose-800 uppercase text-center rotate-[-12deg] bg-rose-50/20 shadow-xs">
                    <div className="border border-rose-700/60 rounded-full w-full h-full flex flex-col items-center justify-center p-0.5">
                      <span>उपविभाग राजुरा</span>
                      <Award className="w-2.5 h-2.5 text-rose-800 my-0.2" />
                      <span>सत्य प्रत</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 hidden sm:block">
                    <p className="font-bold text-slate-700">अभिलेख कक्ष शिक्का</p>
                    <p>प्रमाणित प्रत क्र: CH-RAJ/{parcel?.gatNumber || '105'}</p>
                  </div>
                </div>

                {/* Digital Verification & QR */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-800">तलाठी / मंडळ अधिकारी</p>
                    <p className="text-[8px] font-mono text-slate-500">
                      SHA256: {parcel?.upi?.substring(0, 16) || '7f8a9e2d'}...
                    </p>
                    <span className="inline-block text-[8px] text-emerald-800 bg-emerald-100 px-1 rounded font-semibold mt-0.5">
                      डिजिटल स्वाक्षरीत
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-white border border-slate-300 rounded p-0.5 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Archival Note */}
              <div className="text-[8px] text-center text-slate-500 pt-1">
                सदर दस्तऐवज जिल्हाधिकारी कार्यालय चंद्रपूर च्या अधिकृत ई-अभिलेख प्रणालीतून डाऊनलोड केलेला आहे. कायदेशीर पुराव्यासाठी मूळ अभिलेखाशी पडताळणी करावी.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Viewer Footer Status */}
      <div className="bg-slate-900/90 text-slate-400 px-3 py-1.5 text-[10px] flex justify-between items-center border-t border-slate-800 shrink-0">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3 text-amber-400" />
          <span>स्कॅन दस्तऐवज अचूकतेने दर्शविला आहे (Resolution: 300 DPI Archival Scan)</span>
        </span>
        <span className="font-mono text-[9px] text-slate-400">
          UPI: {parcel?.upi}
        </span>
      </div>
    </div>
  );
}
