import Link from 'next/link';
import { ArrowLeft, Scale, AlertTriangle, BookOpen } from 'lucide-react';
import ChandrapurDistrictLogo from '../../components/landing/ChandrapurDistrictLogo';

export const metadata = {
  title: 'नियम व अटी (Terms & Conditions) | जिल्हाधिकारी कार्यालय, चंद्रपूर',
  description: 'जिल्हाधिकारी कार्यालय चंद्रपूर जमीन महसूल पोर्टलचे अधिकृत नियम व अटी.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-200 bg-gradient-to-r from-amber-50/60 to-slate-50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य पृष्ठावर परत जा</span>
            </Link>

            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
              MLRC 1966 Statutory Terms
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ChandrapurDistrictLogo className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                महाराष्ट्र शासन | जिल्हाधिकारी कार्यालय, चंद्रपूर
              </p>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                नियम व अटी (Terms of Use & Disclaimer)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ च्या कायदेशीर चौकटीत लागू
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-900" />
              <span>१. पोर्टलचा कायदेशीर दर्जा व वापर (Legal Status & Usage)</span>
            </h2>
            <p>
              या पोर्टलवर प्रदर्शित करण्यात आलेली माहिती ही चंद्रपूर जिल्ह्यातील जमीन अभिलेखांचे संनियंत्रण,
              १९५० मूळ शीर्षक पडताळणी, आदिवासी जमीन संरक्षण (कलम ३६/३६अ) आणि शर्तभंग प्रकरणांच्या
              प्रशासकीय सुलभतेसाठी आहे.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>२. वैधानिक अस्वीकरण (Statutory Disclaimer)</span>
            </h2>
            <p>
              पोर्टलवरील माहिती केवळ प्राथमिक माहितीसाठी आहे. कोणत्याही न्यायालयीन दाव्यासाठी अथवा कायदेशीर
              दस्तऐवजासाठी संबंधित तहसीलदार / उपविभागीय अधिकारी यांच्या कार्यालयाने दिलेली अधिकृत
              <strong> स्वाक्षरी व शिक्का असलेली प्रमाणित प्रत (Certified Copy under Sec 327 MLRC)</strong>
              हीच अंतिम व ग्राह्य धरली जाईल.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-900" />
              <span>३. अधिकार क्षेत्र (Jurisdiction)</span>
            </h2>
            <p>
              या पोर्टलच्या वापरासंदर्भातील कोणत्याही कायदेशीर बाबींसाठी न्यायिक अधिकार क्षेत्र हे
              केवळ जिल्हा न्यायालय, चंद्रपूर आणि उच्च न्यायालय, मुंबई (नागपूर खंडपीठ) हेच राहील.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
