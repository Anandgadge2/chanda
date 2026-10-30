'use client';

import { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../lib/api';
import { DMS_DOC_TYPES } from '../../lib/constants';
import DocUploadModal from '../../components/DocUploadModal';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import { useTranslation } from '../../components/LanguageContext';

export default function DocumentsPage() {
  const { isMarathi } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(25);

  // Draft Filters
  const [draftDocType, setDraftDocType] = useState('');
  const [draftSearch, setDraftSearch] = useState('');

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    docType: '',
    search: '',
  });

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchDocs = async (targetPage = page, filtersToUse = appliedFilters) => {
    setLoading(true);
    try {
      const params = { page: targetPage, limit };
      if (filtersToUse.docType) params.docType = filtersToUse.docType;
      if (filtersToUse.search && filtersToUse.search.trim()) params.search = filtersToUse.search.trim();

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
    fetchDocs(1, appliedFilters);
  }, []);

  const isFilterPending = useMemo(() => {
    return (
      draftDocType !== appliedFilters.docType ||
      draftSearch.trim() !== appliedFilters.search.trim()
    );
  }, [draftDocType, draftSearch, appliedFilters]);

  const handleApplyFilters = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const nextFilters = {
      docType: draftDocType,
      search: draftSearch.trim(),
    };
    setAppliedFilters(nextFilters);
    setPage(1);
    fetchDocs(1, nextFilters);
  };

  const handleResetFilters = () => {
    const cleanFilters = {
      docType: '',
      search: '',
    };
    setDraftDocType('');
    setDraftSearch('');
    setAppliedFilters(cleanFilters);
    setPage(1);
    fetchDocs(1, cleanFilters);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchDocs(newPage, appliedFilters);
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
                {isMarathi ? 'डिजिटल दस्तऐवज व भौतिक कपाट संदर्भ' : 'Digital DMS & Record Room Repository'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-300">
                {isMarathi ? 'अभिलेखागार DMS' : 'Archives DMS'}
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-medium">
                {isMarathi
                  ? '• सन १९५० जुने सातबारे, फेरफार पत्रके, SDO व जिल्हाधिकारी आदेश'
                  : '• 1950 Baseline 7/12 extracts, mutation registers, SDO & Collector orders'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 md:hidden truncate font-medium">
              {isMarathi
                ? 'सन १९५० जुने सातबारे, फेरफार पत्रके, SDO व जिल्हाधिकारी आदेश'
                : '1950 Baseline 7/12 extracts, mutation registers, SDO & Collector orders'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
            title={isMarathi ? 'नवीन दस्तऐवज जोडा' : 'Add new document'}
          >
            <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>{isMarathi ? 'नवीन दस्तऐवज' : 'New Document'}</span>
          </button>
          <button
            onClick={() => fetchDocs(page, appliedFilters)}
            disabled={loading}
            className="p-1.5 bg-white hover:bg-purple-50 border border-slate-300 text-slate-700 hover:text-slate-950 rounded-lg text-xs transition active:scale-95 shadow-2xs cursor-pointer"
            title={isMarathi ? 'रीफ्रेश करा' : 'Refresh'}
            aria-label={isMarathi ? 'रीफ्रेश करा' : 'Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : 'text-slate-700'}`} />
          </button>
        </div>
      </div>

      {/* Filter Command Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-2.5 shadow-2xs flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              isMarathi
                ? 'दस्तऐवज शीर्षक, फाईल क्र., रॅक किंवा गठ्ठा क्र. शोधा...'
                : 'Search document title, file no, rack or bundle no...'
            }
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyFilters();
              }
            }}
            className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all font-medium h-9"
          />
          {draftSearch && (
            <button
              type="button"
              onClick={() => setDraftSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg cursor-pointer"
              title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Document Type Dropdown */}
        <div className="w-full sm:w-64">
          <SearchableSelect
            options={[
              { value: '', label: isMarathi ? 'सर्व दस्तऐवज प्रकार' : 'All Document Types' },
              ...Object.entries(DMS_DOC_TYPES).map(([k, v]) => ({
                value: k,
                label: isMarathi ? v.labelMr : (v.labelEn || v.labelMr),
              })),
            ]}
            value={draftDocType}
            onChange={(val) => setDraftDocType(val)}
            placeholder={isMarathi ? 'सर्व दस्तऐवज प्रकार' : 'All Document Types'}
            searchPlaceholder={isMarathi ? 'दस्तऐवज प्रकार शोधा...' : 'Search document type...'}
            icon={Filter}
            showCount={false}
          />
        </div>

        {/* Action Buttons: Apply & Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className={clsx(
              'h-9 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer select-none w-full sm:w-auto',
              isFilterPending
                ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-400/60 ring-offset-1 shadow-purple-700/20'
                : 'bg-purple-900 hover:bg-purple-950 text-white'
            )}
            title={isMarathi ? 'फिल्टर्स लागू करा (Enter)' : 'Apply Filters (Enter)'}
          >
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
            {isFilterPending && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-9 px-3 text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 rounded-xl border border-slate-300 hover:border-rose-300 transition-all active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-2xs"
            title={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
            aria-label={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              {isMarathi ? 'एकूण दस्तऐवज:' : 'Total Documents:'}
            </span>
            <span className="text-xs font-black text-blue-950 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/70">
              {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
              {isMarathi ? 'चंद्रपूर अभिलेख कक्ष कोऑर्डिनेट्स' : 'Chandrapur Record Room Coordinates'}
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 sm:hidden font-medium">
              {isMarathi ? 'तक्ता आडवा स्क्रोल करा' : 'Scroll table horizontally'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{isMarathi ? 'दस्तऐवज शीर्षक व वर्गीकरण' : 'Title & Classification'}</th>
                <th className="py-3 px-3">{isMarathi ? 'संलग्न भूखंड / केस' : 'Linked Parcel / Case'}</th>
                <th className="py-3 px-3">{isMarathi ? 'भौतिक रॅक' : 'Rack No.'}</th>
                <th className="py-3 px-3">{isMarathi ? 'गठ्ठा' : 'Bundle'}</th>
                <th className="py-3 px-3">{isMarathi ? 'फाईल क्र.' : 'File No.'}</th>
                <th className="py-3 px-3">{isMarathi ? 'आकार' : 'Size'}</th>
                <th className="py-3 px-3">{isMarathi ? 'अपलोड दिनांक' : 'Upload Date'}</th>
                <th className="py-3 px-4 text-right">{isMarathi ? 'डिजिटल प्रत' : 'Digital Copy'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    {isMarathi ? 'दस्तऐवज सूची लोड होत आहे...' : 'Loading document repository...'}
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    {isMarathi
                      ? 'कोणतेही दस्तऐवज सापडले नाहीत. कृपया वर दिलेल्या बटनावर क्लिक करून नवीन दस्तऐवज जोडा.'
                      : 'No documents found. Click the button above to upload new documents.'}
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
                          {isMarathi ? (docMeta?.labelMr || doc.docType) : (docMeta?.labelEn || docMeta?.labelMr || doc.docType)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {doc.parcel ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {doc.parcel.villageName} ({isMarathi ? `गट ${doc.parcel.gatNumber}` : `Gat ${doc.parcel.gatNumber}`})
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">{doc.parcel.upi}</div>
                          </div>
                        ) : doc.enforcementCase ? (
                          <div className="font-mono text-xs font-semibold text-blue-900">
                            {doc.enforcementCase.caseNumber}
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            {isMarathi ? 'सामान्य दस्तऐवज' : 'General Document'}
                          </span>
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
                        {new Date(doc.uploadedAt).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={doc.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 transition"
                        >
                          <span>{isMarathi ? 'PDF पहा' : 'View PDF'}</span>
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
        pageSize={limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[25, 50, 100, 'all']}
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
