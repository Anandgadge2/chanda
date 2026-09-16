'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function AddHearingModal({ isOpen, onClose, caseItem, onHearingAdded }) {
  const trapRef = useFocusTrap(isOpen);
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().slice(0, 10));
  const [authority, setAuthority] = useState('Sub-Divisional Officer (SDO) Warora');
  const [proceedingsLog, setProceedingsLog] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2.5 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hearing-modal-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[94vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-700">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="hearing-modal-title" className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                सुनावणी इतिवृत्त नोंद
              </h2>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                केस क्र.: <span className="font-semibold text-slate-700">{caseItem.caseNumber}</span> {caseItem.parcel?.villageName ? `(${caseItem.parcel.villageName})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="संवाद बंद करा (Close dialog)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="hearing-date" className="text-xs font-semibold text-slate-700 block">सुनावणी दिनांक</label>
              <input
                id="hearing-date"
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="hearing-next-date" className="text-xs font-semibold text-slate-700 block">पुढील सुनावणी दिनांक (ऐच्छिक)</label>
              <input
                id="hearing-next-date"
                type="date"
                value={nextHearingDate}
                onChange={(e) => setNextHearingDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="hearing-authority" className="text-xs font-semibold text-slate-700 block">सुनावणी प्राधिकारी</label>
            <select
              id="hearing-authority"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Sub-Divisional Officer (SDO) Warora">उपविभागीय अधिकारी (SDO) वरोरा</option>
              <option value="Sub-Divisional Officer (SDO) Rajura">उपविभागीय अधिकारी (SDO) राजुरा</option>
              <option value="Sub-Divisional Officer (SDO) Chandrapur">उपविभागीय अधिकारी (SDO) चंद्रपूर</option>
              <option value="Tehsildar Mul">तहसीलदार मूल</option>
              <option value="District Collector Chandrapur">जिल्हाधिकारी चंद्रपूर</option>
              <option value="Resident Deputy Collector (RDC)">निवासी उपजिल्हाधिकारी (RDC)</option>
            </select>
          </div>

          <div>
            <label htmlFor="hearing-proceedings" className="text-xs font-semibold text-slate-700 block">
              सुनावणी इतिवृत्त व आदेश शेरा <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="hearing-proceedings"
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
              className="flex-1 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-xs shadow-sm transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? 'नोंद होत आहे...' : 'इतिवृत्त सेव्ह करा'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
