'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  History,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function ProvenanceShowcase() {
  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <section id="provenance" className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>१९५० मूळ शीर्षक साखळी (1950 Backward Provenance)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            ऐतिहासिक हक्कनोंदी व विद्यमान ७/१२ मधील तफावत शोध
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            स्वातंत्र्य काळातील मूळ अभिलेख (Baseline 1950) व आजच्या चालू ७/१२ मधील सर्व फेरफारांची संगणकीय पडताळणी करून अनधिकृत शर्तभंग निष्पन्न करणारी प्रणाली.
          </p>
        </div>

        {/* Interactive Comparison & Timeline Box */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Top Comparison Cards: 1950 Baseline vs Present 2026 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: 1950 Original Record */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  मूळ अभिलेख (१९५० बेसलाईन)
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">१३५९ फसली / १९५०</span>
              </div>
              <h3 className="text-base font-bold text-white">
                गट क्र. ४२/१, मौजे कुकलहेटी (ता. वरोरा)
              </h3>
              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">मूळ खातेदार:</span>
                  <span className="font-semibold text-white">मंगरू बापूजी मडावी (गोंड - अ.ज.)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">भोगवटादार वर्ग:</span>
                  <span className="font-bold text-emerald-400">वर्ग-२ (नवीन व अविभाज्य शर्त)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">क्षेत्रफळ:</span>
                  <span className="font-mono text-white">४.८० हेक्टर आर</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">कायदेशीर दर्जा:</span>
                  <span className="font-semibold text-emerald-300">आदिवासी संरक्षित जमीन (MLRC Sec 36)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Current Status & Detected Violation */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-red-500/40 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                  विद्यमान ७/१२ स्थिती (तपासणीत निष्पन्न)
                </span>
                <span className="text-xs font-mono text-red-400 font-bold">सध्याची स्थिती २०२६</span>
              </div>
              <h3 className="text-base font-bold text-white">
                शर्तभंग फ्लॅग: कलम ३६अ उल्लंघन व अनधिकृत वर्ग-१
              </h3>
              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">विद्यमान नोंद:</span>
                  <span className="font-semibold text-red-300">बिगर-आदिवासी व्यक्तीच्या नावे हस्तांतरित</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">बेकायदेशीर फेरफार:</span>
                  <span className="font-bold text-red-400">फेरफार क्र. ८९४ (सक्षम परवानगी गहाळ)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">अंमलबजावणी आदेश:</span>
                  <span className="font-semibold text-amber-300">SDO सुनावणी खटला क्र. १२/२०२६ सुरू</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">प्रस्तावित कृती:</span>
                  <span className="font-bold text-amber-400">शासन जमा (Govt Repossession) आदेश</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Provenance Chain Flow */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>हक्कनोंदी व फेरफार साखळी अखंडता (Provenance Mutation Chain)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <span className="text-emerald-400 font-mono font-bold text-[11px]">१९५० बेसलाईन</span>
                <p className="font-bold text-white text-xs">मूळ सनद व अधिकार अभिलेख</p>
                <p className="text-[11px] text-slate-400">भोगवटादार वर्ग-२ म्हणून नोंदणीकृत</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <span className="text-sky-400 font-mono font-bold text-[11px]">१९७५ कायदेशीर संरक्षण</span>
                <p className="font-bold text-white text-xs">महाराष्ट्र कायदा क्र. ३५/१९७५</p>
                <p className="text-[11px] text-slate-400">आदिवासी जमीन हस्तांतरणावर निर्बंध लागू</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-red-500/50 space-y-1">
                <span className="text-red-400 font-mono font-bold text-[11px]">२००८ अनधिकृत फेरफार</span>
                <p className="font-bold text-white text-xs">फेरफार क्र. ८९४ संशयास्पद</p>
                <p className="text-[11px] text-slate-400">जिल्हाधिकारी पूर्वपरवानगी गहाळ</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/50 space-y-1">
                <span className="text-amber-400 font-mono font-bold text-[11px]">२०२६ महसूल अंमलबजावणी</span>
                <p className="font-bold text-white text-xs">SDO न्यायालय सुनावणी</p>
                <p className="text-[11px] text-slate-400">शासन जमा किंवा मूळ मालकास पुनर्वसन</p>
              </div>
            </div>
          </div>

          {/* Action Link to 360 trace */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              चंद्रपूर जिल्ह्यातील कोणत्याही भूखंडाची १९५० साखळी व कागदपत्रे पाहण्यासाठी खालील बटणावर क्लिक करा.
            </p>
            <Link
              href="/parcels"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 flex-shrink-0"
            >
              <span>सर्व भूखंडांची ३६०° साखळी पहा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
