import Link from 'next/link';
import { ArrowLeft, Eye, CheckCircle2, LifeBuoy, Sparkles } from 'lucide-react';
import ChandrapurDistrictLogo from '../../components/landing/ChandrapurDistrictLogo';

export const metadata = {
  title: 'सुलभता विधान (Accessibility Statement) | जिल्हाधिकारी कार्यालय, चंद्रपूर',
  description: 'GIGW 3.0 व WCAG 2.1 AA मानकांनुसार जिल्हाधिकारी कार्यालय चंद्रपूर सुलभता विधान.',
};

export default function AccessibilityStatementPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

        <div className="p-6 sm:p-10 border-b border-slate-200 bg-gradient-to-r from-emerald-50/60 to-slate-50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य पृष्ठावर परत जा</span>
            </Link>

            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-300">
              GIGW 3.0 / WCAG 2.1 Level AA
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ChandrapurDistrictLogo className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                महाराष्ट्र शासन | राष्ट्रीय सूचना विज्ञान केंद्र (NIC) मार्गदर्शक तत्त्वे
              </p>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                सुलभता विधान (Accessibility Statement)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                सर्व नागरिकांना, विशेष गरजा असणाऱ्या व्यक्तींना समान डिजिटल सेवा देण्यास कटिबद्ध
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>१. मानकांची पूर्तता (Compliance Standards)</span>
            </h2>
            <p>
              जिल्हाधिकारी कार्यालय, चंद्रपूर हे पोर्टल भारतीय शासकीय संकेतस्थळांची मार्गदर्शक तत्त्वे
              <strong> (GIGW 3.0 - Guidelines for Indian Government Websites)</strong> आणि
              जागतिक स्तरावरील <strong>WCAG 2.1 (Web Content Accessibility Guidelines) Level AA</strong>
              च्या मानकांनुसार विकसित करण्यात आले आहे.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-700" />
              <span>२. उपलब्ध सुलभता वैशिष्ट्ये (Accessibility Features Available)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">अक्षर आकार नियंत्रण (Font Sizing)</p>
                <p className="text-xs text-slate-600">
                  वाचकांना मजकुराचा आकार लहान (A-), सामान्य (A) किंवा मोठा (A+) करण्याची सुविधा वरील
                  सुलभता पट्टीमध्ये उपलब्ध आहे.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">प्रखर कॉन्ट्रास्ट (High Contrast Mode)</p>
                <p className="text-xs text-slate-600">
                  दृष्टिदोष असणाऱ्यांसाठी काळ्या पार्श्वभूमीवर पांढरा मजकूर व ठळक दृश्य घटकांचा पर्याय उपलब्ध आहे.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">स्क्रीन रीडर सुलभता (Screen Readers)</p>
                <p className="text-xs text-slate-600">
                  दृष्टीहीन वापरकर्त्यांसाठी JAWS, NVDA आणि TalkBack सारख्या स्क्रीन रीडर्सशी पूर्ण सुसंगत
                  ARIA लेबल्स व सिमेंटिक टॅग्स वापरले आहेत.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">कीबोर्ड नेव्हिगेशन (Keyboard Accessible)</p>
                <p className="text-xs text-slate-600">
                  माऊस न वापरता केवळ Tab आणि Enter की द्वारे सर्व बटणे आणि फॉर्म्स सहजतेने वापरता येतात.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-emerald-700" />
              <span>३. अभिप्राय व संपर्क (Feedback & Assistance)</span>
            </h2>
            <p>
              आपणास हे संकेतस्थळ वापरताना सुलभतेबाबत कोणतीही अडचण आल्यास कृपया आम्हाला त्वरित कळवा:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
              <p className="font-bold text-slate-900">सुलभता समन्वयक कक्ष, जिल्हाधिकारी कार्यालय चंद्रपूर</p>
              <p>ईमेल: collector.chandrapur@maharashtra.gov.in | दूरध्वनी: ०७१७२-२५११००</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
