'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  Search,
  ShieldCheck,
  MapPin,
  Landmark,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Building,
  Compass,
  Sparkles,
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

const CHANDRAPUR_BANNERS = [
  {
    id: 'collectorate',
    image: '/images/chandrapur_collectorate.jpg',
    badge: 'जिल्हा मुख्यालय • चंद्रपूर',
    titleMr: 'जिल्हाधिकारी कार्यालय, चंद्रपूर (District Collectorate)',
    titleEn: 'Main Administrative Complex & Revenue Headquarters of Chandrapur District',
    tag: 'MLRC १९६६ अपेक्स प्रशासन',
    href: '/cases',
  },
  {
    id: 'fort',
    image: '/images/chandrapur_fort.jpg',
    badge: 'ऐतिहासिक वारसा • चंद्रपूर',
    titleMr: 'चांदा किल्ला व ऐतिहासिक तटबंदी (Historic Chandrapur Fort)',
    titleEn: 'Heritage Ramparts & Historical Land Boundaries of Gond Dynasty',
    tag: 'ऐतिहासिक भूमी अभिलेख',
    href: '/parcels?taluka=chandrapur',
  },
  {
    id: 'tadoba',
    image: '/images/tadoba_reserve.jpg',
    badge: 'नैसर्गिक जलसंपदा व वनक्षेत्र',
    titleMr: 'ताडोबा-अंधारी वनसंपदा व इरई खोरे (Tadoba & Erai Basin)',
    titleEn: 'Ecological Heritage & Irrigation Land Resources of Chandrapur',
    tag: 'गायरान व वनजमीन संरक्षण',
    href: '/parcels',
  },
  {
    id: 'mahakali',
    image: '/images/mahakali_temple.jpg',
    badge: 'धार्मिक व ऐतिहासिक देवस्थान',
    titleMr: 'श्री महाकाली देवी मंदिर देवस्थान (Mahakali Temple)',
    titleEn: 'Ancient Religious Heritage, Devasthan Inam & Public Trust Land Records',
    tag: 'देवस्थान इनाम व विश्वस्त जमीन',
    href: '/parcels?taluka=chandrapur',
  },
  {
    id: 'ballarpur',
    image: '/images/ballarpur_industrial.jpg',
    badge: 'औद्योगिक व खनिज पट्टा',
    titleMr: 'बल्लारपूर कोळसा व औद्योगिक क्षेत्र (Ballarpur Industrial Belt)',
    titleEn: 'Western Coalfields, Paper Industry & Mineral Land Lease Governance',
    tag: 'खनिज भाडेपट्टा व औद्योगिक भूखंड',
    href: '/parcels?taluka=ballarpur',
  },
  {
    id: 'anandwan',
    image: '/images/anandwan_warora.jpg',
    badge: 'समाजसेवा भूमी वारसा',
    titleMr: 'आनंदवन, वरोरा (Anandwan Eco-Community Heritage)',
    titleEn: 'Baba Amte Humanitarian Legacy & Community Land Trust Administration',
    tag: 'सामाजिक संस्था व भू-संपादन',
    href: '/parcels?taluka=warora',
  },
];

export default function LandingHero({ onOpenAuth }) {
  const router = useRouter();
  const bannerSliderRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  const [searchTaluka, setSearchTaluka] = useState('');
  const [searchGat, setSearchGat] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bannerSettings = {
    className: 'center banner-center-slider',
    centerMode: true,
    infinite: true,
    centerPadding: '70px',
    slidesToShow: 1,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: true,
    focusOnSelect: true,
    cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    arrows: false,
    dots: true,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '55px',
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '40px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '24px',
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '10px',
        },
      },
    ],
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTaluka) queryParams.set('taluka', searchTaluka);
    if (searchGat) queryParams.set('query', searchGat);
    router.push(`/parcels?${queryParams.toString()}`);
  };

  return (
    <section
      id="search-section"
      className="relative bg-gradient-to-b from-blue-50/30 via-slate-50 to-white text-slate-900 pt-2 sm:pt-3 pb-8 overflow-hidden border-b border-slate-200"
    >
      {/* Widescreen Grand Photographic District Banner with Side Peeks */}
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 mb-3 sm:mb-4">
        <div className="banner-center-slider relative w-full">
          {/* Floating Navigation Controls (Positioned on Center Banner Edges) */}
          <button
            type="button"
            onClick={() => bannerSliderRef.current?.slickPrev()}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/45 hover:bg-slate-950/80 text-white/90 hover:text-white backdrop-blur-sm border border-white/20 shadow-xl transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label="Previous Banner"
            title="मागील (Previous)"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={() => bannerSliderRef.current?.slickNext()}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/45 hover:bg-slate-950/80 text-white/90 hover:text-white backdrop-blur-sm border border-white/20 shadow-xl transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label="Next Banner"
            title="पुढील (Next)"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Center Mode Carousel */}
          {isMounted ? (
            <Slider ref={bannerSliderRef} {...bannerSettings}>
              {CHANDRAPUR_BANNERS.map((banner, index) => (
                <div key={index} className="px-1 sm:px-1.5 py-1 outline-none">
                  <div
                    className="banner-card block relative w-full h-[250px] sm:h-[320px] lg:h-[455px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/60 shadow-lg group transition-all duration-500 bg-slate-950 select-none"
                  >
                    {/* Image with 50% Reduced Scale on Hover */}
                    <img
                      src={banner.image}
                      alt={banner.titleMr}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.015]"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 sm:top-4 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between gap-2 z-10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-400 text-slate-950 shadow-md">
                          {banner.badge}
                        </span>
                        <span className="px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
                          {banner.tag}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 lg:p-6 text-white space-y-1 sm:space-y-1.5 max-w-4xl">
                      <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
                        {banner.titleMr}
                      </h3>
                      <p className="text-[11px] sm:text-xs lg:text-sm text-slate-200 drop-shadow-sm font-medium line-clamp-1 sm:line-clamp-2">
                        {banner.titleEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="relative w-full h-[250px] sm:h-[320px] lg:h-[455px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-lg">
              <img
                src={CHANDRAPUR_BANNERS[0].image}
                alt={CHANDRAPUR_BANNERS[0].titleMr}
                className="w-full h-full object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {CHANDRAPUR_BANNERS[0].titleMr}
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">

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
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 cursor-pointer"
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
