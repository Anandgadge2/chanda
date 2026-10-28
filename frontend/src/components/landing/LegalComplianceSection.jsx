'use client';

import Link from 'next/link';
import {
  Scale,
  ShieldAlert,
  FileCheck,
  Building2,
  FileSpreadsheet,
  AlertOctagon,
  ArrowRight,
  Landmark,
  BookOpen,
} from 'lucide-react';
import { useTranslation } from '../LanguageContext';

const STATUTES = [
  {
    sectionMr: 'कलम ३६ व ३६अ',
    sectionEn: 'Section 36 & 36A',
    titleEn: 'Section 36 & 36A (Tribal Land Protection)',
    titleMr: 'आदिवासी जमिनींचे हस्तांतरण निर्बंध व संरक्षण',
    authorityMr: 'जिल्हाधिकारी / सक्षम प्राधिकारी',
    authorityEn: 'District Collector / Competent Officer',
    color: 'border-amber-400 bg-amber-50/50',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: ShieldAlert,
    iconColor: 'text-amber-600',
    descMr: 'अनुसूचित जमातीच्या व्यक्तीच्या जमिनीचे गैर-आदिवासी व्यक्तीकडे हस्तांतरण (खरेदी, गहाण, अदलाबदल) राज्य शासनाच्या किंवा जिल्हाधिकाऱ्यांच्या पूर्वपरवानगीशिवाय अवैध ठरते. उल्लंघन झाल्यास जमीन मूळ आदिवासी मालकास किंवा शासनाकडे जमा करण्याचे वैधानिक अधिकार.',
    descEn: 'Alienation of Scheduled Tribe land to non-tribals without prior sanction of State Government / Collector is void ab initio. Empowers Collector to restore possession to tribal owner or repossess to Government.',
    penaltyMr: 'खरेदी खत रद्दबातल + तात्काळ ताबा जप्ती',
    penaltyEn: 'Conveyance Nullified + Eviction',
  },
  {
    sectionMr: 'कलम ५० ते ५४',
    sectionEn: 'Sections 50 to 54',
    titleEn: 'Sections 50 to 54 (Govt & Gairan Lands)',
    titleMr: 'शासकीय व गायरान जमिनींवरील अतिक्रमण निष्कासन',
    authorityMr: 'तहसीलदार / उपविभागीय अधिकारी (SDO)',
    authorityEn: 'Tahsildar / Sub-Divisional Officer (SDO)',
    color: 'border-blue-400 bg-blue-50/50',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: Landmark,
    iconColor: 'text-blue-600',
    descMr: 'शासकीय जमीन, गायरान, ई-क्लास, पांदण रस्ते व वनजमिनींवर झालेले कोणतेही अतिक्रमण निष्कासित करण्याचे व अनधिकृत वापरकर्त्यावर दंड आकारण्याचे पूर्ण अधिकार तहसीलदारांना प्राप्त आहेत.',
    descEn: 'Summary eviction powers vested in revenue officers to clear encroachments on government vesting lands, gairan commons, access cart-tracks, and forest parcels, with statutory compounding fines.',
    penaltyMr: 'निष्कासन नोटीस + चालू आकारणीच्या २५ पट दंड',
    penaltyEn: 'Eviction Notice + 25x Non-Agri Penalty',
  },
  {
    sectionMr: 'कलम ४२, ४४ व ४५',
    sectionEn: 'Sections 42 to 45',
    titleEn: 'Section 42-45 (Unauthorized NA Conversion)',
    titleMr: 'विनापरवानगी अ.कृ. वापर व शर्तभंग',
    authorityMr: 'जिल्हाधिकारी / उपविभागीय अधिकारी (SDO)',
    authorityEn: 'District Collector / SDO',
    color: 'border-indigo-400 bg-indigo-50/50',
    tagColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    icon: AlertOctagon,
    iconColor: 'text-indigo-600',
    descMr: 'कृषी जमिनीचा अथवा भोगवटादार वर्ग-२ जमिनीचा सक्षम महसूल प्राधिकाऱ्यांच्या पूर्वपरवानगीशिवाय निवासी, व्यावसायिक अथवा औद्योगिक कारणासाठी वापर (विनापरवानगी अ.कृ. वापर) केल्यास तो गंभीर शर्तभंग मानला जातो.',
    descEn: 'Unauthorized diversion of agricultural or conditional Bhogvatdar Class-2 land for commercial, residential or industrial purposes triggers immediate breach of tenure, penal assessment, and repossession.',
    penaltyMr: '२५ पट दंड + अकृषिक कर + शासन जमा',
    penaltyEn: '25x Fine + Retrospective NA Tax + Repossession',
  },
  {
    sectionMr: 'प्रपत्र-३ नियम',
    sectionEn: 'Prapatra-3 Standard',
    titleEn: 'Prapatra-3 Statutory Audit Standard',
    titleMr: 'शर्तभंग तपासणी मासिक वैधानिक नोंदवही',
    authorityMr: 'विभागीय आयुक्त / जिल्हाधिकारी',
    authorityEn: 'Divisional Commissioner / Collector',
    color: 'border-emerald-400 bg-emerald-50/50',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: FileSpreadsheet,
    iconColor: 'text-emerald-600',
    descMr: 'महाराष्ट्र शासनाच्या महसूल विभागामार्फत दरमहा घेण्यात येणाऱ्या तपासणीचा अधिकृत विहित नमुना. सर्व १५ तालुक्यांतील प्रलंबित सुनावण्या, शासन जमा क्षेत्र व नियमितीकरण अहवाल एका क्लिकवर संकलित होतात.',
    descEn: 'Mandatory statutory monthly return required by Government of Maharashtra Revenue & Forest Department, consolidating pending trials, repossessed hectares, and compoundings across all 15 talukas.',
    penaltyMr: 'मासिक ऑडिट अहवाल एक्सेल निर्यात',
    penaltyEn: 'Statutory Monthly Return & Excel Export',
  },
];

export default function LegalComplianceSection() {
  const { isMarathi } = useTranslation();

  return (
    <section id="mlrc" className="py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-1.5 mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            <span>{isMarathi ? 'महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६' : 'Maharashtra Land Revenue Code (MLRC) 1966'}</span>
          </div>
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
            {isMarathi ? 'कायदेशीर अधिकार, कलमे व वैधानिक अंमलबजावणी' : 'Statutory Powers, Sections & Enforcement Mandates'}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            {isMarathi
              ? 'चंद्रपूर महसूल प्रशासनाद्वारे वापरण्यात येणाऱ्या मुख्य वैधानिक तरतुदी.'
              : 'Key statutory provisions invoked across Chandrapur revenue jurisdiction for land protection.'}
          </p>
        </div>

        {/* 4 Law Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {STATUTES.map((statute, idx) => {
            const Icon = statute.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-5 rounded-2xl border-2 ${statute.color} shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between space-y-3`}
              >
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black border ${statute.tagColor}`}
                    >
                      {isMarathi ? statute.sectionMr : statute.sectionEn}
                    </span>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${statute.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {isMarathi ? statute.titleMr : statute.titleEn}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {isMarathi ? statute.descMr : statute.descEn}
                  </p>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">
                      {isMarathi ? 'सक्षम अधिकारी: ' : 'Competent Authority: '}
                    </span>
                    <span className="font-bold text-slate-800">
                      {isMarathi ? statute.authorityMr : statute.authorityEn}
                    </span>
                  </div>
                  <div className="font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md text-[11px]">
                    {isMarathi ? statute.penaltyMr : statute.penaltyEn}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Glossary Reference Banner */}
        <div className="mt-4 sm:mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-amber-50/50 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs border border-blue-200/80">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
              <BookOpen className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {isMarathi
                  ? '७/१२ उताऱ्यावरील इतर हक्क व संक्षिप्त शब्दांचा अर्थ जाणून घ्यायचा आहे का?'
                  : 'Need to decode abbreviations & statutory rights on 7/12 land records?'}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isMarathi
                  ? 'अ.कृ., विनापरवानगी अ.कृ. वापर, भोगवटादार वर्ग १/२, ख.ख., ह.सो.प., बो., फे.नं. इत्यादींचा संपूर्ण शब्दकोश.'
                  : 'Comprehensive statutory dictionary of NA, unauthorized NA, Occupancy Class 1/2, Kh.Kh., encumbrances, and mutation notations.'}
              </p>
            </div>
          </div>

          <Link
            href="/glossary"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition shrink-0 shadow-xs hover:shadow-md cursor-pointer"
          >
            <span>{isMarathi ? 'महसूल शब्दावली मार्गदर्शक पहा' : 'View Revenue Glossary Guide'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
