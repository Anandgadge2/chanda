'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { api } from '../../lib/api';

const TALUKA_DETAILS = [
  { id: 'chandrapur', nameMr: 'चंद्रपूर', nameEn: 'Chandrapur', code: 'CHA', sdo: 'चंद्रपूर उपविभाग', highlight: 'जिल्हा मुख्यालय' },
  { id: 'warora', nameMr: 'वरोरा', nameEn: 'Warora', code: 'WAR', sdo: 'वरोरा उपविभाग', highlight: 'औद्योगिक व कृषी केंद्र' },
  { id: 'ballarpur', nameMr: 'बल्लारपूर', nameEn: 'Ballarpur', code: 'BAL', sdo: 'चंद्रपूर उपविभाग', highlight: 'महसूल व वन पट्टा' },
  { id: 'bhadravati', nameMr: 'भद्रावती', nameEn: 'Bhadravati', code: 'BHA', sdo: 'वरोरा उपविभाग', highlight: 'खनिज व कोळसा पट्टा' },
  { id: 'rajura', nameMr: 'राजुरा', nameEn: 'Rajura', code: 'RAJ', sdo: 'राजुरा उपविभाग', highlight: 'सिमेंट व आदिवासी पट्टा' },
  { id: 'mul', nameMr: 'मूल', nameEn: 'Mul', code: 'MUL', sdo: 'मूल उपविभाग', highlight: 'भाताचे कोठार' },
  { id: 'chimur', nameMr: 'चिमूर', nameEn: 'Chimur', code: 'CHM', sdo: 'चिमूर उपविभाग', highlight: 'क्रांतिभूमी व ताडोबा परिसर' },
  { id: 'gondpipri', nameMr: 'गोंडपिंपरी', nameEn: 'Gondpipri', code: 'GON', sdo: 'राजुरा उपविभाग', highlight: 'सीमावर्ती महसूल मंडळ' },
  { id: 'nagbhid', nameMr: 'नागभीड', nameEn: 'Nagbhid', code: 'NAG', sdo: 'ब्रह्मपुरी उपविभाग', highlight: 'रेल्वे जंक्शन व जलसिंचन' },
  { id: 'brahmapuri', nameMr: 'ब्रह्मपुरी', nameEn: 'Brahmapuri', code: 'BRA', sdo: 'ब्रह्मपुरी उपविभाग', highlight: 'वैनगंगा खोरे' },
  { id: 'sindewahi', nameMr: 'सिंदेवाही', nameEn: 'Sindewahi', code: 'SIN', sdo: 'ब्रह्मपुरी उपविभाग', highlight: 'कृषी संशोधन केंद्र' },
  { id: 'korpana', nameMr: 'कोरपना', nameEn: 'Korpana', code: 'KOR', sdo: 'राजुरा उपविभाग', highlight: 'आदिवासी बहुल क्षेत्र' },
  { id: 'pombhurna', nameMr: 'पोंभुर्णा', nameEn: 'Pombhurna', code: 'POM', sdo: 'मूल उपविभाग', highlight: 'वनसंपदा पट्टा' },
  { id: 'saoli', nameMr: 'सावली', nameEn: 'Saoli', code: 'SAO', sdo: 'मूल उपविभाग', highlight: 'तलाव व सिंचन क्षेत्र' },
  { id: 'jivati', nameMr: 'जिवती', nameEn: 'Jivati', code: 'JIV', sdo: 'राजुरा उपविभाग', highlight: 'माणिकगड पहाडी व आदिवासी' },
];

export default function TalukaSlider() {
  const sliderRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: true,
    cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    arrows: false,
    swipe: true,
    swipeToSlide: true,
    touchMove: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 580,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const renderCard = (t) => {
    const live = talukaLiveMap.get(t.nameEn.toLowerCase()) || talukaLiveMap.get(t.id.toLowerCase());
    const parcelsCount = live ? live.parcelCount : 0;
    const violationCount = live ? live.violationCount : 0;
    const areaHa = live ? Number(live.totalAreaHa).toFixed(1) : '—';

    return (
      <div key={t.id} className="px-2 py-1 outline-none h-full">
        <div className="h-full bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1">
          <div className="space-y-2.5">
            {/* Header with Code */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900 font-mono text-[11px] font-black">
                {t.code}
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {t.highlight}
              </span>
            </div>

            {/* Taluka Title */}
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition">
                तालुका {t.nameMr}
              </h3>
            </div>

            {/* Details list */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">उपविभाग:</span>
                <span className="font-semibold text-slate-800">{t.sdo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">नोंदणीकृत भूखंड:</span>
                <span className="font-mono font-bold text-slate-900">
                  {parcelsCount ? parcelsCount.toLocaleString('mr-IN') : 'लोड होत आहे...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">चौकशी प्रकरणे:</span>
                <span className="font-mono font-bold text-amber-700">
                  {violationCount.toLocaleString('mr-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">क्षेत्रफळ:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {areaHa} Ha
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="talukas" className="py-6 sm:py-8 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 sm:mb-4 gap-2.5 sm:gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-900 text-xs font-bold border border-blue-200">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>प्रशासकीय कार्यक्षेत्र</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1">
              चंद्रपूर जिल्ह्यातील १५ तालुके व महसूल मंडळे
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 max-w-2xl">
              जिल्ह्यातील सर्व १५ तालुक्यांतील गावनिहाय चालू ७/१२ अभिलेख, १९५० मूळ शीर्षक तपासणी व शर्तभंग खटले.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={() => sliderRef.current?.slickPrev()}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-blue-900 shadow-2xs transition active:scale-95 cursor-pointer"
              aria-label="Previous slide"
              title="मागील तालुका"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => sliderRef.current?.slickNext()}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-blue-900 shadow-2xs transition active:scale-95 cursor-pointer"
              aria-label="Next slide"
              title="पुढील तालुका"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Slider */}
        <div className="taluka-slick-slider">
          {isMounted ? (
            <Slider ref={sliderRef} {...settings}>
              {TALUKA_DETAILS.map(renderCard)}
            </Slider>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-3 pt-1">
              {TALUKA_DETAILS.slice(0, 4).map(renderCard)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
