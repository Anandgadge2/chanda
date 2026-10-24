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
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  // Filters
  const [docType, setDocType] = useState('');
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchDocs = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit };
      if (docType) params.docType = docType;
      if (search) params.search = search;

      const data = await api.getDocuments(params);
      setDocuments(data.documents || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchDocs(1);
  }, [docType]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchDocs(newPage);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDocs(1);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Executive Command Hero Header - Pro Compact */}
      <div className="bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-purple-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 text-white shadow-2xs">
            <FolderArchive className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                डिजिटल दस्तऐवज व भौतिक कपाट संदर्भ
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-300">
                अभिलेखागार DMS
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-medium">
                • सन १९५० जुने सातबारे, फेरफार पत्रके, SDO व जिल्हाधिकारी आदेश
              </span>
            </div>
            <p className="text-[11px] text-slate-500 md:hidden truncate font-medium">
              सन १९५० जुने सातबारे, फेरफार पत्रके, SDO व जिल्हाधिकारी आदेश
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
            title="नवीन दस्तऐवज जोडा"
          >
            <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>नवीन दस्तऐवज</span>
          </button>
          <button
            onClick={() => fetchDocs(page)}
            disabled={loading}
            className="p-1.5 bg-white hover:bg-purple-50 border border-slate-300 text-slate-700 hover:text-slate-950 rounded-lg text-xs transition active:scale-95 shadow-2xs cursor-pointer"
            title="रीफ्रेश करा"
            aria-label="रीफ्रेश करा"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : 'text-slate-700'}`} />
          </button>
        </div>
      </div>

      {/* Filter Command Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-2.5 shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="दस्तऐवज शीर्षक, फाईल क्र., रॅक किंवा गठ्ठा क्र. शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
          />
        </form>

        <div className="w-full sm:w-72">
          <SearchableSelect
            options={[
              { value: '', label: 'सर्व दस्तऐवज प्रकार' },
              ...Object.entries(DMS_DOC_TYPES).map(([k, v]) => ({
                value: k,
                label: v.labelMr
              }))
            ]}
            value={docType}
            onChange={(val) => setDocType(val)}
            placeholder="सर्व दस्तऐवज प्रकार"
            searchPlaceholder="दस्तऐवज प्रकार शोधा..."
            icon={Filter}
            showCount={false}
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">एकूण दस्तऐवज:</span>
            <span className="text-xs font-black text-blue-950 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/70">
              {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
              चंद्रपूर अभिलेख कक्ष कोऑर्डिनेट्स
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 sm:hidden font-medium">
              तक्ता आडवा स्क्रोल करा
            </span>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">दस्तऐवज शीर्षक व वर्गीकरण</th>
                <th className="py-3 px-3">संलग्न भूखंड / केस</th>
                <th className="py-3 px-3">भौतिक रॅक</th>
                <th className="py-3 px-3">गठ्ठा</th>
                <th className="py-3 px-3">फाईल क्र.</th>
                <th className="py-3 px-3">आकार</th>
                <th className="py-3 px-3">अपलोड दिनांक</th>
                <th className="py-3 px-4 text-right">डिजिटल प्रत</th>
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

      {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        onPageChange={handlePageChange}
      />

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
