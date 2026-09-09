'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Scale,
  FolderArchive,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Building,
  User,
  ShieldAlert,
  FileText,
  Calendar,
} from 'lucide-react';
import { api } from '../lib/api';
import { TENURE_CLASSES, VIOLATION_TYPES, ENFORCEMENT_STATUSES } from '../lib/constants';
import DocUploadModal from './DocUploadModal';

export default function ParcelTraceDrawer({ upi, onClose, onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('backward');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    if (!upi) return;
    setLoading(true);
    setError(null);
    api.getParcelTrace(upi)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [upi]);

  if (!upi) return null;

  const parcel = data?.parcel;
  const summary = data?.intelligenceSummary;
  const tenureConfig = parcel?.tenureClass ? TENURE_CLASSES[parcel.tenureClass] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-start border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                UPI: {upi}
              </span>
              {parcel?.hasActiveDispute && (
                <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-semibold border border-rose-800">
                  सक्रिय वाद (Active Dispute)
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {parcel?.villageName} | गट क्र. {parcel?.gatNumber}
              {parcel?.hissaNumber && parcel.hissaNumber !== '0' && ` (हिस्सा ${parcel.hissaNumber})`}
            </h2>
            <p className="text-xs text-slate-400">
              तालुका: {parcel?.taluka} | महसूल मंडळ: {parcel?.revenueCircle || '-'} | क्षेत्र: {Number(parcel?.totalAreaHa || 0).toFixed(4)} हे.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                अभिलेख इतिहास व ३६०° साखळी लोड होत आहे...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs border border-rose-200">
              त्रुटी: {error}
            </div>
          ) : parcel ? (
            <>
              {/* Intelligence Summary Banner */}
              {summary?.potentialIllegalAlienation && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3 shadow-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">संभाव्य बेकायदेशीर हस्तांतरण (Anomaly Detected)</p>
                    <p className="mt-0.5 text-amber-800">
                      हा भूखंड सन १९५० च्या अभिलेखात शासकीय/इनाम सदरी होता, परंतु सध्या खाजगी धारणेवर नोंदवला गेला आहे.
                    </p>
                  </div>
                </div>
              )}

              {summary?.isRepossessedToGovt && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">शासन जमा आदेश पारित (Land Resumed to State)</p>
                    <p className="mt-0.5 text-emerald-800">
                      जिल्हाधिकारी कार्यालयाच्या अंतिम आदेशानुसार हा भूखंड अनधिकृत कब्जेदारामधून काढून पुन्हा शासकीय सदरी नोंदवला आहे.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Stat Pill Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">धारणा प्रकार (Tenure)</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {tenureConfig?.labelMr || parcel.tenureClass}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">१९५० मूळ खातेदार</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                    {summary?.baseline1950Epoch?.ownerName || 'नोंद प्रलंबित'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">अभिलेख दस्तऐवज (DMS)</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {parcel.documents?.length || 0} फायली उपलब्ध
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 gap-2">
                <button
                  onClick={() => setActiveTab('backward')}
                  className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'backward'
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>मागील शीर्षक साखळी (Backward 1950)</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
                    {parcel.backwardHistories?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('forward')}
                  className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'forward'
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>शर्तभंग व सुनावणी (Forward Enforcement)</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
                    {parcel.forwardCases?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'documents'
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>DMS दस्तऐवज</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
                    {parcel.documents?.length || 0}
                  </span>
                </button>
              </div>

              {/* Tab 1: Backward Linkage */}
              {activeTab === 'backward' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-slate-600">
                      ऐतिहासिक मालकी क्रमविकास (सन १९५० ते सद्यस्थिती)
                    </p>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {parcel.backwardHistories?.map((epoch, idx) => (
                      <div key={epoch.id} className="relative group">
                        {/* Timeline Node */}
                        <div
                          className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                            epoch.epochYear === 1950
                              ? 'border-amber-600 bg-amber-500'
                              : 'border-blue-700'
                          }`}
                        />
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  epoch.epochYear === 1950
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {epoch.epochYear === 1950 ? 'सन १९५० मूळ सनद/नोंद' : `सन ${epoch.epochYear}`}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">
                                {epoch.ownerName}
                              </h4>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">
                              फेरफार: {epoch.ferfarNumber || 'N/A'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                            <div>
                              खाते क्र.: <span className="font-semibold">{epoch.khataNumber || '-'}</span>
                            </div>
                            <div>
                              क्षेत्र: <span className="font-semibold">{Number(epoch.areaHa).toFixed(4)} हे.</span>
                            </div>
                            <div>
                              हस्तांतरण प्रकार: <span className="font-semibold">{epoch.mutationType || '-'}</span>
                            </div>
                            <div>
                              शासकीय जमीन: <span className="font-semibold">{epoch.wasGovtLand ? 'होय (Govt)' : 'नाही'}</span>
                            </div>
                          </div>

                          {epoch.remarks && (
                            <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 mt-1 italic">
                              शेरा: {epoch.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Forward Enforcement */}
              {activeTab === 'forward' && (
                <div className="space-y-4">
                  {parcel.forwardCases?.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      या भूखंडावर कोणतेही सक्रिय वाद किंवा शर्तभंग प्रकरण प्रलंबित नाही.
                    </div>
                  ) : (
                    parcel.forwardCases?.map((item) => {
                      const viol = VIOLATION_TYPES[item.violationType];
                      const stat = ENFORCEMENT_STATUSES[item.status];

                      return (
                        <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  केस क्र. {item.caseNumber}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${viol?.badgeClass}`}>
                                  {viol?.labelMr || item.violationType}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                अनधिकृत कब्जेदार: <span className="font-bold text-slate-900">{item.occupantName || '-'}</span>
                              </p>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold border ${stat?.color}`}>
                              {stat?.labelMr || item.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>
                              अतिक्रमीत क्षेत्र: <span className="font-bold text-slate-900">{Number(item.encroachedAreaHa).toFixed(4)} हे.</span>
                            </div>
                            <div>
                              तपास अधिकारी: <span className="font-semibold">{item.investigatingOfficer || '-'}</span>
                            </div>
                            <div>
                              नोटीस दिनांक: <span className="font-semibold">{item.showCauseNoticeDate ? new Date(item.showCauseNoticeDate).toLocaleDateString('mr-IN') : '-'}</span>
                            </div>
                            <div>
                              शासन जमा: <span className="font-bold text-emerald-700">{item.isRepossessedToGovt ? 'होय (शासन जमा)' : 'नाही'}</span>
                            </div>
                          </div>

                          {item.finalOrderDetails && (
                            <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                              <span className="font-bold">अंतिम आदेश शेरा: </span>
                              {item.finalOrderDetails}
                            </div>
                          )}

                          {/* Hearings Log */}
                          {item.hearings?.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 space-y-2">
                              <p className="text-[11px] font-bold text-slate-700">सुनावणी इतिवृत्त (Proceedings Log):</p>
                              <div className="space-y-2">
                                {item.hearings.map((h) => (
                                  <div key={h.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                                      <span className="font-bold text-blue-900">{h.authority}</span>
                                      <span>दिनांक: {new Date(h.hearingDate).toLocaleDateString('mr-IN')}</span>
                                    </div>
                                    <p className="text-slate-800">{h.proceedingsLog}</p>
                                    {h.nextHearingDate && (
                                      <p className="text-[10px] text-amber-700 font-semibold">
                                        पुढील सुनावणी: {new Date(h.nextHearingDate).toLocaleDateString('mr-IN')}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 3: DMS Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-slate-600">
                      Cloudinary डिजिटल स्कॅन व भौतिक कपाट/रॅक संदर्भ
                    </p>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>नवीन दस्तऐवज जोडा</span>
                    </button>
                  </div>

                  {parcel.documents?.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      या भूखंडाशी संलग्न कोणतेही दस्तऐवज अजून जोडलेले नाहीत.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {parcel.documents?.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {doc.docType}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">
                                {doc.title}
                              </h4>
                            </div>
                            <a
                              href={doc.storageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              <span>उघडा</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {/* Coordinates */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                            <div>
                              रॅक: <span className="font-bold text-slate-800">{doc.recordRoomRackNo || '-'}</span>
                            </div>
                            <div>
                              गठ्ठा: <span className="font-bold text-slate-800">{doc.recordRoomBundleNo || '-'}</span>
                            </div>
                            <div>
                              फाईल: <span className="font-bold text-slate-800">{doc.fileNumber || '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-blue-900 hover:text-blue-700 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>दस्तावेज संलग्न करा</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>

      {/* Embedded Doc Upload Modal */}
      {uploadModalOpen && (
        <DocUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          parcelId={parcel?.id}
          onUploadSuccess={() => {
            if (upi) {
              api.getParcelTrace(upi).then(setData);
            }
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
}
