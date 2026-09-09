'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building,
  ArrowRight,
  Compass,
  Landmark,
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

const TALUKA_DETAILS = [
  { id: 'chandrapur', nameMr: 'चंद्रपूर', nameEn: 'Chandrapur', code: 'CHA', sdo: 'चंद्रपूर उपविभाग', villages: 118, highlight: 'जिल्हा मुख्यालय' },
  { id: 'warora', nameMr: 'वरोरा', nameEn: 'Warora', code: 'WAR', sdo: 'वरोरा उपविभाग', villages: 135, highlight: 'औद्योगिक व कृषी केंद्र' },
  { id: 'ballarpur', nameMr: 'बल्लारपूर', nameEn: 'Ballarpur', code: 'BAL', sdo: 'चंद्रपूर उपविभाग', villages: 42, highlight: 'महसूल व वन पट्टा' },
  { id: 'bhadravati', nameMr: 'भद्रावती', nameEn: 'Bhadravati', code: 'BHA', sdo: 'वरोरा उपविभाग', villages: 124, highlight: 'खनिज व कोळसा पट्टा' },
  { id: 'rajura', nameMr: 'राजुरा', nameEn: 'Rajura', code: 'RAJ', sdo: 'राजुरा उपविभाग', villages: 104, highlight: 'सिमेंट व आदिवासी पट्टा' },
  { id: 'mul', nameMr: 'मूल', nameEn: 'Mul', code: 'MUL', sdo: 'मूल उपविभाग', villages: 107, highlight: 'भाताचे कोठार' },
  { id: 'chimur', nameMr: 'चिमूर', nameEn: 'Chimur', code: 'CHM', sdo: 'चिमूर उपविभाग', villages: 162, highlight: 'क्रांतिभूमी व ताडोबा परिसर' },
  { id: 'gondpipri', nameMr: 'गोंडपिंपरी', nameEn: 'Gondpipri', code: 'GON', sdo: 'राजुरा उपविभाग', villages: 98, highlight: 'सीमावर्ती महसूल मंडळ' },
  { id: 'nagbhid', nameMr: 'नागभीड', nameEn: 'Nagbhid', code: 'NAG', sdo: 'ब्रह्मपुरी उपविभाग', villages: 126, highlight: 'रेल्वे जंक्शन व जलसिंचन' },
  { id: 'bramhapuri', nameMr: 'ब्रह्मपुरी', nameEn: 'Bramhapuri', code: 'BRA', sdo: 'ब्रह्मपुरी उपविभाग', villages: 120, highlight: 'वैनगंगा खोरे' },
  { id: 'sindewahi', nameMr: 'सिंदेवाही', nameEn: 'Sindewahi', code: 'SIN', sdo: 'ब्रह्मपुरी उपविभाग', villages: 105, highlight: 'कृषी संशोधन केंद्र' },
  { id: 'korpurna', nameMr: 'कोरपना', nameEn: 'Korpurna', code: 'KOR', sdo: 'राजुरा उपविभाग', villages: 112, highlight: 'आदिवासी बहुल क्षेत्र' },
  { id: 'pombhurna', nameMr: 'पोंभुर्णा', nameEn: 'Pombhurna', code: 'POM', sdo: 'मूल उपविभाग', villages: 68, highlight: 'वनसंपदा पट्टा' },
  { id: 'saoli', nameMr: 'सावली', nameEn: 'Saoli', code: 'SAO', sdo: 'मूल उपविभाग', villages: 94, highlight: 'तलाव व सिंचन क्षेत्र' },
  { id: 'jivati', nameMr: 'जिवती', nameEn: 'Jivati', code: 'JIV', sdo: 'राजुरा उपविभाग', villages: 87, highlight: 'माणिकगड पहाडी व आदिवासी' },
];

export default function TalukaSlider() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="talukas" className="py-6 sm:py-8 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 sm:mb-4 gap-2.5 sm:gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-900 text-xs font-bold border border-blue-200">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>प्रशासकीय कार्यक्षेत्र (Jurisdiction Map)</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1">
              चंद्रपूर जिल्ह्यातील १५ तालुके व महसूल मंडळे
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 max-w-2xl">
              जिल्ह्यातील सर्व १५ तालुक्यांतील गावनिहाय एक्सेल डेटा, १९५० मूळ शीर्षक तपासणी व शर्तभंग खटले.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-blue-900 shadow-2xs transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-blue-900 shadow-2xs transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Card Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
        >
          {TALUKA_DETAILS.map((t) => (
            <div
              key={t.id}
              className="w-[210px] sm:w-[250px] flex-shrink-0 snap-start bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5"
            >
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
                  <p className="text-[11px] text-slate-500 font-medium">{t.nameEn} Taluka</p>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">उपविभाग (SDO):</span>
                    <span className="font-semibold text-slate-800">{t.sdo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">महसूल गावे:</span>
                    <span className="font-mono font-bold text-slate-900">~{t.villages} गावे</span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={`/parcels?taluka=${t.id}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-900 hover:text-white text-blue-900 text-xs font-bold transition flex items-center justify-between group/btn"
                >
                  <span>भूखंड ७/१२ शोधा</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
