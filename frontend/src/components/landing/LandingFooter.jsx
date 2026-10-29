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
  Building2,
  Globe,
  Award,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import { AshokStambhEmblem, MaharashtraSeal } from './GovEmblem';
import { useTranslation } from '../LanguageContext';

const TALUKAS = [
  { mr: 'चंद्रपूर', en: 'Chandrapur' },
  { mr: 'बल्लारपूर', en: 'Ballarpur' },
  { mr: 'भद्रावती', en: 'Bhadravati' },
  { mr: 'वरोरा', en: 'Warora' },
  { mr: 'चिमूर', en: 'Chimur' },
  { mr: 'नागभीड', en: 'Nagbhid' },
  { mr: 'ब्रह्मपुरी', en: 'Brahmapuri' },
  { mr: 'सिंदेवाही', en: 'Sindewahi' },
  { mr: 'मूल', en: 'Mul' },
  { mr: 'सावली', en: 'Saoli' },
  { mr: 'पोंभुर्णा', en: 'Pombhurna' },
  { mr: 'गोंडपिपरी', en: 'Gondpipri' },
  { mr: 'कोरपना', en: 'Korpana' },
  { mr: 'राजुरा', en: 'Rajura' },
  { mr: 'जिवती', en: 'Jivati' },
];

export default function LandingFooter() {
  const { isMarathi } = useTranslation();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="relative bg-slate-100 text-slate-800 text-xs border-t-2 border-slate-300 selection:bg-amber-500 selection:text-slate-950"
      aria-label={isMarathi ? 'शासकीय पादटीप' : 'Official Footer'}
    >
      {/* Top National Tricolor Header Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shadow-xs" />

      {/* Top Zone: District Collectorate Leadership & Contact Strip */}
      <div className="relative border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-9">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Crests & District Title */}
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs shrink-0">
                  <AshokStambhEmblem className="w-12 h-12 drop-shadow-xs" />
                  <ChandrapurDistrictLogo className="w-12 h-12" />
                  <MaharashtraSeal className="w-12 h-12 drop-shadow-xs" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[11px] font-extrabold tracking-wide uppercase">
                      {isMarathi ? 'महाराष्ट्र शासन' : 'Government of Maharashtra'}
                    </span>
                    <span className="text-slate-600 text-[11px] font-semibold hidden sm:inline">
                      {isMarathi ? 'Government of Maharashtra' : 'Revenue & Forest Department'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-1">
                    {isMarathi ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर' : 'District Collectorate, Chandrapur'}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-amber-900">
                    {isMarathi
                      ? 'महसूल, भूमी अभिलेख व १९५० मूळ शीर्षक साखळी संनियंत्रण प्रणाली'
                      : 'Land Revenue, Cadastral Records & 1950 Provenance Governance System'}
                  </p>
                </div>
              </div>

              <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed max-w-xl font-medium">
                {isMarathi
                  ? 'महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ अंतर्गत चंद्रपूर जिल्ह्यातील १५ तालुक्यांतील जमीन अभिलेख संनियंत्रण, १९५० मूळ शीर्षक तपासणी, अनुसूचित जमाती जमीन संरक्षण (कलम ३६/३६-अ) व अर्ध-न्यायिक सुनावणींचे अधिकृत शासकीय पोर्टल.'
                  : 'Official portal of District Collectorate Chandrapur for land governance under MLRC 1966 across 15 talukas, including 1950 baseline provenance tracking, Section 36/36A tribal land protection, and quasi-judicial trials.'}
              </p>
            </div>

            {/* Quick Contact & Working Hours Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              {/* Phone Card */}
              <a
                href="tel:+917172251100"
                className="group p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-300 hover:border-emerald-500 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 group-hover:bg-emerald-200 transition">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                    {isMarathi ? 'दूरध्वनी संपर्क' : 'Helpline & Telephone'}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-950 group-hover:text-emerald-900 transition tracking-wide">
                  +91 7172 251100
                </p>
                <span className="text-[10px] text-slate-600 font-medium mt-0.5">
                  / 252200 {isMarathi ? '(हेल्पलाईन)' : '(Control Room)'}
                </span>
              </a>

              {/* Email Card */}
              <a
                href="mailto:collector.chandrapur@maharashtra.gov.in"
                className="group p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-500 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-900 group-hover:bg-blue-200 transition">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                    {isMarathi ? 'अधिकृत ईमेल' : 'Official Email'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-950 group-hover:text-blue-900 transition truncate max-w-[200px]">
                  collector.chandrapur
                </p>
                <span className="text-[10px] text-slate-600 font-medium mt-0.5 truncate">
                  @maharashtra.gov.in
                </span>
              </a>

              {/* Office Hours Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                    {isMarathi ? 'कार्यालयीन वेळ' : 'Office Working Hours'}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-950 tracking-wide">
                  {isMarathi ? 'सकाळी ९:४५ ते सायं ६:१५' : '9:45 AM – 6:15 PM'}
                </p>
                <span className="text-[10px] text-slate-600 font-medium mt-0.5">
                  {isMarathi ? 'शासकीय कामकाजाचे दिवस' : 'Official Working Days'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Navigation & Governance Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        

         

        {/* Disclaimer, Policy Links, Back to Top & Copyright */}
        <div className="mt-1 pt-6 mb-1 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-700">
          <div className="space-y-1">
            <p className="font-black text-slate-950 text-xs sm:text-sm">
              {isMarathi
                ? '© २०२६ जिल्हाधिकारी कार्यालय, चंद्रपूर. सर्व हक्क सुरक्षित.'
                : '© 2026 District Collectorate, Chandrapur. All Rights Reserved.'}
            </p>
            <p className="text-[11px] text-slate-600 font-medium">
              {isMarathi
                ? 'महसूल व भूमी अभिलेख विभाग, जिल्हा चंद्रपूर (महाराष्ट्र) | पोर्टल आवृत्ती २.४ (GIGW ३.० मानके)'
                : 'Revenue & Land Records Department, District Chandrapur (Maharashtra) | Portal Version 2.4 (GIGW 3.0)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold">
            <Link
              href="/privacy-policy"
              className="text-slate-700 hover:text-blue-900 transition focus:outline-hidden focus:ring-1 focus:ring-blue-600 rounded px-1"
            >
              {isMarathi ? 'गोपनीयता धोरण' : 'Privacy Policy'}
            </Link>
            <span className="text-slate-400" aria-hidden="true">|</span>
            <Link
              href="/terms"
              className="text-slate-700 hover:text-blue-900 transition focus:outline-hidden focus:ring-1 focus:ring-blue-600 rounded px-1"
            >
              {isMarathi ? 'नियम व अटी' : 'Terms & Conditions'}
            </Link>
            <span className="text-slate-400" aria-hidden="true">|</span>
            <Link
              href="/accessibility-statement"
              className="text-slate-700 hover:text-blue-900 transition focus:outline-hidden focus:ring-1 focus:ring-blue-600 rounded px-1"
            >
              {isMarathi ? 'सुलभता विधान' : 'Accessibility Statement'}
            </Link>

            {/* Accessible Smooth Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              type="button"
              className="inline-flex items-center gap-1.5 ml-0 sm:ml-2 px-3.5 py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-black text-xs shadow-xs transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
              aria-label={isMarathi ? 'पृष्ठाच्या सुरुवातीला जा' : 'Scroll to top'}
            >
              <ArrowUp className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>{isMarathi ? 'वरती स्क्रोल करा' : 'Back to Top'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
