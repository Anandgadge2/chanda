'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  MapPin,
  Landmark,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  UserPlus,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Building,
  Compass,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import { AshokStambhEmblem } from './GovEmblem';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

const CHANDRAPUR_BANNERS = [
  {
    image: '/images/chandrapur_collectorate.jpg',
    badge: 'जिल्हा मुख्यालय • चंद्रपूर',
    titleMr: 'जिल्हाधिकारी कार्यालय, चंद्रपूर (District Collectorate)',
    titleEn: 'Main Administrative Complex & Revenue Headquarters',
    tag: 'MLRC 1966 अपेक्स प्रशासन',
  },
  {
    image: '/images/chandrapur_fort.jpg',
    badge: 'ऐतिहासिक वारसा • चंद्रपूर',
    titleMr: 'चांदा किल्ला व ऐतिहासिक तटबंदी (Historic Chandrapur Fort)',
    titleEn: 'Heritage Ramparts & Historical Land Boundaries of Gond Kings',
    tag: 'ऐतिहासिक भूमी अभिलेख',
  },
  {
    image: '/images/tadoba_reserve.jpg',
    badge: 'नैसर्गिक जलसंपदा व वनक्षेत्र',
    titleMr: 'ताडोबा-अंधारी वनसंपदा व इरई खोरे (Tadoba & Erai Basin)',
    titleEn: 'Ecological Heritage & Irrigation Land Resource of Chandrapur',
    tag: 'गायरान व वनजमीन संरक्षण',
  },
];

export default function LandingHero({ onOpenAuth }) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const [searchTaluka, setSearchTaluka] = useState('');
  const [searchGat, setSearchGat] = useState('');

  // Auto-scrolling banner timer
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % CHANDRAPUR_BANNERS.length);
      }, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CHANDRAPUR_BANNERS.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CHANDRAPUR_BANNERS.length);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTaluka) queryParams.set('taluka', searchTaluka);
    if (searchGat) queryParams.set('query', searchGat);
    router.push(`/parcels?${queryParams.toString()}`);
  };

  const activeBanner = CHANDRAPUR_BANNERS[currentSlide];

  return (
    <section className="relative bg-gradient-to-b from-blue-50/60 via-slate-50 to-white text-slate-900 pt-8 pb-16 overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top District Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <ChandrapurDistrictLogo className="w-14 h-14 drop-shadow-sm flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  महाराष्ट्र शासन • महसूल व वन विभाग
                </span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  जिल्हा चंद्रपूर (Maharashtra)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                जिल्हाधिकारी कार्यालय, चंद्रपूर
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                जमीन महसूल संहिता (MLRC) १९६६ • १९५० मूळ शीर्षक साखळी व अर्ध-न्यायिक सुनावणी पोर्टल
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/40 shadow-xs hover:shadow-sm transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>अधिकारी लॉगिन</span>
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-xs hover:shadow-sm transition"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>डॅशबोर्ड उघडा</span>
            </Link>
          </div>
        </div>

        {/* Auto-scrolling Chandrapur Actual Photographic Banner */}
        <div
          className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950 group h-[340px] sm:h-[440px] lg:h-[480px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Banner Images Carousel */}
          {CHANDRAPUR_BANNERS.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.titleMr}
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-7000 ease-out"
              />
              {/* Subtle Gradient Overlays for High-Contrast Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent hidden sm:block" />
            </div>
          ))}

          {/* Banner Slide Content Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                  {activeBanner.badge}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/30 text-white">
                  {activeBanner.tag}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                {activeBanner.titleMr}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 drop-shadow-sm font-medium">
                {activeBanner.titleEn}
              </p>
            </div>

            {/* Carousel Navigation Buttons & Indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {CHANDRAPUR_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={handlePrevSlide}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 transition"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 transition"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Action Center in Premium Light Glassmorphism */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Search className="w-3.5 h-3.5 text-blue-700" />
              <span>चंद्रपूर जिल्हा भूखंड शोध व ३६०° साखळी (Land Intelligence Search)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              जिल्ह्यातील कोणत्याही भूखंडाची १९५० साखळी व कायदेशीर स्थिती त्वरित शोधा
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              गट क्रमांक, सर्व्हे नंबर अथवा गावनिहाय शोध घेऊन भोगवटादार वर्ग, आदिवासी जमीन निर्बंध (कलम ३६/३६अ), आणि SDO सुनावणी खटल्यांची माहिती मिळवा.
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2.5"
          >
            <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-1 border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <MapPin className="w-4 h-4 text-blue-900 mr-2 flex-shrink-0" />
              <select
                value={searchTaluka}
                onChange={(e) => setSearchTaluka(e.target.value)}
                className="w-full py-2 text-xs font-semibold bg-transparent focus:outline-none text-slate-800"
              >
                <option value="">सर्व तालुके (All 15 Talukas)</option>
                {CHANDRAPUR_TALUKAS.map((t) => (
                  <option key={t.id} value={t.id}>
                    तालुका {t.nameMr} ({t.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-1 border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchGat}
                onChange={(e) => setSearchGat(e.target.value)}
                placeholder="गट क्र. / सर्व्हे नंबर / गाव नाव प्रविष्ट करा..."
                className="w-full py-2 text-xs font-medium bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <span>शोधा (Search 7/12)</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </form>

          {/* Quick Action Navigation CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition flex items-center gap-2"
            >
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>महसूल अधिकारी डॅशबोर्ड</span>
            </Link>

            <Link
              href="/parcels"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>भूखंड नोंदवही (७/१२ साखळी)</span>
            </Link>

            <Link
              href="/reports"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>प्रपत्र-३ अहवाल डाऊनलोड</span>
            </Link>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition flex items-center gap-2 ml-auto"
            >
              <Lock className="w-4 h-4 text-amber-800" />
              <span>अधिकारी थेट प्रवेश</span>
            </button>
          </div>
        </div>

        {/* Real-time District Metrics Cards in Crisp Light Theme */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 flex-shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">१५</p>
              <p className="text-xs font-bold text-slate-800">प्रशासकीय तालुके</p>
              <p className="text-[11px] text-slate-500">चंद्रपूर जिल्हा महसूल मंडळे</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">१,४८२</p>
              <p className="text-xs font-bold text-slate-800">महसूल गावे</p>
              <p className="text-[11px] text-slate-500">एक्सेल डेटा अंतर्ग्रहण सक्षम</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">१९५०</p>
              <p className="text-xs font-bold text-slate-800">मूळ शीर्षक साखळी</p>
              <p className="text-[11px] text-slate-500">बु.ग.दे. व ता.ग.दे. पडताळणी</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">२४x७</p>
              <p className="text-xs font-bold text-slate-800">डिजिटल संनियंत्रण</p>
              <p className="text-[11px] text-slate-500">MLRC १९६६ वैधानिक अंमलबजावणी</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
