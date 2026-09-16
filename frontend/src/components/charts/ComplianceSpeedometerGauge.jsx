'use client';

import { ShieldCheck, Scale, Award } from 'lucide-react';

export default function ComplianceSpeedometerGauge({
  totalParcels = 0,
  totalViolations = 0,
  repossessedCount = 0,
  pendingHearings = 0,
}) {
  // Calculate legal compliance & clean title security score
  // Parcels free of dispute + repossessed/regularized orders vs total
  const safeParcels = Math.max(0, totalParcels - (totalViolations - repossessedCount));
  const scorePct = totalParcels > 0 ? Math.min(100, Math.round((safeParcels / totalParcels) * 100)) : 100;

  // Semicircle gauge geometry (radius = 70, cx = 100, cy = 95)
  // angle range from 180 deg to 360 deg (half circle)
  const radius = 70;
  const strokeWidth = 12;
  const cx = 100;
  const cy = 90;
  const circumference = Math.PI * radius; // Half-circle arc length ~ 219.9
  const progressOffset = circumference - (scorePct / 100) * circumference;

  // Needle angle: 0% -> -90 deg, 100% -> +90 deg
  const needleAngle = -90 + (scorePct / 100) * 180;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>महसूल संरक्षण व compliance निर्देशांक</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                MLRC Audit
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              कायदेशीर निर्वेध भूखंड व शासन संरक्षण प्रमाण
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
          सुरक्षित श्रेणी
        </span>
      </div>

      {/* SVG Semicircle Speedometer Gauge */}
      <div className="relative my-2 flex flex-col items-center justify-center" aria-label="Revenue compliance speedometer gauge">
        <svg viewBox="0 0 200 115" className="w-48 sm:w-56 h-auto overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="needleFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background Track (Dashed/Segmented Arc like Image 4) */}
          <path
            d="M 30 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="4 6"
          />

          {/* Active Progress Arc */}
          <path
            d="M 30 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Shaded Pointer Wedge / Sector */}
          <g transform={`rotate(${needleAngle} ${cx} ${cy})`} className="transition-transform duration-1000 ease-out">
            <polygon
              points="98,90 102,90 100,28"
              fill="#1e3a8a"
            />
            <circle cx="100" cy="90" r="6" fill="#1e3a8a" />
            <circle cx="100" cy="90" r="3" fill="#ffffff" />
          </g>

          {/* Tick Labels */}
          <text x="24" y="106" fontSize="9" fill="#94a3b8" fontWeight="bold" textAnchor="middle">0%</text>
          <text x="100" y="16" fontSize="9" fill="#94a3b8" fontWeight="bold" textAnchor="middle">50%</text>
          <text x="176" y="106" fontSize="9" fill="#94a3b8" fontWeight="bold" textAnchor="middle">100%</text>
        </svg>

        {/* Center Digital Readout */}
        <div className="text-center -mt-4">
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {scorePct}%
            </span>
            <span className="text-xs font-bold text-emerald-700">सुरक्षित</span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {safeParcels} पैकी {totalParcels} भूखंड कायदेशीर निर्वेध
          </p>
        </div>
      </div>

      {/* Screen Reader Accessible Data Table (WCAG 1.1.1) */}
      <table className="sr-only">
        <caption>महसूल संरक्षण व अनुपालन निर्देशांक तपशील</caption>
        <thead>
          <tr>
            <th scope="col">अनुपालन मेट्रिक</th>
            <th scope="col">संख्या / प्रमाण</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>एकूण भूखंड संख्या</td><td>{totalParcels}</td></tr>
          <tr><td>कायदेशीर सुरक्षित भूखंड</td><td>{safeParcels}</td></tr>
          <tr><td>एकूण शर्तभंग व वाद संख्या</td><td>{totalViolations}</td></tr>
          <tr><td>शासन जमा किंवा नियमित झालेले भूखंड</td><td>{repossessedCount}</td></tr>
          <tr><td>प्रलंबित SDO / तहसीलदार सुनावण्या</td><td>{pendingHearings}</td></tr>
          <tr><td>एकूण अनुपालन स्कोअर</td><td>{scorePct}%</td></tr>
        </tbody>
      </table>

      {/* Metric Breakdown Badges */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-center">
        <div className="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
          <span className="text-[9px] font-bold text-emerald-800 uppercase block">निर्दोष भूखंड</span>
          <span className="text-xs font-black text-emerald-950">{safeParcels}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-blue-50/70 border border-blue-200/80">
          <span className="text-[9px] font-bold text-blue-800 uppercase block">शासन जमा/नियमित</span>
          <span className="text-xs font-black text-blue-950">{repossessedCount}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-amber-50/70 border border-amber-200/80">
          <span className="text-[9px] font-bold text-amber-800 uppercase block">SDO सुनावणी</span>
          <span className="text-xs font-black text-amber-950">{pendingHearings}</span>
        </div>
      </div>
    </div>
  );
}
