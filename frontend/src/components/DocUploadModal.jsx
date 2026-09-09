'use client';

import { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function DocUploadModal({ isOpen, onClose, parcelId, caseId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('SDO_ORDER');
  const [rackNo, setRackNo] = useState('');
  const [bundleNo, setBundleNo] = useState('');
  const [fileNo, setFileNo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>दस्तावेज अपलोड व अभिलेख नोंद (Upload to DMS)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Cloudinary Storage & Physical Record Room Mapping
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {statusMsg.text && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block">
              दस्तावेज शीर्षक (Title / Subject) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="उदा. SDO आदेश क्र. १२/२०२४ किंवा स्थळ पंचनामा"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block">
              दस्तावेज प्रकार (Document Classification) <span className="text-rose-500">*</span>
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="SDO_ORDER">SDO Order (उपविभागीय अधिकारी आदेश)</option>
              <option value="COLLECTOR_ORDER">Collector Order (जिल्हाधिकारी आदेश - शासन जमा)</option>
              <option value="FIELD_PANCHNAMA">Field Panchnama (स्थळ पंचनामा व छायाचित्रे)</option>
              <option value="OLD_7_12_ARCHIVE">1950 Archive 7/12 (सन १९५० जुना सातबारा)</option>
              <option value="FERFAR_REGISTER_COPY">Village Form VI Extract (गाव नमुना ६ फेरफार)</option>
              <option value="SHOW_CAUSE_NOTICE">Show-Cause Notice (कारणे दाखवा नोटीस)</option>
            </select>
          </div>

          {/* Physical Coordinate Fields */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">
              भौतिक अभिलेखागार स्थान (Physical Record Room Coordinates)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">रॅक क्र.</label>
                <input
                  placeholder="उदा. R-04"
                  value={rackNo}
                  onChange={(e) => setRackNo(e.target.value)}
                  className="border border-slate-300 rounded p-2 text-xs w-full mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">गठ्ठा क्र.</label>
                <input
                  placeholder="उदा. B-12"
                  value={bundleNo}
                  onChange={(e) => setBundleNo(e.target.value)}
                  className="border border-slate-300 rounded p-2 text-xs w-full mt-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">फाईल क्र.</label>
                <input
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
            <label className="text-xs font-semibold text-slate-700 block">
              फाईल निवडा (PDF किंवा इमेज) <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer mt-1"
              accept="application/pdf,image/*"
              required
            />
            {file && (
              <p className="text-[11px] text-slate-500 mt-1">
                निवडलेली फाईल: <span className="font-semibold text-slate-700">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>अपलोड होत आहे...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
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
