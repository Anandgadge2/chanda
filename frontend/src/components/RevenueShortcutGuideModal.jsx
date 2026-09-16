'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function RevenueShortcutGuideModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialCategory = 'ALL',
}) {
  const trapRef = useFocusTrap(isOpen);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      <div
        ref={trapRef}
        className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="glossary-modal-title"
                  className="text-sm sm:text-base font-bold text-slate-900 leading-tight"
                >
                  जमीन महसूल शब्दावली व संक्षिप्त रूपे
                </h2>
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                  Glossary
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 hidden sm:block">
                ७/१२ उतारा, फेरफार नोंदवही (गाव नमुना ६) व महसूल आदेशांमधील संक्षिप्त संज्ञा
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="संवाद बंद करा (Close glossary modal)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Compact Alert Notice Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 sm:px-6 py-2 text-[11px] sm:text-xs text-amber-950 flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
          <p className="leading-normal truncate sm:whitespace-normal">
            <span className="font-bold text-amber-900">महत्त्वाची सूचना: </span>
            विनापरवानगी अ.कृ. वापर हा MLRC कलम ४४/४५ अन्वये गंभीर शर्तभंग असून त्यावर २५ पट दंड अथवा जमीन शासन जमा कारवाई होते.
          </p>
        </div>

        {/* Search & Category Filter Strip */}
        <div className="p-2.5 sm:p-3 bg-slate-50/70 border-b border-slate-200 space-y-2 shrink-0">
          <div className="relative">
            <label htmlFor="glossary-search" className="sr-only">
              संक्षिप्त रूप शोधा
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="glossary-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="संक्षिप्त रूप शोधा... (उदा. अ.कृ., विनापरवानगी, ख.ख., भो.व., बो., फे.नं.)"
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-800"
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
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            {REVENUE_GLOSSARY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
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
