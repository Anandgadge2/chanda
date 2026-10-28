'use client';
import { useTranslation } from '../LanguageContext';

/**
 * Official Chandrapur District Administration & Collectorate Emblem
 * Features the official seal with Tadoba Tiger, Chanda Fort, Ashoka Chakra, and Scales of Justice
 */
export default function ChandrapurDistrictLogo({ className = 'w-12 h-12', showText = false, textVariant = 'dark' }) {
  const { isMarathi } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/chandrapur_seal.png"
        alt={isMarathi ? 'जिल्हाधिकारी कार्यालय चंद्रपूर अधिकृत बोधचिन्ह' : 'District Collectorate Chandrapur Official Emblem'}
        className={`${className} object-contain rounded-full ring-2 ring-amber-500/60 shadow-sm flex-shrink-0 bg-white`}
      />

      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              {isMarathi ? 'महाराष्ट्र शासन' : 'Govt of Maharashtra'}
            </span>
            <span className={`text-[11px] font-semibold ${textVariant === 'dark' ? 'text-slate-500' : 'text-slate-300'}`}>
              {isMarathi ? 'महसूल विभाग' : 'Revenue Department'}
            </span>
          </div>
          <h2 className={`text-base sm:text-lg font-black leading-tight ${textVariant === 'dark' ? 'text-slate-900' : 'text-white'}`}>
            {isMarathi ? 'जिल्हाधिकारी कार्यालय, चंद्रपूर' : 'District Collectorate, Chandrapur'}
          </h2>
          <p className={`text-[11px] font-medium leading-none mt-0.5 ${textVariant === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>
            {isMarathi ? 'भूमी अभिलेख व महसूल संनियंत्रण प्रणाली' : 'Land Records & Revenue Governance Portal'}
          </p>
        </div>
      )}
    </div>
  );
}
