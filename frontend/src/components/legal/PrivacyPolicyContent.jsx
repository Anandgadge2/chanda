'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText, Building2 } from 'lucide-react';
import ChandrapurDistrictLogo from '../landing/ChandrapurDistrictLogo';
import { useTranslation } from '../LanguageContext';

export default function PrivacyPolicyContent() {
  const { isMarathi } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-200 bg-gradient-to-r from-blue-50/70 to-slate-50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isMarathi ? 'मुख्य पृष्ठावर परत जा' : 'Back to Home'}</span>
            </Link>

            <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full border border-blue-200">
              GIGW 3.0 / DPDPA 2023 Compliant
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ChandrapurDistrictLogo className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {isMarathi ? 'महाराष्ट्र शासन | महसूल व वन विभाग' : 'Govt of Maharashtra | Revenue & Forest Dept'}
              </p>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isMarathi ? 'गोपनीयता धोरण (Privacy Policy)' : 'Privacy Policy'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isMarathi
                  ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर — शेवटचे अद्ययावत: १५ सप्टेंबर २०२६'
                  : 'District Collectorate, Chandrapur — Last Updated: 15 September 2026'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-900" />
              <span>{isMarathi ? '१. प्रास्ताविक व व्याप्ती (Introduction & Scope)' : '1. Introduction & Scope'}</span>
            </h2>
            <p>
              {isMarathi
                ? 'हे गोपनीयता धोरण जिल्हाधिकारी कार्यालय चंद्रपूर द्वारे संचालित जमीन महसूल, भूमी अभिलेख व शर्तभंग संनियंत्रण पोर्टल (MLRC 1966) या प्रणालीवर लागू आहे. सदर पोर्टलद्वारे जमा होणारी सर्व माहिती ही डिजिटल व्यक्तिगत डेटा संरक्षण कायदा (DPDPA 2023) आणि माहिती तंत्रज्ञान कायदा २००० (IT Act 2000) च्या तरतुदींनुसार काटेकोरपणे संरक्षित ठेवली जाते.'
                : 'This Privacy Policy applies to the Land Governance, Provenance and MLRC 1966 Violation Monitoring Portal operated by the District Collectorate of Chandrapur. All data collected is strictly protected under the Digital Personal Data Protection Act (DPDPA 2023) and Information Technology Act 2000.'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-900" />
              <span>{isMarathi ? '२. गोळा करण्यात येणारी माहिती (Data Collection)' : '2. Categories of Data Collected'}</span>
            </h2>
            <p>
              {isMarathi ? 'नागरिक सेवा व अधिकृत महसूल कामकाजासाठी खालील माहिती गोळा केली जाते:' : 'For authorized statutory services, the following categories of information are processed:'}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>{isMarathi ? 'अभिलेख माहिती:' : 'Revenue Records:'}</strong>{' '}
                {isMarathi
                  ? '७/१२ उतारा, फेरफार पत्रक (Village Form VI), सन १९५० मूळ हस्तलिखित नोंदी, गट क्रमांक, क्षेत्रफळ व भोगवटादार वर्ग.'
                  : '7/12 extracts, Mutation Register (Village Form VI), 1950 baseline records, survey numbers, land parcel area and tenure classification.'}
              </li>
              <li>
                <strong>{isMarathi ? 'वापरकर्ता माहिती:' : 'User Identity:'}</strong>{' '}
                {isMarathi
                  ? 'अधिकृत महसूल अधिकारी व नोंदणीकृत नागरिकांचे नाव, शासकीय ईमेल, मोबाईल क्रमांक व पदनिर्देश.'
                  : 'Name, official government email, verified mobile number, and designation of revenue officers.'}
              </li>
              <li>
                <strong>{isMarathi ? 'प्रणाली ऑडिट लॉग्स:' : 'System Audit Logs:'}</strong>{' '}
                {isMarathi
                  ? 'लॉगिन वेळ, आयपी पत्ता, वापरकर्ता एजंट व अर्ध-न्यायिक आदेशांच्या बदलांची इलेक्ट्रॉनिक नोंद (भारतीय पुरावा कायदा कलम ६५B अनुपालन).'
                  : 'Access timestamps, IP addresses, user agent, and tamper-evident audit logs complying with Section 65B of Indian Evidence Act.'}
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-900" />
              <span>{isMarathi ? '३. डेटा सुरक्षा व तृतीय-पक्ष निर्बंध (Security & Third-Party Disclosure)' : '3. Security & Non-Disclosure'}</span>
            </h2>
            <p>
              {isMarathi
                ? 'शासकीय जमीन अभिलेख हे सार्वजनिक सुरक्षिततेसाठी संकलित केलेले असून कोणत्याही अनधिकृत व्यावसायिक हेतूसाठी विकले अथवा हस्तांतरित केले जात नाहीत. सर्व डेटा ट्रान्समिशन SSL/TLS कूटबद्धीकरणाने (Encryption) सुरक्षित केलेले आहे.'
                : 'Cadastral records are processed exclusively for state governance and are never transferred or monetized. All data in transit is encrypted using modern TLS 1.3 standards.'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-900" />
              <span>{isMarathi ? '४. तक्रार निवारण यंत्रणा (Grievance Redressal Mechanism)' : '4. Grievance Redressal Mechanism'}</span>
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
              <p className="font-bold text-slate-900">{isMarathi ? 'जिल्हा महसूल तक्रार निवारण अधिकारी' : 'District Revenue Grievance Redressal Officer'}</p>
              <p>{isMarathi ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर - ४४२४०१, महाराष्ट्र' : 'District Collectorate, Chandrapur - 442401, Maharashtra'}</p>
              <p>Email: grievance.revenue.chandrapur@maharashtra.gov.in | Tel: +91 7172 251100</p>
              <p className="text-slate-500 text-[11px]">{isMarathi ? 'तक्रार निवारण कार्यकाळ: कमाल ३० दिवस' : 'Grievance SLA: Up to 30 days'}</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-900" />
              <span>{isMarathi ? '५. डेटा प्रिन्सिपलचे अधिकार (Data Principal Rights - DPDPA कलम ११-१३)' : '5. Data Principal Rights (DPDPA 2023 Sec 11-13)'}</span>
            </h2>
            <p>
              {isMarathi
                ? 'डिजिटल व्यक्तिगत डेटा संरक्षण कायदा २०२३ (DPDPA 2023) अंतर्गत प्रत्येक नोंदणीकृत नागरिकास (Data Principal) खालील अधिकार प्राप्त आहेत:'
                : 'Under DPDPA 2023, data principals enjoy statutory rights:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? '१. माहिती मिळविण्याचा अधिकार (Right to Access)' : '1. Right to Access'}</p>
                <p className="text-xs text-slate-600">{isMarathi ? 'आपल्या खात्याशी संबंधित वैयक्तिक माहिती, सत्र लॉग्स व संमती स्थितीचा तपशील निर्यात करण्याचा अधिकार.' : 'Right to export profile data, session history, and consent records.'}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? '२. दुरुस्ती व हटविण्याचा अधिकार (Correction & Erasure)' : '2. Right to Correction & Erasure'}</p>
                <p className="text-xs text-slate-600">{isMarathi ? 'अचूक नसलेली वैयक्तिक माहिती अद्ययावत करण्याची किंवा कायदेशीर तरतुदींच्या अधीन राहून डेटा हटविण्याची विनंती करण्याचा अधिकार.' : 'Right to rectify incorrect entries or request personal data erasure.'}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? '३. संमती मागे घेण्याचा अधिकार (Withdraw Consent)' : '3. Right to Withdraw Consent'}</p>
                <p className="text-xs text-slate-600">{isMarathi ? 'दिलेली संमती कधीही मागे घेण्याचा अधिकार. संमती मागे घेतल्यास नागरिकांच्या ऐच्छिक सेवा बंद होऊ शकतात.' : 'Right to withdraw voluntary consent at any time.'}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? '४. नामनिर्देशनाचा अधिकार (Right to Nominate)' : '4. Right to Nominate'}</p>
                <p className="text-xs text-slate-600">{isMarathi ? 'मृत्यू किंवा असमर्थतेच्या प्रसंगी आपल्या अधिकारांचा वापर करण्यासाठी वारसदार किंवा प्रतिनिधी नामनिर्देशित करण्याचा अधिकार.' : 'Right to appoint a representative in case of death or incapacity.'}</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-900" />
              <span>{isMarathi ? '६. डेटा संरक्षण अधिकारी संपर्क (Data Protection Officer - DPO)' : '6. Data Protection Officer (DPO)'}</span>
            </h2>
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs space-y-1.5">
              <p className="font-bold text-blue-950 text-sm">{isMarathi ? 'डेटा संरक्षण अधिकारी (Data Protection Officer - DPO)' : 'Data Protection Officer (DPO)'}</p>
              <p className="text-slate-800">{isMarathi ? 'पद: निवासी उपजिल्हाधिकारी (RDC) तथा मुख्य डेटा संरक्षण अधिकारी' : 'Designation: Resident Deputy Collector (RDC) & Chief DPO'}</p>
              <p className="text-slate-800">{isMarathi ? 'पत्ता: कक्ष क्र. १२, जिल्हाधिकारी कार्यालय, चंद्रपूर - ४४२४०१, महाराष्ट्र' : 'Address: Room 12, District Collectorate, Chandrapur - 442401'}</p>
              <p className="text-slate-800">
                Email: <a href="mailto:dpo.chandrapur@maharashtra.gov.in" className="font-bold text-blue-900 underline">dpo.chandrapur@maharashtra.gov.in</a>
              </p>
              <p className="text-slate-800">{isMarathi ? 'दूरध्वनी: ०७१७२-२५१२५० (कार्यालयीन वेळेत)' : 'Tel: +91 7172 251250 (Office Hours)'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
