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

