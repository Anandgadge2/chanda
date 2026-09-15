'use client';

import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUp,
  Clock,
  Scale,
  FileText,
  ChevronRight,
  Landmark,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import { AshokStambhEmblem, MaharashtraSeal } from './GovEmblem';

const TALUKAS = [
  'चंद्रपूर',
  'बल्लारपूर',
  'भद्रावती',
  'वरोरा',
  'चिमूर',
  'नागभीड',
  'ब्रह्मपुरी',
  'सिंदेवाही',
  'मूल',
  'सावली',
  'पोंभुर्णा',
  'गोंडपिपरी',
  'कोरपना',
  'राजुरा',
  'जिवती',
];

export default function LandingFooter() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="relative bg-gradient-to-b from-slate-950 via-[#0a1527] to-[#040814] text-slate-300 text-xs border-t border-slate-800 selection:bg-amber-500 selection:text-slate-950"
      aria-label="शासकीय पादटीप"
    >
      {/* Top National Tricolor Glow Ribbon */}
      <div className="gov-tricolor-bar shadow-sm shadow-amber-500/20" />

      {/* Decorative Subtle Background Grid */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Zone: District Collectorate Leadership & Contact Strip */}
      <div className="relative border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Crests & District Title */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
                  <AshokStambhEmblem className="w-11 h-11 drop-shadow-md" />
                  <ChandrapurDistrictLogo className="w-11 h-11" />
                  <MaharashtraSeal className="w-11 h-11 drop-shadow-md" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wide uppercase">
                      महाराष्ट्र शासन
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1">
                    जिल्हाधिकारी कार्यालय, चंद्रपूर
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-amber-400">
                    महसूल, भूमी अभिलेख व १९५० मूळ शीर्षक साखळी संनियंत्रण प्रणाली
                  </p>
                </div>
              </div>

              <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed max-w-xl">
                महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ अंतर्गत चंद्रपूर जिल्ह्यातील १५ तालुक्यांतील जमीन अभिलेख संनियंत्रण, १९५० मूळ शीर्षक तपासणी, अनुसूचित जमाती जमीन संरक्षण (कलम ३६/३६-अ) व अर्ध-न्यायिक सुनावणींचे अधिकृत शासकीय पोर्टल.
              </p>
            </div>

            {/* Quick Contact & Working Hours Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              {/* Phone Card */}
              <a
                href="tel:+917172251100"
                className="group p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    दूरध्वनी संपर्क
                  </span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition tracking-wide">
                  +९१ ७१७२ २५११००
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  / २५२२०० (हेल्पलाईन)
                </span>
              </a>

              {/* Email Card */}
              <a
                href="mailto:collector.chandrapur@maharashtra.gov.in"
                className="group p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    अधिकृत ईमेल
                  </span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate max-w-[200px]">
                  collector.chandrapur
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                  @maharashtra.gov.in
                </span>
              </a>

              {/* Office Hours Card */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    कार्यालयीन वेळ
                  </span>
                </div>
                <p className="text-xs font-bold text-white tracking-wide">
                  सकाळी ९:४५ ते सायं ६:१५
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  शासकीय कामकाजाचे दिवस
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Navigation & Governance Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Col 1: Internal Revenue Portal Modules */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-white font-black text-xs uppercase tracking-wider">
                महसूल पोर्टल विभाग
              </h3>
            </div>
            <ul className="space-y-2.5 text-[11px]" role="list">
              <li>
                <Link
                  href="/dashboard"
                  className="group text-slate-300 hover:text-amber-300 font-medium transition flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500/70 group-hover:translate-x-1 group-hover:text-amber-400 transition-transform" />
                  <span>महसूल अधिकारी डॅशबोर्ड</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/parcels"
                  className="group text-slate-300 hover:text-amber-300 font-medium transition flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500/70 group-hover:translate-x-1 group-hover:text-amber-400 transition-transform" />
                  <span>भूखंड नोंदवही व १९५० साखळी</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/cases"
                  className="group text-slate-300 hover:text-amber-300 font-medium transition flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500/70 group-hover:translate-x-1 group-hover:text-amber-400 transition-transform" />
                  <span>शर्तभंग व SDO सुनावणी खटले</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  className="group text-slate-300 hover:text-amber-300 font-medium transition flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500/70 group-hover:translate-x-1 group-hover:text-amber-400 transition-transform" />
                  <span>अभिलेखागार रॅक व फाईल शोध</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/bulk-upload"
                  className="group text-slate-300 hover:text-amber-300 font-medium transition flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500/70 group-hover:translate-x-1 group-hover:text-amber-400 transition-transform" />
                  <span>गाव एक्सेल डेटा अपलोड</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="group text-slate-300 hover:text-amber-300 font-medium transition flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500/70 group-hover:translate-x-1 group-hover:text-amber-400 transition-transform" />
                  <span>प्रपत्र-३ वैधानिक अहवाल केंद्र</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/glossary"
                  className="group text-amber-300 hover:text-amber-200 font-bold transition flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  <span>महसूल शब्दावली व संक्षिप्त रूपे (Glossary)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: External Government Gateways */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-white font-black text-xs uppercase tracking-wider">
                शासकीय अधिकृत संकेतस्थळे
              </h3>
            </div>
            <ul className="space-y-2.5 text-[11px]" role="list">
              <li>
                <a
                  href="https://mahabhumi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-300 hover:text-blue-300 font-medium transition flex items-center justify-between"
                  title="नवीन टॅबमध्ये उघडेल"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    महाभूमी अधिकृत पोर्टल
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                </a>
              </li>
              <li>
                <a
                  href="https://bhulekh.mahabhumi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-300 hover:text-blue-300 font-medium transition flex items-center justify-between"
                  title="नवीन टॅबमध्ये उघडेल"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    महाभूलेख (७/१२ व ८-अ उतारा)
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                </a>
              </li>
              <li>
                <a
                  href="https://grievances.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-300 hover:text-blue-300 font-medium transition flex items-center justify-between"
                  title="नवीन टॅबमध्ये उघडेल"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    आपले सरकार तक्रार निवारण
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                </a>
              </li>
              <li>
                <a
                  href="https://chandrapur.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-300 hover:text-blue-300 font-medium transition flex items-center justify-between"
                  title="नवीन टॅबमध्ये उघडेल"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    चंद्रपूर जिल्हा अधिकृत पोर्टल
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.digitalindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-300 hover:text-blue-300 font-medium transition flex items-center justify-between"
                  title="नवीन टॅबमध्ये उघडेल"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    डिजिटल इंडिया भूमी अभिलेख (DILRMP)
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                </a>
              </li>
              <li>
                <a
                  href="https://districts.ecourts.gov.in/chandrapur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-300 hover:text-blue-300 font-medium transition flex items-center justify-between"
                  title="नवीन टॅबमध्ये उघडेल"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    ई-कोर्ट्स चंद्रपूर जिल्हा न्यायालय
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory Framework */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-white font-black text-xs uppercase tracking-wider">
                वैधानिक कायदे व नियम
              </h3>
            </div>
            <ul className="space-y-2.5 text-[11px]">
              <li className="flex items-start gap-2 text-slate-300">
                <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>अनुसूचित जमाती जमीन संरक्षण (कलम ३६ व ३६-अ)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>महाराष्ट्र जमीन महसूल (अभिलेख तयार करणे) नियम १९७१</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>तुकडेबंदी व तुकडेजोड एकत्रीकरण अधिनियम १९४७</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>माहिती अधिकार अधिनियम (RTI) २००५</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Standards, Security & District Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <h3 className="text-white font-black text-xs uppercase tracking-wider">
                सुरक्षा मानके व पत्ता
              </h3>
            </div>

            {/* Official NIC & SSL Security Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>NIC सुरक्षा प्रमाणित</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>२५६-बिट SSL</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                राष्ट्रीय माहिती विज्ञान केंद्र (NIC) सुरक्षा मानकांनुसार एंड-टू-एंड एनक्रिप्टेड व अधिकृत महसूल प्रणाली.
              </p>
            </div>

            {/* Regulatory Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                GIGW 3.0
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                DPDPA 2023
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                WCAG 2.1 AA
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                DILRMP मानके
              </span>
            </div>

            {/* District Collectorate Physical Location */}
            <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-slate-400 text-[11px]">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                जिल्हाधिकारी संकुल, नागपूर रोड, चंद्रपूर - ४४२४०१ (महाराष्ट्र)
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer, Policy Links, Back to Top & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-slate-400">
          <div className="space-y-1">
            <p className="font-bold text-slate-200">
              © २०२६ जिल्हाधिकारी कार्यालय, चंद्रपूर. सर्व हक्क सुरक्षित.
            </p>
            <p className="text-[10px] text-slate-400">
              महसूल व भूमी अभिलेख विभाग, जिल्हा चंद्रपूर (महाराष्ट्र) | पोर्टल आवृत्ती २.४ (GIGW ३.० मानके)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-medium">
            <Link
              href="/privacy-policy"
              className="hover:text-amber-300 transition focus:outline-hidden focus:ring-1 focus:ring-amber-400 rounded px-1"
            >
              गोपनीयता धोरण
            </Link>
            <span className="text-slate-700" aria-hidden="true">|</span>
            <Link
              href="/terms"
              className="hover:text-amber-300 transition focus:outline-hidden focus:ring-1 focus:ring-amber-400 rounded px-1"
            >
              नियम व अटी
            </Link>
            <span className="text-slate-700" aria-hidden="true">|</span>
            <Link
              href="/accessibility-statement"
              className="hover:text-amber-300 transition focus:outline-hidden focus:ring-1 focus:ring-amber-400 rounded px-1"
            >
              सुलभता विधान
            </Link>

            {/* Accessible Smooth Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              type="button"
              className="inline-flex items-center gap-1.5 ml-0 sm:ml-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-500/50 shadow-xs transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
              aria-label="पृष्ठाच्या सुरुवातीला जा"
            >
              <ArrowUp className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span className="text-[10px] font-bold">वरती स्क्रोल करा</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tricolor Accent Bar */}
      <div className="gov-tricolor-bar opacity-80" />
    </footer>
  );
}
