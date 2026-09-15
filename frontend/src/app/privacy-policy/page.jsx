import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText, Building2 } from 'lucide-react';
import ChandrapurDistrictLogo from '../../components/landing/ChandrapurDistrictLogo';

export const metadata = {
  title: 'गोपनीयता धोरण (Privacy Policy) | जिल्हाधिकारी कार्यालय, चंद्रपूर',
  description: 'जिल्हाधिकारी कार्यालय चंद्रपूर जमीन महसूल पोर्टलचे अधिकृत गोपनीयता धोरण - DPDPA 2023 व IT Act 2000.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

        <div className="p-6 sm:p-10 border-b border-slate-200 bg-gradient-to-r from-blue-50/70 to-slate-50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य पृष्ठावर परत जा</span>
            </Link>

            <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full border border-blue-200">
              GIGW 3.0 / DPDPA 2023 Compliant
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ChandrapurDistrictLogo className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                महाराष्ट्र शासन | महसूल व वन विभाग
              </p>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                गोपनीयता धोरण (Privacy Policy)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                जिल्हाधिकारी कार्यालय, चंद्रपूर — शेवटचे अद्ययावत: १५ सप्टेंबर २०२६
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-900" />
              <span>१. प्रास्ताविक व व्याप्ती (Introduction & Scope)</span>
            </h2>
            <p>
              हे गोपनीयता धोरण जिल्हाधिकारी कार्यालय चंद्रपूर द्वारे संचालित जमीन महसूल, भूमी अभिलेख व
              शर्तभंग संनियंत्रण पोर्टल (MLRC 1966) या प्रणालीवर लागू आहे. सदर पोर्टलद्वारे जमा होणारी
              सर्व माहिती ही डिजिटल व्यक्तिगत डेटा संरक्षण कायदा (DPDPA 2023) आणि माहिती तंत्रज्ञान कायदा
              २००० (IT Act 2000) च्या तरतुदींनुसार काटेकोरपणे संरक्षित ठेवली जाते.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-900" />
              <span>२. गोळा करण्यात येणारी माहिती (Data Collection)</span>
            </h2>
            <p>
              नागरिक सेवा व अधिकृत महसूल कामकाजासाठी खालील माहिती गोळा केली जाते:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>अभिलेख माहिती:</strong> ७/१२ उतारा, फेरफार पत्रक (Village Form VI), सन १९५० मूळ
                हस्तलिखित नोंदी, गट क्रमांक, क्षेत्रफळ व भोगवटादार वर्ग.
              </li>
              <li>
                <strong>वापरकर्ता माहिती:</strong> अधिकृत महसूल अधिकारी व नोंदणीकृत नागरिकांचे नाव, शासकीय
                ईमेल, मोबाईल क्रमांक व पदनिर्देश.
              </li>
              <li>
                <strong>प्रणाली ऑडिट लॉग्स:</strong> लॉगिन वेळ, आयपी पत्ता, वापरकर्ता एजंट व अर्ध-न्यायिक
                आदेशांच्या बदलांची इलेक्ट्रॉनिक नोंद (भारतीय पुरावा कायदा कलम ६५B अनुपालन).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-900" />
              <span>३. डेटा सुरक्षा व तृतीय-पक्ष निर्बंध (Security & Third-Party Disclosure)</span>
            </h2>
            <p>
              शासकीय जमीन अभिलेख हे सार्वजनिक सुरक्षिततेसाठी संकलित केलेले असून कोणत्याही अनधिकृत
              व्यावसायिक हेतूसाठी विकले अथवा हस्तांतरित केले जात नाहीत. सर्व डेटा ट्रान्समिशन
              SSL/TLS कूटबद्धीकरणाने (Encryption) सुरक्षित केलेले आहे.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-900" />
              <span>४. तक्रार निवारण अधिकारी (Grievance Redressal Officer)</span>
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
              <p className="font-bold text-slate-900">जिल्हा महसूल माहिती अधिकारी / तक्रार निवारण अधिकारी</p>
              <p>जिल्हाधिकारी कार्यालय, चंद्रपूर - ४४२४०१, महाराष्ट्र</p>
              <p>ईमेल: collector.chandrapur@maharashtra.gov.in | दूरध्वनी: ०७१७२-२५११००</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
