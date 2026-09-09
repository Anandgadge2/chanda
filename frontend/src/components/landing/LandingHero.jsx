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
  FileSpreadsheet,
  Building,
  Compass,
  Sparkles,
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

const CHANDRAPUR_BANNERS = [
  {
    image: '/images/chandrapur_collectorate.jpg',
    badge: 'जिल्हा मुख्यालय • चंद्रपूर',
    titleMr: 'जिल्हाधिकारी कार्यालय, चंद्रपूर (District Collectorate)',
    titleEn: 'Main Administrative Complex & Revenue Headquarters of Chandrapur District',
    tag: 'MLRC १९६६ अपेक्स प्रशासन',
  },
  {
    image: '/images/chandrapur_fort.jpg',
    badge: 'ऐतिहासिक वारसा • चंद्रपूर',
    titleMr: 'चांदा किल्ला व ऐतिहासिक तटबंदी (Historic Chandrapur Fort)',
    titleEn: 'Heritage Ramparts & Historical Land Boundaries of Gond Dynasty',
    tag: 'ऐतिहासिक भूमी अभिलेख',
  },
  {
    image: '/images/tadoba_reserve.jpg',
    badge: 'नैसर्गिक जलसंपदा व वनक्षेत्र',
    titleMr: 'ताडोबा-अंधारी वनसंपदा व इरई खोरे (Tadoba & Erai Basin)',
    titleEn: 'Ecological Heritage & Irrigation Land Resources of Chandrapur',
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

  // Auto-scrolling banner timer (5s)
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
    <section
      id="search-section"
      className="relative bg-gradient-to-b from-blue-50/30 via-slate-50 to-white text-slate-900 pt-4 pb-8 overflow-hidden border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        {/* Full-Width Grand Photographic District Banner */}
        <div
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-950 group h-[270px] sm:h-[380px] lg:h-[440px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel Images */}
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
                className="w-full h-full object-cover object-center"
              />
              {/* High-Contrast Readability Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent" />
            </div>
          ))}

          {/* Banner Slide Content Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 sm:p-5 lg:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4 text-white">
            <div className="max-w-3xl space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-400 text-slate-950 shadow-xs">
                  {activeBanner.badge}
                </span>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/30 text-white truncate">
                  {activeBanner.tag}
                </span>
              </div>

              <h2 className="text-base sm:text-2xl lg:text-4xl font-black text-white leading-tight drop-shadow-md">
                {activeBanner.titleMr}
              </h2>
              <p className="text-[11px] sm:text-sm text-slate-200 drop-shadow-sm font-medium line-clamp-1 sm:line-clamp-2">
                {activeBanner.titleEn}
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {CHANDRAPUR_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-5 sm:w-7 bg-amber-400' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={handlePrevSlide}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/25 transition"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/25 transition"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unified 7/12 Land Record Search Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs border border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <Search className="w-3.5 h-3.5 text-blue-700" />
                <span>चंद्रपूर जिल्हा भूखंड शोध व ७/१२ साखळी प्रणाली</span>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                भूखंडाचा गट क्र., सर्व्हे नंबर अथवा गावनिहाय शोध व १९५० मूळ हक्कनोंदी
              </h3>
            </div>

            <p className="text-xs text-slate-500 font-medium hidden md:block">
              १५ तालुके • १,४८२ महसूल गावे • MLRC १९६६
            </p>
          </div>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearch}
            className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-1.5 sm:py-1 border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <MapPin className="w-4 h-4 text-blue-900 mr-2 flex-shrink-0" />
              <select
                value={searchTaluka}
                onChange={(e) => setSearchTaluka(e.target.value)}
                className="w-full py-1 text-xs font-semibold bg-transparent focus:outline-none text-slate-800"
              >
                <option value="">सर्व तालुके (All 15 Talukas)</option>
                {CHANDRAPUR_TALUKAS.map((t) => (
                  <option key={t.id} value={t.id}>
                    तालुका {t.nameMr} ({t.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-1.5 sm:py-1 border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchGat}
                onChange={(e) => setSearchGat(e.target.value)}
                placeholder="गट क्र. / सर्व्हे नंबर / गाव नाव..."
                className="w-full py-1 text-xs font-medium bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95"
            >
              <span>शोधा (Search 7/12)</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </form>

          {/* Quick Access Badges / Action Links */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-0.5 text-xs font-bold">
            <Link
              href="/parcels"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition flex items-center justify-center sm:justify-start gap-1.5 text-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
              <span className="truncate">भूखंड नोंदवही (७/१२)</span>
            </Link>

            <Link
              href="/cases"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition flex items-center justify-center sm:justify-start gap-1.5 text-center"
            >
              <Building className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="truncate">SDO सुनावणी खटले</span>
            </Link>

            <Link
              href="/reports"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition flex items-center justify-center sm:justify-start gap-1.5 text-center"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span className="truncate">प्रपत्र-३ अहवाल</span>
            </Link>

            <Link
              href="/documents"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition flex items-center justify-center sm:justify-start gap-1.5 text-center"
            >
              <Landmark className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
              <span className="truncate">जिल्हा अभिलेखागार</span>
            </Link>
          </div>
        </div>

        {/* Real-time District Revenue Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 flex-shrink-0">
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">१५</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">प्रशासकीय तालुके</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">चंद्रपूर उपविभाग</p>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">१,४८२</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">महसूल गावे</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">डिजिटल अभिलेख</p>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">१९५०</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">मूळ शीर्षक साखळी</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">बु.ग.दे. पडताळणी</p>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">MLRC १९६६</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">वैधानिक संरक्षण</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">आदिवासी व गायरान</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
