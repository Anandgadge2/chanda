'use client';

/**
 * Official Emblem of Government of Maharashtra / State Emblem of India
 * Scalable crisp SVG vectors with national colors
 */
export function AshokStambhEmblem({ className = 'w-10 h-10' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="State Emblem of India"
    >
      <circle cx="50" cy="50" r="48" fill="#FFF9F2" stroke="#B45309" strokeWidth="2.5" />
      {/* Outer gold ring */}
      <circle cx="50" cy="50" r="44" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" />
      
      {/* Stylized Lion Capital / Stambh Pillar */}
      <path
        d="M44 80h12v-6h-12v6zm-4 4h20v-3h-20v3zm6-10h8v-8h-8v8z"
        fill="#B45309"
      />
      {/* Ashoka Chakra in Base */}
      <circle cx="50" cy="62" r="7" stroke="#1E3A8A" strokeWidth="1.5" />
      <circle cx="50" cy="62" r="1.5" fill="#1E3A8A" />
      {/* Chakra spokes */}
      <line x1="50" y1="55" x2="50" y2="69" stroke="#1E3A8A" strokeWidth="1" />
      <line x1="43" y1="62" x2="57" y2="62" stroke="#1E3A8A" strokeWidth="1" />
      <line x1="45" y1="57" x2="55" y2="67" stroke="#1E3A8A" strokeWidth="1" />
      <line x1="45" y1="67" x2="55" y2="57" stroke="#1E3A8A" strokeWidth="1" />
      
      {/* Lions Profile Silhouettes */}
      <path
        d="M50 20c-3 0-5 2-6 5-1-1-3-2-5-1-2 1-3 4-2 6-2 1-3 3-2 5 1 2 2 3 4 3 1 4 4 7 8 8h6c4-1 7-4 8-8 2 0 3-1 4-3 1-2 0-4-2-5 1-2 0-5-2-6-2-1-4 0-5 1-1-3-3-5-6-5z"
        fill="#B45309"
      />
      {/* Crown mane accents */}
      <path
        d="M48 24h4v6h-4zm-7 8c1-1 3-1 4 0l-1 3c-1 0-2-1-3-3zm18 0c-1-1-3-1-4 0l1 3c1 0 2-1 3-3z"
        fill="#F59E0B"
      />
      {/* Motto ribbon "सत्यमेव जयते" */}
      <rect x="30" y="86" width="40" height="7" rx="2" fill="#1E293B" />
      <text
        x="50"
        y="91"
        textAnchor="middle"
        fontSize="5"
        fontWeight="bold"
        fill="#F8FAFC"
        fontFamily="sans-serif"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}

export function MaharashtraSeal({ className = 'w-10 h-10' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Government of Maharashtra Seal"
    >
      <circle cx="50" cy="50" r="48" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="43" fill="#172554" stroke="#93C5FD" strokeWidth="0.8" />
      
      {/* Samai / Diya Motif */}
      <path
        d="M50 22c1.5 2.5 3 5 3 7.5 0 2.5-1.5 4.5-3 4.5s-3-2-3-4.5c0-2.5 1.5-5 3-7.5z"
        fill="#F59E0B"
      />
      <path
        d="M42 34h16c-1 4-3 7-8 7s-7-3-8-7z"
        fill="#FBBF24"
      />
      <path
        d="M48 41h4v16h-4z"
        fill="#F59E0B"
      />
      <path
        d="M40 57h20c-1 3-4 5-10 5s-9-2-10-5z"
        fill="#FBBF24"
      />

      {/* Outer circular text representation: प्रतिपच्चंद्रलेखेव... */}
      <circle cx="50" cy="50" r="34" stroke="#FBBF24" strokeWidth="1" strokeDasharray="2 2" />
      
      {/* Bottom ribbon */}
      <rect x="24" y="76" width="52" height="12" rx="3" fill="#D97706" />
      <text
        x="50"
        y="84"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="bold"
        fill="#FFFFFF"
        fontFamily="sans-serif"
      >
        महाराष्ट्र शासन
      </text>
    </svg>
  );
}
