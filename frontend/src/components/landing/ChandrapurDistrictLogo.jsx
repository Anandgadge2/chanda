'use client';

/**
 * Official Chandrapur District Administration & Collectorate Emblem
 * Features the official seal with Tadoba Tiger, Chanda Fort, Ashoka Chakra, and Scales of Justice
 */
export default function ChandrapurDistrictLogo({ className = 'w-12 h-12', showText = false, textVariant = 'dark' }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/chandrapur_seal.png"
        alt="जिल्हाधिकारी कार्यालय चंद्रपूर अधिकृत बोधचिन्ह"
        className={`${className} object-contain rounded-full ring-2 ring-amber-500/60 shadow-sm flex-shrink-0 bg-white`}
      />

      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              महाराष्ट्र शासन
            </span>
            <span className={`text-[11px] font-semibold ${textVariant === 'dark' ? 'text-slate-500' : 'text-slate-300'}`}>
              महसूल विभाग
            </span>
          </div>
          <h2 className={`text-base sm:text-lg font-black leading-tight ${textVariant === 'dark' ? 'text-slate-900' : 'text-white'}`}>
            जिल्हाधिकारी कार्यालय, चंद्रपूर
          </h2>
          <p className={`text-[11px] font-medium leading-none mt-0.5 ${textVariant === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>
            भूमी अभिलेख व महसूल संनियंत्रण प्रणाली
          </p>
        </div>
      )}
    </div>
  );
}
