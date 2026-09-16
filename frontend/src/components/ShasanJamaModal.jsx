'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Building,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function ShasanJamaModal({ isOpen, onClose, caseItem, onSuccess = () => {} }) {
  const trapRef = useFocusTrap(isOpen);
  const { user } = useAuth();

  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [authority, setAuthority] = useState(
    user?.designation || (user?.role === 'COLLECTOR' ? 'जिल्हाधिकारी, चंद्रपूर' : 'उपविभागीय अधिकारी (SDO)')
  );
  const [orderSummary, setOrderSummary] = useState('');
  const [file, setFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  if (!isOpen || !caseItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!orderNumber.trim()) {
      setErrorMsg('कृपया अधिकृत आदेश क्रमांक प्रविष्ट करा.');
      return;
    }
    if (!orderSummary.trim() || orderSummary.trim().length < 20) {
      setErrorMsg('आदेशाचा संक्षिप्त तपशील किमान २० अक्षरांचा असावा.');
      return;
    }
    if (!confirmed) {
      setErrorMsg('कृपया वैधानिक शपथपूर्वक प्रमाणीकरणास संमती द्या.');
      return;
    }

    setLoading(true);

    try {
      let docId = null;

      // 1. If signed PDF is attached, upload to DMS
      if (file) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', `शासन जमा अंतिम आदेश - ${orderNumber}`);
        formData.append('docType', user?.role === 'COLLECTOR' ? 'COLLECTOR_ORDER' : 'SDO_ORDER');
        formData.append('caseId', caseItem.id);
        if (caseItem.parcelId) formData.append('parcelId', caseItem.parcelId);
        formData.append('fileNo', orderNumber);

        const uploadRes = await api.uploadDocument(formData);
        if (uploadRes.success && uploadRes.document) {
          docId = uploadRes.document.id;
        }
      }

      // 2. Update case enforcement status to RECTIFIED_7_12 with Shasan Jama flag
      const finalDetailsText = `[आदेश क्र. ${orderNumber} दि. ${orderDate} | सक्षम प्राधिकारी: ${authority}] ${orderSummary.trim()}`;

      await api.updateCaseStatus(caseItem.id, {
        status: 'RECTIFIED_7_12',
        isRepossessedToGovt: true,
        finalOrderDetails: finalDetailsText,
        orderDate,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Shasan Jama execution error:', err);
      setErrorMsg(err.message || 'शासन जमा आदेश नोंदवताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shasan-modal-title"
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="shasan-modal-title" className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                शासन जमा अंतिम आदेश पारित करा
              </h2>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                प्रकरण क्र. <span className="font-semibold text-rose-700">{caseItem.caseNumber}</span> | MLRC १९६६ कलम ५०/५४/३६अ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="संवाद बंद करा (Close dialog)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Form with Scrollable Body and Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1">
            {/* Target Parcel Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>भूखंड (UPI):</span>
                <span className="font-bold text-slate-900">{caseItem.parcel?.upi || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>स्थान:</span>
                <span className="font-medium text-slate-800">
                  {caseItem.parcel?.villageName}, तालुका {caseItem.parcel?.taluka} (गट क्र.{' '}
                  {caseItem.parcel?.gatNumber})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>अतिक्रमित / शर्तभंग क्षेत्र:</span>
                <span className="font-bold text-rose-700">{caseItem.encroachedAreaHa} हेक्टर</span>
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="shasan-order-no" className="block text-xs font-bold text-slate-700 mb-1">
                  अधिकृत आदेश क्रमांक *
                </label>
                <input
                  id="shasan-order-no"
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="उदा. SDO/WAR/REV/2026/042-SJ"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="shasan-order-date" className="block text-xs font-bold text-slate-700 mb-1">
                  आदेश दिनांक *
                </label>
                <input
                  id="shasan-order-date"
                  type="date"
                  required
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shasan-authority" className="block text-xs font-bold text-slate-700 mb-1">
                आदेश पारित करणारे सक्षम प्राधिकारी *
              </label>
              <input
                id="shasan-authority"
                type="text"
                required
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="shasan-summary" className="block text-xs font-bold text-slate-700 mb-1">
                आदेशाचा संक्षिप्त कायदेशीर तपशील *
              </label>
              <textarea
                id="shasan-summary"
                required
                rows={3}
                value={orderSummary}
                onChange={(e) => setOrderSummary(e.target.value)}
                placeholder="उदा. प्रतिवादीने विहित मुदतीत वैध कारण सादर न केल्यामुळे जमीन महसूल संहिता १९६६ चे कलम ५०/५४ अन्वये सदर गट शासनाधीन (शासन जमा) करण्याचे अंतिम आदेश पारित करण्यात येत आहेत."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Signed PDF File Upload */}
            <div>
              <label htmlFor="shasan-file-upload" className="block text-xs font-bold text-slate-700 mb-1">
                स्वाक्षरी केलेली आदेश प्रत
              </label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="shasan-file-upload"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100/70 text-xs font-bold text-blue-900 transition focus-within:ring-2 focus-within:ring-blue-500"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                  <span>{file ? 'फाइल बदला' : 'PDF फाइल जोडा'}</span>
                  <input
                    id="shasan-file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </label>
                {file && (
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium truncate">
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate">{file.name}</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                * सक्षम प्राधिकाऱ्याची स्वाक्षरी व शिक्का असलेली अधिकृत प्रत जोडावी.
              </p>
            </div>

            {/* Statutory Affirmation Checkbox */}
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
              <label htmlFor="shasan-confirmed-cb" className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer select-none">
                <input
                  id="shasan-confirmed-cb"
                  type="checkbox"
                  required
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-rose-300 text-rose-700 focus:ring-2 focus:ring-rose-500"
                />
                <span className="leading-relaxed">
                  <strong>शपथपूर्वक प्रमाणीकरण:</strong> मी याद्वारे प्रमाणित करतो/करते की वरील आदेश
                  महाराष्ट्र जमीन महसूल संहिता १९६६ अंतर्गत सक्षम महसूल प्राधिकाऱ्याने रीतसर
                  पारित केला असून तो अंतिम स्वरूपाचा आहे.
                </span>
              </label>
            </div>
          </div>

          {/* Pinned Action Buttons Footer (Never clipped on small screens) */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              disabled={loading || !confirmed}
              className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              {loading ? (
                <span>आदेश नोंदवत आहे...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>शासन जमा आदेश पारित करा</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
