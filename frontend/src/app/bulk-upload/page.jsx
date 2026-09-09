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
} from 'lucide-react';
import { api } from '../../lib/api';

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('कृपया प्रथम एक्सेल (.xlsx) फाईल निवडा.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await api.uploadVillageExcel(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || 'एक्सेल आयात अयशस्वी (Upload failed)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
              स्वयंचलित अभिलेख अंतर्ग्रहण (Batch Ingestion)
            </span>
            <span className="text-xs text-slate-500 font-medium">ExcelJS Streaming Parser</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            गाव नमुना एक्सेल डेटा आयात (Raw Village Ingestion)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            तलाठी कार्यालयाकडील कच्च्या एक्सेल पत्रकाचे थेट भूखंड नोंदवहीत रूपांतर व स्वयंचलित UPI निर्मिती
          </p>
        </div>

        <a
          href={api.getSampleTemplateUrl()}
          download="गाव_नमुना_नोंदणी.xlsx"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>नमुना एक्सेल डाऊनलोड (Sample Template)</span>
        </a>
      </div>

      {/* Instructions Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
        <Info className="w-5 h-5 text-blue-800 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 space-y-1.5">
          <p className="font-bold">एक्सेल डेटा अपलोड नियमावली व स्तंभ रचना (Column Specifications):</p>
          <p className="leading-relaxed">
            एक्सेल पत्रकात पहिल्या ओळीत स्तंभ शीर्षके (Headers) असावीत. अनुक्रमे:
            <span className="font-bold"> तालुका (Taluka)</span>,
            <span className="font-bold"> गाव कोड (Village Code)</span>,
            <span className="font-bold"> गाव नाव (Village Name)</span>,
            <span className="font-bold"> जुना स.नं. (Old Survey)</span>,
            <span className="font-bold"> नवा गट क्र. (Gat No.)</span>,
            <span className="font-bold"> हिस्सा क्र. (Hissa)</span>,
            <span className="font-bold"> क्षेत्र हेक्टर (Total Area Ha)</span>,
            <span className="font-bold"> धारणा प्रकार (BHOGVATDAR_CLASS_1 / CLASS_2 / SARKAR_SHASAN)</span>.
          </p>
          <p className="text-[11px] text-blue-800 italic">
            * सिस्टीम आपोआप मानकीकृत UPI तयार करते (उदा. MH-CHA-WAR-042-0019-01) आणि आधीपासून अस्तित्वात असलेले गट वगळते (Skip Duplicates).
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleUpload} className="max-w-2xl mx-auto space-y-6">
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-700 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-blue-50/20 transition cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-12 h-12 text-blue-900 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">
              {file ? file.name : 'गाव नमुना एक्सेल (.xlsx) फाईल येथे ड्रॅग करा किंवा निवडा'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {file
                ? `फाईल आकार: ${(file.size / 1024).toFixed(1)} KB`
                : 'कमाल आकार: २५ MB पर्यंत अनुज्ञेय'}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{result.message}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-emerald-200 text-center">
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">एकूण तपासलेल्या ओळी</span>
                  <span className="text-base font-black text-slate-900">{result.totalRowsProcessed}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-emerald-600 font-bold block">यशस्वी नोंदणीकृत</span>
                  <span className="text-base font-black text-emerald-700">{result.insertedCount}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">आधीच अस्तित्वात (Skipped)</span>
                  <span className="text-base font-black text-slate-600">{result.skippedDuplicates}</span>
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
              }}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              साफ करा (Clear)
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>डेटा आयात होत आहे...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>डेटाबेसमध्ये समाविष्ट करा (Import to Neon DB)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
