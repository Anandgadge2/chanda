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
import { useTranslation } from '../LanguageContext';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';

function formatOccupant(name, isMarathi) {
  if (!name || name.includes('उपलब्ध नाही') || name.includes('रेकार्ड उपलब्ध नाही')) {
    return isMarathi ? 'अभिलेख उपलब्ध नाही (शासकीय/वन क्षेत्र)' : 'Record Not Available (Govt / Forest Tract)';
  }
  if (name.includes('आमराई झाडचा जंगल')) {
    return isMarathi ? 'आमराई झाडचा जंगल (मूळ १९५० वन क्षेत्र)' : 'Amrai Jungle Reserve (1950 Forest Tract)';
  }
  return name;
}

function formatVillage(name, isMarathi) {
  if (!name) return isMarathi ? 'अज्ञात गाव' : 'Unknown Village';
  if (name.includes('विसापुर') || name.includes('वसपर')) {
    return isMarathi ? 'विसापूर' : 'Visapur';
  }
  return name;
}

function formatTalukaName(name, isMarathi) {
  if (!name) return '';
  const match = CHANDRAPUR_TALUKAS.find(t => t.id.toLowerCase() === name.toLowerCase() || t.nameMr === name);
  if (match) {
    return isMarathi ? match.nameMr : match.nameEn;
  }
  return name;
}

export default function ProvenanceShowcase() {
  const { isMarathi } = useTranslation();
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
            currentTenureMr: p.currentTenure === 'BHOGVATDAR_CLASS_1' ? 'भोगवटादार वर्ग-१' : 'भोगवटादार वर्ग-२',
            currentTenureEn: p.currentTenure === 'BHOGVATDAR_CLASS_1' ? 'Bhogvatdar Class-1' : 'Bhogvatdar Class-2',
            currentOwner: p.currentOwner,
            baselineOwner: p.baselineOwner,
            baselineTenureMr: p.baselineTenure || 'वर्ग-२ (नवीन व अविभाज्य शर्त)',
            baselineTenureEn: 'Class-2 (Impartible New Tenure)',
            caseNumber: p.caseNumber || `SHT/${p.taluka?.slice(0, 3)?.toUpperCase()}/${p.gatNumber}`,
            violationTypeMr: p.violationType === 'SHARTBHANG' ? 'शर्तभंग: वर्ग-२ चे अनधिकृत वर्ग-१ रूपांतरण' : 'अतिक्रमण व अनधिकृत हस्तांतरण',
            violationTypeEn: p.violationType === 'SHARTBHANG' ? 'Breach: Unauthorized Class-2 to Class-1 Conversion' : 'Encroachment & Illegal Alienation',
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
    currentTenureMr: 'भोगवटादार वर्ग-१',
    currentTenureEn: 'Bhogvatdar Class-1',
    currentOwner: 'विद्यमान कब्जेदार',
    baselineOwner: 'बळी कृष्णा व इतर (मूळ वाटपदार)',
    baselineTenureMr: 'वर्ग-२ (नवीन व अविभाज्य शर्त)',
    baselineTenureEn: 'Class-2 (Impartible New Tenure)',
    caseNumber: 'SHT/GON/GON-010/48',
    violationTypeMr: 'शर्तभंग: वर्ग-२ चे परस्पर वर्ग-१ रूपांतरण',
    violationTypeEn: 'Breach: Unauthorized Class-2 to Class-1 Conversion',
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
            <span>{isMarathi ? '१९५० मूळ शीर्षक साखळी' : '1950 Baseline Title Provenance'}</span>
          </div>
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
            {isMarathi
              ? 'ऐतिहासिक हक्कनोंदी व विद्यमान ७/१२ मधील तफावत शोध'
              : 'Historical Provenance & Active 7/12 Discrepancy Detection'}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            {isMarathi
              ? 'स्वातंत्र्य काळातील मूळ अभिलेख (Baseline 1950) व आजच्या चालू ७/१२ मधील सर्व फेरफारांची संगणकीय पडताळणी.'
              : 'Algorithmic linkage verifying 1950 post-independence sanads against active 7/12 mutations.'}
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
                  {isMarathi ? 'मूळ अभिलेख (१९५० बेसलाईन)' : 'Baseline Record (1950)'}
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold">
                  {isMarathi ? '१३५९ फसली / १९५०' : '1359 Fasli / 1950'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isMarathi
                  ? `गट क्र. ${d.gatNumber}, मौजे ${formatVillage(d.villageName, true)} (ता. ${formatTalukaName(d.taluka, true)})`
                  : `Gat No. ${d.gatNumber}, Village ${formatVillage(d.villageName, false)} (Tal. ${formatTalukaName(d.taluka, false)})`}
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs text-slate-700 pt-2 border-t border-emerald-200/80">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'मूळ खातेदार:' : 'Original Occupant:'}
                  </span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[260px]">
                    {formatOccupant(d.baselineOwner, isMarathi)}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'भोगवटादार वर्ग:' : 'Tenure Class:'}
                  </span>
                  <span className="font-bold text-emerald-800 text-right">
                    {isMarathi ? d.baselineTenureMr : d.baselineTenureEn}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'क्षेत्रफळ:' : 'Area:'}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {d.totalAreaHa} {isMarathi ? 'हेक्टर आर' : 'Ha'}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'कायदेशीर दर्जा:' : 'Legal Tenure:'}
                  </span>
                  <span className="font-semibold text-emerald-800 text-right">
                    {isMarathi ? 'नवीन अविभाज्य शर्त जमीन' : 'New Impartible Condition'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Current Status & Detected Violation */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50/50 border-2 border-rose-300 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-200/80 text-rose-900 border border-rose-400">
                  {isMarathi ? 'विद्यमान ७/१२ स्थिती (तपासणीत निष्पन्न)' : 'Active 7/12 Status (Audit Finding)'}
                </span>
                <span className="text-xs font-mono text-rose-800 font-bold">
                  {isMarathi ? 'सद्यस्थिती २०२६' : 'Active 2026'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isMarathi ? d.violationTypeMr : d.violationTypeEn}
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs text-slate-700 pt-2 border-t border-rose-200/80">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'विद्यमान नोंद:' : 'Active Record:'}
                  </span>
                  <span className="font-semibold text-rose-800 text-right">
                    {isMarathi ? d.currentTenureMr : d.currentTenureEn}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'तपासणी स्थिती:' : 'Audit Status:'}
                  </span>
                  <span className="font-bold text-rose-700 text-right">
                    {isMarathi ? 'सक्षम प्राधिकारी आदेश गहाळ / तपासणी प्रलंबित' : 'Missing Competent Sanction / Audit Flagged'}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'महसूल केस क्र.:' : 'Revenue Case No.:'}
                  </span>
                  <span className="font-semibold text-amber-800 text-right font-mono">{d.caseNumber}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    {isMarathi ? 'प्रस्तावित कृती:' : 'Proposed Action:'}
                  </span>
                  <span className="font-bold text-amber-800 text-right">
                    {isMarathi ? 'MLRC कलम ५९ अन्वये तपासणी' : 'Inquiry under MLRC Section 59'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Provenance Chain Flow */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{isMarathi ? 'हक्कनोंदी व फेरफार साखळी अखंडता (MLRC १९६६)' : 'Title Chain & Mutation Integrity (MLRC 1966)'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-emerald-700 font-mono font-bold text-[11px]">
                  {isMarathi ? '१९५० बेसलाईन' : '1950 Baseline'}
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {isMarathi ? 'मूळ सनद व अधिकार अभिलेख' : 'Original Sanad & Record of Rights'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isMarathi ? 'भोगवटादार वर्ग-२ म्हणून नोंदणीकृत' : 'Registered as Bhogvatdar Class-2'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-blue-700 font-mono font-bold text-[11px]">
                  {isMarathi ? 'कलम ३६ / ३६अ' : 'Section 36 / 36A'}
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {isMarathi ? 'वैधानिक निर्बंध संरक्षण' : 'Statutory Alienation Bar'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isMarathi ? 'वर्ग-२ व आदिवासी जमीन हस्तांतरणावर बंदी' : 'Ban on non-sanctioned land transfers'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-rose-300 space-y-1">
                <span className="text-rose-700 font-mono font-bold text-[11px]">
                  {isMarathi ? 'तपासणी पडताळणी' : 'Cadastral Audit'}
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {isMarathi ? 'अनधिकृत वर्ग रूपांतरण शोध' : 'Detect Unauthorized Conversion'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isMarathi ? 'सक्षम अधिकारी पूर्वपरवानगी तपासणी' : 'Prior statutory permission check'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-amber-300 space-y-1">
                <span className="text-amber-700 font-mono font-bold text-[11px]">
                  {isMarathi ? 'महसूल अंमलबजावणी' : 'Enforcement Trial'}
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {isMarathi ? 'तहसीलदार / SDO न्यायालय' : 'Tahsildar / SDO Court'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isMarathi ? 'सत्यापन व नियमानुकूल कायदेशीर कारवाई' : 'Adjudication & Repossession Decree'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Link to 1950 trace */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-slate-600">
              {isMarathi
                ? 'चंद्रपूर जिल्ह्यातील सर्व ४२,४५२ भूखंडांची १९५० साखळी व महसूल अभिलेख पाहण्यासाठी खालील बटणावर क्लिक करा.'
                : 'Click below to explore full 1950 baseline provenance and mutation lineages across 42,452 parcels.'}
            </p>
            <Link
              href="/parcels"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0"
            >
              <span>{isMarathi ? 'सर्व भूखंड अभिलेख तपासा' : 'Inspect All Parcel Records'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
