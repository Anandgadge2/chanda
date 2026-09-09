'use client';

/**
 * Official Chandrapur District Administration & Collectorate Emblem
 * Features:
 * - Maharashtra Government & Indian Lion Capital heritage
 * - Majestic Chandrapur Tiger symbol (Tadoba - Central India Tiger Capital)
 * - Historical Chanda Fort battlements & Mahakali temple arch
 * - Revenue Scale of Justice & Tricolor accent
 */
export default function ChandrapurDistrictLogo({ className = 'w-12 h-12', showText = false, textVariant = 'dark' }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        className={className}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="जिल्हाधिकारी कार्यालय चंद्रपूर अधिकृत बोधचिन्ह"
      >
        {/* Outer Golden Border & Deep Royal Blue Ring */}
        <circle cx="60" cy="60" r="58" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="3" />
        <circle cx="60" cy="60" r="53" fill="#0F172A" stroke="#93C5FD" strokeWidth="0.8" />
        <circle cx="60" cy="60" r="42" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />

        {/* Circular Ring Inscription Guide */}
        <path
          id="textPathUpper"
          d="M 18,60 A 42,42 0 1,1 102,60"
          fill="none"
        />
        <path
          id="textPathLower"
          d="M 102,60 A 42,42 0 1,1 18,60"
          fill="none"
        />

        {/* Outer Circular Marathi Text */}
        <text fontSize="7" fontWeight="bold" fill="#F8FAFC" letterSpacing="0.5">
          <textPath href="#textPathUpper" startOffset="50%" textAnchor="middle">
            जिल्हाधिकारी कार्यालय • चंद्रपूर
          </textPath>
        </text>
        <text fontSize="6" fontWeight="bold" fill="#FDE68A" letterSpacing="0.8">
          <textPath href="#textPathLower" startOffset="50%" textAnchor="middle">
            DISTRICT COLLECTORATE
          </textPath>
        </text>

        {/* Inside Center: Chanda Fort Battlements Wall */}
        <path
          d="M32 72 L32 64 L38 64 L38 68 L44 68 L44 64 L50 64 L50 68 L56 68 L56 64 L64 64 L64 68 L70 68 L70 64 L76 64 L76 68 L82 68 L82 64 L88 64 L88 72 Z"
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth="1"
        />

        {/* Majestic Chandrapur Tiger / Tadoba Motif (Stylized Emblem) */}
        <g transform="translate(42, 34) scale(0.6)">
          {/* Tiger Face Outline */}
          <path
            d="M30 6 C22 6 15 15 15 25 C15 36 22 45 30 50 C38 45 45 36 45 25 C45 15 38 6 30 6 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="2"
          />
          {/* Tiger Ears */}
          <circle cx="17" cy="11" r="5" fill="#B45309" />
          <circle cx="17" cy="11" r="2.5" fill="#FEF3C7" />
          <circle cx="43" cy="11" r="5" fill="#B45309" />
          <circle cx="43" cy="11" r="2.5" fill="#FEF3C7" />
          {/* Tiger Stripes */}
          <path d="M30 10 L30 18 M26 12 L22 17 M34 12 L38 17 M20 23 L25 24 M40 23 L35 24" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          {/* Tiger Eyes */}
          <ellipse cx="24" cy="27" rx="2.5" ry="1.8" fill="#1E293B" />
          <ellipse cx="36" cy="27" rx="2.5" ry="1.8" fill="#1E293B" />
          {/* Muzzle */}
          <path d="M28 34 L32 34 L30 38 Z" fill="#B45309" />
          <path d="M30 38 C28 41 24 41 22 39 M30 38 C32 41 36 41 38 39" stroke="#1E293B" strokeWidth="1.5" fill="none" />
        </g>

        {/* Scales of Justice (महसूल व न्याय प्रतीक) */}
        <g transform="translate(42, 70) scale(0.6)">
          <line x1="30" y1="2" x2="30" y2="28" stroke="#1E3A8A" strokeWidth="2.5" />
          <line x1="10" y1="8" x2="50" y2="8" stroke="#1E3A8A" strokeWidth="2.5" />
          {/* Left Pan */}
          <path d="M10 8 L5 18 L15 18 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          {/* Right Pan */}
          <path d="M50 8 L45 18 L55 18 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          {/* Base Stand */}
          <path d="M22 28 L38 28 L34 25 L26 25 Z" fill="#1E3A8A" />
        </g>

        {/* Small Bottom Ashoka Chakra / Tricolor Ringlet */}
        <circle cx="60" cy="94" r="5" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1" />
        <circle cx="60" cy="94" r="1" fill="#1E3A8A" />
      </svg>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300/80">
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
