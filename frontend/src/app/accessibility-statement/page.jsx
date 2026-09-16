import Link from 'next/link';
import { ArrowLeft, Eye, CheckCircle2, LifeBuoy, Sparkles, ShieldCheck, HelpCircle, Layers } from 'lucide-react';
import ChandrapurDistrictLogo from '../../components/landing/ChandrapurDistrictLogo';

export const metadata = {
  title: 'सुलभता विधान (Accessibility Statement) | जिल्हाधिकारी कार्यालय, चंद्रपूर',
  description: 'GIGW 3.0, WCAG 2.1 Level AA व DPDPA 2023 मानकांनुसार जिल्हाधिकारी कार्यालय चंद्रपूर सुलभता विधान.',
};

export default function AccessibilityStatementPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
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
              GIGW 3.0 / WCAG 2.1 Level AA / DPDPA 2023
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ChandrapurDistrictLogo className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                महाराष्ट्र शासन | राष्ट्रीय सूचना विज्ञान केंद्र (NIC) व GIGW 3.0 मार्गदर्शक तत्त्वे
              </p>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                सुलभता विधान (Accessibility Statement)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                सर्व नागरिकांना, दिव्यांग बांधवांना व विशेष गरजा असणाऱ्या व्यक्तींना समान डिजिटल सेवा देण्यास कटिबद्ध
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-8">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>१. मानकांची पूर्तता व सुलभता दर्जा (Conformance Status)</span>
            </h2>
            <p>
              जिल्हाधिकारी कार्यालय, चंद्रपूर हे महसूल व भूमी प्रशासन पोर्टल भारतीय शासकीय संकेतस्थळांची मार्गदर्शक तत्त्वे
              <strong> (GIGW 3.0 - Guidelines for Indian Government Websites)</strong>,
              जागतिक स्तरावरील <strong>W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> मानके
              आणि <strong>डिजिटल वैयक्तिक डेटा संरक्षण अधिनियम (DPDPA 2023)</strong> च्या सर्व तरतुदींशी
              <strong> पूर्णतः सुसंगत (Substantially Conforming)</strong> आहे.
            </p>
          </section>

          {/* Section 2 */}
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
                  सुलभता पट्टीमध्ये उपलब्ध आहे (WCAG 1.4.4 Resize text up to 200%).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">प्रखर कॉन्ट्रास्ट (High Contrast Mode)</p>
                <p className="text-xs text-slate-600">
                  दृष्टिदोष असणाऱ्यांसाठी काळ्या पार्श्वभूमीवर पांढरा/पिवळा मजकूर व किमान ४.५:१ कॉन्ट्रास्ट गुणोत्तराचा पर्याय उपलब्ध आहे (WCAG 1.4.3 / 1.4.6).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">स्क्रीन रीडर सुलभता (Screen Readers)</p>
                <p className="text-xs text-slate-600">
                  दृष्टीहीन वापरकर्त्यांसाठी JAWS, NVDA, VoiceOver आणि Android TalkBack शी सुसंगत
                  ARIA 1.2 लेबल्स, भूखंड डेटा टेबल्स, व सिमेंटिक संरचना वापरली आहे (WCAG 4.1.2).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">कीबोर्ड नेव्हिगेशन व फोकस ट्रॅप (Keyboard Access & Focus Trap)</p>
                <p className="text-xs text-slate-600">
                  माऊस न वापरता केवळ Tab, Shift+Tab, Enter आणि Escape की द्वारे सर्व मॉडेल्स, नेव्हिगेशन व फॉर्म्स सहज वापरता येतात. मॉडेल डायलॉगमध्ये फोकस बंदिस्त (trapped) राहतो (WCAG 2.1.1, 2.1.2).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">चार्ट्सचा पर्यायी मजकूर (Accessible Data Tables)</p>
                <p className="text-xs text-slate-600">
                  तालुकानिहाय तुलनात्मक आलेख, डोंगर नकाशे व डोनट चार्ट्समधील संख्यात्मक डेटा स्क्रीन रीडर्ससाठी दृष्टीआड (sr-only) डेटा सारणी स्वरूपात उपलब्ध आहे (WCAG 1.1.1).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">स्पष्ट दृश्यमान फोकस (Visible Focus Indicators)</p>
                <p className="text-xs text-slate-600">
                  कीबोर्डद्वारे निवडलेल्या प्रत्येक इनपुट, लिंक किंवा बटणावर २px जाडीची स्पष्ट बाह्यरेखा (focus ring) प्रदर्शित होते (WCAG 2.4.7 Focus Visible).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>३. मूल्यमापन पद्धती व तांत्रिक सुसंगतता (Evaluation Methods & Tech Stack)</span>
            </h2>
            <p>
              या संकेतस्थळाचे सुलभता मूल्यमापन खालील पद्धतींचा अवलंब करून प्रमाणित करण्यात आले आहे:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>स्वयंचलित चाचणी:</strong> axe-core 4.8+, Google Lighthouse Accessibility Suite, व WAVE Evaluation Tool द्वारे १००% शून्य त्रुटी (zero blocking violations).</li>
              <li><strong>मॅन्युअल सहाय्यक तंत्रज्ञान चाचणी:</strong> NVDA (NonVisual Desktop Access) सह Google Chrome व Mozilla Firefox वर कीबोर्ड-ओन्ली मोडमध्ये सखोल चाचणी.</li>
              <li><strong>तंत्रज्ञान घटक:</strong> HTML5 Semantic markup, WAI-ARIA 1.2, Next.js 14, React 18, Tailwind CSS, आणि focus-trap-react.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>४. मर्यादा व पर्यायी प्रवेश (Known Limitations & Alternative Formats)</span>
            </h2>
            <p>
              आमचा सर्व सामग्री १००% सुलभ ठेवण्याचा अखंड प्रयत्न आहे, तरीही काही तांत्रिक मर्यादा खालीलप्रमाणे आहेत:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-amber-950">
              <p className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>सॅटेलाइट नकाशे व जिओ-स्पेशियल लेयर्स (Interactive GIS Maps):</span>
              </p>
              <p>
                नकाशावरील व्हिज्युअल पिक्सल्स व सॅटेलाइट लेयर्स पूर्णतः स्क्रीन रीडरद्वारे वाचणे शक्य नसल्याने, आम्ही प्रत्येक नकाशा घटकाचा संपूर्ण वैधानिक डेटा &apos;गट व सर्व्हे क्रमांक महसूल अभिलेख सारणी&apos; (Gat Survey Ledger Table) द्वारे सुलभ मजकूर व टेबल स्वरूपात उपलब्ध करून दिला आहे.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-emerald-700" />
              <span>५. तक्रार निवारण व नोडल अधिकारी (Grievance Redressal & DPO Contact)</span>
            </h2>
            <p>
              आपणास हे संकेतस्थळ वापरताना सुलभतेबाबत किंवा आपल्या वैयक्तिक माहितीच्या संरक्षणाबाबत कोणतीही अडचण आल्यास कृपया आमच्या सुलभता व डेटा संरक्षण अधिकाऱ्यांशी संपर्क साधावा. आम्ही ७२ तासांच्या आत आपल्या समस्येचे निवारण करण्यास कटिबद्ध आहोत:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div>
                <p className="font-bold text-slate-900">डेटा संरक्षण व सुलभता कक्ष (Data Protection & Accessibility Cell)</p>
                <p className="text-slate-600">जिल्हाधिकारी कार्यालय, चंद्रपूर, महाराष्ट्र - ४४२४०१</p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <p><strong>नोडल सुलभता अधिकारी:</strong> श्री. निवासी उपजिल्हाधिकारी, चंद्रपूर</p>
                <p><strong>डेटा संरक्षण अधिकारी (DPO):</strong> dpo.chandrapur@maharashtra.gov.in</p>
                <p><strong>दूरध्वनी:</strong> ०७१७२-२५११०० / ०७१७२-२५५२२२</p>
                <p><strong>तक्रार निवारण मुदत:</strong> कमाल ७२ कामकाजाचे तास (DPDPA 2023 नियमांनुसार)</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
