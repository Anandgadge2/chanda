'use client';
import { useTranslation } from '../LanguageContext';
import { Layers } from 'lucide-react';

/**
 * Modern High-Tech Spatial Registry Logo Mark
 * Sleek geometric emblem with vibrant cyber-indigo styling, replacing archaic government seal appearance.
 */
export default function ChandrapurDistrictLogo({
  className = 'w-9 h-9',
  showText = false,
  textVariant = 'dark',
}) {
  const { isMarathi } = useTranslation();

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Modern High-Tech Geo-Spatial Logo Mark */}
      <div className={`relative ${className} shrink-0 group`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 opacity-80 blur-[6px] group-hover:opacity-100 transition-opacity" />

        {/* Crisp Squircle Emblem */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border border-white/20 shadow-md flex items-center justify-center overflow-hidden">
          {/* Subtle Cyber Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #818cf8 1px, transparent 0)',
              backgroundSize: '8px 8px',
            }}
          />

          {/* Dynamic Layered Cadastral Node Vector */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[58%] h-[58%] text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="url(#logo-grad-1)" />
            <polyline points="2 17 12 22 22 17" stroke="url(#logo-grad-2)" />
            <polyline points="2 12 12 17 22 12" stroke="url(#logo-grad-3)" />
            <defs>
              <linearGradient id="logo-grad-1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="logo-grad-2" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="logo-grad-3" x1="2" y1="12" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Micro Telemetry Dot */}
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 shadow-xs" />
        </div>
      </div>

      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-full border border-indigo-200/80">
              {isMarathi ? 'भू-अभिलेख प्रणाली' : 'Cadastral Intelligence'}
            </span>
            <span
              className={`text-[10px] font-medium hidden sm:inline ${
                textVariant === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              v2.4
            </span>
          </div>
          <h2
            className={`text-sm sm:text-base font-extrabold tracking-tight leading-tight ${
              textVariant === 'dark' ? 'text-slate-900' : 'text-white'
            }`}
          >
            {isMarathi ? 'चंद्रपूर लँड पोर्टल' : 'Chandrapur Spatial'}
          </h2>
          <p
            className={`text-[10.5px] font-medium leading-none mt-0.5 truncate ${
              textVariant === 'dark' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {isMarathi ? '१५ तालुके पारदर्शक अभिलेख व्यवस्थापन' : 'Next-Gen Land Governance & Records'}
          </p>
        </div>
      )}
    </div>
  );
}
