'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import SearchableSelect from '../../components/SearchableSelect';

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState('prapatra'); // 'prapatra' | 'parcel'
  const [selectedTaluka, setSelectedTaluka] = useState('Warora');
  const [villageName, setVillageName] = useState('');
  
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
      setError('कृपया किमान एक १ ते ४५ प्रपत्र (.xlsx) फाईल निवडा.');
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
      setError(err.message || 'प्रपत्र एक्सेल आयात अयशस्वी झाले.');
    } finally {
      setUploading(false);
    }
  };

  const handleParcelSubmit = async (e) => {
    e.preventDefault();
    if (!parcelFile) {
      setError('कृपया प्रथम नमुना एक्सेल (.xlsx) फाईल निवडा.');
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
      setError(err.message || 'एक्सेल आयात अयशस्वी');
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
    <div className="space-y-4 sm:space-y-6">
      {/* Sleek Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                महसूल अभिलेख व गाव नमुना डेटा आयात
              </h1>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                स्वयंचलित सिडिंग (Full Seeding)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              १ ते ४५ तपासणी प्रपत्रे किंवा कच्च्या भूखंड यादीचे थेट भूखंड नोंदवहीत रूपांतर व स्वयंचलित कायदेशीर प्रकरणे निर्मिती
            </p>
          </div>
        </div>

        {activeTab === 'parcel' && (
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <a
              href={api.getSampleTemplateUrl()}
              download="गाव_नमुना_नोंदणी.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-2xs active:scale-95"
              title="नमुना एक्सेल डाऊनलोड"
            >
              <Download className="w-3.5 h-3.5" />
              <span>नमुना एक्सेल डाऊनलोड</span>
            </a>
          </div>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => {
            setActiveTab('prapatra');
            clearForm();
          }}
          className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'prapatra'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>१ ते ४५ तपासणी प्रपत्र (Official Revenue Booklet)</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
            शिफारस केलेले
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('parcel');
            clearForm();
          }}
          className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'parcel'
              ? 'border-blue-600 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>गाव भूखंड यादी नमुना (8-Column Parcel List)</span>
        </button>
      </div>

      {/* Main Upload Body */}
      {activeTab === 'prapatra' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
          {/* Informational Guidance */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">१ ते ४५ तपासणी प्रपत्र अपलोड वैशिष्ट्ये:</p>
              <p className="text-slate-600 leading-relaxed">
                तलाठी व तहसील कार्यालयाकडील अधिकृत <strong>१ ते ४५ मुद्दे एक्सेल पत्रक</strong> अपलोड करा. प्रणाली आपोआप सर्व ४५ स्तंभ तपासून:
                (१) प्रपत्र १ ते १७ ची <strong>गाव व तालुका बेरीज (Rollup)</strong> अद्ययावत करेल,
                (२) <strong>भूखंड नोंदवहीत (Land Parcels)</strong> अचूक नोंदी करेल,
                (३) अतिक्रमण, शर्तभंग व पोकळीस्त नोंदींची <strong>कायदेशीर प्रकरणे (Cases)</strong> स्वयंचलित तयार करेल, आणि
                (४) <strong>१९५० मूळ हक्क इतिहास (Provenance)</strong> जतन करेल.
              </p>
            </div>
          </div>

          <form onSubmit={handlePrapatraSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  तालुका निवडा <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={CHANDRAPUR_TALUKAS.map((t) => ({
                    value: t.id,
                    label: `${t.nameMr} (${t.nameEn})`
                  }))}
                  value={selectedTaluka}
                  onChange={(val) => setSelectedTaluka(val)}
                  placeholder="तालुका निवडा..."
                  searchPlaceholder="तालुका शोधा..."
                  icon={Building2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  गावाचे नाव (पर्यायी - एकाच फाईलसाठी)
                </label>
                <input
                  type="text"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  placeholder="उदा. कोसरसार (रिकामे ठेवल्यास एक्सेल फाईलमधून स्वयंचलित ओळखले जाईल)"
                  disabled={prapatraFiles.length > 1}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                />
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
                  ? `${prapatraFiles.length} फाईल(्स) निवडल्या आहेत:`
                  : '१ ते ४५ प्रपत्र एक्सेल (.xlsx) फाईल येथे ड्रॅग करा किंवा निवडा'}
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
                  एकाच वेळी अनेक गावांच्या एक्सेल फाईल्स (Multi-file upload) अपलोड करणे अनुज्ञेय आहे.
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
                    <span className="text-[10px] text-slate-500 block">गावे (Villages)</span>
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {result.processedCount}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">एकूण ७/१२ (7/12)</span>
                    <span className="text-sm sm:text-base font-black text-blue-900">
                      {result.total712Added}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100" title="नोंदणीकृत स्वतंत्र गट / सर्व्हे क्रमांक">
                    <span className="text-[10px] text-slate-500 block font-bold">भूखंड नोंदणीकृत (गट/स.नं.)</span>
                    <span className="text-sm sm:text-base font-black text-emerald-700">
                      {result.totalParcelsAdded}
                    </span>
                    <span className="text-[9px] text-emerald-600 block font-medium">स्वतंत्र गट क्र.</span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">दाखल प्रकरणे</span>
                    <span className="text-sm sm:text-base font-black text-amber-700">
                      {result.totalCasesAdded}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-emerald-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block">सिस्टीम स्थिती</span>
                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                      ✓ सिडिंग पूर्ण
                    </span>
                  </div>
                </div>

                {/* Village breakdown table */}
                {result.results && result.results.length > 0 && (
                  <div className="mt-3 bg-white rounded-xl border border-emerald-200 overflow-hidden">
                    <div className="px-3 py-2 bg-emerald-100/60 font-bold text-[11px] text-emerald-950 flex justify-between items-center">
                      <span>प्रक्रिया केलेली गावे व आकडेवारी:</span>
                      <span className="text-slate-500 font-normal">तालुका: {result.taluka}</span>
                    </div>
                    <div className="divide-y divide-emerald-100 max-h-56 overflow-y-auto text-[11px]">
                      {result.results.map((r, idx) => (
                        <div key={idx} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-slate-50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-xs sm:text-sm">गाव: {r.village}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                सिडिंग पूर्ण
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                              <span>एकूण ७/१२: <strong className="text-blue-900">{r.total712}</strong></span>
                              <span>•</span>
                              <span>भूखंड नोंदणीकृत (गट/स.नं.): <strong className="text-emerald-700">{r.parcelsCount}</strong></span>
                              {r.uniqueGatCount !== undefined && r.uniqueGatCount !== r.parcelsCount && (
                                <>
                                  <span>•</span>
                                  <span>स्वतंत्र गट: <strong className="text-indigo-700">{r.uniqueGatCount}</strong></span>
                                </>
                              )}
                              <span>•</span>
                              <span>दाखल प्रकरणे: <strong className="text-amber-700">{r.casesCreated || 0}</strong></span>
                            </div>
                            {r.gatNumbersSample && r.gatNumbersSample.length > 0 && (
                              <div className="mt-1 pt-1 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-500">नोंदणीकृत गट/स.नं. उदा.:</span>
                                <div className="flex flex-wrap gap-1">
                                  {r.gatNumbersSample.map((g, gi) => (
                                    <span key={gi} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] rounded font-mono font-bold border border-emerald-200">
                                      गट {g}
                                    </span>
                                  ))}
                                  {r.uniqueGatCount > r.gatNumbersSample.length && (
                                    <span className="text-[10px] text-slate-500 font-medium px-1">
                                      +{r.uniqueGatCount - r.gatNumbersSample.length} इतर
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
                    तालुका बेरीज (Taluka Summary) व डॅशबोर्ड आलेखांमध्ये हे आकडे समाविष्ट करण्यात आले आहेत.
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 hover:text-emerald-900 underline"
                    >
                      डॅशबोर्ड पहा <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/cases"
                      className="inline-flex items-center gap-1 font-bold text-xs text-amber-800 hover:text-amber-900 underline"
                    >
                      दाखल प्रकरणे पहा <ArrowRight className="w-3.5 h-3.5" />
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
                साफ करा (Clear)
              </button>
              <button
                type="submit"
                disabled={prapatraFiles.length === 0 || uploading}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>तपासणी व सिडिंग सुरू आहे...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>१ ते ४५ प्रपत्र सिस्टीममध्ये समाविष्ट करा (Ingest & Seed)</span>
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
              <p className="font-bold">गाव भूखंड नमुना एक्सेल (8 Columns) रचना:</p>
              <p className="text-slate-600 leading-relaxed">
                अनुक्रमे स्तंभ शीर्षके: <strong>तालुका (Taluka)</strong>, <strong>गाव कोड (Village Code)</strong>, <strong>गाव नाव (Village Name)</strong>, <strong>जुना स.नं. (Old Survey)</strong>, <strong>नवा गट क्र. (Gat No.)</strong>, <strong>हिस्सा क्र. (Hissa)</strong>, <strong>क्षेत्र हेक्टर (Total Area Ha)</strong>, <strong>धारणा प्रकार (BHOGVATDAR_CLASS_1 / CLASS_2 / SARKAR_SHASAN)</strong>.
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
                {parcelFile ? parcelFile.name : 'गाव नमुना एक्सेल (.xlsx) फाईल येथे ड्रॅग करा किंवा निवडा'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {parcelFile
                  ? `फाईल आकार: ${(parcelFile.size / 1024).toFixed(1)} KB`
                  : 'कमाल आकार: २५ MB पर्यंत अनुज्ञेय'}
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
                    <span className="text-[10px] text-slate-500 block truncate">एकूण ओळी</span>
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {result.totalRowsProcessed}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-emerald-600 font-bold block truncate">नोंदणीकृत</span>
                    <span className="text-sm sm:text-base font-black text-emerald-700">
                      {result.insertedCount}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block truncate">वगळलेले (Skipped)</span>
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
                    <span>नोंदवहीत आयात केलेले भूखंड पहा</span>
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
                साफ करा (Clear)
              </button>
              <button
                type="submit"
                disabled={!parcelFile || uploading}
                className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>डेटा आयात होत आहे...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>प्रणालीमध्ये डेटा समाविष्ट करा (Import to System)</span>
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
