'use client';

import React, { useState } from 'react';
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

export default function ShasanJamaModal({ isOpen, onClose, caseItem, onSuccess = () => {} }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto max-h-[92vh] flex flex-col">
        {/* Red/Saffron Warning Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-50/80 to-amber-50/80 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                शासन जमा अंतिम आदेश पारित करा
              </h3>
              <p className="text-xs text-rose-800 font-semibold">
                प्रकरण क्र. {caseItem.caseNumber} | MLRC 1966 कलम ५०/५४/३६अ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
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
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                अधिकृत आदेश क्रमांक (Order No.) *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="उदा. SDO/WAR/REV/2026/042-SJ"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                आदेश दिनांक (Order Date) *
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              आदेश पारित करणारे सक्षम प्राधिकारी *
            </label>
            <input
              type="text"
              required
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              आदेशाचा संक्षिप्त कायदेशीर तपशील (Legal Order Summary in Marathi) *
            </label>
            <textarea
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              स्वाक्षरी केलेली आदेश प्रत (Signed PDF Document)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100/70 text-xs font-bold text-blue-900 transition">
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span>{file ? 'फाइल बदला' : 'PDF फाइल जोडा'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium truncate">
                  <FileText className="w-3.5 h-3.5" />
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
            <label className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-rose-300 text-rose-700 focus:ring-rose-500"
              />
              <span className="leading-relaxed">
                <strong>शपथपूर्वक प्रमाणीकरण:</strong> मी याद्वारे प्रमाणित करतो/करते की वरील आदेश
                महाराष्ट्र जमीन महसूल संहिता १९६६ अंतर्गत सक्षम महसूल प्राधिकाऱ्याने रीतसर
                पारित केला असून तो अंतिम स्वरूपाचा आहे.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              disabled={loading || !confirmed}
              className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <span>आदेश नोंदवत आहे...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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
