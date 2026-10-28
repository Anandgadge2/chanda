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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">

          {/* Col 1: Internal Revenue Portal Modules */}
          <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b-2 border-amber-500 pb-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">
                {isMarathi ? 'महसूल पोर्टल विभाग' : 'Portal Modules'}
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs" role="list">
              <li>
                <Link
                  href="/dashboard"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  <span>{isMarathi ? 'महसूल अधिकारी डॅशबोर्ड' : 'Revenue Officer Dashboard'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/parcels"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  <span>{isMarathi ? 'भूखंड नोंदवही व १९५० साखळी' : 'Parcel Registry & 1950 Lineage'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/cases"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  <span>{isMarathi ? 'शर्तभंग व SDO सुनावणी खटले' : 'Breach & SDO Hearings'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  <span>{isMarathi ? 'अभिलेखागार रॅक व फाईल शोध' : 'DMS Archives & Record Room'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/bulk-upload"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  <span>{isMarathi ? 'गाव एक्सेल डेटा अपलोड' : 'Village Excel Bulk Ingestion'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  <span>{isMarathi ? 'प्रपत्र-३ वैधानिक अहवाल केंद्र' : 'Prapatra-3 Statutory Reports'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/glossary"
                  className="group text-blue-950 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 p-2 -mx-1 rounded-lg font-black transition flex items-center gap-2 mt-2"
                >
                  <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform shrink-0" />
                  <span>{isMarathi ? 'महसूल शब्दावली (Glossary)' : 'Revenue Glossary & Abbreviations'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: External Government Gateways */}
          <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b-2 border-blue-600 pb-2.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">
                {isMarathi ? 'शासकीय अधिकृत संकेतस्थळे' : 'Official State Gateways'}
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs" role="list">
              <li>
                <a
                  href="https://mahabhumi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center justify-between"
                  title="Opens in new tab"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {isMarathi ? 'महाभूमी अधिकृत पोर्टल' : 'MahaBhumi Official Portal'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800 transition shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://bhulekh.mahabhumi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center justify-between"
                  title="Opens in new tab"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {isMarathi ? 'महाभूलेख (७/१२ व ८-अ)' : 'MahaBhulekh (7/12 & 8A)'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800 transition shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://grievances.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center justify-between"
                  title="Opens in new tab"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {isMarathi ? 'आपले सरकार तक्रार निवारण' : 'Aaple Sarkar Grievance Redressal'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800 transition shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://chandrapur.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center justify-between"
                  title="Opens in new tab"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {isMarathi ? 'चंद्रपूर जिल्हा अधिकृत पोर्टल' : 'Chandrapur District Portal'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800 transition shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.digitalindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center justify-between"
                  title="Opens in new tab"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {isMarathi ? 'डिजिटल इंडिया (DILRMP)' : 'Digital India Land Records (DILRMP)'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800 transition shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://districts.ecourts.gov.in/chandrapur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-800 hover:text-blue-900 hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg font-semibold transition flex items-center justify-between"
                  title="Opens in new tab"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {isMarathi ? 'ई-कोर्ट्स चंद्रपूर न्यायालय' : 'e-Courts District Court Chandrapur'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800 transition shrink-0" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory Framework */}
          <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b-2 border-emerald-600 pb-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">
                {isMarathi ? 'वैधानिक कायदे व नियम' : 'Statutory Acts & Rules'}
              </h3>
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2.5 text-slate-800 font-semibold p-1">
                <Scale className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{isMarathi ? 'महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६' : 'Maharashtra Land Revenue Code, 1966'}</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 font-semibold p-1">
                <Scale className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{isMarathi ? 'अनुसूचित जमाती जमीन संरक्षण (कलम ३६/३६-अ)' : 'Tribal Land Protection Act (Sec 36/36A)'}</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 font-semibold p-1">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{isMarathi ? 'महाराष्ट्र जमीन महसूल नियम १९७१' : 'Maharashtra Land Revenue Rules, 1971'}</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 font-semibold p-1">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{isMarathi ? 'तुकडेबंदी व एकत्रीकरण अधिनियम १९४७' : 'Fragmentation & Consolidation Act, 1947'}</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 font-semibold p-1">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{isMarathi ? 'माहिती अधिकार अधिनियम (RTI) २००५' : 'Right to Information Act (RTI), 2005'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Standards, Security & District Address */}
          <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b-2 border-purple-600 pb-2.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">
                {isMarathi ? 'सुरक्षा मानके व पत्ता' : 'Security & Address'}
              </h3>
            </div>

            {/* Official NIC & SSL Security Card */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border-2 border-emerald-300 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-emerald-950 font-black text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{isMarathi ? 'NIC सुरक्षा प्रमाणित' : 'NIC Security Certified'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white font-extrabold bg-emerald-600 px-2 py-0.5 rounded-full shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>256-bit SSL</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                {isMarathi
                  ? 'राष्ट्रीय माहिती विज्ञान केंद्र (NIC) सुरक्षा मानकांनुसार एंड-टू-एंड एनक्रिप्टेड व अधिकृत महसूल प्रणाली.'
                  : 'End-to-end encrypted official land governance system aligned with National Informatics Centre (NIC) security directives.'}
              </p>
            </div>

            {/* Regulatory Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-[11px] font-black text-slate-900 shadow-2xs">
                GIGW 3.0
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-[11px] font-black text-slate-900 shadow-2xs">
                DPDPA 2023
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-[11px] font-black text-slate-900 shadow-2xs">
                WCAG 2.1 AA
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-[11px] font-black text-slate-900 shadow-2xs">
                {isMarathi ? 'DILRMP मानके' : 'DILRMP Standards'}
              </span>
            </div>

            {/* District Collectorate Physical Location */}
            <div className="pt-2.5 border-t border-slate-200 flex items-start gap-2.5 text-slate-800 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-snug">
                {isMarathi
                  ? 'जिल्हाधिकारी संकुल, नागपूर रोड, चंद्रपूर - ४४२४०१ (महाराष्ट्र)'
                  : 'Collectorate Complex, Nagpur Road, Chandrapur - 442401 (Maharashtra)'}
              </span>
            </div>
          </div>
        </div>

        {/* 15 Talukas District Coverage Strip */}
        <div className="mt-8 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-slate-950 shrink-0">
              {isMarathi ? 'चंद्रपूर जिल्ह्यातील १५ तालुके कक्ष:' : '15 Talukas of Chandrapur District:'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {TALUKAS.map((t) => (
                <span
                  key={t.en}
                  className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                >
                  {isMarathi ? t.mr : t.en}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer, Policy Links, Back to Top & Copyright */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-700">
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
