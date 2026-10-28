'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useTranslation } from './LanguageContext';
import SearchableSelect from './SearchableSelect';

export default function DocUploadModal({ isOpen, onClose, parcelId, caseId, onUploadSuccess }) {
  const trapRef = useFocusTrap(isOpen);
  const { isMarathi } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('SDO_ORDER');
  const [rackNo, setRackNo] = useState('');
  const [bundleNo, setBundleNo] = useState('');
  const [fileNo, setFileNo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg({
        type: 'error',
        text: isMarathi ? 'फाईल निवडणे आवश्यक आहे (File is required)' : 'Please select a document file to upload',
      });
      return;
    }

    setUploading(true);
    setStatusMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('document', file);
    if (parcelId) formData.append('parcelId', parcelId);
    if (caseId) formData.append('caseId', caseId);
    formData.append('title', title);
    formData.append('docType', docType);
    formData.append('rackNo', rackNo);
    formData.append('bundleNo', bundleNo);
    formData.append('fileNo', fileNo);

    try {
      const data = await api.uploadDocument(formData);
      setStatusMsg({
        type: 'success',
        text: isMarathi
          ? 'दस्तावेज Cloudinary वर अपलोड झाला व अभिलेखागारात नोंदवला गेला!'
          : 'Document uploaded to DMS archive and indexed successfully!',
      });
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess(data.document);
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || (isMarathi ? 'अपलोड अयशस्वी (Upload failed)' : 'Document upload failed'),
      });
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] border border-slate-100 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden my-auto relative animate-in zoom-in-95 duration-150"
      >
        {/* Top Gradient Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center shrink-0 text-purple-700 shadow-2xs">
              <Upload className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="upload-modal-title" className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {isMarathi ? 'दस्तावेज अपलोड व अभिलेख नोंद' : 'Upload Document & Archive Record'}
              </h2>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                {isMarathi ? 'डिजिटल व भौतिक अभिलेखागार संकलन (DMS)' : 'Digital & Physical Document Management (DMS)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition active:scale-90 flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label={isMarathi ? 'संवाद बंद करा (Close dialog)' : 'Close dialog'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form with Scrollable Body and Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
            {statusMsg.text && (
              <div
                role={statusMsg.type === 'error' ? 'alert' : 'status'}
                aria-live={statusMsg.type === 'error' ? 'assertive' : 'polite'}
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div>
              <label htmlFor="doc-title" className="text-xs font-semibold text-slate-700 block">
                {isMarathi ? 'दस्तावेज शीर्षक' : 'Document Title'} <span className="text-rose-500">*</span>
              </label>
              <input
                id="doc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder={isMarathi ? 'उदा. SDO आदेश क्र. १२/२०२४ किंवा स्थळ पंचनामा' : 'e.g. SDO Final Order No. 12/2026 or Spot Panchnama'}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isMarathi ? 'दस्तावेज प्रकार' : 'Document Category'} <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect
                options={[
                  { value: 'SDO_ORDER', label: isMarathi ? 'उपविभागीय अधिकारी (SDO) आदेश' : 'Sub-Divisional Officer (SDO) Order' },
                  { value: 'COLLECTOR_ORDER', label: isMarathi ? 'जिल्हाधिकारी आदेश (शासन जमा)' : 'Collector Repossession Order' },
                  { value: 'FIELD_PANCHNAMA', label: isMarathi ? 'स्थळ पंचनामा व छायाचित्रे' : 'Field Panchnama & Site Photographs' },
                  { value: 'OLD_7_12_ARCHIVE', label: isMarathi ? 'सन १९५० जुना सातबारा' : '1950 Baseline 7/12 Sanad' },
                  { value: 'FERFAR_REGISTER_COPY', label: isMarathi ? 'गाव नमुना ६ फेरफार' : 'Village Form 6 Mutation Register' },
                  { value: 'SHOW_CAUSE_NOTICE', label: isMarathi ? 'कारणे दाखवा नोटीस' : 'Show Cause Statutory Notice' }
                ]}
                value={docType}
                onChange={(val) => setDocType(val)}
                placeholder={isMarathi ? 'दस्तावेज प्रकार निवडा...' : 'Select Document Type...'}
                searchPlaceholder={isMarathi ? 'दस्तऐवज प्रकार शोधा...' : 'Search Type...'}
                showCount={false}
              />
            </div>

            {/* Physical Coordinate Fields */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">
                {isMarathi ? 'भौतिक अभिलेखागार स्थान' : 'Physical Record Room Coordinates'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="doc-rack-no" className="text-[11px] font-semibold text-slate-600 block">
                    {isMarathi ? 'रॅक क्र.' : 'Rack No.'}
                  </label>
                  <input
                    id="doc-rack-no"
                    placeholder="e.g. R-04"
                    value={rackNo}
                    onChange={(e) => setRackNo(e.target.value)}
                    className="border border-slate-300 rounded p-2 text-xs w-full mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="doc-bundle-no" className="text-[11px] font-semibold text-slate-600 block">
                    {isMarathi ? 'गठ्ठा क्र.' : 'Bundle No.'}
                  </label>
                  <input
                    id="doc-bundle-no"
                    placeholder="e.g. B-12"
                    value={bundleNo}
                    onChange={(e) => setBundleNo(e.target.value)}
                    className="border border-slate-300 rounded p-2 text-xs w-full mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="doc-file-no" className="text-[11px] font-semibold text-slate-600 block">
                    {isMarathi ? 'फाईल क्र.' : 'File No.'}
                  </label>
                  <input
                    id="doc-file-no"
                    placeholder="e.g. SDO/118"
                    value={fileNo}
                    onChange={(e) => setFileNo(e.target.value)}
                    className="border border-slate-300 rounded p-2 text-xs w-full mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* File Upload Box */}
            <div>
              <label htmlFor="doc-file-input" className="text-xs font-semibold text-slate-700 block">
                {isMarathi ? 'फाईल निवडा (PDF किंवा इमेज)' : 'Select File (PDF or Image)'} <span className="text-rose-500">*</span>
              </label>
              <input
                id="doc-file-input"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                accept="application/pdf,image/*"
                required
              />
              {file && (
                <p className="text-[11px] text-slate-500 mt-1">
                  {isMarathi ? 'निवडलेली फाईल: ' : 'Selected file: '}
                  <span className="font-semibold text-slate-700">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Pinned Action Buttons Footer */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer focus:outline-none"
            >
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>{isMarathi ? 'अपलोड होत आहे...' : 'Uploading...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isMarathi ? 'Cloudinary वर सेव्ह करा' : 'Upload to Cloud DMS'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
