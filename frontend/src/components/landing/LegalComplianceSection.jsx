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
} from 'lucide-react';

const STATUTES = [
  {
    section: 'कलम ३६ व ३६अ',
    titleEn: 'Section 36 & 36A (Tribal Land Protection)',
    titleMr: 'आदिवासी जमिनींचे हस्तांतरण निर्बंध व संरक्षण',
    authority: 'जिल्हाधिकारी / सक्षम प्राधिकारी',
    color: 'border-amber-400 bg-amber-50/50',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: ShieldAlert,
    iconColor: 'text-amber-600',
    desc: 'अनुसूचित जमातीच्या व्यक्तीच्या जमिनीचे गैर-आदिवासी व्यक्तीकडे हस्तांतरण (खरेदी, गहाण, अदलाबदल) राज्य शासनाच्या किंवा जिल्हाधिकाऱ्यांच्या पूर्वपरवानगीशिवाय अवैध ठरते. उल्लंघन झाल्यास जमीन मूळ आदिवासी मालकास किंवा शासनाकडे जमा करण्याचे वैधानिक अधिकार.',
    penalty: 'खरेदी खत रद्दबातल + तात्काळ ताबा जप्ती',
  },
  {
    section: 'कलम ५० ते ५४',
    titleEn: 'Sections 50 to 54 (Govt & Gairan Lands)',
    titleMr: 'शासकीय व गायरान जमिनींवरील अतिक्रमण निष्कासन',
    authority: 'तहसीलदार / उपविभागीय अधिकारी (SDO)',
    color: 'border-blue-400 bg-blue-50/50',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: Landmark,
    iconColor: 'text-blue-600',
    desc: 'शासकीय जमीन, गायरान, ई-क्लास, पांदण रस्ते व वनजमिनींवर झालेले कोणतेही अतिक्रमण निष्कासित करण्याचे व अनधिकृत वापरकर्त्यावर दंड आकारण्याचे पूर्ण अधिकार तहसीलदारांना प्राप्त आहेत.',
    penalty: 'निष्कासन नोटीस + चालू आकारणीच्या २५ पट दंड',
  },
  {
    section: 'कलम ४४',
    titleEn: 'Section 44 (Unauthorized NA Use)',
    titleMr: 'अनधिकृत अकृषिक (NA) वापर व शर्तभंग',
    authority: 'जिल्हाधिकारी / उपविभागीय अधिकारी',
    color: 'border-indigo-400 bg-indigo-50/50',
    tagColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    icon: AlertOctagon,
    iconColor: 'text-indigo-600',
    desc: 'कृषी प्रयोजनासाठी दिलेल्या किंवा भोगवटादार वर्ग-२ अंतर्गत वाटप केलेल्या जमिनीचा पूर्वपरवानगीशिवाय निवासी, व्यावसायिक अथवा औद्योगिक कारणासाठी वापर केल्यास तो गंभीर शर्तभंग मानला जातो.',
    penalty: 'अकृषिक कर आकारणी + शासन जमा आदेश',
  },
  {
    section: 'प्रपत्र-३ नियम',
    titleEn: 'Prapatra-3 Statutory Audit Standard',
    titleMr: 'शर्तभंग तपासणी मासिक वैधानिक नोंदवही',
    authority: 'विभागीय आयुक्त / जिल्हाधिकारी',
    color: 'border-emerald-400 bg-emerald-50/50',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: FileSpreadsheet,
    iconColor: 'text-emerald-600',
    desc: 'महाराष्ट्र शासनाच्या महसूल विभागामार्फत दरमहा घेण्यात येणाऱ्या तपासणीचा अधिकृत विहित नमुना. सर्व १५ तालुक्यांतील प्रलंबित सुनावण्या, शासन जमा क्षेत्र व नियमितीकरण अहवाल एका क्लिकवर संकलित होतात.',
    penalty: 'मासिक ऑडिट अहवाल एक्सेल निर्यात',
  },
];

export default function LegalComplianceSection() {
  return (
    <section id="mlrc" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            <span>महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            कायदेशीर अधिकार, कलमे व वैधानिक अंमलबजावणी
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            चंद्रपूर महसूल प्रशासनाद्वारे वापरण्यात येणाऱ्या मुख्य वैधानिक तरतुदी ज्यांच्या आधारे भूखंडांची वैधता तपासली जाते आणि अर्ध-न्यायिक सुनावणी चालविली जाते.
          </p>
        </div>

        {/* 4 Law Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STATUTES.map((statute, idx) => {
            const Icon = statute.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border-2 ${statute.color} shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black border ${statute.tagColor}`}
                    >
                      {statute.section}
                    </span>
                    <Icon className={`w-6 h-6 ${statute.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{statute.titleMr}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{statute.titleEn}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{statute.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">सक्षम अधिकारी: </span>
                    <span className="font-bold text-slate-800">{statute.authority}</span>
                  </div>
                  <div className="font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md text-[11px]">
                    {statute.penalty}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner in Clean Light Style */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/90 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-blue-950">
              प्रपत्र-३ वैधानिक अहवाल केंद्र (MLRC Prapatra-3 Ready)
            </h4>
            <p className="text-xs text-slate-600">
              चंद्रपूर जिल्ह्यातील सर्व १५ तालुक्यांचा महसूल तपासणी प्रपत्र-३ एक्सेल फॉरमॅटमध्ये थेट डाऊनलोड करा.
            </p>
          </div>
          <Link
            href="/reports"
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>प्रपत्र-३ अहवाल पहा</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
