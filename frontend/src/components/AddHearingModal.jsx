'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useFocusTrap } from '../hooks/useFocusTrap';
import SearchableSelect from './SearchableSelect';

export default function AddHearingModal({ isOpen, onClose, caseItem, onHearingAdded }) {
  const trapRef = useFocusTrap(isOpen);
  const [mounted, setMounted] = useState(false);
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().slice(0, 10));

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

  if (!isOpen || !caseItem || !mounted) return null;

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
        aria-labelledby="hearing-modal-title"
        className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] border border-slate-100 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden my-auto relative animate-in zoom-in-95 duration-150"
      >
        {/* Top Gradient Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-700 shadow-2xs">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="hearing-modal-title" className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  सुनावणी इतिवृत्त नोंद
                </h2>
                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                  {caseItem.caseNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                {caseItem.parcel?.villageName ? `गाव: ${caseItem.parcel.villageName} • ` : ''}MLRC १९६६ अर्ध-न्यायिक सुनावणी
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition active:scale-90 flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="संवाद बंद करा (Close dialog)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form with Scrollable Body and Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {statusMsg.text && (
              <div
                role={statusMsg.type === 'error' ? 'alert' : 'status'}
                aria-live={statusMsg.type === 'error' ? 'assertive' : 'polite'}
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="hearing-date" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  सुनावणी दिनांक <span className="text-rose-500">*</span>
                </label>
                <input
                  id="hearing-date"
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/60 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="hearing-next-date" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  पुढील तारीख (ऐच्छिक)
                </label>
                <input
                  id="hearing-next-date"
                  type="date"
                  value={nextHearingDate}
                  onChange={(e) => setNextHearingDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/60 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                सुनावणी सक्षम प्राधिकारी <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect
                options={[
                  { value: 'Sub-Divisional Officer (SDO) Warora', label: 'उपविभागीय अधिकारी (SDO) वरोरा' },
                  { value: 'Sub-Divisional Officer (SDO) Rajura', label: 'उपविभागीय अधिकारी (SDO) राजुरा' },
                  { value: 'Sub-Divisional Officer (SDO) Chandrapur', label: 'उपविभागीय अधिकारी (SDO) चंद्रपूर' },
                  { value: 'Tehsildar Mul', label: 'तहसीलदार मूल' },
                  { value: 'District Collector Chandrapur', label: 'जिल्हाधिकारी चंद्रपूर' },
                  { value: 'Resident Deputy Collector (RDC)', label: 'निवासी उपजिल्हाधिकारी (RDC)' }
                ]}
                value={authority}
                onChange={(val) => setAuthority(val)}
                placeholder="सुनावणी प्राधिकारी निवडा..."
                searchPlaceholder="प्राधिकारी शोधा..."
                icon={Scale}
                showCount={false}
              />
            </div>

            <div>
              <label htmlFor="hearing-proceedings" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                सुनावणी इतिवृत्त व आदेश शेरा <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="hearing-proceedings"
                rows={4}
                value={proceedingsLog}
                onChange={(e) => setProceedingsLog(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50/60 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium focus:outline-none leading-relaxed"
                placeholder="उदा. उभय पक्षांचा युक्तिवाद ऐकला. संबंधित तलाठी यांनी मूळ सनद फेरफार प्रत सादर करण्याचे निर्देश दिले."
                required
              />
            </div>
          </div>

          {/* Pinned Action Buttons Footer */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer focus:outline-none"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>नोंद होत आहे...</span>
                </>
              ) : (
                <span>इतिवृत्त सेव्ह करा</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
