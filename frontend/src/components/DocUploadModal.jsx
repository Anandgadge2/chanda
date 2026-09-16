'use client';

import { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function DocUploadModal({ isOpen, onClose, parcelId, caseId, onUploadSuccess }) {
  const trapRef = useFocusTrap(isOpen);
  const [file, setFile] = useState(null);
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg({ type: 'error', text: 'फाईल निवडणे आवश्यक आहे (File is required)' });
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
        text: 'दस्तावेज Cloudinary वर अपलोड झाला व अभिलेखागारात नोंदवला गेला!',
      });
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess(data.document);
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'अपलोड अयशस्वी (Upload failed)' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2.5 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 text-blue-700">
              <Upload className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="upload-modal-title" className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                दस्तावेज अपलोड व अभिलेख नोंद
              </h2>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                डिजिटल व भौतिक अभिलेखागार संकलन
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="संवाद बंद करा (Close dialog)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
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
                दस्तावेज शीर्षक <span className="text-rose-500">*</span>
              </label>
              <input
                id="doc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="उदा. SDO आदेश क्र. १२/२०२४ किंवा स्थळ पंचनामा"
                required
              />
            </div>

            <div>
              <label htmlFor="doc-type" className="text-xs font-semibold text-slate-700 block">
                दस्तावेज प्रकार <span className="text-rose-500">*</span>
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="SDO_ORDER">उपविभागीय अधिकारी (SDO) आदेश</option>
                <option value="COLLECTOR_ORDER">जिल्हाधिकारी आदेश (शासन जमा)</option>
                <option value="FIELD_PANCHNAMA">स्थळ पंचनामा व छायाचित्रे</option>
                <option value="OLD_7_12_ARCHIVE">सन १९५० जुना सातबारा</option>
                <option value="FERFAR_REGISTER_COPY">गाव नमुना ६ फेरफार</option>
                <option value="SHOW_CAUSE_NOTICE">कारणे दाखवा नोटीस</option>
              </select>
            </div>

            {/* Physical Coordinate Fields */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">
                भौतिक अभिलेखागार स्थान
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="doc-rack-no" className="text-[11px] font-semibold text-slate-600 block">रॅक क्र.</label>
                  <input
                    id="doc-rack-no"
                    placeholder="उदा. R-04"
                    value={rackNo}
                    onChange={(e) => setRackNo(e.target.value)}
                    className="border border-slate-300 rounded p-2 text-xs w-full mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="doc-bundle-no" className="text-[11px] font-semibold text-slate-600 block">गठ्ठा क्र.</label>
                  <input
                    id="doc-bundle-no"
                    placeholder="उदा. B-12"
                    value={bundleNo}
                    onChange={(e) => setBundleNo(e.target.value)}
                    className="border border-slate-300 rounded p-2 text-xs w-full mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="doc-file-no" className="text-[11px] font-semibold text-slate-600 block">फाईल क्र.</label>
                  <input
                    id="doc-file-no"
                    placeholder="उदा. SDO/118"
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
                फाईल निवडा (PDF किंवा इमेज) <span className="text-rose-500">*</span>
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
                  निवडलेली फाईल: <span className="font-semibold text-slate-700">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Pinned Action Buttons Footer */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>अपलोड होत आहे...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Cloudinary वर सेव्ह करा</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
