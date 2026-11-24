'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useTranslation } from '../LanguageContext';

const TALUKA_DETAILS = [
  {
    id: 'chandrapur',
    nameMr: 'चंद्रपूर',
    nameEn: 'Chandrapur',
    code: 'CHA',
    sdoMr: 'चंद्रपूर उपविभाग',
    sdoEn: 'Chandrapur Sub-Div',
    highlightMr: 'जिल्हा मुख्यालय',
    highlightEn: 'District HQ',
    defaultParcels: 18450,
    defaultViolations: 2840,
    defaultArea: 48200.5,
  },
  {
    id: 'warora',
    nameMr: 'वरोरा',
    nameEn: 'Warora',
    code: 'WAR',
    sdoMr: 'वरोरा उपविभाग',
    sdoEn: 'Warora Sub-Div',
    highlightMr: 'औद्योगिक व कृषी केंद्र',
    highlightEn: 'Agri-Industrial Hub',
    defaultParcels: 14120,
    defaultViolations: 1940,
    defaultArea: 54100.0,
  },
  {
    id: 'ballarpur',
    nameMr: 'बल्लारपूर',
    nameEn: 'Ballarpur',
    code: 'BAL',
    sdoMr: 'चंद्रपूर उपविभाग',
    sdoEn: 'Chandrapur Sub-Div',
    highlightMr: 'महसूल व वन पट्टा',
    highlightEn: 'Forest & Coal Belt',
    defaultParcels: 9250,
    defaultViolations: 1620,
    defaultArea: 32450.8,
  },
  {
    id: 'bhadravati',
    nameMr: 'भद्रावती',
    nameEn: 'Bhadravati',
    code: 'BHA',
    sdoMr: 'वरोरा उपविभाग',
    sdoEn: 'Warora Sub-Div',
    highlightMr: 'खनिज व कोळसा पट्टा',
    highlightEn: 'Mining & Mineral Corridor',
    defaultParcels: 8900,
    defaultViolations: 1710,
    defaultArea: 36800.2,
  },
  {
    id: 'rajura',
    nameMr: 'राजुरा',
    nameEn: 'Rajura',
    code: 'RAJ',
    sdoMr: 'राजुरा उपविभाग',
    sdoEn: 'Rajura Sub-Div',
    highlightMr: 'सिमेंट व आदिवासी पट्टा',
    highlightEn: 'Cement & Tribal Belt',
    defaultParcels: 14500,
    defaultViolations: 2200,
    defaultArea: 58900.4,
  },
  {
    id: 'mul',
    nameMr: 'मूल',
    nameEn: 'Mul',
    code: 'MUL',
    sdoMr: 'मूल उपविभाग',
    sdoEn: 'Mul Sub-Div',
    highlightMr: 'भाताचे कोठार',
    highlightEn: 'Rice Bowl',
    defaultParcels: 7800,
    defaultViolations: 1180,
    defaultArea: 31200.0,
  },
  {
    id: 'chimur',
    nameMr: 'चिमूर',
    nameEn: 'Chimur',
    code: 'CHM',
    sdoMr: 'चिमूर उपविभाग',
    sdoEn: 'Chimur Sub-Div',
    highlightMr: 'क्रांतिभूमी व ताडोबा परिसर',
    highlightEn: 'Historic & Tadoba Zone',
    defaultParcels: 12650,
    defaultViolations: 1810,
    defaultArea: 49500.6,
  },
  {
    id: 'gondpipri',
    nameMr: 'गोंडपिंपरी',
    nameEn: 'Gondpipri',
    code: 'GON',
    sdoMr: 'राजुरा उपविभाग',
    sdoEn: 'Rajura Sub-Div',
    highlightMr: 'सीमावर्ती महसूल मंडळ',
    highlightEn: 'Border Revenue Circle',
    defaultParcels: 6400,
    defaultViolations: 990,
    defaultArea: 29800.1,
  },
  {
    id: 'nagbhid',
    nameMr: 'नागभीड',
    nameEn: 'Nagbhid',
    code: 'NAG',
    sdoMr: 'ब्रह्मपुरी उपविभाग',
    sdoEn: 'Brahmapuri Sub-Div',
    highlightMr: 'रेल्वे जंक्शन व जलसिंचन',
    highlightEn: 'Rail & Irrigation Hub',
    defaultParcels: 8200,
    defaultViolations: 1390,
    defaultArea: 41200.3,
  },
  {
    id: 'brahmapuri',
    nameMr: 'ब्रह्मपुरी',
    nameEn: 'Brahmapuri',
    code: 'BRA',
    sdoMr: 'ब्रह्मपुरी उपविभाग',
    sdoEn: 'Brahmapuri Sub-Div',
    highlightMr: 'वैनगंगा खोरे',
    highlightEn: 'Wainganga Basin',
    defaultParcels: 16743,
    defaultViolations: 3056,
    defaultArea: 102577.3,
  },
  {
    id: 'sindewahi',
    nameMr: 'सिंदेवाही',
    nameEn: 'Sindewahi',
    code: 'SIN',
    sdoMr: 'ब्रह्मपुरी उपविभाग',
    sdoEn: 'Brahmapuri Sub-Div',
    highlightMr: 'कृषी संशोधन केंद्र',
    highlightEn: 'Agri Research Center',
    defaultParcels: 7159,
    defaultViolations: 1891,
    defaultArea: 9856.7,
  },
  {
    id: 'korpana',
    nameMr: 'कोरपना',
    nameEn: 'Korpana',
    code: 'KOR',
    sdoMr: 'राजुरा उपविभाग',
    sdoEn: 'Rajura Sub-Div',
    highlightMr: 'आदिवासी बहुल क्षेत्र',
    highlightEn: 'Tribal Sub-Plan Zone',
    defaultParcels: 11280,
    defaultViolations: 3588,
    defaultArea: 25123.4,
  },
  {
    id: 'pombhurna',
    nameMr: 'पोंभुर्णा',
    nameEn: 'Pombhurna',
    code: 'POM',
    sdoMr: 'मूल उपविभाग',
    sdoEn: 'Mul Sub-Div',
    highlightMr: 'वनसंपदा पट्टा',
    highlightEn: 'Forest Resource Belt',
    defaultParcels: 5330,
    defaultViolations: 1258,
    defaultArea: 8760.6,
  },
  {
    id: 'saoli',
    nameMr: 'सावली',
    nameEn: 'Saoli',
    code: 'SAO',
    sdoMr: 'मूल उपविभाग',
    sdoEn: 'Mul Sub-Div',
    highlightMr: 'तलाव व सिंचन क्षेत्र',
    highlightEn: 'Tank Irrigation Area',
    defaultParcels: 6600,
    defaultViolations: 1140,
    defaultArea: 28400.0,
  },
  {
    id: 'jivati',
    nameMr: 'जिवती',
    nameEn: 'Jivati',
    code: 'JIV',
    sdoMr: 'राजुरा उपविभाग',
    sdoEn: 'Rajura Sub-Div',
    highlightMr: 'माणिकगड पहाडी व आदिवासी',
    highlightEn: 'Manikgarh Highlands',
    defaultParcels: 5200,
    defaultViolations: 1430,
    defaultArea: 34100.5,
  },
];

const formatDevanagari = (val) => {
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(val).replace(/[0-9]/g, (d) => marathiDigits[Number(d)]);
};

const formatCount = (num, isMarathi, isMounted) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  if (!isMounted) {
    return isMarathi ? formatDevanagari(num) : String(num);
  }
  try {
    return Number(num).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN');
  } catch {
    return isMarathi ? formatDevanagari(num) : String(num);
  }
};

const formatArea = (num, isMarathi, isMounted) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  if (!isMounted) {
    return isMarathi ? formatDevanagari(Number(num).toFixed(1)) : Number(num).toFixed(1);
  }
  try {
    return Number(num).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  } catch {
    return isMarathi ? formatDevanagari(Number(num).toFixed(1)) : Number(num).toFixed(1);
  }
};

export default function TalukaSlider() {
  const { isMarathi } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [talukaLiveMap, setTalukaLiveMap] = useState(new Map());

  useEffect(() => {
    setIsMounted(true);
    api.getAnalyticsSummary()
      .then((data) => {
        if (data?.talukaDistribution) {
          const map = new Map();
          data.talukaDistribution.forEach((t) => {
            map.set((t.taluka || '').toLowerCase(), t);
          });
          setTalukaLiveMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft } = el;

    const card = el.querySelector('[data-card]');
    if (card) {
      const cardWidth = card.offsetWidth + 14; // card width + gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(Math.max(0, newIndex), TALUKA_DETAILS.length - 1));
    }
  }, []);

  const scrollToCard = useCallback((index) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const cardWidth = card ? card.offsetWidth + 14 : el.clientWidth * 0.85;
    const targetLeft = Math.max(0, Math.min(index * cardWidth, el.scrollWidth - el.clientWidth));
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, []);

  const handlePrev = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const step = card ? card.offsetWidth + 14 : el.clientWidth * 0.85;
    if (el.scrollLeft <= 10) {
      // Loop to end
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -step, behavior: 'smooth' });
    }
  }, []);

  const handleNext = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const step = card ? card.offsetWidth + 14 : el.clientWidth * 0.85;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
      // Loop back to start
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  }, []);

  // Smooth Autoplay
  useEffect(() => {
    if (isInteracting) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isInteracting, handleNext]);

  return (
    <section id="talukas" className="py-6 sm:py-8 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 sm:mb-5 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-900 text-xs font-bold border border-blue-200">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>{isMarathi ? 'प्रशासकीय कार्यक्षेत्र' : 'Administrative Jurisdiction'}</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1">
              {isMarathi ? 'चंद्रपूर जिल्ह्यातील १५ तालुके व महसूल मंडळे' : '15 Talukas & Revenue Circles of Chandrapur'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              {isMarathi
                ? 'जिल्ह्यातील सर्व १५ तालुक्यांतील गावनिहाय चालू ७/१२ अभिलेख, १९५० मूळ शीर्षक तपासणी व शर्तभंग खटले.'
                : 'Taluka-level active 7/12 land records, 1950 baseline provenance audit and breach proceedings.'}
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition active:scale-95 cursor-pointer"
              aria-label={isMarathi ? 'मागील तालुका' : 'Previous taluka'}
              title={isMarathi ? 'मागील तालुका' : 'Previous taluka'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition active:scale-95 cursor-pointer"
              aria-label={isMarathi ? 'पुढील तालुका' : 'Next taluka'}
              title={isMarathi ? 'पुढील तालुका' : 'Next taluka'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Scroll Container (Mobile-first snap scroll with full responsiveness) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setTimeout(() => setIsInteracting(false), 3000)}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-1 -mx-1"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {TALUKA_DETAILS.map((t) => {
            const live = talukaLiveMap.get(t.nameEn.toLowerCase()) || talukaLiveMap.get(t.id.toLowerCase());
            const parcelsCount = live?.parcelCount ?? t.defaultParcels;
            const violationCount = live?.violationCount ?? t.defaultViolations;
            const areaHa = live?.totalAreaHa ? Number(live.totalAreaHa).toFixed(1) : t.defaultArea;

            return (
              <div
                key={t.id}
                data-card
                className="w-[84vw] max-w-[340px] min-w-[280px] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-12px)] xl:w-[calc(25%-14px)] shrink-0 snap-center sm:snap-start flex flex-col"
              >
                <div className="h-full bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group">
                  <div className="space-y-3">
                    {/* Header with Code & Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-mono text-[11px] font-black tracking-wider shrink-0">
                        {t.code}
                      </span>
                      <span
                        className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-200/80 truncate max-w-[170px]"
                        title={isMarathi ? t.highlightMr : t.highlightEn}
                      >
                        {isMarathi ? t.highlightMr : t.highlightEn}
                      </span>
                    </div>

                    {/* Taluka Title & SDO */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition tracking-tight">
                        {isMarathi ? `तालुका ${t.nameMr}` : `${t.nameEn} Taluka`}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {isMarathi ? t.sdoMr : t.sdoEn}
                      </p>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-2 text-xs pt-2.5 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-medium">{isMarathi ? 'नोंदणीकृत भूखंड:' : 'Parcels:'}</span>
                        <span className="font-mono font-bold text-slate-900 text-right">
                          {formatCount(parcelsCount, isMarathi, isMounted)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-medium">{isMarathi ? 'चौकशी प्रकरणे:' : 'Inquiry Cases:'}</span>
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60 text-[11px] text-right">
                          {formatCount(violationCount, isMarathi, isMounted)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-medium">{isMarathi ? 'एकूण क्षेत्रफळ:' : 'Total Area:'}</span>
                        <span className="font-mono font-semibold text-slate-700 text-right">
                          {formatArea(areaHa, isMarathi, isMounted)} {isMarathi ? 'हेक्टर' : 'Ha'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <Link
                      href={`/parcels?taluka=${encodeURIComponent(t.id)}`}
                      className="inline-flex items-center justify-between w-full text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 hover:text-indigo-800 transition"
                    >
                      <span>{isMarathi ? 'भूखंड अभिलेख तपासा' : 'Explore Parcels'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Progress & Counter Bar */}
        <div className="flex sm:hidden items-center justify-between px-1 pt-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-2xs">
              {isMarathi
                ? `${formatDevanagari(String(currentIndex + 1).padStart(2, '0'))} / १५`
                : `${String(currentIndex + 1).padStart(2, '0')} / 15`}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {isMarathi ? 'स्वाइप करा' : 'Swipe for more'}
            </span>
          </div>

          {/* Micro progress line */}
          <div className="w-28 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / TALUKA_DETAILS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Tablet & Desktop Pagination Dots */}
        <div className="hidden sm:flex items-center justify-center gap-1.5 pt-5" role="tablist" aria-label="Taluka pagination">
          {TALUKA_DETAILS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => scrollToCard(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 bg-indigo-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to ${t.nameEn}`}
              role="tab"
              aria-selected={idx === currentIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
