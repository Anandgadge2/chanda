'use client';

import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Lock,
  ArrowUp,
  Clock,
  Globe,
  Layers,
  Sparkles,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import { useTranslation } from '../LanguageContext';

export default function LandingFooter() {
  const { isMarathi } = useTranslation();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="relative bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 selection:bg-indigo-500 selection:text-white"
      aria-label={isMarathi ? 'प्लॅटफॉर्म पादटीप' : 'Platform Footer'}
    >
      {/* Sleek High-Tech Accent Micro-Bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 shadow-xs" />

      {/* Top Zone: Spatial Intelligence Brand & Live Operations */}
      <div className="relative border-b border-slate-900 bg-slate-950/90 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Crest & Platform Identity */}
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex items-center gap-3">
                <ChandrapurDistrictLogo className="w-10 h-10" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold tracking-wide uppercase">
                      {isMarathi ? 'डिजिटल भू-अभिलेख' : 'Spatial Intelligence Platform'}
                    </span>
                    <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
                      v2.4 Live
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1">
                    {isMarathi ? 'चंद्रपूर लँड पोर्टल' : 'Chandrapur Spatial Registry'}
                  </h2>
                </div>
              </div>

              <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed max-w-xl font-normal">
                {isMarathi
                  ? 'महाराष्ट्र जमीन महसूल संहिता (MLRC) अंतर्गत चंद्रपूर जिल्ह्यातील १५ तालुक्यांतील जमीन अभिलेख संनियंत्रण, १९५० मूळ शीर्षक तपासणी व पारदर्शक डिजिटल कॅडस्ट्रल रजिस्ट्री.'
                  : 'High-precision spatial land intelligence, 1950 baseline title provenance verification, and unified cadastral oversight across 15 talukas.'}
              </p>
            </div>

            {/* Quick Contact & Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              {/* Phone Card */}
              <a
                href="tel:+917172251100"
                className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-xl bg-indigo-950 text-indigo-400 group-hover:bg-indigo-900 transition">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    {isMarathi ? 'हेल्पलाईन' : 'Helpdesk'}
                  </span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition tracking-wide">
                  +91 7172 251100
                </p>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {isMarathi ? '२४/७ डिजिटल साहाय्य' : 'Technical Support'}
                </span>
              </a>

              {/* Email Card */}
              <a
                href="mailto:collector.chandrapur@maharashtra.gov.in"
                className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-xl bg-cyan-950 text-cyan-400 group-hover:bg-cyan-900 transition">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    {isMarathi ? 'ईमेल' : 'Inquiries'}
                  </span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate max-w-[190px]">
                  support.chanda
                </p>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                  @landintel.gov.in
                </span>
              </a>

              {/* Operations Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-xl bg-emerald-950 text-emerald-400">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    {isMarathi ? 'प्रणाली स्थिती' : 'System Status'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-bold text-white tracking-wide">
                    {isMarathi ? 'सर्व १५ तालुके सक्रिय' : 'All 15 Talukas Online'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                  99.98% Telemetry Uptime
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer: Policies, Copyright & Back to Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-500">
          <div className="space-y-1">
            <p className="font-semibold text-slate-300 text-xs">
              {isMarathi
                ? '© २०२६ चंद्रपूर लँड पोर्टल. सर्व हक्क सुरक्षित.'
                : '© 2026 Chandrapur Spatial Intelligence Registry. All rights reserved.'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isMarathi
                ? 'प्रगत भू-मापन व अभिलेख साखळी संनियंत्रण केंद्र | सुरक्षित एन्क्रिप्शन'
                : 'Next-Generation Cadastral Registry & Verified Spatial Ledger'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold">
            <Link
              href="/privacy-policy"
              className="text-slate-400 hover:text-indigo-400 transition"
            >
              {isMarathi ? 'गोपनीयता धोरण' : 'Privacy Policy'}
            </Link>
            <span className="text-slate-700" aria-hidden="true">•</span>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-indigo-400 transition"
            >
              {isMarathi ? 'नियम व अटी' : 'Terms of Service'}
            </Link>
            <span className="text-slate-700" aria-hidden="true">•</span>
            <Link
              href="/accessibility-statement"
              className="text-slate-400 hover:text-indigo-400 transition"
            >
              {isMarathi ? 'सुलभता विधान' : 'Accessibility'}
            </Link>

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              type="button"
              className="inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              aria-label={isMarathi ? 'वरती स्क्रोल करा' : 'Scroll to top'}
            >
              <ArrowUp className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span>{isMarathi ? 'वरती जा' : 'Top'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
