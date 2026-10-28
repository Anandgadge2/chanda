'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
  Building2,
  FolderArchive,
  History,
  FileText,
  LandPlot,
} from 'lucide-react';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import SearchableSelect from '../../components/SearchableSelect';
import { useTranslation } from '../../components/LanguageContext';
import { formatVillageName } from '../../lib/villageUtils';

export default function BulkUploadPage() {
  const { isMarathi } = useTranslation();
  const [activeTab, setActiveTab] = useState('prapatra'); // 'prapatra' | 'parcel'
  const [selectedTaluka, setSelectedTaluka] = useState('Warora');
  const [villageName, setVillageName] = useState('');
  const [villagesList, setVillagesList] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchVillages() {
      if (!selectedTaluka) return;
      setLoadingVillages(true);
      try {
        const res = await api.getTalukaVillages(selectedTaluka);
        if (isMounted && res.success && Array.isArray(res.villages)) {
          setVillagesList(res.villages);
        }
      } catch (err) {
        console.warn('Could not load villages for', selectedTaluka, err);
      } finally {
        if (isMounted) setLoadingVillages(false);
      }
    }
    fetchVillages();
    return () => { isMounted = false; };
  }, [selectedTaluka]);

  const villageOptions = useMemo(() => {
    return [
      {
        value: '',
        label: isMarathi
          ? (loadingVillages
              ? 'गावांची यादी लोड होत आहे...'
              : villagesList.length > 0
              ? `गाव निवडा (${villagesList.length} गावे उपलब्ध)`
              : 'गाव निवडा (पर्यायी)')
          : (loadingVillages
              ? 'Loading villages...'
              : villagesList.length > 0
              ? `Select Village (${villagesList.length} available)`
              : 'Select Village (Optional)')
      },
      ...villagesList.map((v) => {
        const vName = typeof v === 'object' ? (v.villageName || v.name) : v;
        const count = typeof v === 'object' && v.total712Count ? `${v.total712Count}` : undefined;
        return {
          value: vName,
          label: formatVillageName(vName, isMarathi),
          count
        };
      })
    ];
  }, [villagesList, isMarathi, loadingVillages]);
  
  // Prapatra state
  const [prapatraFiles, setPrapatraFiles] = useState([]);
  
  // Simple parcel state
  const [parcelFile, setParcelFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePrapatraFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setPrapatraFiles(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleParcelFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setParcelFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handlePrapatraSubmit = async (e) => {
    e.preventDefault();
    if (!prapatraFiles || prapatraFiles.length === 0) {
      setError(isMarathi ? 'कृपया किमान एक १ ते ४५ प्रपत्र (.xlsx) फाईल निवडा.' : 'Please select at least one 1 to 45 Prapatra (.xlsx) file.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('taluka', selectedTaluka);
    if (villageName.trim() && prapatraFiles.length === 1) {
      formData.append('villageName', villageName.trim());
    }

    prapatraFiles.forEach((f) => {
      formData.append('files', f);
    });

    try {
      const data = await api.uploadPrapatraExcel(formData);
      setResult({ ...data, mode: 'prapatra' });
    } catch (err) {
      setError(err.message || (isMarathi ? 'प्रपत्र एक्सेल आयात अयशस्वी झाले.' : 'Failed to import Prapatra Excel.'));
    } finally {
      setUploading(false);
    }
  };

  const handleParcelSubmit = async (e) => {
    e.preventDefault();
    if (!parcelFile) {
      setError(isMarathi ? 'कृपया प्रथम नमुना एक्सेल (.xlsx) फाईल निवडा.' : 'Please select a sample Excel (.xlsx) file first.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', parcelFile);

    try {
      const data = await api.uploadVillageExcel(formData);
      setResult({ ...data, mode: 'parcel' });
    } catch (err) {
      setError(err.message || (isMarathi ? 'एक्सेल आयात अयशस्वी' : 'Excel import failed.'));
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    setPrapatraFiles([]);
    setParcelFile(null);
    setVillageName('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Executive Command Hero Header - Pro Compact */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-emerald-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 text-white shadow-2xs">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                {isMarathi ? 'महसूल अभिलेख व गाव नमुना डेटा आयात' : 'Revenue Records & Village Data Ingestion'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                {isMarathi ? 'स्वयंचलित सिडिंग' : 'Automated Seeding'}
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-medium">
                {isMarathi
                  ? '• १ ते ४५ तपासणी प्रपत्रे किंवा कच्च्या भूखंड यादीचे थेट रूपांतर'
                  : '• Ingestion of Checkpoints 1 to 45 booklets or raw parcel registers'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 md:hidden truncate font-medium">
              {isMarathi
                ? '१ ते ४५ तपासणी प्रपत्रे किंवा कच्च्या भूखंड यादीचे थेट रूपांतर'
                : 'Ingestion of Checkpoints 1 to 45 booklets or raw parcel registers'}
            </p>
          </div>
        </div>

        {activeTab === 'parcel' && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <a
              href={api.getSampleTemplateUrl()}
              download="गाव_नमुना_नोंदणी.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
              title={isMarathi ? 'नमुना एक्सेल डाऊनलोड' : 'Download Sample Excel'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'नमुना एक्सेल डाऊनलोड' : 'Download Sample'}</span>
            </a>
          </div>
        )}
      </div>

      {/* Modern Segmented Tabs Selector */}
      <div className="flex flex-col sm:inline-flex sm:flex-row p-1 rounded-2xl bg-slate-200/60 backdrop-blur-md border border-slate-300/60 gap-1.5 shadow-2xs w-full sm:w-auto">
        <button
          onClick={() => {
            setActiveTab('prapatra');
            clearForm();
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto ${
            activeTab === 'prapatra'
              ? 'bg-white text-emerald-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <FolderArchive className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="truncate">
            {isMarathi
              ? '१ ते ४५ तपासणी प्रपत्र (Official Revenue Booklet)'
              : '1 to 45 Checkpoint Audit Booklet (Official)'}
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold shrink-0">
            {isMarathi ? 'शिफारस' : 'Recommended'}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('parcel');
            clearForm();
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto ${
            activeTab === 'parcel'
              ? 'bg-white text-blue-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="truncate">
            {isMarathi
              ? 'गाव भूखंड यादी नमुना (8-Column Parcel List)'
              : 'Village Parcel List (8-Column Format)'}
          </span>
        </button>
      </div>

      {/* Main Upload Body */}
      {activeTab === 'prapatra' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
          {/* Informational Guidance */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                {isMarathi ? '१ ते ४५ तपासणी प्रपत्र अपलोड वैशिष्ट्ये:' : 'Checkpoints 1-45 Booklet Upload Features:'}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {isMarathi ? (
                  <>
                    तलाठी व तहसील कार्यालयाकडील अधिकृत <strong>१ ते ४५ मुद्दे एक्सेल पत्रक</strong> अपलोड करा. प्रणाली आपोआप सर्व ४५ स्तंभ तपासून:
                    (१) प्रपत्र १ ते १७ ची <strong>गाव व तालुका बेरीज (Rollup)</strong> अद्ययावत करेल,
                    (२) <strong>भूखंड नोंदवहीत (Land Parcels)</strong> अचूक नोंदी करेल,
                    (३) अतिक्रमण, शर्तभंग व पोकळीस्त नोंदींची <strong>कायदेशीर प्रकरणे (Cases)</strong> स्वयंचलित तयार करेल, आणि
                    (४) <strong>१९५० मूळ हक्क इतिहास (Provenance)</strong> जतन करेल.
                  </>
                ) : (
                  <>
                    Upload official <strong>Checkpoints 1-45 Excel booklets</strong> received from Talathi and Tehsil offices. The system verifies all 45 columns to:
                    (1) compute <strong>Village and Taluka Rollups</strong> for Booklets 1 to 17,
                    (2) seed accurate entries in the <strong>Land Parcels Register</strong>,
                    (3) automatically register <strong>Quasi-Judicial Cases</strong> for breaches and encroachments, and
                    (4) preserve the <strong>1950 Provenance and Title Chain</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handlePrapatraSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isMarathi ? 'तालुका निवडा' : 'Select Taluka'} <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={CHANDRAPUR_TALUKAS.map((t) => ({
                    value: t.id,
                    label: isMarathi ? `तालुका ${t.nameMr}` : `${t.nameEn} Taluka`
                  }))}
                  value={selectedTaluka}
                  onChange={(val) => {
                    setSelectedTaluka(val);
                    setVillageName('');
                  }}
                  placeholder={isMarathi ? 'तालुका निवडा...' : 'Select Taluka...'}
                  searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
                  icon={Building2}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isMarathi ? 'गावाचे नाव (पर्यायी - एकाच फाईलसाठी)' : 'Village Name (Optional - single file only)'}
                  </label>
                  {villagesList.length > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      {isMarathi ? `${villagesList.length} गावे उपलब्ध` : `${villagesList.length} villages`}
                    </span>
                  )}
                </div>
                <SearchableSelect
                  options={villageOptions}
                  value={villageName}
                  onChange={(val) => setVillageName(!val || val === 'all' ? '' : val)}
                  placeholder={
                    loadingVillages
                      ? (isMarathi ? 'गावांची यादी लोड होत आहे...' : 'Loading villages...')
                      : (isMarathi ? 'उदा. कोसरसार (यादीतून निवडा किंवा शोधा)' : 'e.g. Kosarsar (select or search)')
                  }
                  searchPlaceholder={isMarathi ? 'गाव शोधा किंवा नाव टाईप करा...' : 'Search village or type name...'}
                  icon={LandPlot}
                  disabled={prapatraFiles.length > 1}
                  allowCustom={true}
                  clearValue=""
                  showCount={true}
                />
                {prapatraFiles.length > 1 ? (
                  <p className="text-[10px] text-amber-700 font-medium mt-1">
                    {isMarathi
                      ? 'अनेक फाईल्स निवडल्यामुळे गावाचे नाव प्रत्येक फाईलमधून आपोआप ओळखले जाईल.'
                      : 'Village names will be auto-detected per file for multi-file upload.'}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    {isMarathi
                      ? 'फक्त एका फाईलसाठी गाव निश्चित करायचे असल्यास यादीतून निवडा किंवा शोधा.'
                      : 'Select village if uploading a single file for an explicit village.'}
                  </p>
                )}
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-2xl p-6 sm:p-8 text-center bg-emerald-50/20 hover:bg-emerald-50/40 transition cursor-pointer relative">
              <input
                type="file"
                multiple
                accept=".xlsx,.xls"
                onChange={handlePrapatraFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-800 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {prapatraFiles.length > 0
                  ? isMarathi
                    ? `${prapatraFiles.length} फाईल(्स) निवडल्या आहेत:`
                    : `${prapatraFiles.length} file(s) selected:`
                  : isMarathi
                  ? '१ ते ४५ प्रपत्र एक्सेल (.xlsx) फाईल येथे ड्रॅग करा किंवा निवडा'
                  : 'Drag or select 1 to 45 Prapatra Excel (.xlsx) files here'}
              </p>
              {prapatraFiles.length > 0 ? (
                <div className="mt-2 max-h-24 overflow-y-auto text-[11px] text-emerald-900 space-y-0.5">
                  {prapatraFiles.map((f, idx) => (
                    <div key={idx} className="truncate">
                      📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  {isMarathi
                    ? 'एकाच वेळी अनेक गावांच्या एक्सेल फाईल्स (Multi-file upload) अपलोड करणे अनुज्ञेय आहे.'
                    : 'Multi-file upload across multiple villages is supported.'}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && result.mode === 'prapatra' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{result.message}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 pt-2 border-t border-emerald-200 text-center">
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">
                      {isMarathi ? 'गावे' : 'Villages'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {result.processedCount}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">
                      {isMarathi ? 'एकूण ७/१२' : 'Total 7/12'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-blue-900">
                      {result.total712Added}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100" title={isMarathi ? 'नोंदणीकृत स्वतंत्र गट / सर्व्हे क्रमांक' : 'Registered distinct Gat / Survey numbers'}>
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {isMarathi ? 'भूखंड नोंदणीकृत (गट/स.नं.)' : 'Parcels Registered'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-700">
                      {result.totalParcelsAdded}
                    </span>
                    <span className="text-[9px] text-emerald-600 block font-medium">
                      {isMarathi ? 'स्वतंत्र गट क्र.' : 'Unique Gat Nos.'}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">
                      {isMarathi ? 'दाखल प्रकरणे' : 'Cases Filed'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-amber-700">
                      {result.totalCasesAdded}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block">
                      {isMarathi ? 'सिस्टीम स्थिती' : 'System Status'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                      {isMarathi ? '✓ सिडिंग पूर्ण' : '✓ Seeding Done'}
                    </span>
                  </div>
                </div>

                {/* Village breakdown table */}
                {result.results && result.results.length > 0 && (
                  <div className="mt-3 bg-white rounded-xl border border-emerald-200 overflow-hidden">
                    <div className="px-3 py-2 bg-emerald-100/60 font-bold text-[11px] text-emerald-950 flex justify-between items-center">
                      <span>{isMarathi ? 'प्रक्रिया केलेली गावे व आकडेवारी:' : 'Processed Villages & Ingestion Statistics:'}</span>
                      <span className="text-slate-500 font-normal">
                        {isMarathi ? `तालुका: ${result.taluka}` : `Taluka: ${result.taluka}`}
                      </span>
                    </div>
                    <div className="divide-y divide-emerald-100 max-h-56 overflow-y-auto text-[11px]">
                      {result.results.map((r, idx) => (
                        <div key={idx} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-slate-50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900 text-xs sm:text-sm">
                                {isMarathi ? `गाव: ${r.village}` : `Village: ${formatVillageName(r.village, false)}`}
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                {isMarathi ? 'सिडिंग पूर्ण' : 'Seeded'}
                              </span>
                              {r.detectedLayout && (
                                <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                                  {r.detectedLayout === 'dual_area'
                                    ? (isMarathi ? '✓ कृषक + अकृषक क्षेत्र' : '✓ Agri + NA Area')
                                    : (isMarathi ? '✓ एकल क्षेत्र' : '✓ Single Area')}
                                </span>
                              )}
                              {r.sheetCount > 1 && (
                                <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold">
                                  {isMarathi ? `✓ ${r.sheetCount} शीट्स तपासल्या` : `✓ ${r.sheetCount} Sheets Parsed`}
                                </span>
                              )}
                              {r.auditArchive && (
                                <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1" title={r.auditArchive}>
                                  ☁️ {isMarathi ? `GCP क्लाऊड आर्काइव्ह: ${r.gcsPath ? r.gcsPath.split('/').pop() : 'जतन केले'}` : `GCP Archive: ${r.gcsPath ? r.gcsPath.split('/').pop() : 'Archived'}`}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                              <span>{isMarathi ? 'एकूण ७/१२: ' : 'Total 7/12: '}<strong className="text-blue-900">{r.total712}</strong></span>
                              <span>•</span>
                              <span>{isMarathi ? 'भूखंड नोंदणीकृत (गट/स.नं.): ' : 'Parcels Registered: '}<strong className="text-emerald-700">{r.parcelsCount}</strong></span>
                              {r.uniqueGatCount !== undefined && r.uniqueGatCount !== r.parcelsCount && (
                                <>
                                  <span>•</span>
                                  <span>{isMarathi ? 'स्वतंत्र गट: ' : 'Unique Gat: '}<strong className="text-indigo-700">{r.uniqueGatCount}</strong></span>
                                </>
                              )}
                              <span>•</span>
                              <span>{isMarathi ? 'दाखल प्रकरणे: ' : 'Cases Created: '}<strong className="text-amber-700">{r.casesCreated || 0}</strong></span>
                            </div>
                            {r.gatNumbersSample && r.gatNumbersSample.length > 0 && (
                              <div className="mt-1 pt-1 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-500">
                                  {isMarathi ? 'नोंदणीकृत गट/स.नं. उदा.:' : 'Registered Gat Sample:'}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {r.gatNumbersSample.map((g, gi) => (
                                    <span key={gi} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] rounded font-mono font-bold border border-emerald-200">
                                      {isMarathi ? `गट ${g}` : `Gat ${g}`}
                                    </span>
                                  ))}
                                  {r.uniqueGatCount > r.gatNumbersSample.length && (
                                    <span className="text-[10px] text-slate-500 font-medium px-1">
                                      +{r.uniqueGatCount - r.gatNumbersSample.length} {isMarathi ? 'इतर' : 'more'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap justify-between items-center gap-2">
                  <div className="text-[11px] text-slate-600">
                    {isMarathi
                      ? 'तालुका बेरीज (Taluka Summary) व डॅशबोर्ड आलेखांमध्ये हे आकडे समाविष्ट करण्यात आले आहेत.'
                      : 'These metrics have been incorporated into Taluka summaries and dashboard analytics.'}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 hover:text-emerald-900 underline"
                    >
                      {isMarathi ? 'डॅशबोर्ड पहा' : 'View Dashboard'} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/cases"
                      className="inline-flex items-center gap-1 font-bold text-xs text-amber-800 hover:text-amber-900 underline"
                    >
                      {isMarathi ? 'दाखल प्रकरणे पहा' : 'View Cases'} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={clearForm}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {isMarathi ? 'साफ करा (Clear)' : 'Clear'}
              </button>
              <button
                type="submit"
                disabled={prapatraFiles.length === 0 || uploading}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isMarathi ? 'तपासणी व सिडिंग सुरू आहे...' : 'Ingesting and seeding data...'}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>{isMarathi ? '१ ते ४५ प्रपत्र सिस्टीममध्ये समाविष्ट करा (Ingest & Seed)' : 'Ingest & Seed Booklets'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Simple 8-Column Parcel List Upload */
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                {isMarathi ? 'गाव भूखंड नमुना एक्सेल (8 Columns) रचना:' : 'Village Parcel List Excel (8 Columns) Layout:'}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {isMarathi ? (
                  <>अनुक्रमे स्तंभ शीर्षके: <strong>तालुका</strong>, <strong>गाव कोड</strong>, <strong>गाव नाव</strong>, <strong>जुना स.नं.</strong>, <strong>नवा गट क्र.</strong>, <strong>हिस्सा क्र.</strong>, <strong>क्षेत्र हेक्टर</strong>, <strong>धारणा प्रकार</strong>.</>
                ) : (
                  <>Column headers in order: <strong>Taluka</strong>, <strong>Village Code</strong>, <strong>Village Name</strong>, <strong>Old Survey No.</strong>, <strong>New Gat No.</strong>, <strong>Hissa No.</strong>, <strong>Total Area in Ha</strong>, <strong>Tenure Class</strong>.</>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleParcelSubmit} className="space-y-5">
            <div className="border-2 border-dashed border-blue-300 hover:border-blue-600 rounded-2xl p-6 sm:p-8 text-center bg-blue-50/20 hover:bg-blue-50/40 transition cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleParcelFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-blue-900 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {parcelFile
                  ? parcelFile.name
                  : isMarathi
                  ? 'गाव नमुना एक्सेल (.xlsx) फाईल येथे ड्रॅग करा किंवा निवडा'
                  : 'Drag or select Parcel Excel (.xlsx) file here'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {parcelFile
                  ? isMarathi
                    ? `फाईल आकार: ${(parcelFile.size / 1024).toFixed(1)} KB`
                    : `File size: ${(parcelFile.size / 1024).toFixed(1)} KB`
                  : isMarathi
                  ? 'कमाल आकार: २५ MB पर्यंत अनुज्ञेय'
                  : 'Max size: up to 25 MB supported'}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && result.mode === 'parcel' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-300 text-xs text-blue-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span>{result.message}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-blue-200 text-center">
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block truncate">
                      {isMarathi ? 'एकूण ओळी' : 'Total Rows'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {result.totalRowsProcessed}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-emerald-600 font-bold block truncate">
                      {isMarathi ? 'नोंदणीकृत' : 'Registered'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-700">
                      {result.insertedCount}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block truncate">
                      {isMarathi ? 'वगळलेले (Skipped)' : 'Skipped (Duplicates)'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-600">
                      {result.skippedDuplicates}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <Link
                    href="/parcels"
                    className="inline-flex items-center gap-1 font-bold text-xs text-blue-900 hover:text-blue-700"
                  >
                    <span>{isMarathi ? 'नोंदवहीत आयात केलेले भूखंड पहा' : 'View imported parcels in register'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={clearForm}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {isMarathi ? 'साफ करा (Clear)' : 'Clear'}
              </button>
              <button
                type="submit"
                disabled={!parcelFile || uploading}
                className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isMarathi ? 'डेटा आयात होत आहे...' : 'Importing data...'}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>{isMarathi ? 'प्रणालीमध्ये डेटा समाविष्ट करा (Import to System)' : 'Import to System'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
