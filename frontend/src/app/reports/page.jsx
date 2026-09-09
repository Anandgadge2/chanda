'use client';

import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Landmark,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  CHANDRAPUR_TALUKAS,
  VIOLATION_TYPES,
  ENFORCEMENT_STATUSES,
  TENURE_CLASSES,
} from '../../lib/constants';

export default function ReportsPage() {
  const [taluka, setTaluka] = useState('');
  const [violationType, setViolationType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState([]);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const params = {};
      if (taluka) params.taluka = taluka;
      if (violationType) params.violationType = violationType;
      if (status) params.status = status;

      const data = await api.getPrapatra3Preview(params);
      setPreviewData(data.rows || []);
    } catch (err) {
      console.error('Failed to load Prapatra preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [taluka, violationType, status]);

  const handleDownload = () => {
    window.location.href = api.getPrapatra3DownloadUrl(taluka, violationType);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
              वैधानिक अहवाल (Statutory Compliance)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              महसूल व वन विभाग, महाराष्ट्र शासन
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            प्रपत्र-३ अहवाल निर्यात केंद्र (Prapatra-3 Government Booklet)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            भोगवटादार वर्ग-२ व शासकीय जमीन शर्तभंग, आदिवासी जमीन हस्तांतरण (कलम ३६/३६अ) व अतिक्रमण अहवाल
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl text-xs shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>अधिकृत प्रपत्र-३ एक्सेल डाऊनलोड करा (Download Prapatra-3)</span>
        </button>
      </div>

      {/* Statutory Mapping Guidelines */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-blue-900" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            प्रपत्र-३ शासन नियमावली व १३ अधिकृत वैधानिक स्तंभ (13 Statutory Columns)
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          हा अहवाल महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ च्या तरतुदीनुसार प्रत्यक्ष क्षेत्रीय पडताळणी, सन १९५० ची मूळ मालकी साखळी (Backward Linkage) व उपविभागीय अधिकारी यांच्या अर्ध-न्यायिक आदेशांचा समावेश करून १३ अधिकृत शासकीय स्तंभांमध्ये तयार केला जातो.
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            '१. अ.क्र.',
            '२. तालुका/उपविभाग',
            '३. महसूल मंडळ व गाव',
            '४. स.नं./गट क्र.',
            '५. हिस्सा',
            '६. एकूण क्षेत्र',
            '७. मूळ खातेदार (सन १९५०)',
            '८. धारणा प्रकार',
            '९. सद्यस्थितीतील कब्जेदार',
            '१०. उल्लंघनाचे स्वरूप',
            '११. सक्षम प्राधिकारी स्थिती',
            '१२. आदेश क्र. व दिनांक',
            '१३. शेरा व DMS संदर्भ',
          ].map((col, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={taluka}
            onChange={(e) => setTaluka(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सर्व तालुके (District Wide)</option>
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
            <option value="">सर्व उल्लंघन प्रकार</option>
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
            <option value="">सर्व प्रकरण स्थिती</option>
            {Object.entries(ENFORCEMENT_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.labelMr}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchPreview}
          disabled={loading}
          className="p-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Live Preview Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              प्रपत्र-३ थेट पूर्वावलोकन (Live Table Preview):
            </span>
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              {previewData.length} नोंदणीकृत प्रकरणे
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            डाऊनलोड होणाऱ्या एक्सेल पत्रकातील हुबेहूब रचना
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-amber-100/70 text-slate-900 font-bold border-b border-amber-200">
              <tr>
                <th className="py-3 px-3 text-center">१. अ.क्र.</th>
                <th className="py-3 px-3">२. तालुका</th>
                <th className="py-3 px-3">३. गाव</th>
                <th className="py-3 px-3">४. स.नं./गट क्र.</th>
                <th className="py-3 px-2 text-center">५. हिस्सा</th>
                <th className="py-3 px-3">६. क्षेत्र</th>
                <th className="py-3 px-3">७. मूळ खातेदार (सन १९५०)</th>
                <th className="py-3 px-3">८. धारणा प्रकार</th>
                <th className="py-3 px-3">९. सद्यस्थितीतील कब्जेदार</th>
                <th className="py-3 px-3">१०. उल्लंघन प्रकार</th>
                <th className="py-3 px-3">११. प्राधिकारी स्थिती</th>
                <th className="py-3 px-3">१२. आदेश क्र.</th>
                <th className="py-3 px-3 text-center">१३. DMS फायली</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    पूर्वावलोकन लोड होत आहे...
                  </td>
                </tr>
              ) : previewData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center text-slate-500">
                    या निकषांनुसार कोणतेही अहवाल डेटा उपलब्ध नाही.
                  </td>
                </tr>
              ) : (
                previewData.map((row) => {
                  const tenure = TENURE_CLASSES[row.tenureClass];
                  const viol = VIOLATION_TYPES[row.violationType];
                  const stat = ENFORCEMENT_STATUSES[row.status];

                  return (
                    <tr key={row.srNo} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">{row.srNo}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{row.taluka}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{row.village}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{row.surveyGat}</td>
                      <td className="py-3 px-2 text-center text-slate-600">{row.hissa}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{row.area}</td>
                      <td className="py-3 px-3 font-bold text-amber-900 bg-amber-50/40">
                        {row.originalOwner1950}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold border ${tenure?.badgeClass}`}>
                          {tenure?.labelMr || row.tenureClass}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">{row.occupant}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold border ${viol?.badgeClass}`}>
                          {viol?.labelMr || row.violationType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold border ${stat?.color}`}>
                          {stat?.labelMr || row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-900 font-bold">
                        {row.caseNumber}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                          {row.documentsCount} फायली
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
