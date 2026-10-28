'use client';

import Link from 'next/link';
import {
  UploadCloud,
  History,
  Scale,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useTranslation } from '../LanguageContext';

const STEPS = [
  {
    stepMr: '०१',
    stepEn: '01',
    titleMr: 'गाववार महसूल अभिलेख संकलन व गट नोंदणी',
    titleEn: 'Village Revenue Records Ingestion & Parcel Registry',
    descMr: 'तलाठी व मंडळ अधिकाऱ्यांनी संकलित केलेल्या गाव अभिलेख नोंदवह्यांचे डिजिटायझेशन. प्रत्येक गट व सर्व्हे क्रमांकासाठी अधिकृत नोंदणी केली जाते.',
    descEn: 'Digitization of village land registers gathered by Talathis and Circle Officers, establishing verified unique parcel IDs.',
    icon: UploadCloud,
    color: 'from-blue-600 to-indigo-600',
    link: '/bulk-upload',
    linkTextMr: 'एक्सेल अपलोड पोर्टल',
    linkTextEn: 'Excel Upload Portal',
  },
  {
    stepMr: '०२',
    stepEn: '02',
    titleMr: '१९५० मूळ शीर्षक साखळी पडताळणी',
    titleEn: '1950 Baseline Provenance Linkage',
    descMr: 'विद्यमान ७/१२ मधील नोंदींची १९५० च्या मूळ हक्कनोंदी व फेरफारांशी संगणकीय तुलना. बु.ग.दे. व ता.ग.दे. मधील पोकळ व बेकायदेशीर नोंदी त्वरित निष्पन्न होतात.',
    descEn: 'Algorithmic cross-referencing of active 7/12 entries against 1950 baseline sanads, uncovering void mutations and irregular grants.',
    icon: History,
    color: 'from-emerald-600 to-teal-600',
    link: '/parcels',
    linkTextMr: 'भूखंड साखळी शोधा',
    linkTextEn: 'Trace Parcel History',
  },
  {
    stepMr: '०३',
    stepEn: '03',
    titleMr: 'शर्तभंग नोंद व SDO अर्ध-न्यायिक सुनावणी',
    titleEn: 'Quasi-Judicial SDO Court Hearings',
    descMr: 'कलम ३६, ३६अ, ५०-५४ किंवा अकृषिक शर्तभंग आढळल्यास आपोआप खटला दाखल. नोटीस बजावणी, जागेचा पंचनामा व सुनावणी दैनंदिनीचे डिजिटल व्यवस्थापन.',
    descEn: 'Automatic registration of inquiries upon Section 36, 36A, 50-54 or NA breach, streamlining summons, spot panchnamas, and daily roznama.',
    icon: Scale,
    color: 'from-amber-600 to-orange-600',
    link: '/cases',
    linkTextMr: 'सुनावणी प्रकरणे पहा',
    linkTextEn: 'View Hearing Cases',
  },
  {
    stepMr: '०४',
    stepEn: '04',
    titleMr: 'शासन जमा आदेश व ७/१२ दुरुस्ती',
    titleEn: 'Govt Repossession & Mutation Update',
    descMr: 'उपविभागीय अधिकारी किंवा जिल्हाधिकाऱ्यांचा अंतिम आदेश पारित झाल्यावर अनधिकृत व्यवहार रद्दबातल ठरवून ७/१२ वर थेट "महाराष्ट्र शासन" नावाची दुरुस्ती.',
    descEn: 'Formal execution of Collector / SDO final repossession decrees, nullifying illegal conveyances and mutating ownership to Maharashtra Govt.',
    icon: ShieldCheck,
    color: 'from-indigo-600 to-blue-800',
    link: '/reports',
    linkTextMr: 'प्रपत्र-३ अहवाल पहा',
    linkTextEn: 'View Prapatra-3',
  },
];

export default function WorkflowSection() {
  const { isMarathi } = useTranslation();

  return (
    <section id="workflow" className="py-6 sm:py-8 bg-slate-50 text-slate-900 relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-1.5 mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>{isMarathi ? 'पारदर्शक महसूल कार्यप्रणाली' : 'Transparent Revenue Workflow'}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {isMarathi
              ? 'गाव स्तरापासून ते शासन जमा आदेशापर्यंतची प्रक्रिया'
              : 'End-to-End Workflow: Ingestion to Government Repossession'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isMarathi
              ? 'कच्च्या एक्सेल डेटाचे वैधानिक संनियंत्रणात रूपांतर करणारी ४-टप्पीय अत्याधुनिक डिजिटल चौकट.'
              : 'A 4-stage statutory framework converting raw village land spreadsheets into enforceable audit controls.'}
          </p>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STEPS.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-400 hover:shadow-xs transition duration-200 group"
              >
                <div className="space-y-4">
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-900 font-mono">
                      {isMarathi ? stepItem.stepMr : stepItem.stepEn}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stepItem.color} flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {isMarathi ? stepItem.titleMr : stepItem.titleEn}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isMarathi ? stepItem.descMr : stepItem.descEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={stepItem.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 transition"
                  >
                    <span>{isMarathi ? stepItem.linkTextMr : stepItem.linkTextEn}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
