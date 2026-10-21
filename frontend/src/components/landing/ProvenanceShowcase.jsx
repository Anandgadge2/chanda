'use client';

import { useState, useEffect } from 'react';
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
import { api } from '../../lib/api';

export default function ProvenanceShowcase() {
  const [liveDispute, setLiveDispute] = useState(null);

  useEffect(() => {
    // Dynamically fetch an authentic live flagged dispute parcel from the database
    api.getAnalyticsSummary()
      .then((data) => {
        if (data?.featuredDispute) {
          const p = data.featuredDispute;
          setLiveDispute({
            villageName: p.villageName,
            taluka: p.taluka,
            gatNumber: p.gatNumber,
            oldSurveyNo: p.oldSurveyNo || '—',
            totalAreaHa: p.totalAreaHa ? Number(p.totalAreaHa).toFixed(2) : '—',
            currentTenure: p.currentTenure === 'BHOGVATDAR_CLASS_1' ? 'भोगवटादार वर्ग-१' : 'भोगवटादार वर्ग-२',
            currentOwner: p.currentOwner,
            baselineOwner: p.baselineOwner,
            baselineTenure: p.baselineTenure,
            caseNumber: p.caseNumber || `SHT/${p.taluka?.slice(0, 3)?.toUpperCase()}/${p.gatNumber}`,
            violationType: p.violationType === 'SHARTBHANG' ? 'शर्तभंग: वर्ग-२ चे अनधिकृत वर्ग-१ रूपांतरण' : 'अतिक्रमण व अनधिकृत हस्तांतरण',
            status: p.status || 'FLAGGED_IN_AUDIT',
            upi: p.upi,
          });
        }
      })
      .catch(() => {});
  }, []);

  const d = liveDispute || {
    villageName: 'चेक घडोली',
    taluka: 'Gondpipri',
    gatNumber: '४८',
    oldSurveyNo: '२९/१',
    totalAreaHa: '२.१५',
    currentTenure: 'भोगवटादार वर्ग-१',
    currentOwner: 'विद्यमान कब्जेदार',
    baselineOwner: 'बळी कृष्णा व इतर (मूळ वाटपदार)',
    baselineTenure: 'वर्ग-२ (नवीन व अविभाज्य शर्त)',
    caseNumber: 'SHT/GON/GON-010/48',
    violationType: 'शर्तभंग: वर्ग-२ चे परस्पर वर्ग-१ रूपांतरण',
    status: 'FLAGGED_IN_AUDIT',
    upi: 'MH-CHA-GON-010-0048-58',
  };

  return (
    <section id="provenance" className="py-6 sm:py-8 bg-slate-50 text-slate-900 relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-1.5 mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
            <History className="w-3.5 h-3.5 text-emerald-700" />
            <span>१९५० मूळ शीर्षक साखळी</span>
          </div>
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
            ऐतिहासिक हक्कनोंदी व विद्यमान ७/१२ मधील तफावत शोध
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            स्वातंत्र्य काळातील मूळ अभिलेख (Baseline 1950) व आजच्या चालू ७/१२ मधील सर्व फेरफारांची संगणकीय पडताळणी.
          </p>
        </div>

        {/* Interactive Comparison & Timeline Box */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xs space-y-4">
          {/* Top Comparison Cards: 1950 Baseline vs Present 2026 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1: 1950 Original Record */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/50 border-2 border-emerald-300 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-200/80 text-emerald-900 border border-emerald-400">
                  मूळ अभिलेख (१९५० बेसलाईन)
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold">१३५९ फसली / १९५०</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                गट क्र. {d.gatNumber}, मौजे {d.villageName} (ता. {d.taluka})
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs text-slate-700 pt-2 border-t border-emerald-200/80">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">मूळ खातेदार:</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[260px]">{d.baselineOwner}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">भोगवटादार वर्ग:</span>
                  <span className="font-bold text-emerald-800 text-right">{d.baselineTenure}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">क्षेत्रफळ:</span>
                  <span className="font-mono font-bold text-slate-900">{d.totalAreaHa} हेक्टर आर</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">कायदेशीर दर्जा:</span>
                  <span className="font-semibold text-emerald-800 text-right">नवीन अविभाज्य शर्त जमीन</span>
                </div>
              </div>
            </div>

            {/* Card 2: Current Status & Detected Violation */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50/50 border-2 border-rose-300 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-200/80 text-rose-900 border border-rose-400">
                  विद्यमान ७/१२ स्थिती (तपासणीत निष्पन्न)
                </span>
                <span className="text-xs font-mono text-rose-800 font-bold">सद्यस्थिती २०२६</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {d.violationType}
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs text-slate-700 pt-2 border-t border-rose-200/80">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">विद्यमान नोंद:</span>
                  <span className="font-semibold text-rose-800 text-right">{d.currentTenure}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">तपासणी स्थिती:</span>
                  <span className="font-bold text-rose-700 text-right">सक्षम प्राधिकारी आदेश गहाळ / तपासणी प्रलंबित</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">महसूल केस क्र.:</span>
                  <span className="font-semibold text-amber-800 text-right font-mono">{d.caseNumber}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">प्रस्तावित कृती:</span>
                  <span className="font-bold text-amber-800 text-right">MLRC कलम ५९ अन्वये तपासणी</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Provenance Chain Flow */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>हक्कनोंदी व फेरफार साखळी अखंडता (MLRC १९६६)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-emerald-700 font-mono font-bold text-[11px]">१९५० बेसलाईन</span>
                <p className="font-bold text-slate-900 text-xs">मूळ सनद व अधिकार अभिलेख</p>
                <p className="text-[10px] text-slate-500">भोगवटादार वर्ग-२ म्हणून नोंदणीकृत</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-blue-700 font-mono font-bold text-[11px]">कलम ३६ / ३६अ</span>
                <p className="font-bold text-slate-900 text-xs">वैधानिक निर्बंध संरक्षण</p>
                <p className="text-[10px] text-slate-500">वर्ग-२ व आदिवासी जमीन हस्तांतरणावर बंदी</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-rose-300 space-y-1">
                <span className="text-rose-700 font-mono font-bold text-[11px]">तपासणी पडताळणी</span>
                <p className="font-bold text-slate-900 text-xs">अनधिकृत वर्ग रूपांतरण शोध</p>
                <p className="text-[10px] text-slate-500">सक्षम अधिकारी पूर्वपरवानगी तपासणी</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-amber-300 space-y-1">
                <span className="text-amber-700 font-mono font-bold text-[11px]">महसूल अंमलबजावणी</span>
                <p className="font-bold text-slate-900 text-xs">तहसीलदार / SDO न्यायालय</p>
                <p className="text-[10px] text-slate-500">सत्यापन व नियमानुकूल कायदेशीर कारवाई</p>
              </div>
            </div>
          </div>

          {/* Action Link to 1950 trace */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-slate-600">
              चंद्रपूर जिल्ह्यातील सर्व ४२,४५२ भूखंडांची १९५० साखळी व महसूल अभिलेख पाहण्यासाठी खालील बटणावर क्लिक करा.
            </p>
            <Link
              href="/parcels"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0"
            >
              <span>सर्व भूखंड अभिलेख तपासा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
