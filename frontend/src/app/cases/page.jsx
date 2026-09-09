'use client';

import { useState, useEffect } from 'react';
import {
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Upload,
  User,
  Eye,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  CHANDRAPUR_TALUKAS,
  VIOLATION_TYPES,
  ENFORCEMENT_STATUSES,
} from '../../lib/constants';
import AddHearingModal from '../../components/AddHearingModal';
import DocUploadModal from '../../components/DocUploadModal';
import ParcelTraceDrawer from '../../components/ParcelTraceDrawer';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [taluka, setTaluka] = useState('');
  const [violationType, setViolationType] = useState('');
  const [status, setStatus] = useState('');
  const [isRepossessedToGovt, setIsRepossessedToGovt] = useState('');

  // Modals & Drawers
  const [selectedCaseForHearing, setSelectedCaseForHearing] = useState(null);
  const [uploadDocCaseId, setUploadDocCaseId] = useState(null);
  const [traceUpi, setTraceUpi] = useState(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (taluka) params.taluka = taluka;
      if (violationType) params.violationType = violationType;
      if (status) params.status = status;
      if (isRepossessedToGovt !== '') params.isRepossessedToGovt = isRepossessedToGovt;

      const data = await api.getCases(params);
      setCases(data.cases || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [taluka, violationType, status, isRepossessedToGovt]);

  const handleMarkShasanJama = async (caseItem) => {
    const confirm = window.confirm(
      `केस क्र. ${caseItem.caseNumber} अंतर्गत जमीन 'शासन जमा' (Repossess to Government) म्हणून घोषित करायची आहे का?`
    );
    if (!confirm) return;

    try {
      await api.updateCaseStatus(caseItem.id, {
        status: 'FINAL_ORDER_PASSED',
        isRepossessedToGovt: true,
        orderDate: new Date().toISOString(),
        finalOrderDetails: 'जिल्हाधिकारी यांच्या अंतिम आदेशानुसार जमीन विनाअडथळा शासन जमा करण्यात आली.',
      });
      fetchCases();
    } catch (err) {
      alert('अपडेट अयशस्वी: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
              अर्ध-न्यायिक महसूल न्यायालय
            </span>
            <span className="text-xs text-slate-500 font-medium">कलम ३६, ३६अ व ५०-५४</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            शर्तभंग व अर्ध-न्यायिक सुनावणी कक्ष (Enforcement & Quasi-Judicial Cases)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SDO व तहसीलदार न्यायालयातील सुनावण्या, स्थळ पंचनामे व शासन जमा आदेश
          </p>
        </div>

        <button
          onClick={fetchCases}
          disabled={loading}
          className="p-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <select
          value={taluka}
          onChange={(e) => setTaluka(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">सर्व तालुके (All Talukas)</option>
          {CHANDRAPUR_TALUKAS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameEn} ({t.nameMr})
            </option>
          ))}
        </select>

        <select
          value={violationType}
          onChange={(e) => setViolationType(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">सर्व उल्लंघन प्रकार (All Violations)</option>
          {Object.entries(VIOLATION_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.labelMr}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">सर्व सद्यस्थिती (All Statuses)</option>
          {Object.entries(ENFORCEMENT_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.labelMr}
            </option>
          ))}
        </select>

        <select
          value={isRepossessedToGovt}
          onChange={(e) => setIsRepossessedToGovt(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">सर्व शासन जमा स्थिती</option>
          <option value="true">शासन जमा (Shasan Jama Resumed)</option>
          <option value="false">प्रलंबित प्रकरणे (Pending)</option>
        </select>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl">
            <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">प्रकरणे व सुनावणी नोंदी लोड होत आहेत...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
            निवडलेल्या निकषांनुसार कोणतीही प्रकरणे आढळली नाहीत.
          </div>
        ) : (
          cases.map((c) => {
            const viol = VIOLATION_TYPES[c.violationType];
            const stat = ENFORCEMENT_STATUSES[c.status];
            const latestHearing = c.hearings && c.hearings[0];

            return (
              <div
                key={c.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition space-y-4"
              >
                {/* Case Top Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {c.caseNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${viol?.badgeClass}`}>
                      {viol?.labelMr || c.violationType}
                    </span>
                    {c.isRepossessedToGovt && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>शासन जमा (Resumed)</span>
                      </span>
                    )}
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${stat?.color}`}>
                    {stat?.labelMr || c.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block">भूखंड स्थान</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {c.parcel?.villageName} (गट {c.parcel?.gatNumber})
                    </p>
                    <p className="text-[11px] text-slate-500">तालुका: {c.parcel?.taluka}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block">सध्याचा अनधिकृत कब्जेदार</span>
                    <p className="font-bold text-slate-900 mt-0.5 truncate">
                      {c.occupantName || 'तपासणी सुरू'}
                    </p>
                    <p className="text-[11px] text-slate-500">अतिक्रमीत क्षेत्र: {Number(c.encroachedAreaHa).toFixed(4)} हे.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block">तपास अधिकारी / नोटीस</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {c.investigatingOfficer || 'नायब तहसीलदार'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      नोटीस: {c.showCauseNoticeDate ? new Date(c.showCauseNoticeDate).toLocaleDateString('mr-IN') : '-'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block">DMS पुरावे व फायली</span>
                    <p className="font-bold text-blue-900 mt-0.5">
                      {c.documents?.length || 0} दस्तऐवज संलग्न
                    </p>
                    <p className="text-[11px] text-slate-500">प्रपत्र प्रवर्ग: {c.prapatraCategory || 'प्रपत्र-३'}</p>
                  </div>
                </div>

                {/* Final Order Remark if any */}
                {c.finalOrderDetails && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">अंतिम आदेश व शेरा: </span>
                      <span>{c.finalOrderDetails}</span>
                      {c.orderDate && (
                        <span className="ml-2 font-mono text-[11px] text-amber-800">
                          (दि. {new Date(c.orderDate).toLocaleDateString('mr-IN')})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Latest Hearing Snippet */}
                {latestHearing && (
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-900">{latestHearing.authority}</span>
                        <span className="text-[11px] text-indigo-600">
                          (दिनांक: {new Date(latestHearing.hearingDate).toLocaleDateString('mr-IN')})
                        </span>
                      </div>
                      <p className="text-indigo-900 text-xs leading-relaxed">{latestHearing.proceedingsLog}</p>
                    </div>
                    {latestHearing.nextHearingDate && (
                      <span className="text-xs bg-amber-100 text-amber-900 px-2 py-1 rounded font-bold whitespace-nowrap">
                        पुढील सुनावणी: {new Date(latestHearing.nextHearingDate).toLocaleDateString('mr-IN')}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 justify-end items-center">
                  <button
                    onClick={() => setTraceUpi(c.parcel?.upi)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>३६०° इतिहास</span>
                  </button>

                  <button
                    onClick={() => setUploadDocCaseId(c.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    <span>DMS पुरावा जोडा</span>
                  </button>

                  <button
                    onClick={() => setSelectedCaseForHearing(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs transition shadow-xs"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>सुनावणी नोंदवा (Add Hearing)</span>
                  </button>

                  {!c.isRepossessedToGovt && (
                    <button
                      onClick={() => handleMarkShasanJama(c)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>शासन जमा करा (Repossess)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Hearing Modal */}
      {selectedCaseForHearing && (
        <AddHearingModal
          isOpen={Boolean(selectedCaseForHearing)}
          onClose={() => setSelectedCaseForHearing(null)}
          caseItem={selectedCaseForHearing}
          onHearingAdded={fetchCases}
        />
      )}

      {/* Doc Upload Modal for Case */}
      {uploadDocCaseId && (
        <DocUploadModal
          isOpen={Boolean(uploadDocCaseId)}
          onClose={() => setUploadDocCaseId(null)}
          caseId={uploadDocCaseId}
          onUploadSuccess={fetchCases}
        />
      )}

      {/* 360 Trace Drawer */}
      {traceUpi && (
        <ParcelTraceDrawer
          upi={traceUpi}
          onClose={() => setTraceUpi(null)}
          onRefresh={fetchCases}
        />
      )}
    </div>
  );
}
