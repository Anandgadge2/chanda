'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Landmark,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useTranslation } from '../LanguageContext';

const SLIDE_DURATION = 6000; // 6 seconds per slide

const CHANDRAPUR_BANNERS = [
  {
    id: 'collectorate',
    image: '/images/chandrapur_collectorate.jpg',
    shortLabelMr: 'जिल्हा मुख्यालय',
    shortLabelEn: 'District HQ',
    numeralMr: '०१',
    numeralEn: '01',
    badgeMr: 'जिल्हा मुख्यालय • MLRC १९६६',
    badgeEn: 'District HQ • MLRC 1966',
    titleMr: 'जिल्हाधिकारी कार्यालय, चंद्रपूर',
    titleEn: 'District Collectorate & Revenue Headquarters, Chandrapur',
    descMr: 'जमीन महसूल प्रशासन, ऐतिहासिक १९५० मूळ हक्कनोंदी साखळी व ४२,०००+ भूखंडांचे पारदर्शक डिजिटल संनियंत्रण.',
    descEn: 'Land revenue administration, 1950 baseline title provenance verification, and transparent monitoring across 42,000+ parcels.',
    primaryCtaMr: 'महसूल सेवा व अभिलेख शोधा',
    primaryCtaEn: 'Search Revenue Records',
    primaryHref: '/parcels',
  },
  {
    id: 'collectorate-bhavan',
    image: '/images/chandrapur_collectorate_bhavan.jpg',
    shortLabelMr: 'प्रशासकीय संकुल',
    shortLabelEn: 'Collectorate Campus',
    numeralMr: '०२',
    numeralEn: '02',
    badgeMr: 'जिल्हाधिकारी कार्यालय • मुख्य संकुल',
    badgeEn: 'Collectorate Campus • Main Bhavan',
    titleMr: 'जिल्हाधिकारी कार्यालय, चंद्रपूर • मुख्य प्रशासकीय संकुल',
    titleEn: 'District Collectorate Office, Chandrapur • Administrative Campus',
    descMr: 'चंद्रपूर जिल्ह्याचे सर्वोच्च महसूल व प्रशासकीय केंद्र, जिल्हादंडाधिकारी, अपर जिल्हाधिकारी व भूमी अभिलेख समन्वय मुख्यालय.',
    descEn: 'Apex administrative and revenue headquarters of Chandrapur district, coordinating revenue administration, magisterial oversight and land records governance.',
    primaryCtaMr: 'प्रशासकीय रचना व डॅशबोर्ड',
    primaryCtaEn: 'View Revenue Dashboard',
    primaryHref: '/dashboard',
  },
  {
    id: 'fort',
    image: '/images/chandrapur_fort.jpg',
    shortLabelMr: 'चांदा किल्ला',
    shortLabelEn: 'Chanda Fort',
    numeralMr: '०३',
    numeralEn: '03',
    badgeMr: 'ऐतिहासिक वारसा • गोंड साम्राज्य',
    badgeEn: 'Historic Heritage • Gond Dynasty',
    titleMr: 'चांदा किल्ला व ऐतिहासिक तटबंदी',
    titleEn: 'Historic Chanda Fort & Cadastral Fortifications',
    descMr: 'गोंड राजा खांडक्या बल्लाळ शाह यांची ऐतिहासिक राजधानी व १६ व्या शतकातील पुरातन शासकीय भू-सीमांचे वैधानिक जतन.',
    descEn: 'Historic capital of Gond King Khandkya Ballal Shah with statutory preservation of 16th-century sovereign boundaries.',
    primaryCtaMr: 'ऐतिहासिक भूखंड पहा',
    primaryCtaEn: 'View Historic Parcels',
    primaryHref: '/parcels?taluka=chandrapur',
  },
  {
    id: 'tadoba',
    image: '/images/tadoba_reserve.jpg',
    shortLabelMr: 'ताडोबा वनसंपदा',
    shortLabelEn: 'Tadoba Reserve',
    numeralMr: '०४',
    numeralEn: '04',
    badgeMr: 'वनजमीन व पर्यावरण संवर्धन',
    badgeEn: 'Forest Land & Conservation',
    titleMr: 'ताडोबा-अंधारी वनसंपदा व इरई खोरे',
    titleEn: 'Tadoba-Andhari Tiger Reserve & Eco-Sensitive Zone',
    descMr: 'महाराष्ट्रातील आद्य राष्ट्रीय उद्यान, वन महसूल हक्क, गायरान जमीन संरक्षण व पर्यावरणदृष्ट्या संवेदनशील परिसराचे संनियंत्रण.',
    descEn: 'Pioneer national park of Maharashtra, forest revenue rights, gairan grazing land protection and eco-sensitive oversight.',
    primaryCtaMr: 'वनजमीन व गायरान अभिलेख',
    primaryCtaEn: 'Forest & Gairan Records',
    primaryHref: '/parcels',
  },
  {
    id: 'mahakali',
    image: '/images/mahakali_temple.jpg',
    shortLabelMr: 'महाकाली मंदिर',
    shortLabelEn: 'Mahakali Temple',
    numeralMr: '०५',
    numeralEn: '05',
    badgeMr: 'धार्मिक व देवस्थान इनाम जमीन',
    badgeEn: 'Religious & Devasthan Inam Land',
    titleMr: 'श्री महाकाली देवी मंदिर देवस्थान',
    titleEn: 'Shree Mahakali Devi Temple Trust & Devasthan Lands',
    descMr: 'विदर्भाचे आराध्य दैवत, देवस्थान इनाम वर्ग-३ हक्कनोंदी व भाविकांसाठी सार्वजनिक सोयी-सुविधा भूखंडांचे पारदर्शक व्यवस्थापन.',
    descEn: 'Revered deity of Vidarbha, Devasthan Class-3 inam title governance, and transparent public utility land management.',
    primaryCtaMr: 'देवस्थान जमीन नोंदी पहा',
    primaryCtaEn: 'Devasthan Land Records',
    primaryHref: '/parcels?taluka=chandrapur',
  },
  {
    id: 'ballarpur',
    image: '/images/ballarpur_industrial.jpg',
    shortLabelMr: 'बल्लारपूर औद्योगिक',
    shortLabelEn: 'Ballarpur Industrial',
    numeralMr: '०६',
    numeralEn: '06',
    badgeMr: 'खनिज व औद्योगिक विकास',
    badgeEn: 'Mining & Industrial Zone',
    titleMr: 'बल्लारपूर कोळसा व औद्योगिक क्षेत्र',
    titleEn: 'Ballarpur Coalfields, Mining Leases & Industry',
    descMr: 'खनिज उत्खनन भाडेपट्टे (Mining Leases), औद्योगिक भू-संपादन व शासकीय महसूल संकलन संनियंत्रण प्रणाली.',
    descEn: 'Cadastral mining lease oversight, industrial land acquisition, and state revenue collection governance.',
    primaryCtaMr: 'औद्योगिक भूखंड शोधा',
    primaryCtaEn: 'Search Industrial Parcels',
    primaryHref: '/parcels?taluka=ballarpur',
  },
  {
    id: 'anandwan',
    image: '/images/anandwan_warora.jpg',
    shortLabelMr: 'आनंदवन वरोरा',
    shortLabelEn: 'Anandwan Warora',
    numeralMr: '०७',
    numeralEn: '07',
    badgeMr: 'समाजसेवा भूमी वारसा',
    badgeEn: 'Humanitarian Land Heritage',
    titleMr: 'आनंदवन, वरोरा • सामाजिक संस्था',
    titleEn: 'Anandwan Warora • Humanitarian Land Trust',
    descMr: 'पद्मविभूषण बाबा आमटे यांची कर्मभूमी, महारोगी सेवा समिती व सार्वजनिक विश्वस्त संस्थांच्या भू-अभिलेख संरक्षण प्रणाली.',
    descEn: 'Legacy ground of Padma Vibhushan Baba Amte, Maharogi Seva Samiti, and statutory protection of public trust estates.',
    primaryCtaMr: 'संस्था भूखंड साखळी पहा',
    primaryCtaEn: 'Inspect Trust Title Chain',
    primaryHref: '/parcels?taluka=warora',
  },
];

export default function LandingHero({ onOpenAuth }) {
  const { isMarathi } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [liveStats, setLiveStats] = useState({
    talukas: 15,
    villages: 663,
    parcels: 42452,
  });

  // Fetch live analytics summary
  useEffect(() => {
    api.getAnalyticsSummary()
      .then((data) => {
        if (data) {
          setLiveStats({
            talukas: data.totalTalukas || 15,
            villages: data.totalVillages || 663,
            parcels: data.totalParcels || 42452,
          });
        }
      })
      .catch(() => {});
  }, []);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CHANDRAPUR_BANNERS.length);
    setProgressKey((prev) => prev + 1);
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CHANDRAPUR_BANNERS.length) % CHANDRAPUR_BANNERS.length);
    setProgressKey((prev) => prev + 1);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    setProgressKey((prev) => prev + 1);
  }, []);

  // Autoplay timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      goToNextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isPaused, goToNextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrevSlide();
    } else if (e.key === 'ArrowRight') {
      goToNextSlide();
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPaused((p) => !p);
    }
  };

  const activeBanner = CHANDRAPUR_BANNERS[currentSlide];

  return (
    <section
      id="search-section"
      className="relative bg-gradient-to-b from-blue-50/40 via-slate-50 to-white text-slate-900 pt-2 sm:pt-3 pb-6 sm:pb-8 border-b border-slate-200"
      aria-label={isMarathi ? 'चंद्रपूर जिल्हा प्रशासन मुख्य बॅनर' : 'Chandrapur District Administration Main Banner'}
    >
      {/* Full-width Responsive Showcase Container - Scales Elegantly Across All Zoom Levels */}
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-2.5 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={isMarathi ? 'जिल्हाधिकारी कार्यालय चंद्रपूर मुख्य दालन' : 'District Collectorate Chandrapur Main Showcase'}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full h-[390px] xs:h-[415px] sm:h-[440px] md:h-[470px] lg:h-[500px] xl:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-900/10 bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-amber-400 group"
        >
          {/* Official Indian Tricolor National Accent Micro-Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[3.5px] z-30 bg-gradient-to-r from-amber-500 via-white to-emerald-600 shadow-xs"
            aria-hidden="true"
          />

          {/* Full High-Definition Photographic Showcase (No white washout box, natural daylight clarity) */}
          {CHANDRAPUR_BANNERS.map((banner, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                aria-hidden={!isActive}
              >
                <img
                  src={banner.image}
                  alt={banner.titleMr}
                  className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
                {/* Natural Cinematic Vignette (Subtle top vignette + bottom caption wash) */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-64 sm:h-72 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent pointer-events-none" />
              </div>
            );
          })}

          {/* Top Controls Overlay: Official Floating Badges & Navigation Controller */}
          <div className="absolute top-3 sm:top-5 left-3 sm:left-7 right-3 sm:right-7 flex items-center justify-between gap-2 z-20">
            {/* Left: Official Government Badges */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow-md">
                {isMarathi ? 'महाराष्ट्र शासन' : 'Govt of Maharashtra'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-amber-300 border border-white/20 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {isMarathi ? activeBanner.badgeMr : activeBanner.badgeEn}
              </span>
            </div>

            {/* Right: Sleek Compact Frosted Controller */}
            <div className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/20 p-1 shadow-md text-white/90">
              <button
                type="button"
                onClick={goToPrevSlide}
                className="p-1 sm:p-1.5 rounded-full hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                aria-label={isMarathi ? 'मागील (Previous slide)' : 'Previous slide'}
                title={isMarathi ? 'मागील (Previous)' : 'Previous'}
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <span className="px-2 text-[10px] sm:text-xs font-mono font-bold text-amber-300 tracking-wider">
                {isMarathi ? activeBanner.numeralMr : activeBanner.numeralEn}
                <span className="text-white/40 font-normal mx-0.5">/</span>
                {isMarathi
                  ? String(CHANDRAPUR_BANNERS.length).replace(/\d/g, (d) => '०१२३४५६७८९'[d]).padStart(2, '०')
                  : String(CHANDRAPUR_BANNERS.length).padStart(2, '0')}
              </span>

              <button
                type="button"
                onClick={goToNextSlide}
                className="p-1 sm:p-1.5 rounded-full hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                aria-label={isMarathi ? 'पुढील (Next slide)' : 'Next slide'}
                title={isMarathi ? 'पुढील (Next)' : 'Next'}
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" aria-hidden="true" />

              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="p-1 sm:p-1.5 rounded-full hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                aria-label={isPaused ? (isMarathi ? 'सुरू करा (Play)' : 'Play') : (isMarathi ? 'थांबवा (Pause)' : 'Pause')}
                title={isPaused ? (isMarathi ? 'सुरू करा (Play)' : 'Play') : (isMarathi ? 'थांबवा (Pause)' : 'Pause')}
              >
                {isPaused ? (
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
                ) : (
                  <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/90" />
                )}
              </button>
            </div>
          </div>

          {/* Integrated Lower Showcase Dock (Spans Full Width, Zero Div Clutter) */}
          <div className="absolute inset-x-0 bottom-0 z-20 px-4 sm:px-7 lg:px-9 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
            {/* Title & Primary Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6">
              <div className="space-y-1 sm:space-y-1.5 max-w-3xl">
                <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                  {isMarathi ? activeBanner.titleMr : activeBanner.titleEn}
                </h2>
               
                <p className="text-[11px] sm:text-xs text-slate-200/90 leading-relaxed max-w-2xl line-clamp-2 hidden sm:block drop-shadow-sm font-normal">
                  {isMarathi ? activeBanner.descMr : activeBanner.descEn}
                </p>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                <Link
                  href={activeBanner.primaryHref}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-lg shadow-amber-950/40 hover:shadow-amber-400/30 transition-all active:scale-95 group/btn cursor-pointer"
                >
                  <span>{isMarathi ? activeBanner.primaryCtaMr : activeBanner.primaryCtaEn}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Seamless Landmark Progress Tabs */}
            <div className="pt-1 border-t border-white/15">
              {/* Desktop / Tablet Segments */}
              <div
                className="hidden sm:grid gap-2 sm:gap-3"
                style={{ gridTemplateColumns: `repeat(${CHANDRAPUR_BANNERS.length}, minmax(0, 1fr))` }}
              >
                {CHANDRAPUR_BANNERS.map((banner, index) => {
                  const isActive = index === currentSlide;
                  return (
                    <button
                      key={banner.id}
                      type="button"
                      onClick={() => goToSlide(index)}
                      className="group/seg text-left transition-all cursor-pointer focus:outline-hidden py-1"
                      aria-label={`${isMarathi ? 'स्लाइड' : 'Slide'} ${isMarathi ? banner.numeralMr : banner.numeralEn}: ${isMarathi ? banner.shortLabelMr : banner.shortLabelEn}`}
                    >
                      {/* Segment Progress Line */}
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1.5">
                        {isActive ? (
                          <div
                            key={`prog-desktop-${progressKey}`}
                            className={`h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full animate-hero-progress ${
                              isPaused ? 'animate-hero-progress-paused' : ''
                            }`}
                          />
                        ) : (
                          <div className="h-full w-0 bg-transparent group-hover/seg:w-full group-hover/seg:bg-white/40 transition-all duration-300" />
                        )}
                      </div>

                      {/* Title */}
                      <div className="flex items-center gap-1 truncate">
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            isActive ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {isMarathi ? banner.numeralMr : banner.numeralEn}
                        </span>
                        <span
                          className={`text-[11px] truncate ${
                            isActive ? 'text-white font-bold drop-shadow-sm' : 'text-slate-300 group-hover/seg:text-white'
                          }`}
                        >
                          {isMarathi ? banner.shortLabelMr : banner.shortLabelEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Slim Progress Segments (<640px) */}
              <div className="sm:hidden space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                  <span className="text-amber-300 font-bold">{isMarathi ? activeBanner.shortLabelMr : activeBanner.shortLabelEn}</span>
                  <span className="text-white/60 text-[10px]">
                    {isMarathi ? activeBanner.numeralMr : activeBanner.numeralEn} / {isMarathi
                      ? String(CHANDRAPUR_BANNERS.length).replace(/\d/g, (d) => '०१२३४५६७८९'[d]).padStart(2, '०')
                      : String(CHANDRAPUR_BANNERS.length).padStart(2, '0')}
                  </span>
                </div>
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${CHANDRAPUR_BANNERS.length}, minmax(0, 1fr))` }}
                >
                  {CHANDRAPUR_BANNERS.map((banner, index) => {
                    const isActive = index === currentSlide;
                    return (
                      <button
                        key={banner.id}
                        type="button"
                        onClick={() => goToSlide(index)}
                        className="h-1.5 w-full bg-white/25 rounded-full overflow-hidden cursor-pointer"
                        aria-label={`Slide ${isMarathi ? banner.numeralMr : banner.numeralEn}`}
                      >
                        {isActive ? (
                          <div
                            key={`prog-mob-${progressKey}`}
                            className={`h-full bg-amber-400 rounded-full animate-hero-progress ${
                              isPaused ? 'animate-hero-progress-paused' : ''
                            }`}
                          />
                        ) : (
                          <div className="h-full w-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* District Revenue & Administrative Indicators (Colorful, Balanced & Responsive) */}
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
          <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-blue-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 flex-shrink-0">
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                {liveStats.talukas.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </p>
              <p className="text-[11px] sm:text-[13px] font-bold text-slate-800 mt-0.5 sm:mt-1 truncate">
                {isMarathi ? 'प्रशासकीय तालुके' : 'Administrative Talukas'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">
                {isMarathi ? 'चंद्रपूर महसूल उपविभाग' : 'Revenue Sub-Divisions'}
              </p>
            </div>
          </div>

          <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                {liveStats.villages.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </p>
              <p className="text-[11px] sm:text-[13px] font-bold text-slate-800 mt-0.5 sm:mt-1 truncate">
                {isMarathi ? 'महसूल गावे' : 'Revenue Villages'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">
                {isMarathi ? 'तपासणी व मूळ हक्कनोंदी' : 'Baseline Audited Records'}
              </p>
            </div>
          </div>

          <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                {liveStats.parcels.toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </p>
              <p className="text-[11px] sm:text-[13px] font-bold text-slate-800 mt-0.5 sm:mt-1 truncate">
                {isMarathi ? 'नोंदणीकृत भूखंड' : 'Registered Parcels'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">
                {isMarathi ? 'डिजिटल ७/१२ व १९५० साठा' : 'Digital 7/12 & 1950 Corpus'}
              </p>
            </div>
          </div>

          <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-indigo-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                {isMarathi ? 'MLRC १९६६' : 'MLRC 1966'}
              </p>
              <p className="text-[11px] sm:text-[13px] font-bold text-slate-800 mt-0.5 sm:mt-1 truncate">
                {isMarathi ? 'वैधानिक संरक्षण' : 'Statutory Protection'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">
                {isMarathi ? '१९५० मूळ शीर्षक पडताळणी' : '1950 Provenance Verification'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
