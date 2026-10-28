'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '../LanguageContext';
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
    badgeEn: 'Historical Title Provenance',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    titleMr: '१९५० च्या मूळ नोंदवह्यांशी थेट डिजिटल सांधा',
    titleEn: 'Direct Digital Linkage to 1950 Baseline Records',
    desc: 'स्वातंत्र्योत्तर काळातील मूळ भोगवटादार वर्ग व ऐतिहासिक हक्कनोंदींशी विद्यमान ७/१२ ची जोडणी. बु.ग.दे. (बुडीत गट) व ता.ग.दे. (तात्पुरता गट) मधील पोकळ नोंदी तात्काळ निष्पन्न करणारी प्रणाली.',
    descEn: 'Connecting current 7/12 extracts with post-independence baseline tenure and mutation lineage. Instant detection of hollow non-statutory remarks.',
    points: [
      '१९५० मूळ अधिकार अभिलेख व फेरफार साखळी अखंडता तपासणी',
      'भोगवटादार वर्ग-२ ते वर्ग-१ अवैध रूपांतरण शोध',
      'गावनिहाय ऐतिहासिक क्षेत्रफळ व हिस्सेदारांची पडताळणी',
    ],
    pointsEn: [
      '1950 baseline record of rights & mutation chain integrity audit',
      'Detection of unauthorized Class-2 to Class-1 tenure conversion',
      'Village-level historical area and co-holder lineage verification',
    ],
    ctaText: 'भूखंड साखळी पहा',
    ctaTextEn: 'Explore Title Lineage',
    ctaHref: '/parcels',
    accentColor: 'from-emerald-50/80 via-white to-teal-50/50 border-emerald-200',
    icon: History,
    iconColor: 'text-emerald-700',
    stat: '१९५० बेसलाईन पडताळणी',
    statEn: '1950 Baseline Verified',
  },
  {
    id: 'tribal',
    badge: 'MLRC १९६६ वैधानिक संरक्षण',
    badgeEn: 'MLRC 1966 Statutory Safeguards',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    titleMr: 'आदिवासी व शासकीय जमीन संरक्षण',
    titleEn: 'Tribal & Government Land Protection',
    desc: 'महाराष्ट्र जमीन महसूल संहिता १९६६ च्या कलम ३६ व ३६अ अन्वये सक्षम प्राधिकारी पूर्वपरवानगीशिवाय झालेले सर्व बिगर-आदिवासी व्यवहार रद्दबातल ठरवून जमीन मूळ आदिवासी किंवा शासनाकडे जमा.',
    descEn: 'Under MLRC 1966 Sec 36/36A, all transfers of tribal lands to non-tribals without prior sanction are declared void ab initio and resumed to the holder or Government.',
    points: [
      'कलम ३६ व ३६अ अनधिकृत खरेदी-विक्री व्यवहारांवर तात्काळ लाल ध्वज',
      'कलम ५० ते ५४ अन्वये गायरान व सरकारी जमिनीवरील अतिक्रमण निष्कासन',
      'कलम ४४ अकृषिक (NA) शर्तभंग व पूर्वपरवानगी पडताळणी',
    ],
    pointsEn: [
      'Instant flagging of unauthorized transfers under Sec 36 & 36A',
      'Eviction of encroachments on Gairan and Govt land under Sec 50-54',
      'Audit of Non-Agricultural (NA) conditions & permissions under Sec 44',
    ],
    ctaText: 'शर्तभंग प्रकरणे पहा',
    ctaTextEn: 'View Breach Cases',
    ctaHref: '/cases',
    accentColor: 'from-amber-50/80 via-white to-orange-50/50 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-700',
    stat: 'कलम ३६/३६अ व ५०-५४',
    statEn: 'Sec 36/36A & 50-54 Enforcement',
  },
  {
    id: 'judicial',
    badge: 'अर्ध-न्यायिक सुनावणी न्यायालय',
    badgeEn: 'Quasi-Judicial Revenue Courts',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    titleMr: 'उपविभागीय अधिकारी (SDO) न्यायालय व शासन जमा आदेश',
    titleEn: 'SDO Revenue Court & Govt Resumption Orders',
    desc: 'तहसीलदार व उपविभागीय अधिकारी (SDO) न्यायालयात चालणाऱ्या शर्तभंग खटल्यांची डिजिटल दैनंदिनी. नोटीस बजावणी, जागेचा प्रत्यक्ष पंचनामा व अंतिम शासन जमा आदेशांची नोंद.',
    descEn: 'Digital courtroom ledger for breach inquiries before Tahsildar and SDO courts. Complete tracking of show-cause notices, spot panchnamas, and repossession decrees.',
    points: [
      'लाईव्ह सुनावणी तारीख व प्रोसिडिंग्ज लॉग अद्ययावतीकरण',
      'स्पॉट पंचनामा व साक्षीदार जबाब डिजिटल जोडणी',
      'अंतिम आदेशानंतर ७/१२ वर "महाराष्ट्र शासन" नावाची थेट दुरुस्ती',
    ],
    pointsEn: [
      'Real-time court hearing dates & proceedings log tracking',
      'Digital attachment of spot panchnamas and witness depositions',
      'Automated mutation of "Govt of Maharashtra" in 7/12 upon final decree',
    ],
    ctaText: 'सुनावणी दैनंदिनी उघडा',
    ctaTextEn: 'Open Court Roznama',
    ctaHref: '/cases',
    accentColor: 'from-blue-50/80 via-white to-indigo-50/50 border-blue-200',
    icon: Scale,
    iconColor: 'text-blue-700',
    stat: 'SDO महसूल कोर्ट ट्रॅकर',
    statEn: 'SDO Revenue Court Tracker',
  },
  {
    id: 'dms',
    badge: 'जिल्हा महसूल अभिलेखागार',
    badgeEn: 'Collectorate Archival DMS',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    titleMr: 'जिल्हाधिकारी कार्यालय अभिलेखागार',
    titleEn: 'District Collectorate Digital Archive',
    desc: 'जिल्हाधिकारी व तहसील कार्यालयातील प्रत्यक्ष रेकॉर्ड रूममधील रॅक क्रमांक, बंडल क्रमांक व फाईल क्रमांकाशी मूळ स्कॅन प्रतींची १००% अचूक जोडणी.',
    descEn: '100% indexed linkage of certified scanned records with physical record room coordinates (Rack number, Bundle number, and File number).',
    points: [
      'अति-सुरक्षित शासकीय डिजिटल दस्तऐवज संग्रहण',
      'रॅक व बंडल शोधून प्रत्यक्ष जुन्या फाईली तात्काळ शोधणे',
      'प्रपत्र १ ते ६ वैधानिक अहवाल एका क्लिकवर एक्सेलमध्ये जनरेट',
    ],
    pointsEn: [
      'High-security digitized government land records repository',
      'Instant retrieval of physical files via room rack & bundle lookup',
      'One-click statutory Prapatra 1 to 6 export in Excel & PDF',
    ],
    ctaText: 'अभिलेखागार शोधा',
    ctaTextEn: 'Search Archives',
    ctaHref: '/documents',
    accentColor: 'from-indigo-50/80 via-white to-slate-50 border-indigo-200',
    icon: FolderArchive,
    iconColor: 'text-indigo-700',
    stat: 'अभिलेख कक्ष रॅक व्यवस्थापन',
    statEn: 'Record Room Rack Management',
  },
];

export default function HeroBannerSlider() {
  const { isMarathi } = useTranslation();
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 pb-2.5 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>{isMarathi ? 'प्रशासन स्तंभ व वैधानिक कार्यप्रणाली' : 'Administrative Pillars & Statutory Framework'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {isMarathi ? 'महसूल संनियंत्रणाचे प्रमुख वैशिष्ट्ये व तंत्रज्ञान' : 'Key Pillars & Core Capabilities of Revenue Governance'}
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
                <span>{isMarathi ? slide.badge : slide.badgeEn}</span>
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">
                {isMarathi ? slide.stat : slide.statEn}
              </span>
            </div>

            {/* Slide Titles */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {isMarathi ? slide.titleMr : slide.titleEn}
              </h3>
            </div>

            {/* Slide Description */}
            <p className="text-xs text-slate-700 leading-relaxed font-normal">{isMarathi ? slide.desc : slide.descEn}</p>

            {/* Key Bullet Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {(isMarathi ? slide.points : (slide.pointsEn || slide.points)).map((pt, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${slide.iconColor}`} />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Action Bar */}
          <div className="relative z-10 pt-4 mt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          

            {/* Indicator Dots */}
            <div className="flex items-center justify-center gap-1.5 py-0.5">
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
