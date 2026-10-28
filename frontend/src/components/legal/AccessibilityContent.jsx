'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, CheckCircle2, LifeBuoy, Sparkles, ShieldCheck, HelpCircle, Layers } from 'lucide-react';
import ChandrapurDistrictLogo from '../landing/ChandrapurDistrictLogo';
import { useTranslation } from '../LanguageContext';

export default function AccessibilityContent() {
  const { isMarathi } = useTranslation();

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
              <span>{isMarathi ? 'मुख्य पृष्ठावर परत जा' : 'Back to Home'}</span>
            </Link>

            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-300">
              GIGW 3.0 / WCAG 2.1 Level AA / DPDPA 2023
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ChandrapurDistrictLogo className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {isMarathi
                  ? 'महाराष्ट्र शासन | राष्ट्रीय सूचना विज्ञान केंद्र (NIC) व GIGW 3.0 मार्गदर्शक तत्त्वे'
                  : 'Govt of Maharashtra | National Informatics Centre (NIC) & GIGW 3.0'}
              </p>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isMarathi ? 'सुलभता विधान (Accessibility Statement)' : 'Accessibility Statement'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isMarathi
                  ? 'सर्व नागरिकांना, दिव्यांग बांधवांना व विशेष गरजा असणाऱ्या व्यक्तींना समान डिजिटल सेवा देण्यास कटिबद्ध'
                  : 'Committed to delivering equal digital services to all citizens and persons with disabilities'}
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
              <span>{isMarathi ? '१. मानकांची पूर्तता व सुलभता दर्जा (Conformance Status)' : '1. Conformance Status & Standards Compliance'}</span>
            </h2>
            <p>
              {isMarathi ? (
                <>
                  जिल्हाधिकारी कार्यालय, चंद्रपूर हे महसूल व भूमी प्रशासन पोर्टल भारतीय शासकीय संकेतस्थळांची मार्गदर्शक तत्त्वे
                  <strong> (GIGW 3.0 - Guidelines for Indian Government Websites)</strong>,
                  जागतिक स्तरावरील <strong>W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> मानके
                  आणि <strong>डिजिटल वैयक्तिक डेटा संरक्षण अधिनियम (DPDPA 2023)</strong> च्या सर्व तरतुदींशी
                  <strong> पूर्णतः सुसंगत (Substantially Conforming)</strong> आहे.
                </>
              ) : (
                <>
                  District Collectorate, Chandrapur Land Governance & Revenue Portal substantially conforms to the
                  <strong> Guidelines for Indian Government Websites (GIGW 3.0)</strong>,
                  global <strong>W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards,
                  and provisions of the <strong>Digital Personal Data Protection Act (DPDPA 2023)</strong>.
                </>
              )}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-700" />
              <span>{isMarathi ? '२. उपलब्ध सुलभता वैशिष्ट्ये (Accessibility Features Available)' : '2. Key Accessibility Features'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? 'अक्षर आकार नियंत्रण (Font Sizing)' : 'Font Sizing Controls'}</p>
                <p className="text-xs text-slate-600">
                  {isMarathi
                    ? 'वाचकांना मजकुराचा आकार लहान (A-), सामान्य (A) किंवा मोठा (A+) करण्याची सुविधा वरील सुलभता पट्टीमध्ये उपलब्ध आहे (WCAG 1.4.4 Resize text up to 200%).'
                    : 'Controls to adjust font size (A-, A, A+) are available in the accessibility toolbar (WCAG 1.4.4 Resize text up to 200%).'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? 'प्रखर कॉन्ट्रास्ट (High Contrast Mode)' : 'High Contrast Mode'}</p>
                <p className="text-xs text-slate-600">
                  {isMarathi
                    ? 'दृष्टिदोष असणाऱ्यांसाठी काळ्या पार्श्वभूमीवर पांढरा/पिवळा मजकूर व किमान ४.५:१ कॉन्ट्रास्ट गुणोत्तराचा पर्याय उपलब्ध आहे (WCAG 1.4.3 / 1.4.6).'
                    : 'High contrast black theme with yellow/white text meeting minimum 4.5:1 ratio is provided for low-vision users (WCAG 1.4.3 / 1.4.6).'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? 'स्क्रीन रीडर सुलभता (Screen Readers)' : 'Screen Reader Compatibility'}</p>
                <p className="text-xs text-slate-600">
                  {isMarathi
                    ? 'दृष्टीहीन वापरकर्त्यांसाठी JAWS, NVDA, VoiceOver आणि Android TalkBack शी सुसंगत ARIA 1.2 लेबल्स, भूखंड डेटा टेबल्स, व सिमेंटिक संरचना वापरली आहे (WCAG 4.1.2).'
                    : 'Full compatibility with JAWS, NVDA, VoiceOver, and TalkBack with semantic ARIA 1.2 labeling and data structures (WCAG 4.1.2).'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? 'कीबोर्ड नेव्हिगेशन व फोकस ट्रॅप (Keyboard Access & Focus Trap)' : 'Keyboard Navigation & Focus Trap'}</p>
                <p className="text-xs text-slate-600">
                  {isMarathi
                    ? 'माऊस न वापरता केवळ Tab, Shift+Tab, Enter आणि Escape की द्वारे सर्व मॉडेल्स, नेव्हिगेशन व फॉर्म्स सहज वापरता येतात. मॉडेल डायलॉगमध्ये फोकस बंदिस्त (trapped) राहतो (WCAG 2.1.1, 2.1.2).'
                    : 'Navigate without a mouse using Tab, Shift+Tab, Enter, and Esc. Modals enforce strict focus traps (WCAG 2.1.1, 2.1.2).'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? 'चार्ट्सचा पर्यायी मजकूर (Accessible Data Tables)' : 'Accessible Data Tables for Charts'}</p>
                <p className="text-xs text-slate-600">
                  {isMarathi
                    ? 'तालुकानिहाय तुलनात्मक आलेख, डोंगर नकाशे व डोनट चार्ट्समधील संख्यात्मक डेटा स्क्रीन रीडर्ससाठी दृष्टीआड (sr-only) डेटा सारणी स्वरूपात उपलब्ध आहे (WCAG 1.1.1).'
                    : 'Visual charts provide screen-reader accessible (sr-only) tabular data equivalents (WCAG 1.1.1).'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">{isMarathi ? 'स्पष्ट दृश्यमान फोकस (Visible Focus Indicators)' : 'Visible Focus Indicators'}</p>
                <p className="text-xs text-slate-600">
                  {isMarathi
                    ? 'कीबोर्डद्वारे निवडलेल्या प्रत्येक इनपुट, लिंक किंवा बटणावर २px जाडीची स्पष्ट बाह्यरेखा (focus ring) प्रदर्शित होते (WCAG 2.4.7 Focus Visible).'
                    : 'Clear 2px high-visibility focus indicators on all interactive inputs, buttons, and links (WCAG 2.4.7 Focus Visible).'}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>{isMarathi ? '३. मूल्यमापन पद्धती व तांत्रिक सुसंगतता (Evaluation Methods & Tech Stack)' : '3. Technical Conformance & Evaluation'}</span>
            </h2>
            <p>
              {isMarathi
                ? 'या संकेतस्थळाचे सुलभता मूल्यमापन खालील पद्धतींचा अवलंब करून प्रमाणित करण्यात आले आहे:'
                : 'Accessibility compliance of this portal has been audited using the following methodologies:'}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>{isMarathi ? 'स्वयंचलित चाचणी: axe-core 4.8+, Google Lighthouse Accessibility Suite, व WAVE द्वारे शून्य त्रुटी.' : 'Automated Auditing: axe-core 4.8+, Google Lighthouse Suite, and WAVE with zero blocking violations.'}</li>
              <li>{isMarathi ? 'मॅन्युअल सहाय्यक तंत्रज्ञान चाचणी: NVDA सह Chrome व Firefox वर कीबोर्ड-ओन्ली मोडमध्ये चाचणी.' : 'Manual Assistive Tech Testing: Keyboard-only flows with NVDA on Chrome and Firefox.'}</li>
              <li>{isMarathi ? 'तंत्रज्ञान घटक: HTML5 Semantic markup, WAI-ARIA 1.2, Next.js 14, React 18, Tailwind CSS, आणि focus-trap-react.' : 'Tech Stack: HTML5 Semantic markup, WAI-ARIA 1.2, Next.js 14, React 18, Tailwind CSS, focus-trap-react.'}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>{isMarathi ? '४. मर्यादा व पर्यायी प्रवेश (Known Limitations & Alternative Formats)' : '4. Known Limitations & Alternative Access'}</span>
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-amber-950">
              <p className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{isMarathi ? 'सॅटेलाइट नकाशे व जिओ-स्पेशियल लेयर्स (Interactive GIS Maps):' : 'Interactive GIS Maps & Satellite Imagery:'}</span>
              </p>
              <p>
                {isMarathi
                  ? 'नकाशावरील व्हिज्युअल पिक्सल्स व सॅटेलाइट लेयर्स पूर्णतः स्क्रीन रीडरद्वारे वाचणे शक्य नसल्याने, आम्ही प्रत्येक नकाशा घटकाचा संपूर्ण वैधानिक डेटा \'गट व सर्व्हे क्रमांक महसूल अभिलेख सारणी\' (Gat Survey Ledger Table) द्वारे सुलभ मजकूर व टेबल स्वरूपात उपलब्ध करून दिला आहे.'
                  : 'Since graphical GIS layers cannot be directly parsed by screen readers, complete cadastral data for every parcel is mirrored in the accessible Gat Survey Ledger Table.'}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-emerald-700" />
              <span>{isMarathi ? '५. तक्रार निवारण व नोडल अधिकारी (Grievance Redressal & DPO Contact)' : '5. Grievance Redressal & Contact'}</span>
            </h2>
            <p>
              {isMarathi
                ? 'आपणास हे संकेतस्थळ वापरताना सुलभतेबाबत किंवा आपल्या वैयक्तिक माहितीच्या संरक्षणाबाबत कोणतीही अडचण आल्यास कृपया आमच्या सुलभता व डेटा संरक्षण अधिकाऱ्यांशी संपर्क साधावा. आम्ही ७२ तासांच्या आत आपल्या समस्येचे निवारण करण्यास कटिबद्ध आहोत:'
                : 'If you encounter any accessibility or privacy difficulties, please contact our Nodal Accessibility Officer. We commit to addressing grievances within 72 business hours:'}
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div>
                <p className="font-bold text-slate-900">{isMarathi ? 'डेटा संरक्षण व सुलभता कक्ष (Data Protection & Accessibility Cell)' : 'Data Protection & Accessibility Cell'}</p>
                <p className="text-slate-600">{isMarathi ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर, महाराष्ट्र - ४४२४०१' : 'Collectorate Office, Chandrapur, Maharashtra - 442401'}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <p><strong>{isMarathi ? 'नोडल सुलभता अधिकारी:' : 'Nodal Officer:'}</strong> {isMarathi ? 'श्री. निवासी उपजिल्हाधिकारी, चंद्रपूर' : 'Resident Deputy Collector (RDC), Chandrapur'}</p>
                <p><strong>{isMarathi ? 'डेटा संरक्षण अधिकारी (DPO):' : 'Data Protection Officer (DPO):'}</strong> dpo.chandrapur@maharashtra.gov.in</p>
                <p><strong>{isMarathi ? 'दूरध्वनी:' : 'Tel:'}</strong> +91 7172 251100 / 255222</p>
                <p><strong>{isMarathi ? 'तक्रार निवारण मुदत:' : 'Turnaround Time:'}</strong> {isMarathi ? 'कमाल ७२ कामकाजाचे तास (DPDPA 2023 नियमांनुसार)' : '72 Business Hours (per DPDPA 2023)'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
