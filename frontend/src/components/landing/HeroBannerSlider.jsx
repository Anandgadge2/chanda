'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Scale,
  FolderArchive,
  History,
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpRight,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

const SLIDES = [
  {
    id: 'provenance',
    badge: 'ऐतिहासिक अभिलेख साखळी',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    titleMr: '१९५० च्या मूळ नोंदवह्यांशी थेट डिजिटल सांधा (1950 Provenance)',
    titleEn: 'Backward Title Trace to 1950 Baseline Registers',
    desc: 'स्वातंत्र्योत्तर काळातील मूळ भोगवटादार वर्ग व ऐतिहासिक हक्कनोंदींशी विद्यमान ७/१२ ची जोडणी. बु.ग.दे. (बुडीत गट) व ता.ग.दे. (तात्पुरता गट) मधील पोकळ नोंदी तात्काळ निष्पन्न करणारी प्रणाली.',
    points: [
      '१९५० मूळ अधिकार अभिलेख व फेरफार साखळी अखंडता तपासणी',
      'भोगवटादार वर्ग-२ ते वर्ग-१ अवैध रूपांतरण शोध',
      'गावनिहाय ऐतिहासिक क्षेत्रफळ व हिस्सेदारांची पडताळणी',
    ],
    ctaText: 'भूखंड साखळी पहा',
    ctaHref: '/parcels',
    accentColor: 'from-emerald-50/80 via-white to-teal-50/50 border-emerald-200',
    icon: History,
    iconColor: 'text-emerald-700',
    stat: '१९५० बेसलाईन पडताळणी',
  },
  {
    id: 'tribal',
    badge: 'MLRC १९६६ वैधानिक संरक्षण',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    titleMr: 'आदिवासी व शासकीय जमीन संरक्षण (Tribal Land Safeguards)',
    titleEn: 'MLRC Sections 36, 36A & 50-54 Encroachment Eviction',
    desc: 'महाराष्ट्र जमीन महसूल संहिता १९६६ च्या कलम ३६ व ३६अ अन्वये सक्षम प्राधिकारी पूर्वपरवानगीशिवाय झालेले सर्व बिगर-आदिवासी व्यवहार रद्दबातल ठरवून जमीन मूळ आदिवासी किंवा शासनाकडे जमा.',
    points: [
      'कलम ३६ व ३६अ अनधिकृत खरेदी-विक्री व्यवहारांवर तात्काळ लाल ध्वज',
      'कलम ५० ते ५४ अन्वये गायरान व सरकारी जमिनीवरील अतिक्रमण निष्कासन',
      'कलम ४४ अकृषिक (NA) शर्तभंग व पूर्वपरवानगी पडताळणी',
    ],
    ctaText: 'शर्तभंग प्रकरणे पहा',
    ctaHref: '/cases',
    accentColor: 'from-amber-50/80 via-white to-orange-50/50 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-700',
    stat: 'कलम ३६/३६अ व ५०-५४',
  },
  {
    id: 'judicial',
    badge: 'अर्ध-न्यायिक सुनावणी न्यायालय',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    titleMr: 'उपविभागीय अधिकारी (SDO) न्यायालय व शासन जमा आदेश',
    titleEn: 'Quasi-Judicial Proceedings & Govt Repossession Orders',
    desc: 'तहसीलदार व उपविभागीय अधिकारी (SDO) न्यायालयात चालणाऱ्या शर्तभंग खटल्यांची डिजिटल दैनंदिनी. नोटीस बजावणी, जागेचा प्रत्यक्ष पंचनामा व अंतिम शासन जमा आदेशांची नोंद.',
    points: [
      'लाईव्ह सुनावणी तारीख व प्रोसिडिंग्ज लॉग अद्ययावतीकरण',
      'स्पॉट पंचनामा व साक्षीदार जबाब डिजिटल जोडणी',
      'अंतिम आदेशानंतर ७/१२ वर "महाराष्ट्र शासन" नावाची थेट दुरुस्ती',
    ],
    ctaText: 'सुनावणी दैनंदिनी उघडा',
    ctaHref: '/cases',
    accentColor: 'from-blue-50/80 via-white to-indigo-50/50 border-blue-200',
    icon: Scale,
    iconColor: 'text-blue-700',
    stat: 'SDO महसूल कोर्ट ट्रॅकर',
  },
  {
    id: 'dms',
    badge: 'जिल्हा महसूल अभिलेखागार',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    titleMr: 'जिल्हाधिकारी कार्यालय अभिलेखागार (District Record Room)',
    titleEn: 'Physical Rack & Bundle Mapping to Official Land Records Vault',
    desc: 'जिल्हाधिकारी व तहसील कार्यालयातील प्रत्यक्ष रेकॉर्ड रूममधील रॅक क्रमांक, बंडल क्रमांक व फाईल क्रमांकाशी मूळ स्कॅन प्रतींची १००% अचूक जोडणी.',
    points: [
      'अति-सुरक्षित शासकीय डिजिटल दस्तऐवज संग्रहण',
      'रॅक व बंडल शोधून प्रत्यक्ष जुन्या फाईली तात्काळ शोधणे',
      'प्रपत्र १ ते ६ वैधानिक अहवाल एका क्लिकवर एक्सेलमध्ये जनरेट',
    ],
    ctaText: 'अभिलेखागार शोधा',
    ctaHref: '/documents',
    accentColor: 'from-indigo-50/80 via-white to-slate-50 border-indigo-200',
    icon: FolderArchive,
    iconColor: 'text-indigo-700',
    stat: 'अभिलेख कक्ष रॅक व्यवस्थापन',
  },
];

export default function HeroBannerSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
      }, 6000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section
      id="features"
      className="py-6 sm:py-8 bg-white text-slate-900 relative select-none border-b border-slate-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>प्रशासन स्तंभ व वैधानिक कार्यप्रणाली</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              महसूल संनियंत्रणाचे प्रमुख वैशिष्ट्ये व तंत्रज्ञान
            </h2>
          </div>

          {/* Slider Controls (Next / Prev buttons) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-600 px-1">
              0{current + 1} / 0{SLIDES.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Slide Container with Smooth Background Transition */}
        <div
          className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 border bg-gradient-to-br ${slide.accentColor} shadow-sm transition-all duration-500 min-h-[250px] sm:min-h-[280px] flex flex-col justify-between overflow-hidden`}
        >
          {/* Subtle watermark background icon */}
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            <Icon className="w-64 h-64 text-slate-900" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-2.5">
            {/* Slide Badge */}
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${slide.badgeColor}`}
              >
                <Icon className={`w-3.5 h-3.5 ${slide.iconColor}`} />
                <span>{slide.badge}</span>
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">{slide.stat}</span>
            </div>

            {/* Slide Titles */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {slide.titleMr}
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">{slide.titleEn}</p>
            </div>

            {/* Slide Description */}
            <p className="text-xs text-slate-700 leading-relaxed font-normal">{slide.desc}</p>

            {/* Key Bullet Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {slide.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${slide.iconColor}`} />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Action Bar */}
          <div className="relative z-10 pt-4 mt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white hover:bg-blue-800 font-bold text-xs shadow-xs transition group"
            >
              <span>{slide.ctaText}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === current ? 'w-6 bg-blue-900' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
