'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  Scale,
  MapPin,
  FolderArchive,
  ArrowRight,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Lock,
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

export default function LandingHero({ onOpenAuth }) {
  const router = useRouter();
  const [searchTaluka, setSearchTaluka] = useState('');
  const [searchGat, setSearchGat] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTaluka) queryParams.set('taluka', searchTaluka);
    if (searchGat) queryParams.set('query', searchGat);
    router.push(`/parcels?${queryParams.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Background Decorative Mesh & Glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Government Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>महाराष्ट्र शासन • MLRC १९६६ महसूल व भूमी अभिलेख प्रणाली</span>
            <span className="text-amber-200/60 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-white/90">जिल्हाधिकारी कार्यालय, चंद्रपूर</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            चंद्रपूर जिल्हा जमीन अभिलेख व{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
              महसूल संनियंत्रण
            </span>{' '}
            महापोर्टल
          </h1>

          {/* Subtitle with MLRC Mandate */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ अंतर्गत गावातील एक्सेल नोंदींचे स्वयंचलित पृथक्करण,{' '}
            <strong className="text-amber-300 font-semibold">१९५० मूळ शीर्षक साखळी (Backward Trace)</strong>,{' '}
            कलम ३६/३६अ आदिवासी जमीन संरक्षण व उपविभागीय अधिकारी (SDO) अर्ध-न्यायिक सुनावणी व्यवस्थापन.
          </p>

          {/* Quick Parcel / Gat Number Search Box */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 flex items-center bg-white/95 rounded-xl px-3 text-slate-900">
                <MapPin className="w-4 h-4 text-blue-900 mr-2 flex-shrink-0" />
                <select
                  value={searchTaluka}
                  onChange={(e) => setSearchTaluka(e.target.value)}
                  className="w-full py-2.5 text-xs font-semibold bg-transparent focus:outline-none text-slate-800"
                >
                  <option value="">सर्व तालुके (All 15 Talukas)</option>
                  {CHANDRAPUR_TALUKAS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameMr} ({t.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex items-center bg-white/95 rounded-xl px-3 text-slate-900">
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchGat}
                  onChange={(e) => setSearchGat(e.target.value)}
                  placeholder="गट क्र. / सर्व्हे / गाव नाव प्रविष्ट करा..."
                  className="w-full py-2.5 text-xs font-medium bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <span>शोधा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 transition flex items-center gap-2"
            >
              <Landmark className="w-4 h-4 text-amber-300" />
              <span>महसूल अधिकारी डॅशबोर्ड उघडा</span>
            </Link>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>अधिकारी थेट लॉगिन</span>
            </button>

            <Link
              href="/parcels"
              className="px-5 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>भूखंड नोंदवही (७/१२ Trace)</span>
            </Link>
          </div>

          {/* District Real-Time Metrics Badges */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">१५</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5">प्रशासकीय तालुके</p>
              <p className="text-[10px] text-slate-400">चंद्रपूर जिल्हा महसूल मंडळे</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-sky-400">१,४८२</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5">महसूल गावे</p>
              <p className="text-[10px] text-slate-400">एक्सेल डेटा अंतर्ग्रहण सक्षम</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">१९५०</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5">मूळ शीर्षक साखळी</p>
              <p className="text-[10px] text-slate-400">बु.ग.दे. व ता.ग.दे. पडताळणी</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-indigo-400">२४x७</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5">डिजिटल अभिलेखागार</p>
              <p className="text-[10px] text-slate-400">रॅक व फाईल स्कॅन DMS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
