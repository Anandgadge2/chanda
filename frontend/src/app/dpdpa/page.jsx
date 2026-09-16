'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Download,
  Trash2,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  ArrowRight,
  ExternalLink,
  Info,
  Scale,
  Building,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { api } from '../../lib/api';

export default function DpdpaPage() {
  const { user } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [erasureReason, setErasureReason] = useState('Account closure / खाते वापर बंद करणे');
  const [erasureNotes, setErasureNotes] = useState('');
  const [erasureLoading, setErasureLoading] = useState(false);
  const [erasureResult, setErasureResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Export Personal Data (Section 11)
  const handleExportData = async () => {
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
  const handleErasureRequest = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErasureLoading(true);
    try {
      const combinedReason = erasureNotes.trim()
        ? `${erasureReason} - ${erasureNotes.trim()}`
        : erasureReason;
      const res = await api.requestDpdpaErasure(combinedReason);
      setErasureResult(res);
    } catch (err) {
      setErrorMsg(err.message || 'विनंती नोंदवणे अयशस्वी झाले.');
    } finally {
      setErasureLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-xs flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  DPDPA २०२३ डेटा गोपनीयता व नागरिक अधिकार
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                  Data Principal Rights
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम २०२३ (DPDPA 2023) अंतर्गत अधिकृत शासकीय सेवा
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">
              संमती आवृत्ती: {user?.consentVersion || '1.0-2026'}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout for Section 11 & Section 12 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section 11: Export Data Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  ११
                </div>
                <h2 className="text-sm font-black text-slate-900">
                  कलम ११: वैयक्तिक डेटा निर्यात (Data Export)
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                JSON Archive
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              DPDPA २०२३ कलम ११ नुसार नागरिकांना व महसूल अधिकाऱ्यांना त्यांच्या खात्याची सर्व वैयक्तिक माहिती, सक्रिय लॉगिन सत्रे, आयपी पत्ते व सुरक्षितता ऑडिट नोंदी डिजिटल व मशीन-वाचनीय (.JSON) स्वरूपात डाउनलोड करण्याचा अधिकार आहे.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1 text-slate-700 font-medium">
              <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-blue-700" />
                डाउनलोड फाईलमध्ये समाविष्ट नोंदी:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                <li>नाव, पदनाम, अधिकृत ईमेल व मोबाइल क्रमांक</li>
                <li>गोपनीयता संमती दिनांक व डिजिटल संमती शिक्का</li>
                <li>सक्रिय व मागील लॉगिन सत्रे (IP Address & Browser)</li>
                <li>अलीकडील ५० महसूल व सुरक्षा ऑडिट नोंदी</li>
              </ul>
            </div>

            {exportSuccess && (
              <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>डेटा फाईल आपल्या संगणकावर यशस्वीरित्या डाऊनलोड झाली!</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportData}
            disabled={exportLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exportLoading ? 'डेटा तयार होत आहे...' : 'माझा संपूर्ण डेटा डाउनलोड करा (.JSON)'}</span>
          </button>
        </div>

        {/* Section 12: Request Erasure Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                  १२
                </div>
                <h2 className="text-sm font-black text-slate-900">
                  कलम १२: डेटा निष्कासन विनंती (Request Erasure)
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
                Right to Erasure
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              आपल्या वैयक्तिक खात्याची माहिती आणि डिजिटल ओळख निष्कासित करण्याची विनंती येथे नोंदवा.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed">
              <p className="font-bold flex items-center gap-1 text-amber-900 mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                वैधानिक शासकीय महसूल नोंद (MLRC 1966):
              </p>
              <p className="text-[11px]">
                महाराष्ट्र जमीन महसूल संहिता १९६६ अंतर्गत सुनावणी हुकूमनामे, शर्तभंग कार्यवाही व अधिकृत ७/१२ फेरफार नोंदी कायमस्वरूपी शासकीय अभिलेख असल्याने त्या कायद्यानुसार जतन राहतात; केवळ आपले वैयक्तिक लॉगिन खाते निष्कासित केले जाईल.
              </p>
            </div>

            {erasureResult ? (
              <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-950">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  विनंती यशस्वीरित्या नोंदवली गेली!
                </p>
                <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-200 space-y-1 text-[11px]">
                  <p><strong>तिकीट क्रमांक:</strong> <code className="bg-emerald-100 font-mono font-bold px-1 py-0.5 rounded">{erasureResult.requestId}</code></p>
                  <p><strong>निवारण कालमर्यादा:</strong> ७२ कामकाजाचे तास</p>
                  <p><strong>अधिकारी:</strong> डेटा संरक्षण अधिकारी (DPO), जिल्हाधिकारी कार्यालय, चंद्रपूर</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleErasureRequest} className="space-y-3">
                <div>
                  <label htmlFor="dpdpa-reason" className="block text-[11px] font-bold text-slate-700 mb-1">
                    निष्कासन विनंतीचे कारण:
                  </label>
                  <select
                    id="dpdpa-reason"
                    value={erasureReason}
                    onChange={(e) => setErasureReason(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 font-medium"
                  >
                    <option value="Account closure / खाते वापर बंद करणे">खाते वापर बंद करणे (Account closure)</option>
                    <option value="Transfer to other district / इतर जिल्ह्यात बदली">इतर जिल्ह्यात बदली (Officer transfer)</option>
                    <option value="Personal privacy request / वैयक्तिक गोपनीयता विनंती">वैयक्तिक गोपनीयता विनंती (Privacy request)</option>
                    <option value="Other statutory reason / इतर वैधानिक कारण">इतर वैधानिक कारण (Other)</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="अतिरिक्त माहिती किंवा विनंतीचे स्पष्टीकरण (पर्यायी)..."
                    value={erasureNotes}
                    onChange={(e) => setErasureNotes(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={erasureLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{erasureLoading ? 'नोंदवत आहे...' : 'डेटा निष्कासन विनंती सादर करा'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Grievance & Nodal Officer Details Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-700" />
          <span>तक्रार निवारण व नोडल अधिकारी संपर्क (Grievance Redressal SLA)</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          डिजिटल वैयक्तिक डेटा संरक्षण कायदा २०२३ कलम १३ नुसार, कोणत्याही तक्रारीचे किंवा विनंतीचे निवारण कमाल ७२ कामकाजाच्या तासांच्या आत करणे बंधनकारक आहे.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <p className="text-[10px] font-bold uppercase text-slate-400">नोडल अधिकारी</p>
            <p className="font-bold text-slate-900 mt-0.5">निवासी उपजिल्हाधिकारी</p>
            <p className="text-[11px] text-slate-500">जिल्हाधिकारी कार्यालय, चंद्रपूर</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <p className="text-[10px] font-bold uppercase text-slate-400">डेटा संरक्षण कक्ष</p>
            <p className="font-bold text-slate-900 mt-0.5">dpo.chandrapur@maharashtra.gov.in</p>
            <p className="text-[11px] text-slate-500">दूरध्वनी: ०७१७२-२५११००</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <p className="text-[10px] font-bold uppercase text-slate-400">वैधानिक कालमर्यादा</p>
            <p className="font-bold text-emerald-800 mt-0.5">७२ कामकाजाचे तास</p>
            <p className="text-[11px] text-slate-500">निवारण व पोहोच पावती</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/privacy-policy"
              className="text-blue-700 hover:text-blue-900 font-bold underline inline-flex items-center gap-1"
            >
              <span>संपूर्ण गोपनीयता धोरण वाचा</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/accessibility-statement"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              सुलभता विधान
            </Link>
          </div>

          <Link
            href="/settings"
            className="text-slate-600 hover:text-blue-900 font-bold inline-flex items-center gap-1"
          >
            <span>खाते सेटिंग्जवर जा</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
