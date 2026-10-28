'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Scale,
  AlertTriangle,
  FileText,
  Filter,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Landmark,
  Layers,
  FileSpreadsheet,
  Building,
  Info,
  Printer,
  X,
} from 'lucide-react';
import ChandrapurDistrictLogo from '../../components/landing/ChandrapurDistrictLogo';
import { REVENUE_SHORTCUTS, REVENUE_GLOSSARY_CATEGORIES } from '../../lib/constants';
import { useAuth } from '../../components/AuthContext';
import { useTranslation } from '../../components/LanguageContext';

export default function RevenueGlossaryPage() {
  const { user } = useAuth();
  const { isMarathi } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredShortcuts = useMemo(() => {
    return REVENUE_SHORTCUTS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        item.shortcut.toLowerCase().includes(q) ||
        item.fullFormMr.toLowerCase().includes(q) ||
        item.fullFormEn.toLowerCase().includes(q) ||
        item.descriptionMr.toLowerCase().includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        (item.mlrcSection && item.mlrcSection.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full space-y-2.5 sm:space-y-3">
      {/* Executive Command Hero Header - Pro Compact */}
      <div className="bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-sky-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
            <ChandrapurDistrictLogo className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                {isMarathi
                  ? 'जमीन महसूल शब्दावली व संक्षिप्त रूपे (Glossary)'
                  : 'Land Revenue Legal Glossary & Acronyms'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                {isMarathi ? 'MLRC १९६६' : 'MLRC 1966'}
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500 font-medium">
                {isMarathi
                  ? '• ७/१२ उतारा, फेरफार नोंदवही (नमुना ६) संक्षिप्त शब्द व कलमे'
                  : '• 7/12 extract, mutation register (Form VI) abbreviations & statutory sections'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 md:hidden truncate font-medium">
              {isMarathi
                ? '७/१२ उतारा, फेरफार नोंदवही (नमुना ६) संक्षिप्त शब्द व कलमे'
                : '7/12 extract, mutation register (Form VI) abbreviations & statutory sections'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-950 shadow-2xs transition active:scale-95 cursor-pointer"
            title={isMarathi ? 'शब्दावली अहवाल मुद्रित करा' : 'Print Glossary Report'}
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">{isMarathi ? 'प्रत मुद्रित करा' : 'Print Glossary'}</span>
            <span className="sm:hidden">Print</span>
          </button>
          <Link
            href={user ? '/dashboard' : '/'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition shadow-2xs active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>{user ? (isMarathi ? 'महसूल डॅशबोर्ड' : 'Revenue Dashboard') : (isMarathi ? 'मुख्य पृष्ठ' : 'Home')}</span>
          </Link>
        </div>
      </div>

      {/* Featured Deep-Dive Spotlight Card: 'विनापरवानगी अ.कृ. वापर' */}
      <div className="bg-gradient-to-br from-amber-500/15 via-amber-50/50 to-orange-500/10 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200 text-amber-950 text-xs font-black border border-amber-300 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
            <span>{isMarathi ? 'वैधानिक विश्लेषण: विनापरवानगी अ.कृ. वापर (Unauthorized Non-Agricultural Use)' : 'Statutory Analysis: Unauthorized Non-Agricultural (NA) Use'}</span>
          </div>
          <span className="text-[11px] font-bold text-amber-900 bg-white/80 px-2.5 py-0.5 rounded-md border border-amber-200">
            MLRC 1966 कलम ४२, ४४, ४५ व ४७
          </span>
        </div>

        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
            {isMarathi ? '"विनापरवानगी अ.कृ. वापर" म्हणजे काय आणि ७/१२ उताऱ्यावर त्याचा काय परिणाम होतो?' : 'What is "Unauthorized NA Use" and how does it affect 7/12 Land Records?'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            शेतजमिनीचा बिगरशेती प्रयोजनासाठी वापर करताना लागणारी पूर्वपरवानगी व उल्लंघनावरील कारवाईची कायदेशीर माहिती
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Box 1: व्याख्या व कलम संदर्भ */}
          <div className="p-4 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{isMarathi ? '१. कायदेशीर व्याख्या व कलम संदर्भ' : '1. Legal Definition & Statutory Sections'}</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {isMarathi ? (
                    <>महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ च्या <strong>कलम ४२ व ४४</strong> नुसार कोणतीही शेतजमीन निवासी, व्यावसायिक, हॉटेल किंवा औद्योगिक वापरासाठी वापरण्यापूर्वी सक्षम प्राधिकारी (जिल्हाधिकारी किंवा उपविभागीय अधिकारी - SDO) यांची अधिकृत <strong>अकृषिक (NA) परवानगी</strong> घेणे अनिवार्य आहे.</>
                  ) : (
                    <>Under <strong>Sections 42 & 44</strong> of MLRC 1966, prior sanction for <strong>Non-Agricultural (NA) use</strong> from the competent authority (District Collector or SDO) is mandatory before putting agricultural land to residential, commercial, hospitality, or industrial use.</>
                  )}
              </p>
            </div>
            <div className="text-xs text-amber-950 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-normal">
              {isMarathi ? (
                    <>पूर्वपरवानगीशिवाय केलेला असा कोणताही वापर <strong>कलम ४५ व ४७</strong> अन्वये "विनापरवानगी अ.कृ. वापर" (Unauthorized Non-Agricultural Use) ठरतो.</>
                  ) : (
                    <>Any utilization without prior permission constitutes "Unauthorized Non-Agricultural Use" under <strong>Sections 45 & 47</strong>.</>
                  )}
            </div>
          </div>

          {/* Box 2: परिणाम व कारवाई */}
          <div className="p-4 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{isMarathi ? '२. परिणाम, दंड व शासन जमा कारवाई' : '2. Penalties & Repossession Proceedings'}</span>
              </h3>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-700 text-xs leading-relaxed">
                <li>
                  {isMarathi ? <><strong>७/१२ उताऱ्यावर शेरा:</strong> तलाठी/मंडळ अधिकाऱ्यांमार्फत ७/१२ च्या <em>'इतर हक्क'</em> किंवा <em>'पिक पाहणी'</em> रकान्यात विनापरवानगी अ.कृ. वापराची लाल नोंद होते.</> : <><strong>7/12 Adverse Remark:</strong> Red remark entered under Other Rights by Talathi/Circle Officer.</>}
                </li>
                <li>
                  {isMarathi ? <><strong>२५ पट दंडात्मक आकारणी:</strong> MLRC कलम ४५ अंतर्गत वार्षिक महसूल आकारणीच्या <strong>२५ पटींपर्यंत दंड</strong> आणि दंडात्मक अकृषिक कर वसूल केला जातो.</> : <><strong>Up to 25x Penalty:</strong> Penal non-agricultural assessment up to 25 times standard rate levied under Section 45.</>}
                </li>
                <li>
                  {isMarathi ? <><strong>शर्तभंग व शासन जमा:</strong> भोगवटादार वर्ग-२ जमीन असल्यास शर्तभंगाखाली जमीन राज्य शासनाकडे जप्त (शासन जमा) करण्याचे आदेश पारित होतात.</> : <><strong>Breach & Vesting in Govt:</strong> For Class-2 holdings, land is resumed and vested back into the State Government.</>}
                </li>
                <li>
                  {isMarathi ? <><strong>नियमितीकरण:</strong> पात्र प्रकरणात नियमितीकरण शुल्क व विकास आकार भरून प्रकरण नियमित करून घ्यावे लागते.</> : <><strong>Regularization:</strong> In eligible cases, compounding penalty and development charges must be paid.</>}
                </li>
              </ul>
            </div>
            <div className="text-[11px] text-rose-900 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
              {isMarathi ? 'धोका: असा शेरा असल्यास जमिनीचे खरेदीखत, बांधकाम परवानगी अथवा बँक कर्ज नामंजूर होते.' : 'Risk: Such adverse entries prohibit registration of sale deeds, building sanction, and mortgage loans.'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Statistics Bar - Modern Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight block">
            {REVENUE_SHORTCUTS.length}
          </span>
          <p className="text-[11px] text-slate-600 font-bold mt-1">
            {isMarathi ? 'एकूण संक्षिप्त रूपे (Shortcuts)' : 'Total Statutory Acronyms'}
          </p>
        </div>
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <span className="text-xl sm:text-2xl font-black text-blue-900 font-mono tracking-tight block">
            {REVENUE_GLOSSARY_CATEGORIES.length - 1}
          </span>
          <p className="text-[11px] text-slate-600 font-bold mt-1">
            {isMarathi ? 'विषय वर्गवारी (Categories)' : 'Glossary Categories'}
          </p>
        </div>
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <span className="text-base sm:text-lg font-black text-emerald-700 tracking-tight block">
            MLRC 1966
          </span>
          <p className="text-[11px] text-slate-600 font-bold mt-1">
            {isMarathi ? 'वैधानिक संहिता व कलमे' : 'Statutory Code & Sections'}
          </p>
        </div>
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-600" />
          <span className="text-base sm:text-lg font-black text-purple-900 tracking-tight block">
            {isMarathi ? '१५ तालुके' : '15 Talukas'}
          </span>
          <p className="text-[11px] text-slate-600 font-bold mt-1">
            {isMarathi ? 'चंद्रपूर जिल्हा कार्यक्षेत्र' : 'Chandrapur District Jurisdiction'}
          </p>
        </div>
      </div>

      {/* Filter & Live Search Command Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isMarathi
                  ? 'संक्षिप्त रूप, पूर्ण रूप, इंग्रजी शब्द किंवा कलम शोधा... (उदा. अ.कृ., विनापरवानगी, ख.ख., भो.व., बो., फे.नं., NA)'
                  : 'Search acronym, full form, English term or section... (e.g. NA, Sale Deed, Survey No, 36A)'
              }
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition shrink-0 shadow-2xs"
            >
              {isMarathi ? 'सर्व फिल्टर काढा' : 'Clear all filters'}
            </button>
          )}
        </div>

        {/* Category Filter Horizontal Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {REVENUE_GLOSSARY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition duration-150 shrink-0 ${
                  isActive
                    ? 'bg-blue-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {isMarathi ? cat.labelMr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid - 3 Columns on Wide Screens */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-600 px-1 font-medium">
          <span>
            {isMarathi ? (
              <>एकूण <strong>{filteredShortcuts.length}</strong> संक्षिप्त संज्ञा उपलब्ध</>
            ) : (
              <>Showing <strong>{filteredShortcuts.length}</strong> glossary terms available</>
            )}
          </span>
          <span className="hidden sm:inline">
            {isMarathi ? 'सध्याची वर्गवारी: ' : 'Category: '}
            <strong className="text-slate-900">
              {isMarathi
                ? REVENUE_GLOSSARY_CATEGORIES.find((c) => c.id === selectedCategory)?.labelMr
                : REVENUE_GLOSSARY_CATEGORIES.find((c) => c.id === selectedCategory)?.labelEn}
            </strong>
          </span>
        </div>

        {filteredShortcuts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 px-4 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {isMarathi
                ? `'${searchQuery}' साठी कोणतीही संज्ञा सापडली नाही`
                : `No term matching '${searchQuery}' found`}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isMarathi
                ? 'कृपया स्पेलिंग तपासा किंवा इंग्रजी संज्ञा (उदा. NA, Sale Deed, Survey No) टाकून पुन्हा शोधा.'
                : 'Please check your spelling or try searching with statutory terms (e.g. NA, Sale Deed, Survey No).'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="inline-block mt-2 text-xs font-bold text-blue-950 bg-amber-100 px-3.5 py-2 rounded-xl border border-amber-300 hover:bg-amber-200 transition shadow-2xs"
            >
              {isMarathi ? 'सर्व शब्दावली पूर्ववत पहा' : 'Reset Glossary View'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredShortcuts.map((item, idx) => {
              const isCritical = item.severity === 'CRITICAL';
              const isRestricted = item.severity === 'RESTRICTED';
              const isEncumbrance = item.severity === 'ENCUMBRANCE';

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition duration-150 flex flex-col justify-between space-y-3 shadow-2xs ${
                    isCritical
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400 hover:shadow-xs'
                      : isRestricted
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400 hover:shadow-xs'
                      : isEncumbrance
                      ? 'bg-purple-50/50 border-purple-200 hover:border-purple-400 hover:shadow-xs'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Shortcut Pill + Section Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-mono text-xs sm:text-sm font-black border ${
                            isCritical
                              ? 'bg-rose-100 text-rose-950 border-rose-300'
                              : isRestricted
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : isEncumbrance
                              ? 'bg-purple-100 text-purple-950 border-purple-300'
                              : 'bg-blue-50 text-blue-950 border-blue-200'
                          }`}
                        >
                          {item.shortcut}
                        </span>

                        {item.mlrcSection && (
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {item.mlrcSection}
                          </span>
                        )}
                      </div>

                      {isCritical && (
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                          {isMarathi ? 'वैधानिक उल्लंघन' : 'Statutory Violation'}
                        </span>
                      )}
                      {isRestricted && (
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                          {isMarathi ? 'परवानगी आवश्यक' : 'Permission Required'}
                        </span>
                      )}
                      {isEncumbrance && (
                        <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                          {isMarathi ? 'बोजा / प्रभार' : 'Encumbrance / Charge'}
                        </span>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="pt-0.5">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug">
                        {isMarathi ? item.fullFormMr : item.fullFormEn}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                      {isMarathi ? item.descriptionMr : item.descriptionEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statutory Footer Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-900 shrink-0" />
          <span>
            {isMarathi ? 'ही नामावली महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ आणि गाव नमुना १ ते २१ नियमांवर आधारित अधिकृत संदर्भासाठी आहे.' : 'This glossary is compiled for official reference based on MLRC 1966 and Village Forms 1 to 21 rules.'}
          </span>
        </div>
        <Link
          href={user ? '/dashboard' : '/'}
          className="text-blue-900 font-bold hover:underline shrink-0"
        >
          {user ? (isMarathi ? 'महसूल डॅशबोर्डवर जा →' : 'Go to Revenue Dashboard →') : (isMarathi ? 'मुख्य पोर्टलवर जा →' : 'Go to Public Portal →')}
        </Link>
      </div>
    </div>
  );
}
