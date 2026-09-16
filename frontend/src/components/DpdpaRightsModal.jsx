'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileJson,
  X,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { api } from '../lib/api';

export default function DpdpaRightsModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'erasure'
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [erasureReason, setErasureReason] = useState('Account closure / खाते वापर बंद करणे');
  const [erasureLoading, setErasureLoading] = useState(false);
  const [erasureResult, setErasureResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const trapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  // Handle Export Data (Section 11)
  const handleExport = async () => {
    setErrorMsg('');
    setExportLoading(true);
    setExportSuccess(false);
    try {
      const response = await api.exportDpdpaData();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      const filename = `chanda_dpdpa_export_${user?.id || 'profile'}_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExportSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'डेटा निर्यात अयशस्वी झाले.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle Request Erasure (Section 12)
  const handleErasure = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErasureLoading(true);
    try {
      const result = await api.requestDpdpaErasure(erasureReason);
      setErasureResult(result);
    } catch (err) {
      setErrorMsg(err.message || 'विनंती नोंदवणे अयशस्वी झाले.');
    } finally {
      setErasureLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpdpa-rights-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md shadow-blue-900/20 flex items-center justify-center shrink-0 ring-4 ring-blue-50 mt-0.5">
              <ShieldCheck className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="dpdpa-rights-title" className="text-base sm:text-lg font-black text-slate-900">
                  माझे डेटा संरक्षण अधिकार (DPDPA 2023)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-900 rounded-full border border-blue-200">
                  Data Principal Rights
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                डिजिटल व्यक्तिगत डेटा संरक्षण कायदा २०२३ अंतर्गत डेटा निर्यात व निष्कासन सुविधा
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 shrink-0"
            aria-label="खिडकी बंद करा (Close)"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setErrorMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>डेटा निर्यात (Export Sec 11)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('erasure');
              setErrorMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'erasure'
                ? 'border-rose-600 text-rose-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>डेटा निष्कासन विनंती (Erasure Sec 12)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-blue-600" />
                    <span>वैयक्तिक प्रोफाइल व ऑडिट डेटा फाइल</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    DPDPA कलम ११ सुसंगत
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  या सुविधेद्वारे आपल्या खात्याशी संबंधित खालील माहिती संरचित व मशीन-वाचनीय (.JSON) स्वरूपात डाउनलोड करता येईल:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  <li>नाव, ईमेल, दूरध्वनी, पदनाम व तालुका तपशील</li>
                  <li>गोपनीयता संमती तारीख व आवृत्ती तपशील ({user?.consentVersion || '1.0-2026'})</li>
                  <li>सक्रिय लॉगिन सत्रे व IP पत्ते</li>
                  <li>अलीकडील ५० सुरक्षा व महसूल ऑडिट क्रियाकलाप नोंदी</li>
                </ul>
              </div>

              {exportSuccess && (
                <div
                  role="status"
                  className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 space-y-1">
                    <p className="font-bold">डेटा फाइल यशस्वीरित्या डाऊनलोड झाली!</p>
                    <p className="text-emerald-700">
                      आपल्या उपकरणावर JSON स्वरूपातील सुरक्षित डेटा कॉपी सेव्ह झाली आहे.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  माहिती सुरक्षित ठेवणे ही वापरकर्त्याची जबाबदारी आहे.
                </p>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 active:scale-[0.98] shadow-md shadow-blue-900/20 transition disabled:opacity-50"
                >
                  {exportLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>तयार होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>माझा डेटा डाउनलोड करा (.JSON)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'erasure' && (
            <div className="space-y-4">
              {erasureResult ? (
                <div
                  role="status"
                  className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <h3 className="text-sm font-black text-emerald-950">
                      डेटा निष्कासन विनंती यशस्वीरित्या नोंदवली गेली!
                    </h3>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs space-y-1 text-emerald-950">
                    <p><strong>विनंती क्रमांक (Ticket ID):</strong> <code className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">{erasureResult.requestId}</code></p>
                    <p><strong>निवारण कालमर्यादा:</strong> ७२ कामकाजाचे तास (DPDPA २०२३ नियमांनुसार)</p>
                    <p><strong>अधिकारी:</strong> डेटा संरक्षण अधिकारी (DPO), जिल्हाधिकारी कार्यालय, चंद्रपूर</p>
                  </div>
                  <p className="text-xs text-emerald-800">
                    {erasureResult.message}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    समजले, बंद करा
                  </button>
                </div>
              ) : (
                <form onSubmit={handleErasure} className="space-y-4">
                  {/* Legal Precedence Warning */}
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-950 text-xs leading-relaxed">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-0.5">वैधानिक शासकीय अभिलेख सूचना (MLRC 1966):</p>
                      <p>
                        महाराष्ट्र जमीन महसूल संहिता १९६६ अंतर्गत अधिकृत शासकीय नोंदी, शर्तभंग कार्यवाही, सुनावणी हुकूमनामे व जमीन महसूल अभिलेख हे वैधानिक कालावधीसाठी कायम ठेवणे बंधनकारक आहे. या विनंतीनुसार आपले वैयक्तिक लॉगिन खाते व ओळख निष्कासित केली जाईल.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="erasure-reason" className="block text-xs font-bold text-slate-800">
                      निष्कासन विनंतीचे कारण निवडा किंवा नमूद करा:
                    </label>
                    <select
                      id="erasure-reason-select"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800"
                      onChange={(e) => setErasureReason(e.target.value)}
                      value={erasureReason}
                    >
                      <option value="Account closure / खाते वापर बंद करणे">खाते वापर बंद करणे (Account closure)</option>
                      <option value="Transfer to other district / इतर जिल्ह्यात बदली">इतर जिल्ह्यात बदली (Officer transfer)</option>
                      <option value="Personal privacy request / वैयक्तिक गोपनीयता विनंती">वैयक्तिक गोपनीयता विनंती (Privacy request)</option>
                      <option value="Other statutory reason / इतर वैधानिक कारण">इतर वैधानिक कारण (Other)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="erasure-notes" className="block text-xs font-semibold text-slate-600">
                      अतिरिक्त विवरण (पर्यायी):
                    </label>
                    <textarea
                      id="erasure-notes"
                      rows={2}
                      placeholder="अतिरिक्त माहिती किंवा विनंतीचे स्पष्टीकरण लिहा..."
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setErasureReason(e.target.value);
                        }
                      }}
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>७२ तासांच्या आत कार्यवाही</span>
                    </div>
                    <button
                      type="submit"
                      disabled={erasureLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] shadow-md shadow-rose-600/20 transition disabled:opacity-50"
                    >
                      {erasureLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>विनंती नोंदवत आहे...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>डेटा निष्कासन विनंती सादर करा (Submit)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px]">DPDPA २०२३ व GIGW ३.० मानकांनुसार पूर्ण सुरक्षित</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white font-bold text-xs transition"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
}
