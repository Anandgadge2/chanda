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
  return (
    <section id="provenance" className="py-8 bg-slate-50 text-slate-900 relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
            <History className="w-3.5 h-3.5 text-emerald-700" />
            <span>१९५० मूळ शीर्षक साखळी (1950 Backward Provenance)</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            ऐतिहासिक हक्कनोंदी व विद्यमान ७/१२ मधील तफावत शोध
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            स्वातंत्र्य काळातील मूळ अभिलेख (Baseline 1950) व आजच्या चालू ७/१२ मधील सर्व फेरफारांची संगणकीय पडताळणी.
          </p>
        </div>

        {/* Interactive Comparison & Timeline Box */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
          {/* Top Comparison Cards: 1950 Baseline vs Present 2026 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: 1950 Original Record */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border-2 border-emerald-300 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-200/80 text-emerald-900 border border-emerald-400">
                  मूळ अभिलेख (१९५० बेसलाईन)
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold">१३५९ फसली / १९५०</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                गट क्र. ४२/१, मौजे कुकलहेटी (ता. वरोरा)
              </h3>
              <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-emerald-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">मूळ खातेदार:</span>
                  <span className="font-semibold text-slate-900">मंगरू बापूजी मडावी (गोंड - अ.ज.)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">भोगवटादार वर्ग:</span>
                  <span className="font-bold text-emerald-800">वर्ग-२ (नवीन व अविभाज्य शर्त)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">क्षेत्रफळ:</span>
                  <span className="font-mono font-bold text-slate-900">४.८० हेक्टर आर</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">कायदेशीर दर्जा:</span>
                  <span className="font-semibold text-emerald-800">आदिवासी संरक्षित जमीन (MLRC Sec 36)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Current Status & Detected Violation */}
            <div className="p-4 rounded-xl bg-rose-50/50 border-2 border-rose-300 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-200/80 text-rose-900 border border-rose-400">
                  विद्यमान ७/१२ स्थिती (तपासणीत निष्पन्न)
                </span>
                <span className="text-xs font-mono text-rose-800 font-bold">सध्याची स्थिती २०२६</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                शर्तभंग फ्लॅग: कलम ३६अ उल्लंघन व अनधिकृत वर्ग-१
              </h3>
              <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-rose-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">विद्यमान नोंद:</span>
                  <span className="font-semibold text-rose-800">बिगर-आदिवासी व्यक्तीच्या नावे हस्तांतरित</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">बेकायदेशीर फेरफार:</span>
                  <span className="font-bold text-rose-700">फेरफार क्र. ८९४ (सक्षम परवानगी गहाळ)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">अंमलबजावणी आदेश:</span>
                  <span className="font-semibold text-amber-800">SDO सुनावणी खटला क्र. १२/२०२६ सुरू</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">प्रस्तावित कृती:</span>
                  <span className="font-bold text-amber-800">शासन जमा (Govt Repossession) आदेश</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Provenance Chain Flow */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>हक्कनोंदी व फेरफार साखळी अखंडता (Provenance Mutation Chain)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-emerald-700 font-mono font-bold text-[11px]">१९५० बेसलाईन</span>
                <p className="font-bold text-slate-900 text-xs">मूळ सनद व अधिकार अभिलेख</p>
                <p className="text-[10px] text-slate-500">भोगवटादार वर्ग-२ म्हणून नोंदणीकृत</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-blue-700 font-mono font-bold text-[11px]">१९७५ कायदेशीर संरक्षण</span>
                <p className="font-bold text-slate-900 text-xs">महाराष्ट्र कायदा क्र. ३५/१९७५</p>
                <p className="text-[10px] text-slate-500">आदिवासी जमीन हस्तांतरणावर निर्बंध लागू</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-rose-300 space-y-1">
                <span className="text-rose-700 font-mono font-bold text-[11px]">२००८ अनधिकृत फेरफार</span>
                <p className="font-bold text-slate-900 text-xs">फेरफार क्र. ८९४ संशयास्पद</p>
                <p className="text-[10px] text-slate-500">जिल्हाधिकारी पूर्वपरवानगी गहाळ</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-amber-300 space-y-1">
                <span className="text-amber-700 font-mono font-bold text-[11px]">२०२६ महसूल अंमलबजावणी</span>
                <p className="font-bold text-slate-900 text-xs">SDO न्यायालय सुनावणी</p>
                <p className="text-[10px] text-slate-500">शासन जमा किंवा मूळ मालकास पुनर्वसन</p>
              </div>
            </div>
          </div>

          {/* Action Link to 360 trace */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              चंद्रपूर जिल्ह्यातील कोणत्याही भूखंडाची १९५० साखळी व कागदपत्रे पाहण्यासाठी खालील बटणावर क्लिक करा.
            </p>
            <Link
              href="/parcels"
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 flex-shrink-0"
            >
              <span>सर्व भूखंडांची १९५० साखळी पहा</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
