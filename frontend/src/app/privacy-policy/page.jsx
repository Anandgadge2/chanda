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
              <span>४. तक्रार निवारण यंत्रणा (Grievance Redressal Mechanism)</span>
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
              <p className="font-bold text-slate-900">जिल्हा महसूल तक्रार निवारण अधिकारी</p>
              <p>जिल्हाधिकारी कार्यालय, चंद्रपूर - ४४२४०१, महाराष्ट्र</p>
              <p>ईमेल: grievance.revenue.chandrapur@maharashtra.gov.in | दूरध्वनी: ०७१७२-२५११००</p>
              <p className="text-slate-500 text-[11px]">तक्रार निवारण कार्यकाळ: कमाल ३० दिवस</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-900" />
              <span>५. डेटा प्रिन्सिपलचे अधिकार (Data Principal Rights - DPDPA कलम ११-१३)</span>
            </h2>
            <p>
              डिजिटल व्यक्तिगत डेटा संरक्षण कायदा २०२३ (DPDPA 2023) अंतर्गत प्रत्येक नोंदणीकृत नागरिकास (Data Principal) खालील अधिकार प्राप्त आहेत:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">१. माहिती मिळविण्याचा अधिकार (Right to Access)</p>
                <p className="text-xs text-slate-600">आपल्या खात्याशी संबंधित वैयक्तिक माहिती, सत्र लॉग्स व संमती स्थितीचा तपशील निर्यात करण्याचा अधिकार.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">२. दुरुस्ती व हटविण्याचा अधिकार (Correction & Erasure)</p>
                <p className="text-xs text-slate-600">अचूक नसलेली वैयक्तिक माहिती अद्ययावत करण्याची किंवा कायदेशीर तरतुदींच्या अधीन राहून डेटा हटविण्याची विनंती करण्याचा अधिकार.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">३. संमती मागे घेण्याचा अधिकार (Withdraw Consent)</p>
                <p className="text-xs text-slate-600">दिलेली संमती कधीही मागे घेण्याचा अधिकार. संमती मागे घेतल्यास नागरिकांच्या ऐच्छिक सेवा बंद होऊ शकतात.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">४. नामनिर्देशनाचा अधिकार (Right to Nominate)</p>
                <p className="text-xs text-slate-600">मृत्यू किंवा असमर्थतेच्या प्रसंगी आपल्या अधिकारांचा वापर करण्यासाठी वारसदार किंवा प्रतिनिधी नामनिर्देशित करण्याचा अधिकार.</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-900" />
              <span>६. डेटा संरक्षण अधिकारी संपर्क (Data Protection Officer - DPO)</span>
            </h2>
            <p>
              DPDPA २०२३ कलम ८ नुसार जिल्हा प्रशासनाने नियुक्त केलेल्या डेटा संरक्षण अधिकाऱ्यांचा (DPO) अधिकृत संपर्क तपशील खालीलप्रमाणे आहे:
            </p>
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs space-y-1.5">
              <p className="font-bold text-blue-950 text-sm">डेटा संरक्षण अधिकारी (Data Protection Officer - DPO)</p>
              <p className="text-slate-800">पद: निवासी उपजिल्हाधिकारी (RDC) तथा मुख्य डेटा संरक्षण अधिकारी</p>
              <p className="text-slate-800">पत्ता: कक्ष क्र. १२, जिल्हाधिकारी कार्यालय, चंद्रपूर - ४४२४०१, महाराष्ट्र</p>
              <p className="text-slate-800">
                अधिकृत ईमेल: <a href="mailto:dpo.chandrapur@maharashtra.gov.in" className="font-bold text-blue-900 underline">dpo.chandrapur@maharashtra.gov.in</a>
              </p>
              <p className="text-slate-800">दूरध्वनी: ०७१७२-२५१२५० (कार्यालयीन वेळेत: सकाळी ९:४५ ते संध्याकाळी ६:१५)</p>
              <p className="text-blue-900 font-semibold text-[11px] pt-1">
                * DPDPA तरतुदींनुसार प्राप्त अर्जांवर कमाल ७२ तासांच्या आत प्राथमिक पोच दिली जाते.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
