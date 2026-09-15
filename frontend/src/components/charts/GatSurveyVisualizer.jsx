'use client';

import Link from 'next/link';
import { Compass, Hash, AlertTriangle, CheckCircle2, ChevronRight, Sprout, Mountain } from 'lucide-react';
import { TENURE_CLASSES, VIOLATION_TYPES } from '../../lib/constants';

export default function GatSurveyVisualizer({
  parcels = [],
  totalPotkharabaHa = 0,
  totalCultivableHa = 0,
  onSelectParcel,
}) {
  const potkharaba = Number(totalPotkharabaHa || 0);
  const cultivable = Number(totalCultivableHa || 0);
  const totalUsableArea = potkharaba + cultivable;
  const cultivablePct = totalUsableArea > 0 ? ((cultivable / totalUsableArea) * 100).toFixed(1) : 0;
  const potkharabaPct = totalUsableArea > 0 ? ((potkharaba / totalUsableArea) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>गट व स.नं. भूमी विश्लेषक</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-semibold">
                स्थानिक अभिलेख
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              नवा गट क्र., जुना सर्व्हे नं. व पोटखराबा/लागवडीयोग्य क्षेत्र प्रमाण
            </p>
          </div>
        </div>

        <Link
          href="/parcels"
          className="text-[11px] text-blue-900 hover:text-blue-800 font-bold flex items-center gap-0.5 transition self-start sm:self-auto"
        >
          <span>सर्व गट भूखंड</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Usability Ratio Bar (Potkharaba vs Cultivable) */}
      <div className="my-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
          <span className="flex items-center gap-1 text-emerald-800 text-[11px]">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>लागवडीयोग्य क्षेत्र: {cultivable.toFixed(2)} Ha ({cultivablePct}%)</span>
          </span>
          <span className="flex items-center gap-1 text-amber-900 text-[11px]">
            <Mountain className="w-3.5 h-3.5 text-amber-600" />
            <span>पोटखराबा: {potkharaba.toFixed(2)} Ha ({potkharabaPct}%)</span>
          </span>
        </div>

        {/* Dual Stacked Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex" aria-label="Land usability split">
          <div
            className="bg-emerald-600 h-full transition-all duration-500"
            style={{ width: `${cultivablePct}%` }}
            title={`लागवडीयोग्य: ${cultivable.toFixed(2)} Ha`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${potkharabaPct}%` }}
            title={`पोटखराबा: ${potkharaba.toFixed(2)} Ha`}
          />
        </div>
      </div>

      {/* Top Survey / Gat Parcels List */}
      <div className="space-y-1.5 my-1" aria-label="Key Gat and Survey parcels list">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          <span>गट व स.नं. / गाव</span>
          <span>वर्ग व क्षेत्र</span>
        </div>

        {parcels.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">कोणतेही गट भूखंड उपलब्ध नाहीत.</p>
        ) : (
          parcels.slice(0, 5).map((p) => {
            const tenure = TENURE_CLASSES[p.tenureClass] || { labelMr: p.tenureClass };
            const violation = p.violationType ? VIOLATION_TYPES[p.violationType] : null;

            return (
              <div
                key={p.upi}
                className="p-2 rounded-lg border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-slate-900 text-[11px] px-1.5 py-0.2 bg-white rounded border border-slate-200">
                      गट {p.gatNumber}
                    </span>
                    {p.oldSurveyNo && (
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">
                        (स.नं. {p.oldSurveyNo})
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-700 truncate">
                      {p.villageName}, {p.taluka}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                    <span className="text-slate-500 font-medium">
                      लागवड: {p.cultivableAreaHa ? Number(p.cultivableAreaHa).toFixed(2) : '0.00'} Ha
                    </span>
                    {p.potkharabaAreaHa > 0 && (
                      <span className="text-amber-700 font-medium">
                        • खराबा: {Number(p.potkharabaAreaHa).toFixed(2)} Ha
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="font-black text-slate-900 text-xs">
                    {Number(p.totalAreaHa).toFixed(2)} Ha
                  </span>
                  {p.hasActiveDispute || p.violationType ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{violation?.labelMr ? violation.labelMr.slice(0, 10) + '...' : 'चौकशी सक्रीय'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>निर्दोष/स्पष्ट</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>भूखंडाचा ३६०° इतिहास पाहण्यासाठी भूखंड सूची पहा</span>
        <Link
          href="/parcels"
          className="text-blue-900 font-bold hover:underline"
        >
          तपशील &gt;
        </Link>
      </div>
    </div>
  );
}
