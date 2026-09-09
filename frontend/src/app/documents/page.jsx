'use client';

import { useState, useEffect } from 'react';
import {
  FolderArchive,
  UploadCloud,
  Search,
  ExternalLink,
  FileText,
  Layers,
  Filter,
  RefreshCw,
  Plus,
  Landmark,
  HardDrive,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DMS_DOC_TYPES } from '../../lib/constants';
import DocUploadModal from '../../components/DocUploadModal';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [docType, setDocType] = useState('');
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (docType) params.docType = docType;
      if (search) params.search = search;

      const data = await api.getDocuments(params);
      setDocuments(data.documents || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [docType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded">
              जिल्हाधिकारी अभिलेखागार (DMS Vault)
            </span>
            <span className="text-xs text-slate-500 font-medium">Cloudinary + Physical Room Mapping</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            डिजिटल दस्तऐवज व भौतिक कपाट संदर्भ (Collectorate DMS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            सन १९५० जुने सातबारे, फेरफार पत्रके, उपविभागीय अधिकारी व जिल्हाधिकारी आदेश
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>नवीन दस्तऐवज जोडा (Upload)</span>
          </button>
          <button
            onClick={fetchDocs}
            disabled={loading}
            className="p-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="दस्तऐवज शीर्षक, फाईल क्र., रॅक किंवा गठ्ठा क्र. शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">सर्व दस्तऐवज प्रकार (All Categories)</option>
          {Object.entries(DMS_DOC_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.labelMr}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-700">
            एकूण दस्तऐवज: <span className="text-blue-900">{totalCount}</span>
          </p>
          <span className="text-[11px] text-slate-500">
            Cloudinary डिजिटल आर्काइव्ह व चंद्रपूर अभिलेख कक्ष कोऑर्डिनेट्स
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">दस्तऐवज शीर्षक व वर्गीकरण</th>
                <th className="py-3 px-3">संलग्न भूखंड / केस</th>
                <th className="py-3 px-3">भौतिक रॅक (Rack)</th>
                <th className="py-3 px-3">गठ्ठा (Bundle)</th>
                <th className="py-3 px-3">फाईल क्र.</th>
                <th className="py-3 px-3">साकार (Size)</th>
                <th className="py-3 px-3">अपलोड दिनांक</th>
                <th className="py-3 px-4 text-right">डिजिटल प्रत (Cloud)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    दस्तऐवज सूची लोड होत आहे...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    कोणतेही दस्तऐवज सापडले नाहीत. कृपया वर दिलेल्या बटनावर क्लिक करून नवीन दस्तऐवज जोडा.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const docMeta = DMS_DOC_TYPES[doc.docType];
                  const sizeMB = (Number(doc.fileSizeBytes) / (1024 * 1024)).toFixed(2);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{doc.title}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          {docMeta?.labelMr || doc.docType}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {doc.parcel ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {doc.parcel.villageName} (गट {doc.parcel.gatNumber})
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">{doc.parcel.upi}</div>
                          </div>
                        ) : doc.enforcementCase ? (
                          <div className="font-mono text-xs font-semibold text-blue-900">
                            {doc.enforcementCase.caseNumber}
                          </div>
                        ) : (
                          <span className="text-slate-400">सामान्य दस्तऐवज</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                        {doc.recordRoomRackNo ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {doc.recordRoomRackNo}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                        {doc.recordRoomBundleNo ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {doc.recordRoomBundleNo}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-blue-900">
                        {doc.fileNumber || '-'}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                        {sizeMB} MB
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        {new Date(doc.uploadedAt).toLocaleDateString('mr-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={doc.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 transition"
                        >
                          <span>PDF पहा</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <DocUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploadSuccess={fetchDocs}
        />
      )}
    </div>
  );
}
