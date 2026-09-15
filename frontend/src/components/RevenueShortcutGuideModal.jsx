'use client';

import { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Scale,
  AlertTriangle,
  FileText,
  Filter,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { REVENUE_SHORTCUTS, REVENUE_GLOSSARY_CATEGORIES } from '../lib/constants';

export default function RevenueShortcutGuideModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialCategory = 'ALL',
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filteredItems = useMemo(() => {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex justify-between items-start border-b border-slate-800 shrink-0 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                महाराष्ट्र जमीन महसूल संदर्भ व ७/१२ संक्षिप्त रूपे
              </span>
            </div>
            <h2
              id="glossary-modal-title"
              className="text-base sm:text-xl font-black text-white mt-1"
            >
              जमीन महसूल शब्दावली व संक्षिप्त रूपे (Glossary)
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              ७/१२ उतारा, फेरफार नोंदवही (गाव नमुना ६) व महसूल आदेशांमधील संक्षिप्त शब्दांचे अर्थ व वैधानिक कलमे
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition shrink-0"
            aria-label="Close glossary modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlighted Banner for 'विनापरवानगी अ.कृ. वापर' */}
        <div className="bg-amber-50/90 border-b border-amber-200 px-4 sm:px-6 py-2.5 text-xs text-amber-950 flex items-start gap-2.5 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-900">
              महत्त्वाची सूचना (विनापरवानगी अ.कृ. वापर):{' '}
            </span>
            <span>
              शेतजमिनीचा निवासी, व्यावसायिक अथवा औद्योगिक कारणासाठी विनापरवानगी वापर केल्यास तो MLRC कलम ४४/४५ अन्वये गंभीर शर्तभंग मानला जातो आणि त्यावर २५ पट दंड अथवा जमीन शासन जमा कारवाई होते.
            </span>
          </div>
        </div>

        {/* Search & Category Filter Strip */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="संक्षिप्त रूप शोधा... (उदा. अ.कृ., विनापरवानगी, ख.ख., भो.व., बो., फे.नं.)"
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="शोध साफ करा"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {REVENUE_GLOSSARY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-950 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.labelMr}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">कोणतीही संक्षिप्त संज्ञा सापडली नाही</p>
              <p className="text-xs text-slate-500">
                कृपया वेगळा शब्द टाइप करा किंवा सर्व कॅटेगरी निवडून पुन्हा तपासा.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-2 text-xs font-bold text-blue-900 hover:underline"
              >
                सर्व संज्ञा पूर्ववत दाखवा
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item, idx) => {
                const isCritical = item.severity === 'CRITICAL';
                const isRestricted = item.severity === 'RESTRICTED';
                const isEncumbrance = item.severity === 'ENCUMBRANCE';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition duration-150 flex flex-col justify-between space-y-2.5 ${
                      isCritical
                        ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                        : isRestricted
                        ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                        : isEncumbrance
                        ? 'bg-purple-50/60 border-purple-200 hover:border-purple-400'
                        : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      {/* Top Row: Shortcut Pill + Section Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-xs font-black border ${
                              isCritical
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : isRestricted
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : isEncumbrance
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : 'bg-blue-50 text-blue-950 border-blue-200'
                            }`}
                          >
                            {item.shortcut}
                          </span>
                          {item.mlrcSection && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.mlrcSection}
                            </span>
                          )}
                        </div>

                        {isCritical && (
                          <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded shrink-0">
                            वैधानिक उल्लंघन
                          </span>
                        )}
                      </div>

                      {/* Full Forms */}
                      <div className="mt-2">
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {item.fullFormMr}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 italic">
                          {item.fullFormEn}
                        </p>
                      </div>

                      {/* Description Marathi */}
                      <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                        {item.descriptionMr}
                      </p>
                    </div>

                    {/* Footer: English Summary */}
                    <div className="pt-2 border-t border-slate-200/70 text-[10px] text-slate-500 leading-normal">
                      <span className="font-semibold text-slate-600">English: </span>
                      {item.descriptionEn}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-blue-900" />
            <span>संदर्भ: महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ व महसूल नियम</span>
          </div>
          <div className="text-[11px] font-bold text-slate-700">
            एकूण {filteredItems.length} पैकी {REVENUE_SHORTCUTS.length} संज्ञा उपलब्ध
          </div>
        </div>
      </div>
    </div>
  );
}
