'use client';

import { useState } from 'react';
import { X, Calendar, Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function AddHearingModal({ isOpen, onClose, caseItem, onHearingAdded }) {
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().slice(0, 10));
  const [authority, setAuthority] = useState('Sub-Divisional Officer (SDO) Warora');
  const [proceedingsLog, setProceedingsLog] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  if (!isOpen || !caseItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.addHearing(caseItem.id, {
        hearingDate,
        authority,
        proceedingsLog,
        nextHearingDate: nextHearingDate || null,
      });

      setStatusMsg({ type: 'success', text: 'सुनावणी इतिवृत्त यशस्वीरीत्या नोंदवले गेले!' });
      setTimeout(() => {
        if (onHearingAdded) onHearingAdded();
        onClose();
      }, 1000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'नोंदणी अयशस्वी' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>सुनावणी इतिवृत्त नोंद (Log Quasi-Judicial Hearing)</span>
            </h2>
            <p className="text-xs text-slate-400">
              केस क्र.: {caseItem.caseNumber} ({caseItem.parcel?.villageName || ''})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block">सुनावणी दिनांक</label>
              <input
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block">पुढील सुनावणी दिनांक (ऐच्छिक)</label>
              <input
                type="date"
                value={nextHearingDate}
                onChange={(e) => setNextHearingDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block">सुनावणी प्राधिकारी (Authority)</label>
            <select
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Sub-Divisional Officer (SDO) Warora">उपविभागीय अधिकारी (SDO) वरोरा</option>
              <option value="Sub-Divisional Officer (SDO) Rajura">उपविभागीय अधिकारी (SDO) राजुरा</option>
              <option value="Sub-Divisional Officer (SDO) Chandrapur">उपविभागीय अधिकारी (SDO) चंद्रपूर</option>
              <option value="Tehsildar Mul">तहसीलदार मूल</option>
              <option value="District Collector Chandrapur">जिल्हाधिकारी चंद्रपूर (District Collector)</option>
              <option value="Resident Deputy Collector (RDC)">निवासी उपजिल्हाधिकारी (RDC)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block">
              सुनावणी इतिवृत्त व आदेश शेरा (Proceedings Summary) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={proceedingsLog}
              onChange={(e) => setProceedingsLog(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="उदा. उभय पक्षांचा युक्तिवाद ऐकला. संबंधित तलाठी यांनी मूळ सनद फेरफार प्रत सादर करण्याचे निर्देश दिले."
              required
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-xs shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'नोंद होत आहे...' : 'इतिवृत्त सेव्ह करा'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
