'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Upload,
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  FolderArchive,
} from 'lucide-react';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS, TENURE_CLASSES } from '../../lib/constants';
import ParcelTraceDrawer from '../../components/ParcelTraceDrawer';
import DocUploadModal from '../../components/DocUploadModal';

export default function ParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [taluka, setTaluka] = useState('');
  const [tenureClass, setTenureClass] = useState('');
  const [hasActiveDispute, setHasActiveDispute] = useState('');
  const [search, setSearch] = useState('');

  // Drawers & Modals
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [uploadModalParcelId, setUploadModalParcelId] = useState(null);

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const params = {};
      if (taluka) params.taluka = taluka;
      if (tenureClass) params.tenureClass = tenureClass;
      if (hasActiveDispute !== '') params.hasActiveDispute = hasActiveDispute;
      if (search) params.search = search;

      const data = await api.getParcels(params);
      setParcels(data.parcels || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [taluka, tenureClass, hasActiveDispute]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParcels();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
              मास्टर भूखंड नोंदवही
            </span>
            <span className="text-xs text-slate-500 font-medium">गाव नमुना ७/१२ अभिलेख</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            भूखंड नोंदवही व ३६०° शीर्षक साखळी (Parcel Registry)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ऐतिहासिक १९५० मूळ मालकी, फेरफार नोंदी व चालू शर्तभंग चौकशी
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getSampleTemplateUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>एक्सेल टेम्पलेट</span>
          </a>
          <button
            onClick={fetchParcels}
            disabled={loading}
            className="p-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="गट क्र., जुना स.नं., गाव किंवा UPI द्वारे शोधा..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
            value={tenureClass}
            onChange={(e) => setTenureClass(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सर्व धारणा प्रकार (All Tenures)</option>
            {Object.entries(TENURE_CLASSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.labelMr}
              </option>
            ))}
          </select>

          <select
            value={hasActiveDispute}
            onChange={(e) => setHasActiveDispute(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सर्व वाद स्थिती (All Dispute Status)</option>
            <option value="true">सक्रिय वाद / शर्तभंग (In Dispute)</option>
            <option value="false">विवादरहित (Clear Title)</option>
          </select>

          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shadow-xs"
          >
            शोधा (Search)
          </button>
        </form>
      </div>

      {/* Parcels Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-700">
            एकूण नोंदणीकृत भूखंड: <span className="text-blue-900">{totalCount}</span>
          </p>
          <span className="text-[11px] text-slate-500">
            ओळीवर क्लिक करून ३६०° शीर्षक इतिहास व पुरावे पहा
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">UPI / भूखंड ओळख</th>
                <th className="py-3 px-3">तालुका व गाव</th>
                <th className="py-3 px-3">स.नं. / गट क्र.</th>
                <th className="py-3 px-3">हिस्सा</th>
                <th className="py-3 px-3">क्षेत्र (हेक्टर)</th>
                <th className="py-3 px-3">धारणा प्रकार</th>
                <th className="py-3 px-3 text-center">वाद स्थिती</th>
                <th className="py-3 px-3 text-center">DMS फायली</th>
                <th className="py-3 px-4 text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    नोंदवही डेटा लोड होत आहे...
                  </td>
                </tr>
              ) : parcels.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    कोणतेही भूखंड सापडले नाहीत. कृपया फिल्टर बदला.
                  </td>
                </tr>
              ) : (
                parcels.map((parcel) => {
                  const tenure = TENURE_CLASSES[parcel.tenureClass];
                  const hasDispute = parcel.hasActiveDispute;

                  return (
                    <tr
                      key={parcel.id}
                      className="hover:bg-blue-50/40 transition cursor-pointer group"
                      onClick={() => setSelectedUpi(parcel.upi)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 group-hover:text-blue-900">
                        {parcel.upi}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{parcel.villageName}</div>
                        <div className="text-[11px] text-slate-500">तालुका: {parcel.taluka}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">गट {parcel.gatNumber}</div>
                        {parcel.oldSurveyNo && (
                          <div className="text-[11px] text-slate-500">जुना स.नं. {parcel.oldSurveyNo}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {parcel.hissaNumber || '०'}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {Number(parcel.totalAreaHa).toFixed(4)}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            tenure?.badgeClass || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tenure?.labelMr || parcel.tenureClass}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {hasDispute ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>शर्तभंग चौकशी</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>निर्वेध</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <FolderArchive className="w-3 h-3 text-blue-600" />
                          <span>{parcel._count?.documents || 0}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedUpi(parcel.upi)}
                          className="inline-flex items-center gap-1 text-[11px] bg-blue-900 hover:bg-blue-800 text-white font-semibold px-2.5 py-1 rounded transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>३६०° साखळी</span>
                        </button>
                        <button
                          onClick={() => setUploadModalParcelId(parcel.id)}
                          className="inline-flex items-center gap-1 text-[11px] border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded transition"
                          title="दस्तावेज अपलोड करा"
                        >
                          <Upload className="w-3 h-3 text-blue-600" />
                          <span>DMS</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360 Trace Drawer */}
      {selectedUpi && (
        <ParcelTraceDrawer
          upi={selectedUpi}
          onClose={() => setSelectedUpi(null)}
          onRefresh={fetchParcels}
        />
      )}

      {/* Doc Upload Modal */}
      {uploadModalParcelId && (
        <DocUploadModal
          isOpen={Boolean(uploadModalParcelId)}
          onClose={() => setUploadModalParcelId(null)}
          parcelId={uploadModalParcelId}
          onUploadSuccess={fetchParcels}
        />
      )}
    </div>
  );
}
