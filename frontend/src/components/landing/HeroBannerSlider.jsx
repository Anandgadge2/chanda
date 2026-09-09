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
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
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
    accentColor: 'from-emerald-950 via-slate-900 to-blue-950',
    icon: History,
    iconColor: 'text-emerald-400',
    stat: '१९५० बेसलाईन',
  },
  {
    id: 'tribal',
    badge: 'MLRC १९६६ वैधानिक संरक्षण',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
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
    accentColor: 'from-amber-950 via-slate-900 to-stone-950',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    stat: 'कलम ३६/३६अ',
  },
  {
    id: 'judicial',
    badge: 'अर्ध-न्यायिक सुनावणी न्यायालय',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    titleMr: 'उपविभागीय अधिकारी (SDO) न्यायालय व शासन जमा आदेश',
    titleEn: 'Quasi-Judicial Proceedings & Govt Repossession Orders',
    desc: 'तहसीलदार व उपविभागीय अधिकारी (SDO) न्यायालयात चालणाऱ्या शर्तभंग खटल्यांची डिजिटल दैनंदिनी. नोटीस बजावणी, जागेचा प्रत्यक्ष पंचनामा व अंतिम शासन जमा आदेशांची नोंद.',
    points: [
      'लाईव्ह सुनावणी तारीख व प्रोसिडिंग्ज लॉग अद्ययावतीकरण',
      'स्पॉट पंचनामा व साक्षीदार जबाब डिजिटल अपलोड',
      'अंतिम आदेशानंतर ७/१२ वर "महाराष्ट्र शासन" नावाची थेट दुरुस्ती',
    ],
    ctaText: 'सुनावणी दैनंदिनी उघडा',
    ctaHref: '/cases',
    accentColor: 'from-blue-950 via-indigo-950 to-slate-900',
    icon: Scale,
    iconColor: 'text-sky-400',
    stat: 'SDO कोर्ट ट्रॅकर',
  },
  {
    id: 'dms',
    badge: 'डिजिटल दस्तऐवज तिजोरी',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    titleMr: 'कलेक्टर कार्यालय डिजिटल अभिलेखागार (Cloud DMS Archive)',
    titleEn: 'Physical Rack & Bundle Mapping to Cloud DMS Vault',
    desc: 'जिल्हाधिकारी व तहसील कार्यालयातील प्रत्यक्ष रेकॉर्ड रूममधील रॅक क्रमांक, बंडल क्रमांक व फाईल क्रमांकाशी क्लाउडवरील मूळ स्कॅन प्रतींची १००% अचूक जोडणी.',
    points: [
      'Cloudinary सुरक्षित व अति-जलद दस्तऐवज संग्रहण',
      'रॅक व बंडल शोधून प्रत्यक्ष जुन्या फाईली तात्काळ शोधणे',
      'प्रपत्र १ ते ६ वैधानिक अहवाल एका क्लिकवर एक्सेलमध्ये जनरेट',
    ],
    ctaText: 'अभिलेखागार शोधा',
    ctaHref: '/documents',
    accentColor: 'from-cyan-950 via-slate-900 to-blue-950',
    icon: FolderArchive,
    iconColor: 'text-cyan-400',
    stat: '२४x७ क्लाउड DMS',
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
      className="py-12 bg-slate-900 text-white relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>प्रशासन स्तंभ व वैधानिक कार्यप्रणाली</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              महसूल संनियंत्रणाचे प्रमुख वैशिष्ट्ये व तंत्रज्ञान
            </h2>
          </div>

          {/* Slider Controls (Next / Prev buttons) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-400 px-2">
              0{current + 1} / 0{SLIDES.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Slide Container with Smooth Background Transition */}
        <div
          className={`relative rounded-3xl p-6 sm:p-10 border border-slate-800 bg-gradient-to-br ${slide.accentColor} shadow-2xl transition-all duration-500 min-h-[380px] flex flex-col justify-between overflow-hidden`}
        >
          {/* Subtle watermark background icon */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Icon className="w-72 h-72 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            {/* Slide Badge */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${slide.badgeColor}`}
              >
                <Icon className={`w-3.5 h-3.5 ${slide.iconColor}`} />
                <span>{slide.badge}</span>
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">{slide.stat}</span>
            </div>

            {/* Slide Titles */}
            <div>
              <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {slide.titleMr}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">{slide.titleEn}</p>
            </div>

            {/* Slide Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{slide.desc}</p>

            {/* Key Bullet Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {slide.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${slide.iconColor}`} />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Action Bar */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md transition group"
            >
              <span>{slide.ctaText}</span>
              <ArrowUpRight className="w-4 h-4 text-blue-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === current ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
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
