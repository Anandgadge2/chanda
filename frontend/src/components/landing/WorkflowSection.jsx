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

const STEPS = [
  {
    step: '०१',
    titleMr: 'गाव एक्सेल अंतर्ग्रहण व UPI निर्मिती',
    titleEn: 'Village Excel Ingestion & Auto UPI',
    desc: 'तलाठी व मंडळ अधिकाऱ्यांनी जमा केलेल्या गाव एक्सेल शीटचे स्वयंचलित वाचन. प्रत्येक गट व सर्व्हेसाठी मानकीकृत Unique Parcel ID (UPI) तयार केला जातो.',
    icon: UploadCloud,
    color: 'from-blue-600 to-indigo-600',
    link: '/bulk-upload',
    linkText: 'एक्सेल अपलोड पोर्टल',
  },
  {
    step: '०२',
    titleMr: '१९५० मूळ शीर्षक साखळी पडताळणी',
    titleEn: '1950 Baseline Provenance Linkage',
    desc: 'विद्यमान ७/१२ मधील नोंदींची १९५० च्या मूळ हक्कनोंदी व फेरफारांशी संगणकीय तुलना. बु.ग.दे. व ता.ग.दे. मधील पोकळ व बेकायदेशीर नोंदी त्वरित निष्पन्न होतात.',
    icon: History,
    color: 'from-emerald-600 to-teal-600',
    link: '/parcels',
    linkText: 'भूखंड साखळी शोधा',
  },
  {
    step: '०३',
    titleMr: 'शर्तभंग नोंद व SDO अर्ध-न्यायिक सुनावणी',
    titleEn: 'Quasi-Judicial SDO Court Hearings',
    desc: 'कलम ३६, ३६अ, ५०-५४ किंवा अकृषिक शर्तभंग आढळल्यास आपोआप खटला दाखल. नोटीस बजावणी, जागेचा पंचनामा व सुनावणी दैनंदिनीचे डिजिटल व्यवस्थापन.',
    icon: Scale,
    color: 'from-amber-600 to-orange-600',
    link: '/cases',
    linkText: 'सुनावणी प्रकरणे पहा',
  },
  {
    step: '०४',
    titleMr: 'शासन जमा आदेश व ७/१२ दुरुस्ती',
    titleEn: 'Govt Repossession & Mutation Update',
    desc: 'उपविभागीय अधिकारी किंवा जिल्हाधिकाऱ्यांचा अंतिम आदेश पारित झाल्यावर अनधिकृत व्यवहार रद्दबातल ठरवून ७/१२ वर थेट "महाराष्ट्र शासन" नावाची दुरुस्ती.',
    icon: ShieldCheck,
    color: 'from-purple-600 to-indigo-700',
    link: '/reports',
    linkText: 'प्रपत्र-३ अहवाल पहा',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="py-16 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>पारदर्शक महसूल कार्यप्रणाली (End-to-End Governance Lifecycle)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            गाव स्तरापासून ते शासन जमा आदेशापर्यंतची प्रक्रिया
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            कच्च्या एक्सेल डेटाचे वैधानिक संनियंत्रणात रूपांतर करणारी ४-टप्पीय अत्याधुनिक डिजिटल चौकट.
          </p>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-500 transition duration-200 group"
              >
                <div className="space-y-4">
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {stepItem.step}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stepItem.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-base font-black text-white leading-snug">
                      {stepItem.titleMr}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {stepItem.titleEn}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{stepItem.desc}</p>
                </div>

                {/* Link */}
                <div className="pt-3 border-t border-slate-700/60">
                  <Link
                    href={stepItem.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                  >
                    <span>{stepItem.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
