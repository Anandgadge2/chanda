'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { useTranslation } from './LanguageContext';

export default function RevenueShortcutGuideModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialCategory = 'ALL',
}) {
  const { locale, isMarathi } = useTranslation();
  const trapRef = useFocusTrap(isOpen);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={trapRef}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Top Gradient Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600 shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="glossary-modal-title"
                  className="text-sm sm:text-base font-black text-slate-900 leading-tight"
                >
                  {isMarathi ? 'जमीन महसूल शब्दावली व संक्षिप्त रूपे' : 'Land Revenue Glossary & Abbreviations'}
                </h2>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                  {isMarathi ? 'MLRC १९६६ Glossary' : 'MLRC 1966 Glossary'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 hidden sm:block font-medium">
                {isMarathi ? '७/१२ उतारा, फेरफार नोंदवही (गाव नमुना ६) व महसूल आदेशांमधील संक्षिप्त संज्ञा' : 'Abbreviations across 7/12 extracts, VF-6 mutation registers, and revenue orders'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition active:scale-90 flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label={isMarathi ? 'संवाद बंद करा (Close glossary modal)' : 'Close glossary dialog'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Alert Notice Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 sm:px-6 py-2 text-[11px] sm:text-xs text-amber-950 flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
          <p className="leading-normal truncate sm:whitespace-normal">
            <span className="font-bold text-amber-900">{isMarathi ? 'महत्त्वाची सूचना: ' : 'Statutory Note: '}</span>
            {isMarathi ? 'विनापरवानगी अ.कृ. वापर हा MLRC कलम ४४/४५ अन्वये गंभीर शर्तभंग असून त्यावर २५ पट दंड अथवा जमीन शासन जमा कारवाई होते.' : 'Unauthorized Non-Agricultural (NA) use violates MLRC Sec 44/45, inviting up to 25x penalty or Government resumption.'}
          </p>
        </div>

        {/* Search & Category Filter Strip */}
        <div className="p-2.5 sm:p-3 bg-slate-50/70 border-b border-slate-200 space-y-2 shrink-0">
          <div className="relative">
            <label htmlFor="glossary-search" className="sr-only">
              {isMarathi ? 'संक्षिप्त रूप शोधा' : 'Search abbreviation'}
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="glossary-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'संक्षिप्त रूप शोधा... (उदा. अ.कृ., विनापरवानगी, ख.ख., भो.व., बो., फे.नं.)' : 'Search abbreviations (e.g. NA, Tribal alienation, Khata, Bhogvatdar, Ferfar)...'}
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
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
                {isMarathi ? cat.labelMr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">{isMarathi ? 'कोणतीही संक्षिप्त संज्ञा सापडली नाही' : 'No matching terms found'}</p>
              <p className="text-xs text-slate-500">
                {isMarathi ? 'कृपया वेगळा शब्द टाइप करा किंवा सर्व कॅटेगरी निवडून पुन्हा तपासा.' : 'Please try another term or select All Categories.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-2 text-xs font-bold text-blue-900 hover:underline"
              >
                {isMarathi ? 'सर्व संज्ञा पूर्ववत दाखवा' : 'Reset & show all terms'}
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
                            {isMarathi ? 'वैधानिक उल्लंघन' : 'Statutory Violation'}
                          </span>
                        )}
                      </div>

                      {/* Full Form */}
                      <div className="mt-2">
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {isMarathi ? item.fullFormMr : (item.fullFormEn || item.fullFormMr)}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                        {isMarathi ? item.descriptionMr : (item.descriptionEn || item.descriptionMr)}
                      </p>
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
            <span>{isMarathi ? 'संदर्भ: महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ व महसूल नियम' : 'Reference: Maharashtra Land Revenue Code (MLRC) 1966 & Revenue Rules'}</span>
          </div>
          <div className="text-[11px] font-bold text-slate-700">
            {isMarathi ? `एकूण ${filteredItems.length} पैकी ${REVENUE_SHORTCUTS.length} संज्ञा उपलब्ध` : `Showing ${filteredItems.length} of ${REVENUE_SHORTCUTS.length} terms available`}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
