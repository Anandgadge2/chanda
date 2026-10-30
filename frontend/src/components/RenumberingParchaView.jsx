'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  TableProperties,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { useTranslation } from './LanguageContext';

const DEFAULT_SUBDIVISIONS = {
  Chandrapur: 'चंद्रपूर',
  'चंद्रपूर': 'चंद्रपूर',
  Ballarpur: 'चंद्रपूर',
  'बल्लारपूर': 'चंद्रपूर',
  Warora: 'वरोरा',
  'वरोरा': 'वरोरा',
  Bhadravati: 'वरोरा',
  'भद्रावती': 'वरोरा',
  Rajura: 'राजुरा',
  'राजुरा': 'राजुरा',
  Korpana: 'राजुरा',
  'कोरपना': 'राजुरा',
  Jivati: 'राजुरा',
  'जिवती': 'राजुरा',
  Mul: 'मूल',
  'मूल': 'मूल',
  Saoli: 'मूल',
  'सावली': 'मूल',
  Pombhurna: 'मूल',
  'पोंभुर्णा': 'मूल',
  Brahmapuri: 'ब्रह्मपुरी',
  'ब्रह्मपुरी': 'ब्रह्मपुरी',
  Nagbhid: 'ब्रह्मपुरी',
  'नागभीड': 'ब्रह्मपुरी',
  Sindewahi: 'ब्रह्मपुरी',
  'सिंदेवाही': 'ब्रह्मपुरी',
  Chimur: 'चिमूर',
  'चिमूर': 'चिमूर',
  Gondpipri: 'गोंडपिपरी',
  'गोंडपिपरी': 'गोंडपिपरी'
};

const TALUKA_MR_MAP = {
  Chandrapur: 'चंद्रपूर',
  Ballarpur: 'बल्लारपूर',
  Warora: 'वरोरा',
  Bhadravati: 'भद्रावती',
  Rajura: 'राजुरा',
  Korpana: 'कोरपना',
  Jivati: 'जिवती',
  Mul: 'मूल',
  Saoli: 'सावली',
  Pombhurna: 'पोंभुर्णा',
  Brahmapuri: 'ब्रह्मपुरी',
  Nagbhid: 'नागभीड',
  Sindewahi: 'सिंदेवाही',
  Chimur: 'चिमूर',
  Gondpipri: 'गोंडपिपरी'
};

export default function RenumberingParchaView({
  selectedTaluka = 'all',
  selectedVillage = 'all',
  onRegisterExportHandlers
}) {
  const { isMarathi } = useTranslation();

  // Header State (Matching Image 2: गावाचे नाव & तालुक्याचे नाव)
  const [header, setHeader] = useState({
    villageName: '',
    taluka: '',
    subDivision: '',
    district: 'चंद्रपूर'
  });

  // Table Rows (रिनंबरिंग पर्चा - 4 Columns)
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const prevFiltersRef = useRef({ taluka: '', village: '' });

  // Load Village Data when selectedTaluka or selectedVillage changes via Apply
  const loadVillageData = useCallback(async (t, v) => {
    const effectiveTaluka = t !== undefined ? t : selectedTaluka;
    const effectiveVillage = v !== undefined ? v : selectedVillage;

    // If no valid village is selected, show empty state
    if (!effectiveVillage || effectiveVillage === 'all' || effectiveVillage === 'सर्व गावे') {
      const isTalukaGiven = effectiveTaluka && effectiveTaluka !== 'all' && effectiveTaluka !== 'सर्व तालुके';
      const tMr = isTalukaGiven ? (TALUKA_MR_MAP[effectiveTaluka] || effectiveTaluka) : '';
      setHeader({
        villageName: '',
        taluka: tMr,
        subDivision: isTalukaGiven ? (DEFAULT_SUBDIVISIONS[effectiveTaluka] || '') : '',
        district: 'चंद्रपूर'
      });
      setRows([]);
      return;
    }

    setLoading(true);
    try {
      const data = await api.getRenumberingParchaData(effectiveTaluka, effectiveVillage);
      if (data && data.header) {
        setHeader({
          villageName: data.header.villageName || effectiveVillage,
          taluka: data.header.taluka || (TALUKA_MR_MAP[effectiveTaluka] || effectiveTaluka),
          subDivision: data.header.subDivision || DEFAULT_SUBDIVISIONS[effectiveTaluka] || '',
          district: data.header.district || 'चंद्रपूर'
        });
      }
      if (data && Array.isArray(data.rows)) {
        setRows(data.rows);
        showStatus(`${data.rows.length} अभिलेख यशस्वीपणे लोड झाले.`);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.warn('Failed to load renumbering data:', err);
      showStatus('डेटा लोड करण्यात अडचण आली, स्थानिक संपादन सुरू आहे.');
    } finally {
      setLoading(false);
    }
  }, [selectedTaluka, selectedVillage]);

  // Trigger load when applied filters change
  useEffect(() => {
    if (
      prevFiltersRef.current.taluka !== selectedTaluka ||
      prevFiltersRef.current.village !== selectedVillage
    ) {
      prevFiltersRef.current = { taluka: selectedTaluka, village: selectedVillage };
      loadVillageData(selectedTaluka, selectedVillage);
    }
  }, [selectedTaluka, selectedVillage, loadVillageData]);

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleHeaderChange = (field, value) => {
    setHeader(prev => ({ ...prev, [field]: value }));
  };

  const handleCellChange = (rowIndex, colKey, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [colKey]: value
      };
      return updated;
    });
  };

  const insertRowAt = (index) => {
    setRows(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, {
        id: `ins_${Date.now()}`,
        chaluSurveyNo: '',
        bandobastNo: '',
        ekatrikaranNo: '',
        punarmajaniNo: ''
      });
      return updated;
    });
  };

  const addNewRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: `ins_${Date.now()}`,
        chaluSurveyNo: '',
        bandobastNo: '',
        ekatrikaranNo: '',
        punarmajaniNo: ''
      }
    ]);
  };

  const deleteRow = (index) => {
    setRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearAllRows = () => {
    setRows([]);
    showStatus('सर्व पंक्ती रिकाम्या केल्या.');
  };

  // Export to Excel
  const handleExportExcel = useCallback(async () => {
    setDownloadingExcel(true);
    try {
      await api.exportRenumberingParchaExcel({ header, rows });
      showStatus('रिनंबरिंग एक्सेल फाईल डाऊनलोड झाली!');
    } catch (err) {
      console.error('Excel download failed:', err);
      alert(err.message || 'एक्सेल डाऊनलोड अयशस्वी झाले.');
    } finally {
      setDownloadingExcel(false);
    }
  }, [header, rows]);

  // Export to PDF
  const handleExportPdf = useCallback(async () => {
    setDownloadingPdf(true);
    try {
      await api.exportRenumberingParchaPdf({ header, rows });
      showStatus('रिनंबरिंग पीडीएफ फाईल डाऊनलोड झाली!');
    } catch (err) {
      console.error('PDF download failed:', err);
      alert(err.message || 'पीडीएफ डाऊनलोड अयशस्वी झाले.');
    } finally {
      setDownloadingPdf(false);
    }
  }, [header, rows]);

  // Expose export handlers to top-right export buttons
  useEffect(() => {
    if (onRegisterExportHandlers) {
      onRegisterExportHandlers({
        exportExcel: handleExportExcel,
        exportPdf: handleExportPdf,
        isDownloadingExcel: downloadingExcel,
        isDownloadingPdf: downloadingPdf
      });
    }
  }, [onRegisterExportHandlers, handleExportExcel, handleExportPdf, downloadingExcel, downloadingPdf]);

  const hasVillageSelected = selectedVillage && selectedVillage !== 'all' && selectedVillage !== 'सर्व गावे';

  return (
    <div className="space-y-3">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <TableProperties className="w-4 h-4 text-amber-600" />
          <span>
            {hasVillageSelected
              ? `रिनंबरिंग पर्चा नोंदवही — ${header.villageName || selectedVillage}`
              : 'रिनंबरिंग पर्चा नोंदवही (कृपया गाव निवडा)'}
          </span>
          <span className="text-[11px] font-mono font-normal text-slate-500">
            ({rows.length} पंक्ती)
          </span>
          {loading && (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {hasVillageSelected && (
            <button
              type="button"
              onClick={() => loadVillageData()}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-lg border border-blue-200 transition cursor-pointer"
              title="डेटा पुन्हा लोड करा"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>पुन्हा लोड करा</span>
            </button>
          )}
          <button
            type="button"
            onClick={addNewRow}
            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition cursor-pointer"
            title="नवीन पंक्ती जोडा"
          >
            <Plus className="w-3 h-3 text-emerald-600" />
            <span>पंक्ती जोडा</span>
          </button>
          {rows.length > 0 && (
            <button
              type="button"
              onClick={clearAllRows}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 font-medium text-xs rounded-lg border border-rose-200 shadow-2xs transition cursor-pointer"
              title="सर्व पंक्ती रिकाम्या करा"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
              <span>साफ करा</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className="p-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* =========================================================================
          AUTHENTIC REVENUE REGISTER TABLE (EXACT MATCH TO IMAGE 2)
          Format:
          - Row 1: Centered title "रिनंबरिंग पर्चा"
          - Row 2: "गावाचे नाव - ..." (Left) | "तालुक्याचे नाव - ..." (Right)
          - Row 3: चालू सर्व्हे क्रमांक | बंदोबस्त नंबर | एकत्रीकरण नंबर | पुनर्मोजणी नंबर
          - Data Rows
      ========================================================================= */}
      <div className="bg-white border border-slate-900 rounded-xl p-3 sm:p-5 shadow-xs">
        <div className="w-full max-w-4xl mx-auto space-y-2">

          {/* Unified Register Table */}
          <div className="border border-black bg-white">
            
            {/* Header Row 1: Title (Centered, across all 4 columns) */}
            <div className="border-b border-black py-2 text-center font-bold text-base sm:text-lg text-slate-900 tracking-wide bg-slate-50/70">
              रिनंबरिंग पर्चा
            </div>

            {/* Header Row 2: Jurisdiction (गावाचे नाव & तालुक्याचे नाव) */}
            <div className="border-b border-black grid grid-cols-2 divide-x divide-black bg-white text-xs sm:text-sm">
              <div className="p-1.5 px-3 flex items-center gap-1.5 font-bold text-slate-900">
                <span className="shrink-0">गावाचे नाव -</span>
                <input
                  type="text"
                  value={header.villageName}
                  onChange={(e) => handleHeaderChange('villageName', e.target.value)}
                  placeholder={hasVillageSelected ? '' : 'गाव प्रविष्ट करा...'}
                  className="w-full px-1.5 py-0.5 text-slate-900 font-semibold focus:outline-none focus:bg-amber-50 rounded"
                />
              </div>
              <div className="p-1.5 px-3 flex items-center gap-1.5 font-bold text-slate-900">
                <span className="shrink-0">तालुक्याचे नाव -</span>
                <input
                  type="text"
                  value={header.taluka}
                  onChange={(e) => handleHeaderChange('taluka', e.target.value)}
                  placeholder={hasVillageSelected ? '' : 'तालुका प्रविष्ट करा...'}
                  className="w-full px-1.5 py-0.5 text-slate-900 font-semibold focus:outline-none focus:bg-amber-50 rounded"
                />
              </div>
            </div>

            {/* Header Row 3: 4 Column Names */}
            <div className="border-b border-black grid grid-cols-4 divide-x divide-black bg-slate-50 font-bold text-xs sm:text-sm text-slate-900 text-center">
              <div className="py-2 px-1 flex items-center justify-center">
                चालू सर्व्हे क्रमांक
              </div>
              <div className="py-2 px-1 flex items-center justify-center">
                बंदोबस्त नंबर
              </div>
              <div className="py-2 px-1 flex items-center justify-center">
                एकत्रीकरण नंबर
              </div>
              <div className="py-2 px-1 flex items-center justify-center">
                पुनर्मोजणी नंबर
              </div>
            </div>

            {/* Data Rows */}
            {rows.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 text-xs sm:text-sm">
                {hasVillageSelected ? (
                  <span>या गावासाठी रिनंबरिंग अभिलेख उपलब्ध नाहीत.</span>
                ) : (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-slate-600">कोणतेही गाव निवडलेले नाही.</p>
                    <p className="text-[11px] text-slate-400">
                      कृपया वरील फिल्टरमधून तालुका व गाव निवडून 'लागू करा' वर क्लिक करा.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-black font-sans text-xs sm:text-sm">
                {rows.map((row, idx) => (
                  <div
                    key={row.id || idx}
                    className="grid grid-cols-4 divide-x divide-black group hover:bg-amber-50/30 transition relative"
                  >
                    {/* Col 1: चालू सर्व्हे क्रमांक */}
                    <div className="p-0.5">
                      <input
                        type="text"
                        value={row.chaluSurveyNo || ''}
                        onChange={(e) => handleCellChange(idx, 'chaluSurveyNo', e.target.value)}
                        placeholder=""
                        className="w-full text-center py-1.5 px-1 text-slate-900 font-semibold focus:outline-none focus:bg-amber-100/60 rounded"
                      />
                    </div>

                    {/* Col 2: बंदोबस्त नंबर */}
                    <div className="p-0.5">
                      <input
                        type="text"
                        value={row.bandobastNo || ''}
                        onChange={(e) => handleCellChange(idx, 'bandobastNo', e.target.value)}
                        placeholder=""
                        className="w-full text-center py-1.5 px-1 text-slate-900 font-semibold focus:outline-none focus:bg-amber-100/60 rounded"
                      />
                    </div>

                    {/* Col 3: एकत्रीकरण नंबर */}
                    <div className="p-0.5">
                      <input
                        type="text"
                        value={row.ekatrikaranNo || ''}
                        onChange={(e) => handleCellChange(idx, 'ekatrikaranNo', e.target.value)}
                        placeholder=""
                        className="w-full text-center py-1.5 px-1 text-slate-900 font-semibold focus:outline-none focus:bg-amber-100/60 rounded"
                      />
                    </div>

                    {/* Col 4: पुनर्मोजणी नंबर */}
                    <div className="p-0.5 relative">
                      <input
                        type="text"
                        value={row.punarmajaniNo || ''}
                        onChange={(e) => handleCellChange(idx, 'punarmajaniNo', e.target.value)}
                        placeholder=""
                        className="w-full text-center py-1.5 px-1 text-slate-900 font-semibold focus:outline-none focus:bg-amber-100/60 rounded"
                      />

                      {/* Row Actions on hover */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-white shadow-xs border border-slate-300 rounded p-0.5 z-10">
                        <button
                          type="button"
                          onClick={() => insertRowAt(idx)}
                          className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="खाली नवीन पंक्ती जोडा"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRow(idx)}
                          className="p-0.5 text-rose-600 hover:bg-rose-50 rounded"
                          title="ही पंक्ती वगळा"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Details */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1">
            <div>
              एकूण नोंदवही पंक्ती: <span className="font-bold text-slate-800">{rows.length}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              जिल्हाधिकारी कार्यालय, चंद्रपूर • महसूल अभिलेख व रिनंबरिंग शाखा
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
