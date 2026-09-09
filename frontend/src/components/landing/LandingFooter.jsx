'use client';

import Link from 'next/link';
import {
  Landmark,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Building,
  Scale,
} from 'lucide-react';
import { AshokStambhEmblem, MaharashtraSeal } from './GovEmblem';

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Collectorate Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AshokStambhEmblem className="w-10 h-10" />
              <div>
                <h3 className="text-white font-black text-sm leading-tight">
                  जिल्हाधिकारी कार्यालय, चंद्रपूर
                </h3>
                <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                  महसूल व भूमी अभिलेख विभाग
                </p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ अंतर्गत चंद्रपूर जिल्ह्यातील १५ तालुक्यांतील जमीन अभिलेख संनियंत्रण, १९५० मूळ शीर्षक तपासणी व अर्ध-न्यायिक सुनावणी पोर्टल.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-900 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>जिल्हाधिकारी संकुल, चंद्रपूर - ४४२४०१ (महाराष्ट्र)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>दूरध्वनी: +९१ ७१७२ २५११०० / २५२२००</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>collector.chandrapur@maharashtra.gov.in</span>
              </div>
            </div>
          </div>

          {/* Col 2: Internal Portal Modules */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              महसूल पोर्टल विभाग
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span>
                  <span>महसूल अधिकारी डॅशबोर्ड (Dashboard)</span>
                </Link>
              </li>
              <li>
                <Link href="/parcels" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span>
                  <span>भूखंड नोंदवही व ३६०° साखळी (7/12 Trace)</span>
                </Link>
              </li>
              <li>
                <Link href="/cases" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span>
                  <span>शर्तभंग व SDO सुनावणी खटले (Hearings)</span>
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span>
                  <span>अभिलेखागार रॅक व फाईल शोध (Cloud DMS)</span>
                </Link>
              </li>
              <li>
                <Link href="/bulk-upload" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span>
                  <span>गाव एक्सेल डेटा अपलोड (Bulk Upload)</span>
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span>
                  <span>प्रपत्र-३ वैधानिक अहवाल केंद्र (Export)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: External Government Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              शासकीय अधिकृत संकेतस्थळे
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a
                  href="https://mahabhumi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between group"
                >
                  <span>महाभूमी अधिकृत पोर्टल</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://bhulekh.mahabhumi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between group"
                >
                  <span>महाभूलेख (७/१२ व ८-अ उतारा)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://grievances.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between group"
                >
                  <span>आपले सरकार तक्रार निवारण</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://chandrapur.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between group"
                >
                  <span>चंद्रपूर जिल्हा अधिकृत पोर्टल</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.digitalindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between group"
                >
                  <span>डिजिटल इंडिया भूमी अभिलेख (DILRMP)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Standards & Security Badges */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              प्रणाली सुरक्षा व मानके
            </h4>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>NIC सुरक्षा मार्गदर्शक प्रमाणित</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                राष्ट्रीय माहिती विज्ञान केंद्र (NIC) मार्गदर्शक तत्त्वांनुसार सुरक्षित सर्व्हरलेस डेटाबेस व एंड-टू-एंड एनक्रिप्शन.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                PostgreSQL Neon
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                Cloudinary DMS
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                MLRC 1966
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-slate-500">
          <p>
            © २०२६ जिल्हाधिकारी कार्यालय, चंद्रपूर (Collectorate Chandrapur). सर्व हक्क सुरक्षित.
          </p>
          <p>
            डिझाईन व विकसित: महसूल व भूमी अभिलेख कक्ष, जिल्हा चंद्रपूर (महाराष्ट्र)
          </p>
        </div>
      </div>

      {/* Tricolor Ribbon at bottom */}
      <div className="gov-tricolor-bar" />
    </footer>
  );
}
